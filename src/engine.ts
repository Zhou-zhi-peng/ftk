/// <reference path="./objectnode.ts" />
/// <reference path="./stage.ts" />
/// <reference path="./sprite.ts" />
/// <reference path="./ui/progressbar.ts" />

namespace ftk {

    export abstract class AbstractEngine extends EventEmitter {
        private mRC: CanvasRenderingContext2D;
        private mCanvas: HTMLCanvasElement;
        private mOffscreenRC: CanvasRenderingContext2D;
        private mOffscreenCanvas: HTMLCanvasElement;
        private mRootNode: Stage;
        private mEventPrevTarget: IObjectNode | null;
        private mEventCaptured: boolean;
        private mEventCaptureContext: any;
        private mResourceManager: IResourceDB;
        private mFrameRate: number;
        private mEngineUpdateEventArg = new EngineEvent(this, 0);
        private mEngineRanderEventArg = new EngineEvent(this, null);

        public constructor(canvas: HTMLCanvasElement) {
            super();
            canvas.addEventListener("mousedown", (ev) => { this.OnMouseDown(ev); });
            canvas.addEventListener("mouseup", (ev) => { this.OnMouseUp(ev); });
            canvas.addEventListener("mousemove", (ev) => { this.OnMouseMove(ev); });
            this.mCanvas = canvas;
            this.mRC = canvas.getContext("2d", { alpha: false }) as CanvasRenderingContext2D;
            this.mOffscreenCanvas = AbstractEngine.createOffscreenCanvas(this.mCanvas.width, this.mCanvas.height);
            this.mOffscreenRC = this.mOffscreenCanvas.getContext("2d", { alpha: false }) as CanvasRenderingContext2D;
            this.mRootNode = new Stage(canvas.width, canvas.height);
            this.mEventPrevTarget = null;
            this.mEventCaptured = false;
            this.mEventCaptureContext = undefined;
            this.mResourceManager = new ResourceDBEditor();
            this.mFrameRate = 60;
        }

        public get FrameRate(): number { return this.mFrameRate; }
        public get ViewportWidth(): number { return this.mCanvas.width; }
        public get ViewportHeight(): number { return this.mCanvas.height; }
        public get Root(): Stage { return this.mRootNode; }
        public get R(): IResourceDB {
            return this.mResourceManager;
        }

        public Run(): void {
            this.mRC.clearRect(0, 0, this.ViewportWidth, this.ViewportHeight);
            this.StartLoop();
            this.OnRun();
        }

        public Notify(source: any, name: string, broadcast: boolean, message: any): any {
            let ev = new NoticeEvent(source, name, broadcast, message);
            let root = this.Root;
            if (broadcast) {
                root.DispatchNoticeEvent(ev, false);
            }
            this.emit(name, ev);
            return undefined;
        }

        protected setFrameRate(value: number) { this.mFrameRate = value; }
        protected abstract OnRun(): void;

        private StartLoop(): void {
            let lastUpdateTime: number = 0;
            let looper = (timestamp: number) => {
                let t = 1000 / this.FrameRate;
                if (timestamp - lastUpdateTime > t) {
                    this.MainLoop(timestamp);
                    lastUpdateTime = timestamp;
                }
                requestAnimationFrame(looper);
            };
            requestAnimationFrame(looper);
        }

        private MainLoop(timestamp: number): void {
            let root = this.Root;
            root.Update(timestamp);
            this.mEngineUpdateEventArg.Args = timestamp;
            this.emit("update", this.mEngineUpdateEventArg);
            this.Rander();
        }

        private Rander(): void {
            let root = this.Root;
            this.mOffscreenRC.save();
            root.Rander(this.mOffscreenRC);
            this.mOffscreenRC.restore();

            this.mEngineRanderEventArg.Args = this.mOffscreenRC;
            this.emit('rander', this.mEngineRanderEventArg);

            this.mRC.drawImage(this.mOffscreenCanvas, 0, 0);
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
            if (this.mEventCaptured) {
                gev.CaptureContext = this.mEventCaptureContext;
            }
            return gev;
        }

