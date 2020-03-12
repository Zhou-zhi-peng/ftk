/// <reference path="./utility.ts" />

namespace ftk.net {
    export type ChannelOptions = {
        url: string,
        reconnectInterval: number,
        maxReconnectCount?: number,
        protocols?: string | string[]
    };

    const _voidfunction = () => { };

    export abstract class Channel {
        private mSocket: WebSocket | null;
        private mReconnectInterval: number;
        private mMaxReconnectCount: number;
        private mReconnectCount: number;
        private mCloseing: boolean;
        private mWaitingQueue: Array<ArrayBuffer>;
        private mOnReconnect: ((count: number) => void) | null;
        private mOnError: ((reason: string) => void) | null;

        constructor(options: ChannelOptions) {
            this.mSocket = null;
            this.mReconnectInterval = options.reconnectInterval;
            this.mMaxReconnectCount = options.maxReconnectCount ? options.maxReconnectCount : 0;
            this.mReconnectCount = 0;
            this.mCloseing = false;
            this.mWaitingQueue = new Array<ArrayBuffer>();
            this.mOnReconnect = _voidfunction;
            this.mOnError = _voidfunction;
            this.connect(options.url, options.protocols);
        }

        public get OnReconnect(): (count: number) => void {
            if (!this.mOnReconnect)
                return _voidfunction;
            return this.mOnReconnect;
        }
        public set OnReconnect(value: (count: number) => void) {
            this.mOnReconnect = value;
        }

        public get OnError(): (reason: string) => void {
            if (!this.mOnError)
                return _voidfunction;
            return this.mOnError;
        }
        public set OnError(value: (reason: string) => void) {
            this.mOnError = value;
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

            this.mSocket.onerror = (ev) => {
                if ((!this.mSocket) || this.mSocket.readyState != WebSocket.OPEN) {
                    this.reconnect(url, protocols);
                }
            };

            this.mSocket.onmessage = (ev) => {
                this.OnMessageHandle(ev.data);
            };
            this.mSocket.onopen = (ev) => {
                this.mReconnectCount=0;
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
                this.OnError("Reconnect exceeds maximum number.");
            } else {
                setTimeout(() => {
                    this.OnReconnect(this.mReconnectCount);
                    if (!this.mCloseing)
                        this.connect(url, protocols);
                }, this.mReconnectInterval);
            }
        }

        protected abstract OnMessageHandle(data: ArrayBuffer): void;

        protected SendMessage(data: ArrayBuffer): void {
            if (this.mSocket && this.Connected) {
                this.mSocket.send(data);
            } else {
                if(this.mCloseing){
                    this.OnError("Can't try an operation on an unrecoverable channel.");
                }else{
                    if (this.mWaitingQueue.length > 1024 * 8)
                        this.mWaitingQueue.shift();
                    this.mWaitingQueue.push(data);
                }
            }
        }
        public get Connected(): boolean {
            return (!this.mCloseing) && (this.mSocket!==null) && (this.mSocket.readyState === WebSocket.OPEN);
        }
        public get WaitingQueueLength(): number {
            return this.mWaitingQueue.length;
        }
        private _Close(): void {
            if (this.mSocket) {
                this.mSocket.onclose = null;
                this.mSocket.onerror = null;
                this.mSocket.onmessage = null;
                this.mSocket.onopen = null;

                if (this.mSocket.readyState !== WebSocket.CLOSED)
                    this.mSocket.close(255, "call close function");
            }
        }

        private Close(): void {
            this.mCloseing = true;
            this.mWaitingQueue.length = 0
            this._Close();
        }
    }

    export class StringChannel extends Channel {
        private mOnMessage: ((data: string) => void) | null = _voidfunction;
        protected OnMessageHandle(data: ArrayBuffer): void {
            this.OnMessage(utility.UTF8BufferDecode(data));
        }
        public get OnMessage(): (data: string) => void {
            if (!this.mOnMessage)
                return _voidfunction;
            return this.mOnMessage;
        }
        public set OnMessage(value: (data: string) => void) {
            this.mOnMessage = value;
        }

        public Send(data: string): void {
            this.SendMessage(utility.UTF8BufferEncode(data));
        }
    }

    export class JsonChannel extends Channel {
        private mOnMessage: ((data: any) => void) | null = _voidfunction;
        protected OnMessageHandle(data: ArrayBuffer): void {
            let json:any;
            try{
                json = JSON.parse(utility.UTF8BufferDecode(data));
            }catch(ex){
                this.OnError("Unexpected end of JSON input");
                return;
            }
            this.OnMessage(json);
        }
        public get OnMessage(): (data: any) => void {
            if (!this.mOnMessage)
                return _voidfunction;
            return this.mOnMessage;
        }
        public set OnMessage(value: (data: any) => void) {
            this.mOnMessage = value;
        }
        public Send(data: any): void {
            this.SendMessage(utility.UTF8BufferEncode(JSON.stringify(data)));
        }
    }

    export class ArrayBufferChannel extends Channel {
        private mOnMessage: ((data: ArrayBuffer) => void) | null = _voidfunction;
        protected OnMessageHandle(data: ArrayBuffer): void {
            this.OnMessage(data);
        }
        public get OnMessage(): (data: ArrayBuffer) => void {
            if (!this.mOnMessage)
                return _voidfunction;
            return this.mOnMessage;
        }
        public set OnMessage(value: (data: ArrayBuffer) => void) {
            this.mOnMessage = value;
        }

        public Send(data: any): void {
            this.SendMessage(data);
        }
    }
}