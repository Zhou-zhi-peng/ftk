/// <reference path="../particleanimation.ts" />
/// <reference path="../particles/seed.ts" />

namespace ftk.ui {
    export abstract class ProgressBar extends Sprite {
        private mValue: number;
        private mMax: number;
        private mMin: number;

        constructor(x: number, y: number, w: number, h: number, id?: string) {
            super(id);
            this.Position = new geometry.twodim.Point(x, y);
            this.Resize(w, h);
            this.mValue = 0;
            this.mMin = 0;
            this.mMax = 100;
        }

        public get Value():number{
            return this.mValue;
        }

        public set Value(value:number){
            if(value<this.mMin)
                value = this.mMin;
            if (value > this.mMax)
                value = this.mMax;
            this.mValue = value;
        }

        public get MaxValue():number{
            return this.mMax;
        }

        public set MaxValue(value:number){
            if(value<this.mMin)
                value = this.mMin;
            this.mMax = value;
        }

        public get MinValue():number{
            return this.mMin;
        }

        public set MinValue(value:number){
            if(value>this.mMax)
                value = this.mMax;
            this.mMin = value;
        }
    }

    export class CircularProgressBar extends ProgressBar{
        private mColor:Color = new Color("#0F0");
        protected OnRander(rc: CanvasRenderingContext2D): void {
            let box = this.Box;
            let r = Math.min(box.w,box.h)/2;
            let xc = box.x+box.w/2;
            let yc = box.y+box.h/2;
            let end = this.Value/Math.abs(this.MaxValue-this.MinValue) * (2*Math.PI);
            let bgn = this.mColor.Clone();
            let tscr = this.mColor.Clone();
            bgn.addLightness(-100);
            tscr.addLightness(100);

            rc.lineWidth = r/6;
            rc.beginPath();
            rc.strokeStyle = bgn.toRGBAString();
            rc.arc(xc, yc, r, end, 2*Math.PI);
            rc.stroke();

            rc.beginPath();
            rc.arc(xc, yc, r, 0, end);
            rc.strokeStyle = this.Color.toRGBAString();
            rc.stroke();

            var percentage = Math.floor(this.Value) + '%';
            rc.textAlign = "center";
            rc.textBaseline = "middle";
            rc.font = (r/3).toFixed(0) + "px bold Arial";
            rc.fillStyle = this.mColor.toRGBAString();
            rc.shadowColor = tscr.toRGBAString();
            rc.shadowBlur = ((r/3));
            rc.fillText(percentage, xc, yc);
        }

        public get Color():Color{
            return this.mColor;
        }
        public set Color(value:Color){
            this.mColor = value;
        }
    }

    export class RectangularProgressBar extends ProgressBar{
        private mColor:Color = new Color("#0F0");
        protected OnRander(rc: CanvasRenderingContext2D): void {
            let box = this.Box;
            let size = Math.max(box.w,box.h);
            let end = this.Value/Math.abs(this.MaxValue-this.MinValue) * size;
            let bgn = this.mColor.Clone();
            let tcr = this.mColor.Clone();
            let tscr = this.mColor.Clone();
            bgn.addLightness(-100);
            tcr.inverse();
            tscr.addLightness(100);
            rc.fillStyle = bgn.toRGBAString();
            rc.fillRect(box.x, box.y, box.w, box.h);
            rc.fillStyle = this.mColor.toRGBAString();
            if (box.w > box.h) {
                rc.fillRect(box.x, box.y, end, box.h);
            }else{
                rc.fillRect(box.x, box.y+(box.h - end), box.w, end);
            }

            var percentage = Math.floor(this.Value) + '%';
            rc.textAlign = "center";
            rc.textBaseline = "middle";
            rc.font = (Math.min(box.w,box.h)*0.8).toFixed(0) + "px bold Arial";
            rc.fillStyle = tcr.toRGBAString();
            rc.shadowColor = tscr.toRGBAString();
            rc.shadowBlur = (Math.min(box.w,box.h)*0.2);
            rc.fillText(percentage, box.x+box.w/2, box.y+box.h/2);
        }

        public get Color():Color{
            return this.mColor;
        }
        public set Color(value:Color){
            this.mColor = value;
        }
    }
}