/// <reference path="../particlesystem.ts" />

namespace ftk.particles {
    export class FireworkSparkParticle extends Particle {
        public hue: number;
        public color: string;
        constructor(pa: ParticleSprite, x: number, y: number) {
            super(pa, x, y);
            this.hue = Math.floor(Math.random() * 360);
            this.maxLife = this.age;
            this.drag = 0.9;
            this.color = this.randColor();
        }
        public Render(rc: CanvasRenderingContext2D): void {
            rc.fillStyle = this.color;
            rc.fillRect(this.x - 1, this.y - 1, 2, 2);
        }

        public Update(timestamp: number): void {
            super.Update(timestamp);
            if (Math.random() < 0.5) {
                this.color = this.randColor();
            }
        }

        protected randColor(): string {
            let components = [
                (Math.random() * 128 + 128) & 0xff, (Math.random() * 128 + 128) & 0xff, (Math.random() * 128 + 128) & 0xff
            ];
            components[Math.floor(Math.random() * 3)] = Math.floor(Math.random() * 200 + 55) & 0xff;
            if (Math.random() < 0.3) {
                components[Math.floor(Math.random() * 3)] = (Math.random() * 200 + 55) & 0xff;
            }
            return "rgb(" + components.join(',') + ")";
        }
    }

    export class FireworkFlameParticle extends Particle {
        constructor(pa: ParticleSprite, x: number, y: number) {
            super(pa, x, y);
            this.age /= 2;
        }
        public Update(timestamp: number): void {
            let spark = new FireworkSparkParticle(this.PA, this.x, this.y);
            spark.vx /= 10;
            spark.vy /= 10;
            spark.vx += this.vx / 2;
            spark.vy += this.vy / 2;
            this.PA.AddParticle(spark);
            super.Update(timestamp);
        }
        public Render(_rc: CanvasRenderingContext2D): void {
        }
    }

    export class FireworkParticle extends Particle {
        constructor(pa: ParticleSprite, x: number, y: number) {
            super(pa, x, y);
            this.maxLife = 5;
            this.age = 0;
        }

        public Update(timestamp: number): void {
            super.Update(timestamp);
            let bits = Math.ceil(this.age * 10 / this.maxLife);
            for (let i = 0; i < bits; ++i) {
                let flame = new FireworkFlameParticle(this.PA, this.x, this.y);
                flame.vy *= 1.5;
                flame.vx *= 1.5;
                this.PA.AddParticle(flame);
            }
        }
        public Render(_rc: CanvasRenderingContext2D): void {
        }
    }

    export class FireworkAnimation extends ParticleSprite {
        protected OnUpdate(): boolean {
            if ((this.Ticks % 40) === 0) {
                let fw = new FireworkParticle(this, Math.random() * window.innerWidth, Math.random() * window.innerHeight * 0.75);
                fw.vx *= 5;
                fw.vy *= 3;
                this.AddParticle(fw);
            }
            return false;
        }
    }
}
