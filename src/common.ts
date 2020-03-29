namespace ftk {

    export interface IReadonlyArray<T> extends Iterable<T> {
        readonly length: number;
        [index: number]: T;
    }

    export interface IClone<T> {
        clone(): T;
    }

    export function NewInstance<T>(typename: string, ...args: any[]): T | undefined {
        const g = window as any;
        const f = g[typename];
        if (typeof (f) === "function") {
            const fn = f as Function;
            args.unshift(null);
            const cfn = fn.bind.apply(fn, args as any);
            return cfn() as T;
        }
        return undefined;
    }

    export interface IEventEmitter {
        addListener(evt: string, listener: Function): void;
        on(evt: string, listener: Function): void;
        once(evt: string, listener: Function): void;
        off(evt: string, listener: Function): void;
        removeListener(evt: string, listener: Function): void;
        resetListeners(): void;
        emit(evt: string, ...args: any[]): void;
    }

    export class EventHandlerChain {
        private mHandlers: Function[] | undefined;
        constructor() {
        }

        public get length() { return this.mHandlers ? this.mHandlers.length : 0; }
        public add(handler: Function) {
            if (!this.mHandlers) {
                this.mHandlers = new Array<Function>();
            }
            this.mHandlers.push(handler);
        }
        public remove(handler: Function) {
            if (this.mHandlers) {
                let i = this.mHandlers.indexOf(handler);
                if (i >= 0) {
                    this.mHandlers.splice(i, 1);
                }
            }
        }
        public reset() {
            this.mHandlers = undefined;
        }
        public call(ctx: any, ...args: any): void {
            if (this.mHandlers && this.mHandlers.length > 0) {
                this.mHandlers.forEach((handler) => {
                    handler.apply(ctx, args);
                });
            }
        }
    }

    export class EventEmitter implements IEventEmitter {
        private mListeners: Map<string, EventHandlerChain> | undefined;
        public addListener(evt: string, listener: Function): void {
            if (!this.mListeners) {
                this.mListeners = new Map<string, EventHandlerChain>();
            }
            let handlerList = this.mListeners.get(evt);
            if (!handlerList) {
                handlerList = new EventHandlerChain();
                this.mListeners.set(evt, handlerList);
            }
            handlerList.add(listener);
        }

        public on(evt: string, listener: Function): void {
            this.addListener(evt, listener);
        }

        public once(evt: string, listener: Function): void {
            let _this = this;
            let newlistener = function (this: any, ...args: any[]): void {
                listener.apply(this, args);
                _this.removeListener(evt, newlistener);
            };
            this.addListener(evt, newlistener);
        }

        public off(evt: string, listener?: Function): void {
            this.removeListener(evt, listener);
        }

        public removeListener(evt: string, listener?: Function): void {
            if (this.mListeners) {
                let handlerList = this.mListeners.get(evt);
                if (handlerList) {
                    if (listener) {
                        handlerList.remove(listener);
                    } else {
                        this.mListeners.delete(evt);
                    }
                }
            }
        }

        public resetListeners(): void {
            this.mListeners = undefined;
        }

        public emit(evt: string, ...args: any[]): void {
            this.emitEx(this, evt, ...args);
        }

        protected emitEx(thisArg: any, evt: string, ...args: any[]): void {
            if (this.mListeners) {
                let handlerList = this.mListeners.get(evt);
                if (handlerList) {
                    handlerList.call(thisArg, ...args);
                }
            }
        }
    }
}
