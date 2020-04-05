/// <reference path="./sprite.ts" />
/// <reference path="./resource.ts" />

namespace ftk {
    export class ImageSprite extends RectangleSprite {
        private mTexture: ITexture;
        public constructor(texture?: ITexture, id?: string) {
            super(0, 0, 0, 0, id);
            this.mTexture = texture ? texture : EmptyTexture;
            this.Resize(this.mTexture.Width, this.mTexture.Height);
        }

        public get Texture(): ITexture {
            return this.mTexture;
        }

        public set Texture(value: ITexture) {
            this.mTexture = value;
        }

        protected OnRander(rc: CanvasRenderingContext2D): void {
            let box = this.Box;
            this.mTexture.Draw(
                rc,
                box.x,
                box.y,
                box.w,
                box.h);
        }
    }
}
