/// <reference path="./sprite.ts" />

namespace ftk {
    export class ParticleSprite extends Sprite {
        private mParticles: Particle[];
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
        public get Particles(): IReadonlyArray<Particle> {
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

        public DispatchTouchEvent(_ev: GTouchEvent, _forced: boolean): void {
        }
        public DispatchMouseEvent(_ev: GMouseEvent, _forced: boolean): void {
        }
        public DispatchKeyboardEvent(_ev: GKeyboardEvent, _forced: boolean): void {
        }
        public OnRander(rc: CanvasRenderingContext2D): void {
            if (this.mParticleRander) {
                let randerHook = this.mParticleRander;
                this.mParticles.forEach((particle) => { randerHook.call(this, rc, particle); });
            } else {
                this.mParticles.forEach((particle) => { particle.Render(rc); });
            }
        }

        public Update(timestamp: number): void {
            this.mUpdateTime = timestamp;
            if (!this.OnUpdate()) {
                let arr = this.mParticles;
                for (let p of arr) {
                    p.Update();
                }
                let j = 0;
                for (let p of arr) {
                    if (p.active) {
                        arr[j++] = p;
                    }
                }
                arr.length = j;
            }
            ++this.mTicks;
            this.mLastUpdateTime = timestamp;
        }

        protected OnUpdate(): boolean {
            return false;
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
        public readonly PA: ParticleSprite;

        constructor(pa: ParticleSprite, x: number, y: number) {
            this.PA = pa;
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
            let x = 0.0;
            let y = 0.0;
            let s = 0.0;
            do {
                x = (Math.random() - 0.5) * 2.0;
                y = (Math.random() - 0.5) * 2.0;
                s = x * x + y * y;
            } while (s > 1);

            let scale = size / Math.sqrt(s);
            return new Point(
                x * scale,
                y * scale
            );
        }
    }
}