        private OnMouseEvent(type: InputEventType, ev: MouseEvent) {
            let root = this.Root;
            let gev = this.createGMouseEvent(type, ev);
            root.DispatchMouseEvent(gev, false);
            if (gev.StopPropagation) {
                ev.stopPropagation();
            }
            if (gev.Target) {
                switch (gev.InputType) {
                    case InputEventType.MouseDown: {
                        this.emit("mousedown", gev);
                        break;
                    }
                    case InputEventType.MouseMove: {
                        if (this.mEventPrevTarget != gev.Target) {
                            if (this.mEventPrevTarget) {
                                let newev = this.createGMouseEvent(InputEventType.MouseLeave, ev);
                                this.mEventPrevTarget.DispatchMouseEvent(newev, true);
                                this.emit("mouselevae", newev);
                            }
                            if (gev.Target) {
                                let newev = this.createGMouseEvent(InputEventType.MouseEnter, ev);
                                gev.Target.DispatchMouseEvent(newev, true);
                                this.emit("mouseenter", newev);
                            }
                        }

                        this.emit("mousemove", gev);
                        break;
                    }
                    case InputEventType.MouseUp: {
                        this.emit("mouseup", gev);
                        break;
                    }
                }
            }
            if (this.mCanvas.style.cursor !== gev.Cursor) {
                this.mCanvas.style.cursor = gev.Cursor;
            }
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

        private static createOffscreenCanvas(width: number, height: number): HTMLCanvasElement {
            let globalThis = window as any;
            if (globalThis["OffscreenCanvas"]) {
                let OffscreenCanvas = globalThis["OffscreenCanvas"] as any;
                return new OffscreenCanvas(width, height) as HTMLCanvasElement;
            } else {
                let OffscreenCanvas = document.createElement('canvas');
                OffscreenCanvas.width = width;
                OffscreenCanvas.height = height;
                return OffscreenCanvas;
            }
        }
    }

    export type LibrarySetupOptions = {
        canvas: HTMLCanvasElement,
        ViewportWidth?: number;
        ViewportHeight?: number;
        VideoQuality?: number;
        FrameRate?: number;
        HideLogo?: boolean;
        HideLoading?: boolean;
    };

    export class EngineLogoSprite extends Sprite {
        private mColor0 = new Color(0xff0060ff);
        private mColor1 = new Color(0xff0000ff);
        private mShadowBlur = 5;
        constructor(x: number, y: number, w: number, h: number, id?: string) {
            super(id);
            this.Position = new Point(x, y);
            this.Resize(w, h);
            this.BasePoint = new Point(w / 2, h / 2);
        }

        protected OnRander(rc: CanvasRenderingContext2D): void {
            let box = this.Box;
            this.DrawEngineLogo(rc, box.x, box.y, Math.min(box.w, box.h));
        }

        protected OnUpdate(timestamp: number): void {
            this.mShadowBlur = Math.sin(timestamp / 300) * 15 + 20;

        }
        private DrawEngineLogo(rc: CanvasRenderingContext2D, x: number, y: number, size: number): void {
            let r0 = size / 2;
            let r1 = r0 / 1.67;
            let xc = x + r0;
            let yc = y + r0;
            const astep = Math.PI / 3;
            rc.beginPath();
            let angle = astep;
            rc.moveTo(xc + r0, yc);
            for (let i = 1; i < 6; ++i) {
                rc.lineTo(xc + Math.cos(angle) * r0, yc + Math.sin(angle) * r0);
                angle += astep;
            }

            rc.closePath();
            rc.fillStyle = this.mColor0.toRGBAString();
            let shadowColor = new Color(rc.fillStyle);
            shadowColor.addLightness(0x50);
            rc.shadowColor = shadowColor.toRGBAString();
            rc.shadowBlur = this.mShadowBlur;
            rc.fill();

            rc.beginPath();
            angle = astep;
            rc.moveTo(xc + r1, yc);
            for (let i = 1; i < 6; ++i) {
                rc.lineTo(xc + Math.cos(angle) * r1, yc + Math.sin(angle) * r1);
                angle += astep;
            }
            rc.closePath();
            rc.shadowBlur = 0;
            rc.fillStyle = this.mColor1.toRGBAString();
            rc.fill();

            rc.beginPath();
            let x0 = xc + r0;
            let y0 = yc;
            let x1 = xc + r1;
            let y1 = yc;
            angle = astep;
            rc.moveTo(x1, y1);
            for (let i = 1; i < 7; ++i) {
                x1 = xc + Math.cos(angle) * r1;
                y1 = yc + Math.sin(angle) * r1;
                let nx = xc + Math.cos(angle) * r0;
                let ny = yc + Math.sin(angle) * r0;
                rc.lineTo(x1, y1);
                rc.lineTo(nx, ny);
                rc.lineTo(x0, y0);
                rc.moveTo(x1, y1);
                x0 = nx;
                y0 = ny;
                angle += astep;
            }
            // canvas.closePath();
            rc.lineWidth = 0.8;
            rc.strokeStyle = "#fff";
            rc.stroke();

            rc.fillStyle = this.mColor1.toRGBAString();
            rc.strokeStyle = "#fff";
            rc.lineWidth = 0.5;
            rc.font = (size / 6).toString() + "px serif";
            rc.textBaseline = "middle";
            rc.textAlign = "center";
            rc.fillText("F T K", xc, yc);
            rc.strokeText("F T K", xc, yc);
        }
    }

