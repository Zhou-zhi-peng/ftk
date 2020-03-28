/// <reference path="./objectnode.ts" />
/// <reference path="./color.ts" />
/// <reference path="./resource.ts" />

namespace ftk {
    export class Layer implements IObjectNode {
        private mNodes: IObjectNode[];
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
            for (let n of this.mNodes) {
                if (n.Id === id) {
                    return n;
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

        public Rander(rc: CanvasRenderingContext2D): void {
            if (!this.Visible) {
                return;
            }

            for (let i = this.mNodes.length - 1; i >= 0; --i) {
                this.mNodes[i].Rander(rc);
            }
        }

        public DispatchTouchEvent(ev: GTouchEvent, forced: boolean): void {
            if (this.Visible) {
                if (!this.EventTransparent) {
                    ev.Target = this;
                    ev.StopPropagation = true;
                }
                for (let n of this.mNodes) {
                    n.DispatchTouchEvent(ev, forced);
                    if (ev.StopPropagation) {
                        break;
                    }
                }
            }
        }
        public DispatchMouseEvent(ev: GMouseEvent, forced: boolean): void {
            if (this.Visible) {
                if (!this.EventTransparent) {
                    ev.Target = this;
                    ev.StopPropagation = true;
                }
                for (let n of this.mNodes) {
                    n.DispatchMouseEvent(ev, forced);
                    if (ev.StopPropagation) {
                        break;
                    }
                }
            }
        }
        public DispatchKeyboardEvent(ev: GKeyboardEvent, forced: boolean): void {
            if (this.Visible) {
                if (!this.EventTransparent) {
                    ev.Target = this;
                    ev.StopPropagation = true;
                }
                for (let n of this.mNodes) {
                    n.DispatchKeyboardEvent(ev, forced);
                    if (ev.StopPropagation) {
                        break;
                    }
                }
            }
        }
        public DispatchNoticeEvent(ev: NoticeEvent, forced: boolean): void {
            for (let n of this.mNodes) {
                n.DispatchNoticeEvent(ev, forced);
                if (ev.StopPropagation) {
                    break;
                }
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

    export class ColoredLayer extends Layer {
        private mBackgroundColor: Color;
        constructor() {
            super();
            this.mBackgroundColor = new Color("#00F");
        }

        public get BackgroundColor(): Color {
            return this.mBackgroundColor;
        }

        public set BackgroundColor(value: Color) {
            this.mBackgroundColor = value.Clone();
        }

        public Rander(rc: CanvasRenderingContext2D): void {
            rc.fillStyle = this.BackgroundColor.toRGBAString();
            rc.fillRect(0, 0, rc.canvas.width, rc.canvas.height);
            super.Rander(rc);
        }
    }

    export type BackgroundImageRepeatStyle = "repeat" | "center" | "stretch" | "fit-stretch" | "none";
    export class BackgroundImageLayer extends Layer {
        private mBackgroundImage: ImageResource;
        private mRepeatStyle: BackgroundImageRepeatStyle;
        constructor() {
            super();
            this.mBackgroundImage = new ImageResource("");
            this.mRepeatStyle = "stretch";
        }

        public get BackgroundImage(): ImageResource {
            return this.mBackgroundImage;
        }

        public set BackgroundImage(value: ImageResource) {
            this.mBackgroundImage = value;
        }

        public get RepeatStyle(): BackgroundImageRepeatStyle {
            return this.mRepeatStyle;
        }

        public set RepeatStyle(value: BackgroundImageRepeatStyle) {
            this.mRepeatStyle = value;
        }

        public Rander(rc: CanvasRenderingContext2D): void {
            let image = this.BackgroundImage.Image;
            let style = this.RepeatStyle;
            if (style === "stretch") {
                rc.drawImage(
                    image,
                    0,
                    0,
                    image.naturalWidth,
                    image.naturalHeight,
                    0,
                    0,
                    rc.canvas.width,
                    rc.canvas.height);
            } else if (style === "fit-stretch") {
                let fitRatioX = image.naturalWidth / rc.canvas.width;
                let fitRatioY = image.naturalHeight / rc.canvas.height;
                let fitratio = Math.min(fitRatioX, fitRatioY);
                let w = image.naturalWidth * fitratio;
                let h = image.naturalHeight * fitratio;
                let x = (rc.canvas.width - w) / 2;
                let y = (rc.canvas.height - h) / 2;

                rc.drawImage(
                    image,
                    0, 0,
                    image.naturalWidth,
                    image.naturalHeight,
                    x, y, w, h);
            } else if (style === "center") {
                let x = (rc.canvas.width - image.naturalWidth) / 2;
                let y = (rc.canvas.height - image.naturalHeight) / 2;
                rc.drawImage(
                    image,
                    0,
                    0,
                    image.naturalWidth,
                    image.naturalHeight,
                    x,
                    y,
                    image.naturalWidth,
                    image.naturalHeight);
            } else if (style === "none") {
                rc.drawImage(
                    image,
                    0,
                    0,
                    image.naturalWidth,
                    image.naturalHeight,
                    0,
                    0,
                    image.naturalWidth,
                    image.naturalHeight);
            } else {
                let pattern = rc.createPattern(image, 'repeat') as CanvasPattern;
                let oldfs = rc.fillStyle;
                rc.fillStyle = pattern;
                rc.fillRect(0, 0, rc.canvas.width, rc.canvas.height);
                rc.fillStyle = oldfs;
            }
            super.Rander(rc);
        }
    }

}
