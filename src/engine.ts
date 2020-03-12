/// <reference path="./objectnode.ts" />
/// <reference path="./stage.ts" />


namespace ftk {
    export type MouseEventName =
        "mousedown" |
        "mouseup" |
        "mousemove" |
        "mouseenter" |
        "mouselevae";

    export type TouchEventName =
        "touchcancel" |
        "touchend" |
        "touchmove" |
        "touchstart";

    export type KeyboardEventName =
        "keydown" |
        "keyup";

    export type EngineEventName =
        "ready" |
        "shutdown" |
        "update" |
        "rander" |
        "pause" |
        "resume" |
        "fault" |
        "offline" |
        "online" |
        "active" |
        "inactive";

    export interface IEventListener {
        addMouseListener(name: MouseEventName, handler: (ev: GMouseEvent) => void): void;
        addTouchListener(name: TouchEventName, handler: (ev: GTouchEvent) => void): void;
        addKeyboardListener(name: KeyboardEventName, handler: (ev: GKeyboardEvent) => void): void;
        addEngineListener(name: EngineEventName, handler: (ev: EngineEvent) => void): void;
        addNoticeListener(name: string, handler: (ev: NoticeEvent) => void): void;
    }

    class EventHandlerChain {
        private mHandlers: Array<Function>;
        constructor() {
            this.mHandlers = new Array<Function>();
        }

        public get length() { return this.mHandlers.length; }
        public add(handler: Function) {
            this.mHandlers.push(handler);
        }
        public remove(handler: Function) {
            let i = this.mHandlers.indexOf(handler);
            if (i >= 0) {
                this.mHandlers.splice(i, 1);
            }
        }
        public call(ctx: any, ...args: any): any {
            let r: any;
            this.mHandlers.forEach((handler) => {
                r = handler.apply(ctx, args);
            });
            return r;
        }
    }

    export abstract class AbstractEngine implements IEventListener {
        private mRC: CanvasRenderingContext2D;
        private mCanvas: HTMLCanvasElement;
        private mRootNode: Stage;
        private mEventPrevTarget: IObjectNode | null;
        private mEventCaptured: boolean;
        private mEventCaptureContext: any;
        private mEventHandlerMap: Map<string, EventHandlerChain>;
        private mNoticeHandlerMap: Map<string, EventHandlerChain>;
        private mResourceManager:IResourceDB;
        private mFrameRate:number;
        constructor(canvas: HTMLCanvasElement) {
            canvas.addEventListener("mousedown", (ev) => { this.OnMouseDown(ev); });
            canvas.addEventListener("mouseup", (ev) => { this.OnMouseUp(ev); });
            canvas.addEventListener("mousemove", (ev) => { this.OnMouseMove(ev); });
            this.mCanvas = canvas;
            this.mRC = canvas.getContext("2d") as CanvasRenderingContext2D;
            this.mRootNode = new Stage(canvas.width, canvas.height);
            this.mEventPrevTarget = null;
            this.mEventCaptured = false;
            this.mEventCaptureContext = undefined;
            this.mEventHandlerMap = new Map<string, EventHandlerChain>();
            this.mNoticeHandlerMap = new Map<string, EventHandlerChain>();
            this.mResourceManager = new ResourceDBEditor();
            this.mFrameRate = 60;

            this.mEventHandlerMap.set("mousedown", new EventHandlerChain());
            this.mEventHandlerMap.set("mouseup", new EventHandlerChain());
            this.mEventHandlerMap.set("mousemove", new EventHandlerChain());
            this.mEventHandlerMap.set("mouseenter", new EventHandlerChain());
            this.mEventHandlerMap.set("mouselevae", new EventHandlerChain());
            this.mEventHandlerMap.set("touchcancel", new EventHandlerChain());
            this.mEventHandlerMap.set("touchend", new EventHandlerChain());
            this.mEventHandlerMap.set("touchmove", new EventHandlerChain());
            this.mEventHandlerMap.set("touchstart", new EventHandlerChain());
            this.mEventHandlerMap.set("keydown", new EventHandlerChain());
            this.mEventHandlerMap.set("keyup", new EventHandlerChain());
            this.mEventHandlerMap.set("ready", new EventHandlerChain());
            this.mEventHandlerMap.set("shutdown", new EventHandlerChain());
            this.mEventHandlerMap.set("update", new EventHandlerChain());
            this.mEventHandlerMap.set("rander", new EventHandlerChain());
            this.mEventHandlerMap.set("pause", new EventHandlerChain());
            this.mEventHandlerMap.set("resume", new EventHandlerChain());
            this.mEventHandlerMap.set("fault", new EventHandlerChain());
            this.mEventHandlerMap.set("offline", new EventHandlerChain());
            this.mEventHandlerMap.set("online", new EventHandlerChain());
            this.mEventHandlerMap.set("active", new EventHandlerChain());
            this.mEventHandlerMap.set("inactive", new EventHandlerChain());
        }

        public get FrameRate(): number { return this.mFrameRate; }
        public set FrameRate(value: number) { this.mFrameRate = value; }
        public get Root(): Stage { return this.mRootNode; }
        public get R():IResourceDB{
            return this.mResourceManager;
        }

        public Run(): void {
            this.R.Edit().LoadAll().then(() => {
                this.callEventHandler("ready", new EngineEvent(this, null));
                this.StartLoop();
            }).catch((reason)=>{
                this.callEventHandler("fault",new EngineEvent(this, reason))
            });
        }

        public Notify(source: any, name: string, broadcast: boolean, message: any): any {
            let ev = new NoticeEvent(source, name, broadcast, message);
            let root = this.Root;
            if (broadcast) {
                root.DispatchNoticeEvent(ev, false);
            }
            let hc = this.mNoticeHandlerMap.get(name);
            if (hc)
                return hc.call(this, ev);
            return undefined;
        }