    class EngineImpl extends AbstractEngine {
        private mBackgroundLayer: ColoredLayer | undefined;
        private mLogo: Sprite | undefined;
        private mLoadingProgressBar: ui.ProgressBar | undefined;
        constructor(options: LibrarySetupOptions) {
            super(options.canvas);
            if (options.FrameRate) {
                this.setFrameRate(options.FrameRate);
            }
            if (!options.HideLogo) {
                this.AddEngineLogo();
            }
            if (!options.HideLoading) {
                this.AddLoadingProgressBar();
                this.addListener("loading", (ev: EngineEvent) => {
                    let progress = ev.Args as number;
                    if (this.mLoadingProgressBar) {
                        this.mLoadingProgressBar.Value = progress;
                    }
                });
            }
            this.addListener("ready", () => {
                if (this.mBackgroundLayer) {
                    if (this.mLogo) {
                        this.mBackgroundLayer.RemoveNode(this.mLogo.Id);
                        this.mLogo = undefined;
                    }
                    if (this.mLoadingProgressBar) {
                        this.mBackgroundLayer.RemoveNode(this.mLoadingProgressBar.Id);
                        this.mLoadingProgressBar = undefined;
                    }
                    this.Root.RemoveLayer(this.mBackgroundLayer.Id);
                    this.mBackgroundLayer = undefined;
                }
            });
        }
        public OnRun(): void {
            if (this.mLogo) {
                setTimeout(() => {
                    if (this.mLogo) {
                        this.mLogo.Visible = false;
                    }
                    if (this.mLoadingProgressBar) {
                        this.mLoadingProgressBar.Visible = true;
                    }
                    this._Start();
                }, 2000);
            } else {
                if (this.mLoadingProgressBar) {
                    this.mLoadingProgressBar.Visible = true;
                }
                this._Start();
            }
        }
        public Shutdown(): void {
            this.emit("shutdown", new EngineEvent(this, null));
            this.R.Edit().Clear();
        }

        private _Start(): void {
            this.R.Edit().LoadAll((progress) => {
                this.emit("loading", new EngineEvent(this, progress));
            }).then(() => {
                this.emit("ready", new EngineEvent(this, null));
            }).catch((reason) => {
                this.emit("fault", new EngineEvent(this, reason));
            });
        }

        private AddBackgroundLayer(): Layer {
            if (!this.mBackgroundLayer) {
                this.mBackgroundLayer = new ColoredLayer();
                this.mBackgroundLayer.BackgroundColor = new Color("#000");
                this.Root.AddLayer(this.mBackgroundLayer);
            }
            return this.mBackgroundLayer;
        }
        private AddEngineLogo(): void {
            let size = Math.min(this.ViewportWidth, this.ViewportHeight) / 5;
            let x = (this.ViewportWidth - size) / 2;
            let y = (this.ViewportHeight - size) / 2;
            this.mLogo = new EngineLogoSprite(x, y, size, size);
            this.AddBackgroundLayer().AddNode(this.mLogo);
        }

        private AddLoadingProgressBar(): void {
            let size = Math.min(this.ViewportWidth, this.ViewportHeight) / 5;
            let x = (this.ViewportWidth - size) / 2;
            let y = (this.ViewportHeight - size) / 2;
            this.mLoadingProgressBar = new ui.CircularProgressBar(x, y, size, size);
            this.mLoadingProgressBar.Visible = false;
            this.AddBackgroundLayer().AddNode(this.mLoadingProgressBar);
        }
    }

    let _EngineImpl: EngineImpl | null = null;
    export let Engine: AbstractEngine;
    export function LibrarySetup(options: LibrarySetupOptions): void {
        if (_EngineImpl) {
            throw Error("Libraries cannot be initialized more than once!");
        }
        _EngineImpl = new EngineImpl(options);
        Engine = _EngineImpl;
    }

    export function LibraryShutdown(): void {
        if (_EngineImpl) {
            _EngineImpl.Shutdown();
        }
        _EngineImpl = null;
        (Engine as any) = undefined;
    }
}
