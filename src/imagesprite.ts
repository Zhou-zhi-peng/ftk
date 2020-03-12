/// <reference path="./sprite.ts" />
/// <reference path="./resource.ts" />

namespace ftk {
    export class ImageSprite extends Sprite {
        private mImage: ImageResource;
        constructor(resource?: ImageResource, w?: number, h?: number, id?: string) {
            super(id);
            if (resource)
                this.mImage = resource;
            else
                this.mImage = new ImageResource("");
            if (w && h) {
                this.Resize(w,h);
            } else {
                this.Resize(this.mImage.Image.naturalWidth, this.mImage.Image.naturalHeight);
            }
        }

        public get Resource(): ImageResource {
            return this.mImage;
        }

        public set Resource(value: ImageResource) {
            this.mImage = value;
        }

        protected OnRander(canvas: CanvasRenderingContext2D): void {
            let image = this.Resource.Image;
            let box = this.Box;
            canvas.drawImage(
                image,
                0,
                0,
                image.naturalWidth,
                image.naturalHeight,
                box.x,
                box.y,
                box.w,
                box.h);
        }
    }

    export class ImageButton extends ImageSprite {
        private mHoverImage: ImageResource | undefined;
        private mDownImage: ImageResource | undefined;
        private mNormalImage: ImageResource | undefined;
        private mPressState: boolean = false;

        constructor(resource?: ImageResource, id?: string, w?: number, h?: number) {
            super(resource, w, h, id);
            this.mNormalImage = this.Resource;
        }
        public get Resource(): ImageResource {
            return super.Resource;
        }

        public set Resource(value: ImageResource) {
            super.Resource = value;
            this.mNormalImage = value;
        }

        public get HoverResource(): ImageResource | undefined {
            return this.mHoverImage;
        }

        public set HoverResource(value: ImageResource | undefined) {
            this.mHoverImage = value;
        }

        public get DownResource(): ImageResource | undefined {
            return this.mDownImage;
        }

        public set DownResource(value: ImageResource | undefined) {
            this.mDownImage = value;
        }

        protected OnDispatchMouseEvent(ev: GMouseEvent, forced: boolean): void {
            switch (ev.InputType) {
                case InputEventType.MouseEnter:
                    if (this.mHoverImage && (!this.mPressState))
                        super.Resource = this.mHoverImage;
                    break;
                case InputEventType.MouseLeave:
                    if (this.mNormalImage)
                        super.Resource = this.mNormalImage;
                    this.mPressState = false;
                    break;
                case InputEventType.MouseDown:
                    if (this.mDownImage && (!this.mPressState)) {
                        super.Resource = this.mDownImage;
                        this.mPressState = true;
                    }
                    break;
                case InputEventType.MouseUp:
                    if (this.mHoverImage && (this.mPressState)) {
                        this.mPressState = false;
                        super.Resource = this.mHoverImage;
                    }
                    break;
            }
            ev.Cursor = "pointer";
        }
    }
}