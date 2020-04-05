namespace ftk {

    export enum AnimationPlayState {
        Stop,
        Suspended,
        Playing
    }

    export interface IAnimation {
        readonly PlayState: AnimationPlayState;
        Loop: boolean;
        Start(): void;
        Restart(): void;
        Stop(): void;
        Suspend(timestamp?: number): void;
        Resume(timestamp?: number): void;
        Update(timestamp: number, target: Sprite): void;
        ValidateTarget(target: Sprite): boolean;
    }

    export abstract class Animation<TValue> implements IAnimation {
        private mStartValue: TValue;
        private mEndValue: TValue;
        private mDistance: TValue;
        private mStartTime: number;
        private mEndTime: number;
        private mSuspendTime: number;
        private mPlayState: AnimationPlayState;
        private mFirstFrame: boolean;
        public Loop: boolean;
        public Duration: number;

        constructor(start: TValue, end: TValue, duration: number, loop?: boolean, autostart?: boolean) {
            this.mPlayState = AnimationPlayState.Stop;
            this.Loop = loop ? loop : false;
            this.Duration = duration;
            this.mStartValue = start;
            this.mEndValue = end;
            this.mDistance = this.CalcDistance(start, end);
            this.mStartTime = 0;
            this.mEndTime = 0;
            this.mSuspendTime = 0;
            this.mFirstFrame = true;
            if (autostart) {
                this.Start();
            }
        }

        public get PlayState(): AnimationPlayState { return this.mPlayState; }

        public Start(): void {
            if (this.mPlayState !== AnimationPlayState.Playing) {
                this.Restart();
            }
        }

        public Restart(): void {
            this.mFirstFrame = true;
            this.mSuspendTime = 0;
            this.mPlayState = AnimationPlayState.Playing;
        }

        public Stop(): void {
            this.mPlayState = AnimationPlayState.Stop;
            this.mFirstFrame = true;
            this.mSuspendTime = 0;
        }

        public Suspend(timestamp?: number): void {
            if (this.mPlayState === AnimationPlayState.Playing) {
                if (!timestamp) {
                    this.mSuspendTime = performance.now();
                }
                else {
                    this.mSuspendTime = timestamp;
                }
                this.mPlayState = AnimationPlayState.Suspended;
            }
        }
        public Resume(timestamp?: number): void {
            if (this.mPlayState === AnimationPlayState.Suspended) {
                let ts = timestamp ? timestamp : performance.now();
                let t = this.mSuspendTime - this.mStartTime;
                if (t < 0) {
                    throw new RangeError('SuspendTime < StartTime');
                }
                this.mStartTime = ts - t;
                this.mEndTime = this.mStartTime + this.Duration;
                this.mPlayState = AnimationPlayState.Playing;
            }
        }

        public Update(timestamp: number, target: Sprite): void {
            if (this.mPlayState !== AnimationPlayState.Playing) {
                return;
            }
            if (this.mFirstFrame) {
                this.mStartTime = timestamp;
                this.mEndTime = timestamp + this.Duration;
                this.mFirstFrame = false;
                this.UpdateTarget(target, this.mStartValue);
            } else {
                if (timestamp >= this.mEndTime) {
                    this.UpdateTarget(target, this.mEndValue);
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
                    this.UpdateTarget(target, value);
                }
            }
        }

        public ValidateTarget(_target: Sprite): boolean {
            return true;
        }
        protected get StartValue(): TValue { return this.mStartValue; }
        protected set StartValue(value: TValue) {
            this.mStartValue = value;
            this.mDistance = this.CalcDistance(this.mStartValue, this.mEndValue);
        }
        protected get EndValue(): TValue { return this.mEndValue; }
        protected set EndValue(value: TValue) {
            this.mEndValue = value;
            this.mDistance = this.CalcDistance(this.mStartValue, this.mEndValue);
        }

        protected abstract CalcDistance(start: TValue, end: TValue): TValue;
        protected abstract CalcProgress(start: TValue, distanceTotal: TValue, timeProgress: number, timeTotal: number): TValue;
        protected abstract UpdateTarget(target: Sprite, value: TValue): void;
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
        protected UpdateTarget(target: Sprite, value: number): void {
            target.Angle = value;
        }
    }

    export class OpacityAnimation extends NumberValueAnimation {
        protected UpdateTarget(target: Sprite, value: number): void {
            target.Opacity = value;
        }
    }

    export class PosXAnimation extends NumberValueAnimation {
        protected UpdateTarget(target: Sprite, value: number): void {
            target.X = value;
        }
    }

    export class PosYAnimation extends NumberValueAnimation {
        protected UpdateTarget(target: Sprite, value: number): void {
            target.Y = value;
        }
    }

    export class WidthAnimation extends NumberValueAnimation {
        protected UpdateTarget(target: Sprite, value: number): void {
            target.Width = value;
        }
    }

    export class HeightAnimation extends NumberValueAnimation {
        protected UpdateTarget(target: Sprite, value: number): void {
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
        protected UpdateTarget(target: Sprite, value: Point): void {
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
        protected UpdateTarget(target: Sprite, value: Size): void {
            target.Size = value;
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
        protected UpdateTarget(target: Sprite, value: Rectangle): void {
            target.Box = value;
        }
    }

    export class KeyframeAnimation implements IAnimation {
        private mPlayState: AnimationPlayState;
        private mFrames: IAnimation[];
        private mCurrentFrame: number;
        public Loop: boolean;
        constructor(loop?: boolean, autostart?: boolean) {
            this.mPlayState = AnimationPlayState.Stop;
            this.Loop = loop ? loop : false;
            this.mFrames = new Array<IAnimation>();
            this.mCurrentFrame = 0;
            if (autostart) {
                this.Start();
            }
        }

        public get PlayState(): AnimationPlayState { return this.mPlayState; }

        public Start(): void {
            if (this.mPlayState !== AnimationPlayState.Playing) {
                this.Restart();
            }
        }

        public Restart(): void {
            this.mPlayState = AnimationPlayState.Playing;
            let cur = this.mFrames[this.mCurrentFrame];
            if (cur) {
                cur.Stop();
            }
            this.mCurrentFrame = 0;
            cur = this.mFrames[this.mCurrentFrame];
            if (cur) {
                cur.Restart();
            }
        }

        public Stop(): void {
            this.mPlayState = AnimationPlayState.Stop;
            let cur = this.mFrames[this.mCurrentFrame];
            if (cur) {
                cur.Stop();
            }
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

        public Suspend(timestamp?: number): void {
            if (this.mPlayState === AnimationPlayState.Playing) {
                let cur = this.mFrames[this.mCurrentFrame];
                if (cur) {
                    cur.Suspend(timestamp);
                }
                this.mPlayState = AnimationPlayState.Suspended;
            }
        }
        public Resume(timestamp?: number): void {
            if (this.mPlayState === AnimationPlayState.Suspended) {
                let cur = this.mFrames[this.mCurrentFrame];
                if (cur) {
                    cur.Resume(timestamp);
                }
                this.mPlayState = AnimationPlayState.Playing;
            }
        }

        public Update(timestamp: number, target: Sprite): void {
            if ((this.PlayState !== AnimationPlayState.Playing) && this.mFrames.length == 0) {
                return;
            }
            let animation = this.mFrames[this.mCurrentFrame];
            if (animation.PlayState !== AnimationPlayState.Playing) {
                animation.Start();
            }
            animation.Loop = false;
            animation.Update(timestamp, target);
            if (animation.PlayState !== AnimationPlayState.Playing) {
                this.mCurrentFrame++;
                if (this.mCurrentFrame >= this.mFrames.length) {
                    this.mCurrentFrame = 0;
                    if (!this.Loop) {
                        this.Stop();
                    }
                }
            }
        }

        public ValidateTarget(_target: Sprite): boolean {
            return true;
        }
    }

    export class SequenceAnimation extends NumberValueAnimation {
        private mTextureList: ITexture[];
        private mInterval: number;
        constructor(interval: number, textures?: IReadonlyArray<ITexture>, loop?: boolean, autostart?: boolean) {
            super(0, 0, 0, loop, autostart);
            this.mTextureList = new Array<ITexture>();
            this.mInterval = interval;
            if (textures) {
                for (let t of textures) {
                    this.mTextureList.push(t);
                }
            }
            this.EndValue = this.mTextureList.length - 1;
            this.Duration = this.mTextureList.length * interval;
        }

        public get Frames(): IReadonlyArray<ITexture> {
            return this.mTextureList;
        }

        public get Interval(): number {
            return this.mInterval;
        }

        public set Interval(value: number) {
            this.mInterval = value;
            this.Duration = this.mTextureList.length * value;
        }

        public AddFrame(texture: ITexture): void {
            this.mTextureList.push(texture);
            this.EndValue = this.mTextureList.length - 1;
            this.Duration = this.mTextureList.length * this.mInterval;
        }

        public RemoveAt(index: number): void {
            this.mTextureList.slice(index, index + 1);
            this.EndValue = this.mTextureList.length - 1;
            this.Duration = this.mTextureList.length * this.mInterval;
        }

        public ClearFrames(): void {
            this.mTextureList.length = 0;
            this.EndValue = 0;
            this.Duration = 0;
        }

        public ValidateTarget(target: Sprite): boolean {
            return target instanceof ImageSprite;
        }

        protected UpdateTarget(target: ImageSprite, value: number): void {
            if (this.mTextureList.length > 0) {
                target.Texture = this.mTextureList[Math.floor(value)];
            }
        }
    }
}
