/// <reference path="./sprite.ts" />
/// <reference path="./resource.ts" />

namespace ftk {
    export class VideoSprite extends Sprite {
        private mVideo: VideoResource;
        constructor(resource?: VideoResource, w?: number, h?: number, id?: string) {
            super(id);
            if (resource)
                this.mVideo = resource;
            else
                this.mVideo = new VideoResource("");
            if (w && h) {
                this.Resize(w,h);
            } else {
                this.Resize(this.mVideo.Video.videoWidth, this.mVideo.Video.videoHeight);
            }
        }

        public get Resource(): VideoResource {
            return this.mVideo;
        }

        public set Resource(value: VideoResource) {
            this.mVideo = value;
        }

        protected OnRander(canvas: CanvasRenderingContext2D): void {
            let video = this.Resource.Video;
            let box = this.Box;
            canvas.drawImage(
                video,
                0,
                0,
                video.videoWidth,
                video.videoHeight,
                box.x,
                box.y,
                box.w,
                box.h);
        }

        public Play():void{
            this.Resource.Video.play();
        }

        public Pause():void{
            this.Resource.Video.pause();
        }
    }
}