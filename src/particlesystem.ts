/// <reference path="./sprite.ts" />

namespace ftk {
    export class ParticleSprite extends RectangleSprite {
        private mParticles: Particle[];
        private mTicks: number;
        private mLastUpdateTime: number;
        private mUpdateTime: number;
        private mParticleRander: ((rc: CanvasRenderingContext2D, particle: Particle) => void) | null;

        public constructor() {
            super(0, 0, 0, 0);
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
            let r = this.getRectangle();
            rc.beginPath();
            rc.rect(r.x, r.y, r.w, r.h);
            rc.clip();

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
                    p.Update(timestamp);
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
        private birth: number;

        public x: number; // 位置
        public y: number;
        public w: number; // 大小
        public h: number;
        public vx: number; // 速度
        public vy: number;
        public ax: number; // 加速度
        public ay: number;
        public maxLife: number; // 预设寿命
        public age: number; // 当前寿命
        public exp: number; // 膨胀
        public gravity: number; // 重力
        public drag: number; // 阻力(0无穷大，1无阻力)
        public active: boolean;
        public readonly PA: ParticleSprite;

        constructor(pa: ParticleSprite, x: number, y: number) {
            this.PA = pa;
            this.x = x;
            this.y = y;
            this.w = 0;
            this.h = 0;
            this.vx = 0;
            this.vy = 0;
            this.ax = 0;
            this.ay = 0;
            this.maxLife = 0;
            this.age = 0;
            this.exp = 0;
            this.gravity = 0.07;
            this.drag = 0.998;
            this.birth = -1;
            this.active = true;
        }

        public Update(timestamp: number): void {
            let r = this.PA.Box;
            if (this.active || r.isInside(this.x, this.y)) {
                if (this.birth < 0) {
                    this.birth = timestamp;
                }
                else {
                    this.age = timestamp - this.birth;
                }
                if (this.age >= this.maxLife) {
                    this.active = false;
                }
                this.vy += this.gravity + this.ay;
                this.vx += this.ax;
                if (this.drag !== 1) {
                    this.vx *= this.drag;
                }

                this.x += this.vx;
                this.y += this.vy;

                if (this.exp !== 0) {
                    this.w += this.exp;
                    this.h += this.exp;
                }
            }
        }
        public abstract Render(rc: CanvasRenderingContext2D): void;
    }
}
