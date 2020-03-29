/// <reference path="./objectnode.ts" />

namespace ftk {
    export abstract class Sprite implements IObjectNode {
        private mRectangle: Rectangle = new Rectangle();
        private mAngle = 0;
        private mBasePoint: Point = new Point();
        private mID: string;
        private mVisible: boolean;
        private mOpacity: number;
        private mAnimations: IAnimation[] | undefined;
        constructor(id?: string) {
            if ((!id) || id.length == 0) {
                id = ftk.utility.GenerateIDString(16);
            }
            this.mID = id as string;
            this.mVisible = true;
            this.mOpacity = 1;
        }
        public get Id(): string {
            return this.mID;
        }
        public get Position(): Point {
            return new Point(
                this.mRectangle.x + this.mBasePoint.x,
                this.mRectangle.y + this.mBasePoint.y);
        }
        public set Position(pos: Point) {
            this.mRectangle.x = pos.x - this.mBasePoint.x;
            this.mRectangle.y = pos.y - this.mBasePoint.y;
        }

        public get X(): number {
            return this.mRectangle.x + this.mBasePoint.x;
        }
        public set X(value: number) {
            this.mRectangle.x = value - this.mBasePoint.x;
        }

        public get Y(): number {
            return this.mRectangle.y + this.mBasePoint.y;
        }
        public set Y(value: number) {
            this.mRectangle.y = value - this.mBasePoint.y;
        }

        public get Box(): Rectangle {
            return this.mRectangle.clone();
        }

        public set Box(value: Rectangle) {
            this.mRectangle = value.clone();
        }

        public get size(): Size {
            return this.mRectangle.size;
        }
        public set size(value: Size) {
            this.mRectangle.size = value;
        }

        public get Width(): number {
            return this.mRectangle.w;
        }
        public set Width(value: number) {
            this.mRectangle.w = value;
        }

        public get Height(): number {
            return this.mRectangle.h;
        }
        public set Height(value: number) {
            this.mRectangle.h = value;
        }

        public Resize(w: number, h: number) {
            this.mRectangle.w = w;
            this.mRectangle.h = h;
            this.OnResized();
        }

        public get Angle(): number {
            return this.mAngle;
        }
        public set Angle(value: number) {
            this.mAngle = value;
        }

        public get Opacity(): number {
            return this.mOpacity;
        }
        public set Opacity(value: number) {
            this.mOpacity = value;
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

        public get Animations(): IReadonlyArray<IAnimation> {
            if (this.mAnimations) {
                return this.mAnimations;
            }
            return [];
        }

        public AddAnimation(animation: IAnimation): void {
            if (!this.mAnimations) {
                this.mAnimations = new Array<IAnimation>();
            }
            this.mAnimations.push(animation);
        }

        public RemoveAnimation(animation: IAnimation): boolean {
            if (!this.mAnimations) {
                return false;
            }
            let r = false;
            for (let i = 0; i < this.mAnimations.length; ++i) {
                if (this.mAnimations[i] === animation) {
                    this.mAnimations.splice(i, 1);
                    r = true;
                }
            }
            return r;
        }

        public ClearAnimations(): void {
            this.mAnimations = undefined;
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
                let opacity = this.Opacity;
                if (opacity < 1) {
                    if (opacity > 0) {
                        rc.globalAlpha = this.mOpacity;
                        this.OnRander(rc);
                    }
                } else {
                    this.OnRander(rc);
                }
                rc.restore();
            }
        }

        public DispatchTouchEvent(ev: GTouchEvent, forced: boolean): void {
            if (this.mVisible && (forced
                || this.PickTest(this.GetMouseEventPoint(ev.ChangedTouches[0])))) {
                ev.Target = this;
                ev.StopPropagation = true;
                this.OnDispatchTouchEvent(ev, forced);
            }
        }

        public DispatchMouseEvent(ev: GMouseEvent, forced: boolean): void {
            if (this.mVisible && (forced
                || this.PickTest(this.GetMouseEventPoint(ev)))) {
                ev.Target = this;
                ev.StopPropagation = true;
                this.OnDispatchMouseEvent(ev, forced);
            }
        }
        public DispatchKeyboardEvent(ev: GKeyboardEvent, forced: boolean): void {
            if (this.mVisible) {
                this.OnDispatchKeyboardEvent(ev, forced);
            }
        }
        public DispatchNoticeEvent(ev: NoticeEvent, forced: boolean): void {
            this.OnDispatchNoticeEvent(ev, forced);
        }
        public Update(timestamp: number): void {
            if (this.mAnimations) {
                let anis = this.mAnimations;
                for (let a of anis) {
                    a.Update(timestamp, this);
                }
            }
            this.OnUpdate(timestamp);
        }

        protected OnResized(): void {
        }

        protected abstract OnRander(rc: CanvasRenderingContext2D): void;
        protected OnUpdate(_timestamp: number): void {

        }

        protected OnDispatchTouchEvent(_ev: GTouchEvent, _forced: boolean): void {
        }

        protected OnDispatchMouseEvent(_ev: GMouseEvent, _forced: boolean): void {
        }

        protected OnDispatchKeyboardEvent(_ev: GKeyboardEvent, _forced: boolean): void {
        }

        protected OnDispatchNoticeEvent(_ev: NoticeEvent, _forced: boolean): void {
        }

        protected GetMouseEventPoint(ev: { x: number, y: number }) {
            let angle = this.Angle;
            let pt = new Point(ev.x, ev.y);
            if (angle === 0) {
                return pt;
            }
            pt.rotate(-angle, this.Position);
            return pt;
        }

    }
}
