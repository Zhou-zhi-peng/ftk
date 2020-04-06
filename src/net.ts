/// <reference path="./utility.ts" />
/// <reference path="./common.ts" />

namespace ftk.net {
    export type ChannelOptions = {
        url: string,
        reconnectInterval: number,
        maxReconnectCount?: number,
        protocols?: string | string[]
    };

    export abstract class Channel extends EventEmitter {
        private mSocket: WebSocket | null;
        private mReconnectInterval: number;
        private mMaxReconnectCount: number;
        private mReconnectCount: number;
        private mCloseing: boolean;
        private mWaitingQueue: (string | ArrayBuffer | ArrayBufferView)[];

        public constructor(options: ChannelOptions) {
            super();
            this.mSocket = null;
            this.mReconnectInterval = options.reconnectInterval;
            this.mMaxReconnectCount = options.maxReconnectCount ? options.maxReconnectCount : 0;
            this.mReconnectCount = 0;
            this.mCloseing = false;
            this.mWaitingQueue = new Array<ArrayBuffer>();
            this.connect(options.url, options.protocols);
        }

        public get Connected(): boolean {
            return (!this.mCloseing) && (this.mSocket !== null) && (this.mSocket.readyState === WebSocket.OPEN);
        }
        public get WaitingQueueLength(): number {
            return this.mWaitingQueue.length;
        }

        protected abstract OnMessageHandle(data: string | ArrayBuffer): void;

        protected SendMessage(data: string | ArrayBuffer | ArrayBufferView): void {
            if (this.mSocket && this.Connected) {
                this.mSocket.send(data);
            } else {
                if (this.mCloseing) {
                    this.emit('error', "Can't try an operation on an unrecoverable channel.");
                } else {
                    if (this.mWaitingQueue.length > 1024 * 8) {
                        this.mWaitingQueue.shift();
                    }
                    this.mWaitingQueue.push(data);
                }
            }
        }

        private connect(url: string, protocols?: string | string[]): void {
            this._Close();
            this.mSocket = new WebSocket(url, protocols);
            this.mSocket.binaryType = "arraybuffer";
            this.mSocket.onclose = (ev) => {
                if (ev.code !== 255) {
                    this.reconnect(url, protocols);
                }
            };

            this.mSocket.onerror = () => {
                if ((!this.mSocket) || this.mSocket.readyState != WebSocket.OPEN) {
                    this.reconnect(url, protocols);
                }
            };

            this.mSocket.onmessage = (ev) => {
                this.OnMessageHandle(ev.data);
            };
            this.mSocket.onopen = () => {
                this.mReconnectCount = 0;
                let s = this.mSocket as WebSocket;
                this.mWaitingQueue.forEach((buffer) => {
                    s.send(buffer);
                });
                this.mWaitingQueue.length = 0;
            };
        }

        private reconnect(url: string, protocols?: string | string[]): void {
            if (this.mMaxReconnectCount > 0 && (++this.mReconnectCount > this.mMaxReconnectCount)) {
                this.Close();
                this.emit('error', 'Reconnect exceeds maximum number.');
            } else {
                setTimeout(() => {
                    this.emit('reconnect', this.mReconnectCount);
                    if (!this.mCloseing) {
                        this.connect(url, protocols);
                    }
                }, this.mReconnectInterval);
            }
        }

        private _Close(): void {
            if (this.mSocket) {
                this.mSocket.onclose = null;
                this.mSocket.onerror = null;
                this.mSocket.onmessage = null;
                this.mSocket.onopen = null;

                if (this.mSocket.readyState !== WebSocket.CLOSED) {
                    this.mSocket.close(255, "call close function");
                }
            }
        }

        private Close(): void {
            this.mCloseing = true;
            this.mWaitingQueue.length = 0;
            this._Close();
        }
    }

    export class StringChannel extends Channel {
        public Send(data: string): void {
            this.SendMessage(data);
        }

        protected OnMessageHandle(data: string | ArrayBuffer): void {
            if (data instanceof ArrayBuffer) {
                this.emit('message', utility.UTF8BufferDecode(data));
            }
            else {
                this.emit('message', data);
            }
        }

    }

    export class JsonChannel extends Channel {
        public Send(data: any): void {
            this.SendMessage(JSON.stringify(data));
        }

