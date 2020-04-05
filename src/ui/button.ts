/// <reference path="../imagesprite.ts" />

namespace ftk.ui {
    export class ImageButton extends ImageSprite {
        private mPressState: boolean = false;
        private mNormalTexture: ITexture | undefined;
        public HoverTexture: ITexture | undefined;
        public DownTexture: ITexture | undefined;
        public constructor(texture?: ITexture, id?: string) {
            super(texture, id);
            this.mNormalTexture = this.Texture;
        }
        public get Texture(): ITexture {
            return super.Texture;
        }

        public set Texture(value: ITexture) {
            super.Texture = value;
            this.mNormalTexture = value;
        }

        protected OnDispatchMouseEvent(ev: GMouseEvent, _forced: boolean): void {
            switch (ev.InputType) {
                case InputEventType.MouseEnter:
                    if (this.HoverTexture && (!this.mPressState)) {
                        super.Texture = this.HoverTexture;
                    }
                    break;
                case InputEventType.MouseLeave:
                    if (this.mNormalTexture) {
                        super.Texture = this.mNormalTexture;
                    }
                    this.mPressState = false;
                    break;
                case InputEventType.MouseDown:
                    if (this.DownTexture && (!this.mPressState)) {
                        super.Texture = this.DownTexture;
                        this.mPressState = true;
                    }
                    break;
                case InputEventType.MouseUp:
                    if (this.HoverTexture && (this.mPressState)) {
                        this.mPressState = false;
                        super.Texture = this.HoverTexture;
                    }
                    break;
            }
            ev.Cursor = "pointer";
        }
    }
}
