/// <reference path="../particleanimation.ts" />

namespace ftk.particles {
    export class FireworkSparkParticle extends Particle {
        public hue: number;
        public lifeMax: number;
        public color: string;
        constructor(pa: ParticleAnimation, x: number, y: number) {
            super(pa, x, y);
            this.hue = Math.floor(Math.random() * 360);
            this.lifeMax = this.life;
            this.drag = 0.9;
            this.color = this.randColor();
        }
        public Render(rc: CanvasRenderingContext2D): void {
            rc.fillStyle = this.color;
            rc.fillRect(this.x - 1, this.y - 1, 2, 2);
        }

        public Update(): void {
            super.Update();
            if (Math.random() < 0.5) {
                this.color = this.randColor()
            }
        }

        protected randColor(): string {
            var components = [
                (Math.random() * 128 + 128) & 0xff, (Math.random() * 128 + 128) & 0xff, (Math.random() * 128 + 128) & 0xff
            ];
            components[Math.floor(Math.random() * 3)] = Math.floor(Math.random() * 200 + 55) & 0xff;
            if (Math.random() < 0.3) {
                components[Math.floor(Math.random() * 3)] = (Math.random() * 200 + 55) & 0xff;
            }
            return "rgb(" + components.join(',') + ")"
        }
    }

    export class FireworkFlameParticle extends Particle {
        constructor(pa: ParticleAnimation, x: number, y: number) {
            super(pa, x, y);
            this.life *= 2;
        }
        public Update(): void {
            var spark = new FireworkSparkParticle(this.PA, this.x, this.y);
            spark.vx /= 10;
            spark.vy /= 10;
            spark.vx += this.vx / 2;
            spark.vy += this.vy / 2;
            this.PA.AddParticle(spark);
            super.Update();
        }
        public Render(rc: CanvasRenderingContext2D): void {
        }
    }

    export class FireworkParticle extends Particle {
        public lifeMax: number;
        constructor(pa: ParticleAnimation, x: number, y: number) {
            super(pa, x, y);
            this.lifeMax = 5;
            this.life = this.lifeMax;
        }

        public Update(): void {
            super.Update();
            var bits = Math.ceil(this.life * 10 / this.lifeMax);
            var dd = (this.lifeMax - this.life) / this.lifeMax + 0.2;
            for (var i = 0; i < bits; ++i) {
                var flame = new FireworkFlameParticle(this.PA, this.x, this.y)
                flame.vy *= 1.5;
                flame.vx *= 1.5
                this.PA.AddParticle(flame);
            }
        }
        public Render(rc: CanvasRenderingContext2D): void {
        }
    }

    export class FireworkAnimation extends ParticleAnimation {
        protected OnUpdate(): boolean {
            if ((this.Ticks % 40) === 0) {
                var fw = new FireworkParticle(this, Math.random() * window.innerWidth, Math.random() * window.innerHeight * 0.75);
                fw.vx *= 5;
                fw.vy *= 3;
                this.AddParticle(fw);
            }
            return false;
        }
    }
}