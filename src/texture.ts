namespace ftk {
    export interface ITexture {
        readonly Width: number;
        readonly Height: number;
        Draw(rc: CanvasRenderingContext2D, dx: number, dy: number, dw: number, dh: number): void;
        Clip(x: number, y: number, w: number, h: number): ITexture;
        BuildOutline(threshold?: number): Polygon;
    }

    export type TextureImageSource = HTMLVideoElement | HTMLCanvasElement | HTMLImageElement | HTMLVideoElement | ImageBitmap;

    class _Texture implements ITexture {
        private mRect: Rectangle;
        private mImage: TextureImageSource;
        public constructor(image: TextureImageSource, x?: number, y?: number, w?: number, h?: number) {
            let iw: number;
            let ih: number;
            if (image instanceof HTMLImageElement) {
                iw = image.naturalWidth;
                ih = image.naturalHeight;
            } else if (image instanceof HTMLVideoElement) {
                iw = image.videoWidth;
                ih = image.videoHeight;
            } else {
                iw = image.width;
                ih = image.height;
            }

            let tx = x || 0;
            let ty = y || 0;
            let tw = w || iw;
            let th = h || ih;

            if (tx < 0) {
                tx = 0;
            } else if (tx > iw) {
                tx = iw;
            }
            if (ty < 0) {
                ty = 0;
            } else if (ty > ih) {
                ty = ih;
            }

            this.mRect = new Rectangle(tx, ty, tw, th);
            if (this.mRect.right > iw) {
                this.mRect.right = iw;
            }

            if (this.mRect.bottom > ih) {
                this.mRect.bottom = ih;
            }
            this.mImage = image;
        }
        public Draw(rc: CanvasRenderingContext2D, dx: number, dy: number, dw: number, dh: number): void {
            let r = this.mRect;
            if (r.w < 0 || r.h < 0) {
                return;
            }
            rc.drawImage(this.mImage, r.x, r.y, r.w, r.h, dx, dy, dw, dh);
        }

        public Clip(x: number, y: number, w: number, h: number): ITexture {
            let sx = x;
            let sy = y;
            let sw = w;
            let sh = h;
            if (sx < 0) {
                sx = 0;
            } else if (sx > this.mRect.w) {
                sx = this.mRect.w;
            }
            if (sy < 0) {
                sy = 0;
            } else if (sy > this.mRect.h) {
                sy = this.mRect.h;
            }
            if (sw < 0) {
                sw = 0;
            } else if (sw > this.mRect.w) {
                sw = this.mRect.w;
            }
            if (sh < 0) {
                sh = 0;
            } else if (sh > this.mRect.h) {
                sh = this.mRect.h;
            }
            return new _Texture(this.mImage, sx + this.mRect.x, sy + this.mRect.y, sw, sh);
        }

        public BuildOutline(threshold?: number): Polygon {
            let polygon = new Polygon();
            let rc = utility.api.createOffscreenCanvas(this.mRect.w, this.mRect.h).getContext('2d');
            if (rc) {
                this.Draw(rc, 0, 0, this.Width, this.Height);
                let img = rc.getImageData(0, 0, this.Width, this.Height);
                const w = img.width << 2;
                const a = threshold || 0;
                let idx = 3;
                let start = 0;
                let v: Point = new Point(-1, -1);
                let vf = v;
                let l = 0;
                for (let y = 0; y < img.height; ++y) {
                    for (let x = 0; x < img.width; ++x) {
                        if (img.data[idx] > a) {
                            if (x !== v.x) {
                                if (l > 0) {
                                    polygon.pushVertex(v.x, y - 1);
                                    l = 0;
                                }
                                v = polygon.pushVertex(x, y);
                            } else {
                                ++l;
                            }
                            break;
                        }
                        idx += 4;
                    }
                    start += w;
                    idx = start + 3;
                }
                vf = v;

                start = img.data.length - w;
                idx = start + 3;
                l = 0;
                for (let x = 0; x < img.width; ++x) {
                    for (let y = img.height; y >= 0; --y) {
                        if (img.data[idx] > a && (y > vf.y || x > vf.x)) {
                            if (y !== v.y) {
                                if (l > 0) {
                                    polygon.pushVertex(x - 1, v.y);
                                    l = 0;
                                }
                                v = polygon.pushVertex(x, y);
                            } else {
                                ++l;
                            }
                            break;
                        }
                        idx -= w;
                    }
                    start += 4;
                    idx = start + 3;
                }
                vf = v;

                start = img.data.length;
                idx = start - 1;
                l = 0;
                for (let y = img.height; y >= 0; --y) {
                    for (let x = img.width; x >= 0; --x) {
                        if (img.data[idx] > a && (y < vf.y || x > vf.x)) {
                            if (x !== v.x) {
                                if (l > 0) {
                                    polygon.pushVertex(v.x, y + 1);
                                    l = 0;
                                }
                                v = polygon.pushVertex(x, y);
                            } else {
                                ++l;
                            }
                            break;
                        }
                        idx -= 4;
                    }
                    start -= w;
                    idx = start - 1;
                }
                vf = v;

                let vt = polygon.vertexs[0];
                start = w;
                idx = start - 1;
                for (let x = img.width; x >= 0; --x) {
                    for (let y = 0; y < img.height; ++y) {
                        if (img.data[idx] > a && (y < vt.y || x > vt.x) && (y < vf.y || x < vf.x)) {
                            if (y !== v.y) {
                                if (l > 0) {
                                    polygon.pushVertex(x + 1, v.y);
                                    l = 0;
                                }
                                v = polygon.pushVertex(x, y);
                            } else {
                                ++l;
                            }
                            break;
                        }
                        idx += w;
                    }
                    start -= 4;
                    idx = start - 1;
                }
            }
            return polygon;
        }

        public get Width(): number {
            return this.mRect.w;
        }
        public get Height(): number {
            return this.mRect.h;
        }
    }

    export const EmptyTexture: ITexture = new _Texture(new Image(), 0, 0, 0, 0);
    export function createTexture(image: TextureImageSource | ImageResource | VideoResource | undefined, x?: number, y?: number, w?: number, h?: number): ITexture {
        if (!image) {
            return EmptyTexture;
        } else if (image instanceof ImageResource) {
            return new _Texture(image.Image, x, y, w, h);
        } else if (image instanceof VideoResource) {
            return new _Texture(image.Video, x, y, w, h);
        }
        return new _Texture(image, x, y, w, h);
    }
}
