/// <reference path="./objectnode.ts" />

namespace ftk {
    type Point = geometry.twodim.Point;
    type Rectangle = geometry.twodim.Rectangle;

    export abstract class Sprite implements IObjectNode {
        private mRectangle: Rectangle = new geometry.twodim.Rectangle();
        private mAngle = 0;
        private mBasePoint: Point = new geometry.twodim.Point();
        private mID: string;
        private mVisible: boolean;
        constructor(id?: string) {
            if ((!id) || id.length == 0) {
                id = ftk.utility.GenerateIDString(16);
            }
            this.mID = id as string;
            this.mVisible = true;
        }
        public get Id(): string {
            return this.mID;
        }
        public get Position(): Point {
            return new geometry.twodim.Point(
                this.mRectangle.x + this.mBasePoint.x, 
                this.mRectangle.y + this.mBasePoint.y);
        }
        public set Position(pos: Point) {
            this.mRectangle.x = pos.x - this.mBasePoint.x;
            this.mRectangle.y = pos.y - this.mBasePoint.y;
        }

        public get Box(): Rectangle {
            return this.mRectangle.clone();
        }

        protected OnResized(): void {
        }

        public get Width(): number {
            return this.Box.w;
        }
        public get Height(): number {
            return this.Box.h;
        }
        public Resize(w: number,h:number) {
            this.mRectangle.w = w;
            this.mRectangle.h = h;
            this.OnResized();
        }
        
        public get Angle(): number {
            return this.mAngle;
        }
        public set Angle(angle: number) {
            this.mAngle = angle;
        }

        public get BasePoint(): Point {
            return this.mBasePoint.clone();
        }
        public set BasePoint(pos: Point) {
            this.mBasePoint = pos.clone();
        }

        public get Visible(): boolean {
            return this.mVisible;
        }

        public set Visible(value: boolean) {
            this.mVisible = value;
        }

        public PickTest(point: Point): boolean {
            let box = this.Box;
            return point.x > box.x && (point.x < box.x + box.w)
                && point.y > box.y && (point.y < box.y + box.h);
        }

        public Rander(rc: CanvasRenderingContext2D | null): void {
            if (rc && this.Visible) {
                rc.save();
                let angle = this.Angle;
                if (angle !== 0) {
                    let box = this.Box;
                    let bp = this.BasePoint;
                    let xc = box.x + bp.x;
                    let yc = box.y + bp.y;
                    rc.translate(xc, yc);
                    rc.rotate(angle);
                    rc.translate(-xc, -yc);
                }
                this.OnRander(rc);
                rc.restore();
            }
        }
        protected abstract OnRander(rc: CanvasRenderingContext2D): void;
        protected OnUpdate(timestamp: number): void{

        }

        protected OnDispatchTouchEvent(ev: GTouchEvent, forced: boolean): void {
        }

        protected OnDispatchMouseEvent(ev: GMouseEvent, forced: boolean): void {
        }

        protected OnDispatchKeyboardEvent(ev: GKeyboardEvent, forced: boolean): void {
        }

        protected OnDispatchNoticeEvent(ev: NoticeEvent, forced: boolean): void {
        }

        public DispatchTouchEvent(ev: GTouchEvent, forced: boolean): void {
            if (this.mVisible && (forced 
                || this.PickTest(new geometry.twodim.Point(ev.ChangedTouches[0].x,ev.ChangedTouches[0].y)))) {
                ev.Target = this;
                ev.StopPropagation = true;
                this.OnDispatchTouchEvent(ev, forced);
            }
        }

        public DispatchMouseEvent(ev: GMouseEvent, forced: boolean): void {
            if (this.mVisible && (forced 
                || this.PickTest(new geometry.twodim.Point(ev.x,ev.y)))) {
                ev.Target = this;
                ev.StopPropagation = true;
                this.OnDispatchMouseEvent(ev, forced);
            }
        }
        public DispatchKeyboardEvent(ev: GKeyboardEvent, forced: boolean): void {
            if(this.mVisible){
                this.OnDispatchKeyboardEvent(ev, forced);
            }
        }
        public DispatchNoticeEvent(ev: NoticeEvent, forced: boolean): void {
            this.OnDispatchNoticeEvent(ev, forced);
        }
        public Update(timestamp: number): void {
            this.OnUpdate(timestamp);
        }
    }
}