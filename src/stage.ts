/// <reference path="./objectnode.ts" />
/// <reference path="./utility.ts" />


namespace ftk {
    export class Stage implements IObjectNode {
        private mID: string;
        private mLayerList = new Array<Layer>();
        private mWidth: number;
        private mHeight: number;

        constructor(width: number, height: number, id?: string) {
            if ((!id) || id.length == 0) {
                id = ftk.utility.GenerateIDString(16);
            }
            this.mID = id;
            this.mWidth = width;
            this.mHeight = height;
        }

        public get Id(): string {
            return this.mID;
        }

        public get Width(): number {
            return this.mWidth;
        }

        public set Width(value: number) {
            this.mWidth = value;
        }

        public get Height(): number {
            return this.mHeight;
        }

        public set Height(value: number) {
            this.mHeight = value;
        }

        public AddLayer(layer: Layer): Stage {
            this.mLayerList.unshift(layer);
            return this;
        }

        public RemoveLayer(id: string): Stage {
            for (let i = 0; i < this.mLayerList.length; ++i) {
                if (this.mLayerList[i].Id === id) {
                    this.mLayerList.splice(i--, 1);
                }
            }
            return this;
        }

        public GetLayer(id: string): Layer | undefined {
            for (let i = 0; i < this.mLayerList.length; ++i) {
                if (this.mLayerList[i].Id === id) {
                    return this.mLayerList[i];
                }
            }
            return undefined;
        }

        public forEach(callback: (layer: Layer) => void) {
            this.mLayerList.forEach(callback);
        }

        public Sort(compareCallback: (a: Layer, b: Layer) => number) {
            this.mLayerList.sort(compareCallback);
        }

        public MoveToTop(layer: Layer) {
            this.RemoveLayer(layer.Id);
            this.mLayerList.unshift(layer);
        }

        public MoveToBottom(layer: Layer) {
            this.RemoveLayer(layer.Id);
            this.mLayerList.push(layer);
        }

        public DispatchTouchEvent(ev: GTouchEvent, forced: boolean): void {
            let values = this.mLayerList
            for (let i = 0; i < values.length; ++i) {
                values[i].DispatchTouchEvent(ev, forced);
                if (ev.StopPropagation)
                    break;
            }
        }
        public DispatchMouseEvent(ev: GMouseEvent, forced: boolean): void {
            let values = this.mLayerList
            for (let i = 0; i < values.length; ++i) {
                values[i].DispatchMouseEvent(ev, forced);
                if (ev.StopPropagation)
                    break;
            }
        }
        public DispatchKeyboardEvent(ev: GKeyboardEvent, forced: boolean): void {
            let values = this.mLayerList
            for (let i = 0; i < values.length; ++i) {
                values[i].DispatchKeyboardEvent(ev, forced);
                if (ev.StopPropagation)
                    break;
            }
        }
        public DispatchNoticeEvent(ev: NoticeEvent, forced: boolean): void {
            let values = this.mLayerList
            for (let i = 0; i < values.length; ++i) {
                values[i].DispatchNoticeEvent(ev, forced);
                if (ev.StopPropagation)
                    break;
            }
        }

        public Update(timestamp: number): void {
            this.mLayerList.forEach((node) => {
                node.Update(timestamp);
            });
        }

        public Rander(canvas: CanvasRenderingContext2D): void {
            for (let i = this.mLayerList.length - 1; i >= 0; --i) {
                this.mLayerList[i].Rander(canvas);
            }
        }
    }
}