/// <reference path="../particlesystem.ts" />
/// <reference path="../color.ts" />

namespace ftk.particles {
    export class SpeedParticle extends Particle {
        public color: Color;
        public size:number;
        constructor(pa: ParticleSprite, x: number, y: number,color: Color) {
            super(pa, x, y);
            this.drag = 0;
            this.color = color;
            this.size = Math.random() * 10;
        }
        public Render(rc: CanvasRenderingContext2D): void {
            rc.beginPath();
            rc.fillStyle = this.color.toRGBAString();
            rc.arc(this.x, this.y, this.size, 0, 2 * Math.PI, true);
            rc.fill();
        }

        public Update(): void {
            super.Update();
            this.color.A = this.life;
        }
    }
}