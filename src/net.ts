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

        public get Connected(): boolean {
            return (!this.mCloseing) && (this.mSocket !== null) && (this.mSocket.readyState === WebSocket.OPEN);
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

                if (this.mSocket.readyState !== WebSocket.CLOSED) {
                    this.mSocket.close(255, "call close function");
                }
            }
        }

        private Close(): void {
            this.mCloseing = true;
            this.mWaitingQueue.length = 0
            this._Close();
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
    }

    export class StringChannel extends Channel {
        protected OnMessageHandle(data: string | ArrayBuffer): void {
            if (data instanceof ArrayBuffer) {
                this.emit('message', utility.UTF8BufferDecode(data));
            }
            else {
                this.emit('message', data);
            }
        }

        public Send(data: string): void {
            this.SendMessage(data);
        }
    }

    export class JsonChannel extends Channel {
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

        public Send(data: any): void {
            this.SendMessage(utility.UTF8BufferEncode(JSON.stringify(data)));
        }
    }

    export class ArrayBufferChannel extends Channel {
        protected OnMessageHandle(data: string | ArrayBuffer): void {
            if (data instanceof ArrayBuffer) {
                this.emit('message', data);
            }
            else {
                this.emit('message', utility.UTF8BufferEncode(data));
            }
        }

        public Send(data: any): void {
            if (data instanceof ArrayBuffer) {
                this.SendMessage(data);
            } else if (ArrayBuffer.isView(data)) {
                this.SendMessage(data);
            } else if (data && typeof (data) !== 'undefined') {
                this.SendMessage(utility.UTF8BufferEncode(data.toString()));
            }
        }
    }
}