        public addMouseListener(name: MouseEventName, handler: (ev: GMouseEvent) => void): void {
            let hc = this.mEventHandlerMap.get(name);
            if (hc)
                return hc.add(handler);
        }
        public addTouchListener(name: TouchEventName, handler: (ev: GTouchEvent) => void): void {
            let hc = this.mEventHandlerMap.get(name);
            if (hc)
                return hc.add(handler);
        }
        public addKeyboardListener(name: KeyboardEventName, handler: (ev: GKeyboardEvent) => void): void {
            let hc = this.mEventHandlerMap.get(name);
            if (hc)
                return hc.add(handler);
        }
        public addEngineListener(name: EngineEventName, handler: (ev: EngineEvent) => void): void {
            let hc = this.mEventHandlerMap.get(name);
            if (hc)
                return hc.add(handler);
        }
        public addNoticeListener(name: string, handler: (ev: NoticeEvent) => void): void {
            let hc = this.mEventHandlerMap.get(name);
            if (hc)
                return hc.add(handler);
        }


        private StartLoop(): void {
            let lastUpdateTime: number = 0;
            let looper = (timestamp: number) => {
                let t = 1000 / this.FrameRate;
                if (timestamp - lastUpdateTime > t) {
                    this.MainLoop(timestamp);
                    lastUpdateTime = timestamp;
                }
                requestAnimationFrame(looper);
            }
            requestAnimationFrame(looper);
        }

        private mEngineUpdateEventArg = new EngineEvent(this, 0);
        private MainLoop(timestamp: number): void {
            let root = this.Root;
            root.Update(timestamp);
            this.mEngineUpdateEventArg.Args = timestamp;
            this.callEventHandler("update", this.mEngineUpdateEventArg);
            this.Rander();
        }

        private mEngineRanderEventArg = new EngineEvent(this, null);
        private Rander(): void {
            let root = this.Root;
            this.mRC.save();
            root.Rander(this.mRC);
            this.mEngineRanderEventArg.Args = this.mRC;
            this.mRC.restore();
        }

        private createGMouseEvent(type: InputEventType, ev: MouseEvent): GMouseEvent {
            let gev = new GMouseEvent(
                this,
                type,
                ev.altKey,
                ev.ctrlKey,
                ev.shiftKey,
                ev.clientX,
                ev.clientY,
                ev.button,
                0
            );
            if (this.mEventCaptured)
                gev.CaptureContext = this.mEventCaptureContext;
            return gev;
        }
        protected callEventHandler(name: string, ev: GEvent) {
            let hc = this.mEventHandlerMap.get(name);
            if (hc)
                hc.call(this, ev);
        }
        private OnMouseEvent(type: InputEventType, ev: MouseEvent) {
            let root = this.Root;
            let gev = this.createGMouseEvent(type, ev);
            root.DispatchMouseEvent(gev, false);
            if (gev.StopPropagation)
                ev.stopPropagation();
            if (gev.Target) {
                switch (gev.InputType) {
                    case InputEventType.MouseDown: {
                        this.callEventHandler("mousedown", gev);
                        break;
                    }
                    case InputEventType.MouseMove: {
                        if (this.mEventPrevTarget != gev.Target) {
                            if (this.mEventPrevTarget) {
                                let newev = this.createGMouseEvent(InputEventType.MouseLeave, ev);
                                this.mEventPrevTarget.DispatchMouseEvent(newev, true);
                                this.callEventHandler("mouselevae", newev);
                            }
                            if (gev.Target) {
                                let newev = this.createGMouseEvent(InputEventType.MouseEnter, ev);
                                gev.Target.DispatchMouseEvent(newev, true);
                                this.callEventHandler("mouseenter", newev);
                            }
                        }

                        this.callEventHandler("mousemove", gev);
                        break;
                    }
                    case InputEventType.MouseUp: {
                        this.callEventHandler("mouseup", gev);
                        break;
                    }
                }
            }
            if (this.mCanvas.style.cursor !== gev.Cursor)
                this.mCanvas.style.cursor = gev.Cursor;
            this.mEventPrevTarget = gev.Target;
            this.mEventCaptured = gev.Captured;
            this.mEventCaptureContext = gev.Captured ? gev.CaptureContext : undefined;
        }
        private OnMouseDown(ev: MouseEvent): void {
            this.OnMouseEvent(InputEventType.MouseDown, ev);
        }

        private OnMouseUp(ev: MouseEvent): void {
            this.OnMouseEvent(InputEventType.MouseUp, ev);
        }

        private OnMouseMove(ev: MouseEvent): void {
            this.OnMouseEvent(InputEventType.MouseMove, ev);
        }
    }

    class EngineImpl extends AbstractEngine {
        public Shutdown(): void {
            this.callEventHandler("shutdown", new EngineEvent(this, null));
            this.R.Edit().Clear();
        }
    }

    export type LibrarySetupOptions = {
        canvas: HTMLCanvasElement,
        ViewportWidth?: number;
        ViewportHeight?: number;
        VideoQuality?: number;
        FrameRate?: number;
    };

    let _EngineImpl: EngineImpl | null = null;
    export let Engine: AbstractEngine;
    export function LibrarySetup(options: LibrarySetupOptions): void {
        if (_EngineImpl)
            throw Error("Libraries cannot be initialized more than once!");
        _EngineImpl = new EngineImpl(options.canvas);
        Engine = _EngineImpl;
    }

    export function LibraryShutdown(options: LibrarySetupOptions): void {
        if (_EngineImpl)
            _EngineImpl.Shutdown();
        _EngineImpl = null;
        (Engine as any) = undefined;
    }
}