        protected OnMessageHandle(data: string | ArrayBuffer): void {
            let json: any;
            try {
                if (data instanceof ArrayBuffer) {
                    json = JSON.parse(utility.UTF8BufferDecode(data));
                }
                else {
                    json = JSON.parse(data);
                }
            } catch (ex) {
                this.emit('error', "Unexpected end of JSON input");
                return;
            }
            this.emit('message', json);
        }
    }

    export class ArrayBufferChannel extends Channel {
        public Send(data: any): void {
            if (data instanceof ArrayBuffer) {
                this.SendMessage(data);
            } else if (ArrayBuffer.isView(data)) {
                this.SendMessage(data);
            } else if (data || typeof (data) !== 'undefined' || data !== null) {
                this.SendMessage(utility.UTF8BufferEncode(data.toString()));
            }
        }

        protected OnMessageHandle(data: string | ArrayBuffer): void {
            if (data instanceof ArrayBuffer) {
                this.emit('message', data);
            }
            else {
                this.emit('message', utility.UTF8BufferEncode(data));
            }
        }
    }

    export interface IHttpResponse {
        readonly status: number;
        readonly message: string;
        readonly responseType: string;
        readonly response: any;
        getHeader(name: string): string | null;
        getAllHeaders(): string;
    }

    class _HttpResponseImpl implements IHttpResponse {
        private mXHR: XMLHttpRequest;
        private mDataFormater: (data: any) => any;
        public constructor(xhr: XMLHttpRequest, dataFormater: (data: any) => any) {
            this.mXHR = xhr;
            this.mDataFormater = dataFormater;
        }
        public get status(): number {
            return this.mXHR.status;
        }
        public get message(): string {
            return this.mXHR.statusText;
        }

        public get responseType(): string {
            return this.mXHR.responseType;
        }

        public get response(): any {
            return this.mDataFormater(this.mXHR.response);
        }

        public getHeader(name: string): string | null {
            return this.mXHR.getResponseHeader(name);
        }

        public getAllHeaders(): string {
            return this.mXHR.getAllResponseHeaders();
        }
    }

    export enum HttpResponseType {
        Buffer,
        Blob,
        Text,
        XML,
        JSON
    }
    export class HttpClient extends EventEmitter {
        private mXHR: XMLHttpRequest | null;
        private mHeaders: Map<string, string>;
        private mResponseType: string;
        public Username: string | undefined;
        public Password: string | undefined;
        public Sync: boolean;
        public Timeout: number;

        public constructor() {
            super();
            this.mXHR = null;
            this.mHeaders = new Map<string, string>();
            this.Sync = false;
            this.Timeout = 0;
            this.mResponseType = '';
        }

        public get ResponseType(): HttpResponseType {
            switch (this.mResponseType.toLowerCase()) {
                case 'arraybuffer':
                    return HttpResponseType.Buffer;
                case 'blob':
                    return HttpResponseType.Blob;
                case 'document':
                    return HttpResponseType.XML;
                case 'json':
                    return HttpResponseType.JSON;
                case 'text':
                    return HttpResponseType.Text;
            }
            return HttpResponseType.Text;
        }

        public set ResponseType(value: HttpResponseType) {
            switch (value) {
                case HttpResponseType.Buffer: this.mResponseType = 'arraybuffer'; break;
                case HttpResponseType.Blob: this.mResponseType = 'blob'; break;
                case HttpResponseType.XML: this.mResponseType = 'document'; break;
                case HttpResponseType.JSON: this.mResponseType = 'json'; break;
                case HttpResponseType.Text: this.mResponseType = 'text'; break;
                default:
                    this.mResponseType = '';
                    break;
            }
        }

        public Get(url: string, data?: any): IHttpResponse {
            return this.Request('GET', url, data);
        }

        public Post(url: string, data?: any): IHttpResponse {
            return this.Request('POST', url, data);
        }

        public Put(url: string, data?: any): IHttpResponse {
            return this.Request('PUT', url, data);
        }

        public Delete(url: string, data?: any): IHttpResponse {
            return this.Request('DELETE', url, data);
        }

