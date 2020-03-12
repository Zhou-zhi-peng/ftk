/// <reference path="./objectnode.ts" />

namespace ftk {
    export abstract class Layer implements IObjectNode {
        private mNodes: Array<IObjectNode>;
        private mVisible: boolean;
        private mEventTransparent: boolean;
        private mID = ftk.utility.GenerateIDString(32);
        private mUpdateForHide: boolean;
        constructor() {
            this.mNodes = new Array<IObjectNode>();
            this.mVisible = true;
            this.mEventTransparent = true;
            this.mUpdateForHide = false;
        }

        public get Id(): string {
            return this.mID;
        }
        public get Visible(): boolean {
            return this.mVisible;
        }

        public set Visible(value: boolean) {
            this.mVisible = value;
        }

        public get UpdateForHide(): boolean {
            return this.mUpdateForHide;
        }

        public set UpdateForHide(value: boolean) {
            this.mUpdateForHide = value;
        }

        public get EventTransparent(): boolean {
            return this.mEventTransparent;
        }

        public set EventTransparent(value: boolean) {
            this.mEventTransparent = value;
        }

        public AddNode(node: IObjectNode): Layer {
            this.mNodes.push(node);
            return this;
        }

        public RemoveNode(id: string): Layer {
            for (let i = 0; i < this.mNodes.length; ++i) {
                if (this.mNodes[i].Id === id) {
                    this.mNodes.splice(i--, 1);
                }
            }
            return this;
        }

        public GetNode(id: string): IObjectNode | undefined {
            for (let i = 0; i < this.mNodes.length; ++i) {
                if (this.mNodes[i].Id === id) {
                    return this.mNodes[i];
                }
            }
            return undefined;
        }

        public forEach(callback: (node: IObjectNode) => void) {
            this.mNodes.forEach(callback);
        }

        public Sort(compareCallback: (a: IObjectNode, b: IObjectNode) => number) {
            this.mNodes.sort(compareCallback);
        }

        public Rander(canvas: CanvasRenderingContext2D): void {
            if (!this.Visible)
                return;

            for (let i = this.mNodes.length - 1; i >= 0; --i) {
                this.mNodes[i].Rander(canvas);
            }
        }

        public DispatchTouchEvent(ev: GTouchEvent, forced: boolean): void {
            if (this.Visible) {
                if (!this.EventTransparent) {
                    ev.Target = this;
                    ev.StopPropagation = true;
                }
                let values = this.mNodes
                for (let i = 0; i < values.length; ++i) {
                    values[i].DispatchTouchEvent(ev, forced);
                    if (ev.StopPropagation)
                        break;
                }
            }
        }
        public DispatchMouseEvent(ev: GMouseEvent, forced: boolean): void {
            if (this.Visible) {
                if (!this.EventTransparent) {
                    ev.Target = this;
                    ev.StopPropagation = true;
                }
                let values = this.mNodes
                for (let i = 0; i < values.length; ++i) {
                    values[i].DispatchMouseEvent(ev, forced);
                    if (ev.StopPropagation)
                        break;
                }
            }
        }
        public DispatchKeyboardEvent(ev: GKeyboardEvent, forced: boolean): void {
            if (this.Visible) {
                if (!this.EventTransparent) {
                    ev.Target = this;
                    ev.StopPropagation = true;
                }
                let values = this.mNodes
                for (let i = 0; i < values.length; ++i) {
                    values[i].DispatchKeyboardEvent(ev, forced);
                    if (ev.StopPropagation)
                        break;
                }
            }
        }
        public DispatchNoticeEvent(ev: NoticeEvent, forced: boolean): void {
            let values = this.mNodes
            for (let i = 0; i < values.length; ++i) {
                values[i].DispatchNoticeEvent(ev, forced);
                if (ev.StopPropagation)
                    break;
            }
        }
        public Update(timestamp: number): void {
            if (this.Visible || this.UpdateForHide) {
                this.forEach((node) => {
                    node.Update(timestamp);
                });
            }
        }
    }
}