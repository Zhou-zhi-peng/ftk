/// <reference path="./objectnode.ts" />

namespace ftk {
    export abstract class Sprite implements IObjectNode {
        private mRectangle: Rectangle = { x: 0, y: 0, w: 0, h: 0 };
        private mAngle = 0;
        private mBasePoint: Point = { x: 0, y: 0 };
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
            return { x: this.mRectangle.x + this.mBasePoint.x, y: this.mRectangle.y + this.mBasePoint.y };
        }
        public set Position(pos: Point) {
            this.mRectangle.x = pos.x - this.mBasePoint.x;
            this.mRectangle.y = pos.y - this.mBasePoint.y;
        }

        public get Box(): Rectangle {
            return { x: this.mRectangle.x, y: this.mRectangle.y, w: this.mRectangle.w, h: this.mRectangle.h };
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
            return { x: this.mBasePoint.x, y: this.mBasePoint.y };
        }
        public set BasePoint(pos: Point) {
            this.mBasePoint = { x: pos.x, y: pos.y };
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
            if (this.mVisible && (forced || this.PickTest(ev.ChangedTouches[0]))) {
                ev.Target = this;
                ev.StopPropagation = true;
                this.OnDispatchTouchEvent(ev, forced);
            }
        }

        public DispatchMouseEvent(ev: GMouseEvent, forced: boolean): void {
            if (this.mVisible && (forced || this.PickTest(ev))) {
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