        public Request(method: string, url: string, data?: any): IHttpResponse {
            let xhr = new XMLHttpRequest();
            let response = new _HttpResponseImpl(xhr, (d) => { return this.FormatResult(d); });
            if (!this.Sync) {
                xhr.onloadstart = () => {
                    try { this.emit('start'); } catch (e) { console.error(e); }
                };
                xhr.onprogress = (ev) => {
                    try { this.emit('progress', ev.loaded, ev.total); } catch (e) { console.error(e); }
                };
                xhr.onload = () => {
                    try {
                        this.emit('load', response);
                    } catch (e) {
                        try { this.emit('error', e.message); } catch (e) { console.error(e); }
                        console.error(e);
                    }
                };

                xhr.onabort = () => {
                    try { this.emit('error', 'abort'); } catch (e) { console.error(e); }
                };

                xhr.onerror = () => {
                    try { this.emit('error', 'unknown error'); } catch (e) { console.error(e); }
                };

                xhr.ontimeout = () => {
                    try { this.emit('error', 'timeout'); } catch (e) { console.error(e); }
                };

                xhr.onloadend = () => {
                    xhr.onloadstart = null;
                    xhr.onprogress = null;
                    xhr.onload = null;
                    xhr.onabort = null;
                    xhr.onerror = null;
                    xhr.ontimeout = null;
                    xhr.onloadend = null;
                    try { this.emit('end'); } catch (e) { console.error(e); }
                };
            }
            let reqUrl = url;
            let isget = method.toLowerCase() === 'get';
            if (isget && typeof (data) !== 'undefined') {
                let i = reqUrl.indexOf('?');
                if (i < 0) {
                    i = reqUrl.indexOf('#');
                }

                if (i < 0) {
                    reqUrl += '?';
                    reqUrl += utility.ToURLParameters(data, true);
                } else {
                    if (reqUrl[i] === '?') {
                        reqUrl = reqUrl.substr(0, i + 1)
                            + utility.ToURLParameters(data, true)
                            + reqUrl.substr(i + 1);
                    } else {
                        reqUrl = reqUrl.substr(0, i)
                            + '?'
                            + utility.ToURLParameters(data, true)
                            + reqUrl.substr(i);
                    }
                }
            }
            this.mHeaders.forEach((k, v) => {
                xhr.setRequestHeader(k, v);
            });

            xhr.timeout = this.Timeout;
            xhr.open(method, reqUrl, !this.Sync, this.Username, this.Password);
            if (!isget) {
                let reqData = this.FormatParameters(data);
                if (reqData !== null) {
                    xhr.send(reqData);
                }
            } else {
                xhr.send();
            }
            this.mXHR = xhr;
            return response;
        }

        public SetHeader(name: string, value: any) {
            if (typeof (value) === 'undefined' || value === null) {
                this.mHeaders.delete(name);
            } else {
                this.mHeaders.set(name, value.toString());
            }
        }

        public Cancel(): void {
            if (this.mXHR) {
                this.mXHR.abort();
            }
        }

        protected FormatParameters(data: any): any {
            if (typeof (data) === 'undefined' || data === null) {
                return null;
            }
            return data;
        }

        protected FormatResult(data: any): any {
            return data;
        }
    }

    export class XMLHttpClient extends HttpClient {
        public constructor() {
            super();
            this.ResponseType = HttpResponseType.XML;
        }
        protected FormatParameters(data: any): any {
            let r = super.FormatParameters(data);
            if (r instanceof Node) {
                let serializer = new XMLSerializer();
                return serializer.serializeToString(r);
            }
            return r.toString();
        }
    }

    export class JsonHttpClient extends HttpClient {
        public constructor() {
            super();
            this.ResponseType = HttpResponseType.JSON;
        }
        protected FormatParameters(data: any): any {
            let r = super.FormatParameters(data);
            return JSON.stringify(r);
        }
    }

    export class StringHttpClient extends HttpClient {
        public constructor() {
            super();
            this.ResponseType = HttpResponseType.Text;
        }
        protected FormatParameters(data: any): any {
            let r = super.FormatParameters(data);
            if (r !== null) {
                return r.toString();
            }
            return '';
        }
    }

    export class BufferHttpClient extends HttpClient {
        public constructor() {
            super();
            this.ResponseType = HttpResponseType.Buffer;
        }
        protected FormatParameters(data: any): any {
            if (data instanceof ArrayBuffer) {
                return data;
            } else if (ArrayBuffer.isView(data)) {
                return data;
            } else if (data || typeof (data) !== 'undefined' || data !== null) {
                return utility.UTF8BufferEncode(data.toString());
            }
            return new Uint8Array(0);
        }
    }
}
