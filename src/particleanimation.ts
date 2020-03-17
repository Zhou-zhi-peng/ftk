/// <reference path="./sprite.ts" />

namespace ftk {
    type Point = geometry.twodim.Point;
    export class ParticleAnimation extends Sprite {
        private mParticles: Array<Particle>;
        private mTicks: number;
        private mLastUpdateTime: number;
        private mUpdateTime: number;
        private mParticleRander: ((rc: CanvasRenderingContext2D, particle: Particle) => void) | null;

        public constructor() {
            super();
            this.mParticles = new Array<Particle>();
            this.mTicks = 0;
            this.mLastUpdateTime = 0;
            this.mUpdateTime = 0;
            this.mParticleRander = null;
        }
        public get Particles(): IReadOnlyArray<Particle> {
            return this.mParticles;
        }
        public get Ticks(): number {
            return this.mTicks;
        }
        public get LastUpdateTime(): number {
            return this.mLastUpdateTime;
        }
        public get UpdateTime(): number {
            return this.mUpdateTime;
        }
        public AddParticle(particle: Particle) {
            this.mParticles.push(particle);
        }

        public DispatchTouchEvent(ev: GTouchEvent, forced: boolean): void {
        }
        public DispatchMouseEvent(ev: GMouseEvent, forced: boolean): void {
        }
        public DispatchKeyboardEvent(ev: GKeyboardEvent, forced: boolean): void {
        }
        public OnRander(rc: CanvasRenderingContext2D): void {
            if (this.mParticleRander) {
                let randerHook = this.mParticleRander;
                this.mParticles.forEach((particle) => { randerHook.call(this, rc, particle); });
            } else {
                this.mParticles.forEach((particle) => { particle.Render(rc); });
            }
        }

        protected OnUpdate(): boolean {
            return false;
        }

        public Update(timestamp: number): void {
            this.mUpdateTime = timestamp;
            if (!this.OnUpdate()) {
                let arr = this.mParticles;
                for (var i = 0; i < arr.length; ++i) {
                    arr[i].Update();
                }
                var j = 0;
                for (var i = 0; i < arr.length; ++i) {
                    if (arr[i].active) {
                        arr[j++] = arr[i];
                    }
                }
                arr.length = j;
            }
            ++this.mTicks;
            this.mLastUpdateTime = timestamp;
        }
    }
    export abstract class Particle {
        public x: number;
        public y: number;
        public vx: number;
        public vy: number;
        public life: number;
        public bounce: number;
        public gravity: number;
        public drag: number;
        public active: boolean;
        private mPA: ParticleAnimation;

        constructor(pa: ParticleAnimation, x: number, y: number) {
            this.mPA = pa;
            this.x = x;
            this.y = y;
            let pt = this.randPointOnCircle(Math.random() + 1);
            this.vx = pt.x;
            this.vy = pt.y;
            this.life = Math.floor(Math.random() * 20) + 40;
            this.bounce = 0.6;
            this.gravity = 0.07;
            this.drag = 0.998;
            this.active = true;
        }

        public get PA(): ParticleAnimation {
            return this.mPA;
        }
        public Update(): void {
            if (--this.life < 0) {
                this.active = false;
            }
            this.vy += this.gravity;
            this.vx *= this.drag;
            this.x += this.vx;
            this.y += this.vy;
        }
        public abstract Render(rc: CanvasRenderingContext2D): void;
        private randPointOnCircle(size: number): Point {
            if (size == null) {
                size = 1;
            }
            var x = 0.0;
            var y = 0.0;
            var s = 0.0;
            do {
                x = (Math.random() - 0.5) * 2.0;
                y = (Math.random() - 0.5) * 2.0;
                s = x * x + y * y;
            } while (s > 1);

            var scale = size / Math.sqrt(s);
            return new geometry.twodim.Point(
                x * scale,
                y * scale
            );
        }
    }
}