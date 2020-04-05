/// <reference path="./objectnode.ts" />
/// <reference path="./color.ts" />
/// <reference path="./resource.ts" />

namespace ftk {
    export class Layer implements IObjectNode {
        private mNodes: IObjectNode[];
        private mVisible: boolean;
        private mEventTransparent: boolean;
        private mID: string;
        private mUpdateForHide: boolean;
        public constructor(id?: string) {
            this.mID = id ? id : ftk.utility.GenerateIDString(32);
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

        public Add(node: IObjectNode): Layer {
            this.mNodes.push(node);
            return this;
        }

        public Remove(id: string): Layer {
            for (let i = 0; i < this.mNodes.length; ++i) {
                if (this.mNodes[i].Id === id) {
                    this.mNodes.splice(i--, 1);
                }
            }
            return this;
        }

        public RemoveAll(): Layer {
            this.mNodes.length = 0;
            return this;
        }

        public Get(id: string): IObjectNode | undefined {
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
        public constructor(color?: Color | string | number, id?: string) {
            super(id);
            if (color) {
                this.mBackgroundColor = new Color(color);
            } else {
                this.mBackgroundColor = new Color("#00F");
            }
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

    export enum BackgroundImageRepeatStyle {
        none,
        repeat,
        center,
        stretch,
        fitStretch,
    }

    export class BackgroundImageLayer extends Layer {
        public RepeatStyle: BackgroundImageRepeatStyle;
        public BackgroundTexture: ITexture;
        public constructor(texture?: ITexture, id?: string) {
            super(id);
            this.BackgroundTexture = texture ? texture : EmptyTexture;
            this.RepeatStyle = BackgroundImageRepeatStyle.stretch;
        }

        public Rander(rc: CanvasRenderingContext2D): void {
            let texture = this.BackgroundTexture;
            let style = this.RepeatStyle;
            if (style === BackgroundImageRepeatStyle.stretch) {
                texture.Draw(
                    rc,
                    0,
                    0,
                    rc.canvas.width,
                    rc.canvas.height);
            } else if (style === BackgroundImageRepeatStyle.fitStretch) {
                let fitRatioX = texture.Width / rc.canvas.width;
                let fitRatioY = texture.Height / rc.canvas.height;
                let fitratio = Math.min(fitRatioX, fitRatioY);
                let w = texture.Width * fitratio;
                let h = texture.Height * fitratio;
                let x = (rc.canvas.width - w) / 2;
                let y = (rc.canvas.height - h) / 2;

                texture.Draw(rc, x, y, w, h);
            } else if (style === BackgroundImageRepeatStyle.center) {
                let x = (rc.canvas.width - texture.Width) / 2;
                let y = (rc.canvas.height - texture.Height) / 2;
                texture.Draw(
                    rc,
                    x,
                    y,
                    texture.Width,
                    texture.Height);
            } else if (style === BackgroundImageRepeatStyle.none) {
                texture.Draw(
                    rc,
                    0,
                    0,
                    texture.Width,
                    texture.Height);
            } else {
                let rw = rc.canvas.width % texture.Width;
                let rh = rc.canvas.height % texture.Height;
                let rwtx = texture.Clip(0, 0, rw, rc.canvas.height);
                let rhtx = texture.Clip(0, 0, rc.canvas.width, rh);
                let tw = texture.Width;
                let th = texture.Height;
                let cw = rc.canvas.width;
                let ch = rc.canvas.height;
                for (let x = 0; x < cw; x += tw) {
                    for (let y = 0; y < ch; y += th) {
                        if (cw - x < tw) {
                            rwtx.Draw(rc, x, y, rhtx.Width, rhtx.Height);
                        }
                        else if (ch - y < th) {
                            rhtx.Draw(rc, x, y, rhtx.Width, rhtx.Height);
                        }
                        else {
                            texture.Draw(rc, x, y, tw, th);
                        }
                    }
                }
            }
            super.Rander(rc);
        }
    }

}
