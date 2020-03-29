/// <reference path="./sprite.ts" />
/// <reference path="./resource.ts" />

namespace ftk {
    export class ImageSprite extends RectangleSprite {
        private mImage: ImageResource;
        constructor(resource?: ImageResource, w?: number, h?: number, id?: string) {
            super(0, 0, 0, 0, id);
            if (resource) {
                this.mImage = resource;
            }
            else {
                this.mImage = new ImageResource("");
            }
            if (w && h) {
                this.Resize(w, h);
            } else {
                this.Resize(this.mImage.Image.naturalWidth, this.mImage.Image.naturalHeight);
            }
            let size = this.Box.size;
            this.BasePoint = new Point(size.cx / 2, size.cy / 2);
        }

        public get Resource(): ImageResource {
            return this.mImage;
        }

        public set Resource(value: ImageResource) {
            this.mImage = value;
        }

        protected OnRander(rc: CanvasRenderingContext2D): void {
            let image = this.Resource.Image;
            let box = this.Box;
            rc.drawImage(
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
}
