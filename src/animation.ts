namespace ftk {
    export interface IAnimation {
        readonly Playing: boolean;
        Loop: boolean;
        Start(): void;
        Restart(): void;
        Stop(): void;
        Update(timestamp: number, target: Sprite): void;
    }

    export abstract class Animation<T> implements IAnimation {
        private mStartValue: T;
        private mEndValue: T;
        private mDistance: T;
        private mStartTime: number;
        private mEndTime: number;
        private mPlaying: boolean;
        private mFirstFrame: boolean;

        public Loop: boolean;
        public Duration: number;

        constructor(start: T, end: T, duration: number, loop?: boolean, autostart?: boolean) {
            this.mPlaying = false;
            this.Loop = loop ? loop : false;
            this.Duration = duration;
            this.mStartValue = start;
            this.mEndValue = end;
            this.mDistance = this.CalcDistance(start, end);
            this.mStartTime = 0;
            this.mEndTime = 0;
            this.mFirstFrame = true;
            if (autostart) {
                this.Start();
            }
        }

        public get Playing(): boolean { return this.mPlaying; }

        public Start(): void {
            if (!this.mPlaying) {
                this.Restart();
            }
        }

        public Restart(): void {
            this.mFirstFrame = true;
            this.mPlaying = true;
        }

        public Stop(): void {
            this.mPlaying = false;
            this.mFirstFrame = true;
        }

        public Update(timestamp: number, target: Sprite): void {
            if (!this.Playing) {
                return;
            }
            if (this.mFirstFrame) {
                this.mStartTime = timestamp;
                this.mEndTime = timestamp + this.Duration;
                this.mFirstFrame = false;
                this.SetTarget(target, this.mStartValue);
            } else {
                if (timestamp >= this.mEndTime) {
                    this.SetTarget(target, this.mEndValue);
                    if (this.Loop) {
                        this.mStartTime = timestamp;
                        this.mEndTime = timestamp + this.Duration;
                    }
                    else {
                        this.Stop();
                    }
                } else {
                    let count = timestamp - this.mStartTime;
                    let value = this.CalcProgress(this.mStartValue, this.mDistance, count, this.Duration);
                    this.SetTarget(target, value);
                }
            }
        }
        protected abstract CalcDistance(start: T, end: T): T;
        protected abstract CalcProgress(start: T, distanceTotal: T, timeProgress: number, timeTotal: number): T;
        protected abstract SetTarget(target: Sprite, value: T): void;
    }

    export abstract class NumberValueAnimation extends Animation<number>{
        protected CalcDistance(start: number, end: number): number {
            return end - start;
        }
        protected CalcProgress(start: number, distanceTotal: number, timeProgress: number, timeTotal: number): number {
            return start + (distanceTotal * timeProgress) / timeTotal;
        }
    }

    export class AngleAnimation extends NumberValueAnimation {
        protected SetTarget(target: Sprite, value: number): void {
            target.Angle = value;
        }
    }

    export class OpacityAnimation extends NumberValueAnimation {
        protected SetTarget(target: Sprite, value: number): void {
            target.Opacity = value;
        }
    }

    export class PosXAnimation extends NumberValueAnimation {
        protected SetTarget(target: Sprite, value: number): void {
            target.X = value;
        }
    }

    export class PosYAnimation extends NumberValueAnimation {
        protected SetTarget(target: Sprite, value: number): void {
            target.Y = value;
        }
    }

    export class WidthAnimation extends NumberValueAnimation {
        protected SetTarget(target: Sprite, value: number): void {
            target.Width = value;
        }
    }

    export class HeightAnimation extends NumberValueAnimation {
        protected SetTarget(target: Sprite, value: number): void {
            target.Height = value;
        }
    }

    export class PositionAnimation extends Animation<Point>{
        protected CalcDistance(start: Point, end: Point): Point {
            return new Point(end.x - start.x, end.y - start.y);
        }
        protected CalcProgress(start: Point, distanceTotal: Point, timeProgress: number, timeTotal: number): Point {
            let x = start.x + (distanceTotal.x * timeProgress) / timeTotal;
            let y = start.y + (distanceTotal.y * timeProgress) / timeTotal;
            return new Point(x, y);
        }
        protected SetTarget(target: Sprite, value: Point): void {
            target.Position = value;
        }
    }

    export class SizeAnimation extends Animation<Size>{
        protected CalcDistance(start: Size, end: Size): Size {
            return new Size(end.cx - start.cx, end.cy - start.cy);
        }
        protected CalcProgress(start: Size, distanceTotal: Size, timeProgress: number, timeTotal: number): Size {
            let x = start.cx + (distanceTotal.cx * timeProgress) / timeTotal;
            let y = start.cy + (distanceTotal.cy * timeProgress) / timeTotal;
            return new Size(x, y);
        }
        protected SetTarget(target: Sprite, value: Size): void {
            target.size = value;
        }
    }

    export class BoxAnimation extends Animation<Rectangle>{
        protected CalcDistance(start: Rectangle, end: Rectangle): Rectangle {
            return new Rectangle(end.x - start.x, end.y - start.y, end.w - start.w, end.h - start.h);
        }
        protected CalcProgress(start: Rectangle, distanceTotal: Rectangle, timeProgress: number, timeTotal: number): Rectangle {
            let x = start.x + (distanceTotal.x * timeProgress) / timeTotal;
            let y = start.y + (distanceTotal.y * timeProgress) / timeTotal;
            let w = start.w + (distanceTotal.w * timeProgress) / timeTotal;
            let h = start.h + (distanceTotal.h * timeProgress) / timeTotal;
            return new Rectangle(x, y, w, h);
        }
        protected SetTarget(target: Sprite, value: Rectangle): void {
            target.Box = value;
        }
    }

    export class KeyframeAnimation implements IAnimation {
        private mPlaying: boolean;
        private mFrames: IAnimation[];
        private mCurrentFrame: number;
        public Loop: boolean;
        constructor(loop?: boolean, autostart?: boolean) {
            this.mPlaying = false;
            this.Loop = loop ? loop : false;
            this.mFrames = new Array<IAnimation>();
            this.mCurrentFrame = 0;
            if (autostart) {
                this.Start();
            }
        }

        public get Playing(): boolean { return this.mPlaying; }

        public Start(): void {
            if (!this.mPlaying) {
                this.Restart();
            }
        }

        public Restart(): void {
            this.mPlaying = true;
        }

        public Stop(): void {
            this.mPlaying = false;
        }

        public AddFrame(animation: IAnimation): void {
            animation.Loop = false;
            this.mFrames.push(animation);
        }

        public RemoveFrame(animation: IAnimation): void {
            this.mFrames = this.mFrames.filter((a) => { return a !== animation; });
        }
        public ClearFrames(): void {
            this.mFrames = new Array<IAnimation>();
        }

        public Update(timestamp: number, target: Sprite): void {
            if (!this.Playing && this.mFrames.length == 0) {
                return;
            }
            let animation = this.mFrames[this.mCurrentFrame];
            if (!animation.Playing) {
                animation.Start();
            }
            animation.Loop = false;
            animation.Update(timestamp, target);
            if (!animation.Playing) {
                this.mCurrentFrame++;
                if (this.mCurrentFrame >= this.mFrames.length) {
                    this.mCurrentFrame = 0;
                    if (!this.Loop) {
                        this.Stop();
                    }
                }
            }
        }
    }
}
