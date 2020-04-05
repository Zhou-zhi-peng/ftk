/// <reference path="./sprite.ts" />

namespace ftk {
    export class ParticleSprite extends RectangleSprite {
        private mParticles: Particle[];
        private mBufferParticles: Particle[];
        private mParticleEmitters: IParticleEmitter[];
        private mLastUpdateTime: number;
        private mUpdateTime: number;
        private mSuspendTime: number;

        public constructor() {
            super(0, 0, 0, 0);
            this.mParticles = new Array<Particle>();
            this.mBufferParticles = new Array<Particle>();
            this.mParticleEmitters = new Array<IParticleEmitter>();
            this.mLastUpdateTime = -1;
            this.mUpdateTime = 0;
            this.mSuspendTime = 0;
        }
        public get Particles(): IReadonlyArray<Particle> {
            return this.mParticles;
        }

        public get Emitters(): IReadonlyArray<IParticleEmitter> {
            return this.mParticleEmitters;
        }

        public get LastUpdateTime(): number {
            return this.mLastUpdateTime;
        }
        public get UpdateTime(): number {
            return this.mUpdateTime;
        }
        public AddParticle(particle: Particle): void {
            this.mParticles.push(particle);
        }

        public ClearParticle(): void {
            this.mParticles.length = 0;
        }

        public AddEmitter(emitter: IParticleEmitter): void {
            this.mParticleEmitters.push(emitter);
        }

        public RemoveEmitter(emitter: IParticleEmitter): void {
            this.mParticleEmitters = this.mParticleEmitters.filter((e) => e != emitter);
        }

        public ClearEmitter(): void {
            this.mParticleEmitters.length = 0;
        }

        // 屏蔽用户事件
        public DispatchTouchEvent(_ev: GTouchEvent, _forced: boolean): void {
        }

        public DispatchMouseEvent(_ev: GMouseEvent, _forced: boolean): void {
        }

        public DispatchKeyboardEvent(_ev: GKeyboardEvent, _forced: boolean): void {
        }

        protected OnUpdate(timestamp: number): void {
            if (this.mLastUpdateTime < 0) {
                this.mLastUpdateTime = timestamp;
            }
            this.mUpdateTime = timestamp;
            let incremental = timestamp - this.mLastUpdateTime;
            let arr = this.mParticles;
            let buf = this.mBufferParticles;
            let box = this.getRectangle();
            for (let p of arr) {
                p.Update(incremental, box);
                if (p.active) {
                    buf.push(p);
                }
            }
            this.SwapBuffer();
            for (let pe of this.mParticleEmitters) {
                pe.Update(timestamp, this);
            }
            this.mLastUpdateTime = timestamp;
        }

        protected OnRander(rc: CanvasRenderingContext2D): void {
            let r = this.getRectangle();
            rc.beginPath();
            rc.rect(r.x, r.y, r.w, r.h);
            rc.clip();

            for (let p of this.mParticles) {
                p.Render(rc);
            }
        }

        protected OnEngineVisibilityStateChanged(visible: boolean, timestamp: number) {
            super.OnEngineVisibilityStateChanged(visible, timestamp);
            if (visible) {
                this.mLastUpdateTime = timestamp - (this.mSuspendTime - this.mLastUpdateTime);
                this.mSuspendTime = 0;
            } else {
                this.mSuspendTime = timestamp;
            }
        }
        private SwapBuffer(): void {
            let t = this.mParticles;
            this.mParticles = this.mBufferParticles;
            this.mBufferParticles = t;
            this.mBufferParticles.length = 0;
        }
    }

    export abstract class Particle {
        public x: number; // 位置
        public y: number;
        public w: number; // 大小
        public h: number;
        public vx: number; // 速度
        public vy: number;
        public maxLife: number; // 预设寿命
        public age: number; // 当前寿命
        public gravity: number; // 重力[<0 反重力，0无重力，>0 产生重力]
        public drag: number; // 阻力[0无穷大，1无阻力,>1 产生排斥力]
        public elastic: number; // 弹性
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
            this.maxLife = 0;
            this.age = 0;
            this.gravity = 1;
            this.drag = 1;
            this.elastic = 0;
            this.active = true;
        }

        public Update(incremental: number, rect: Rectangle): void {
            if (this.active) {
                this.age += incremental;
                if (this.age >= this.maxLife) {
                    this.active = false;
                }
                if (this.drag !== 1) {
                    this.vx *= this.drag;
                    this.vy *= this.drag;
                }
                this.vy += this.gravity;

                this.x += this.vx;
                this.y += this.vy;

                if (this.elastic !== 0) {
                    let right = rect.right;
                    let bottom = rect.bottom;
                    if (this.x <= rect.x || this.x >= right) {
                        this.vx = (-this.vx) * this.elastic;
                        if (this.x <= rect.x) {
                            this.x = rect.x;
                        } else if (this.x > right) {
                            this.x = right;
                        }
                    }
                    if (this.y <= rect.y || this.y >= bottom) {
                        this.vy = (-this.vy) * this.elastic;
                        if (this.y <= rect.y) {
                            this.y = rect.y;
                        } else if (this.y > bottom) {
                            this.y = bottom;
                        }
                    }
                } else if (!rect.isInside(this.x, this.y)) {
                    this.active = false;
                }
            }
        }
        public abstract Render(rc: CanvasRenderingContext2D): void;
    }

    export interface IParticleEmitter {
        Position: Point;
        Update(timestamp: number, ps: ParticleSprite): void;
    }
}
