/// <reference path="./objectnode.ts" />
/// <reference path="./geometry.ts" />


namespace ftk {
    export abstract class Shape extends Sprite {
        public LineWidth: number;
        public ForegroundColor: Color;
        public BackgroundColor: Color;
        public BorderColor: Color;
        public Text: string | undefined;
        public FontName: string;
        public FontSize: number;

        public constructor(id?: string) {
            super(id);
            this.LineWidth = 1;
            this.ForegroundColor = new Color(0, 0, 0);
            this.BackgroundColor = new Color(0, 0, 255);
            this.BorderColor = new Color(255, 255, 255);
            this.Text = undefined;
            this.FontName = "serif";
            this.FontSize = 16;
        }
        protected abstract OnDrawShape(rc: CanvasRenderingContext2D): void;
        protected OnRander(rc: CanvasRenderingContext2D): void {
            rc.lineWidth = this.LineWidth;
            rc.fillStyle = this.BackgroundColor.toRGBAString();
            rc.strokeStyle = this.BorderColor.toRGBAString();
            this.OnDrawShape(rc);
            if (this.Text && this.Text.length > 0) {
                rc.textAlign = 'center';
                rc.textBaseline = 'middle';
                rc.fillStyle = this.ForegroundColor.toRGBAString();
                rc.font = this.FontSize.toString() + 'px ' + this.FontName;
                let c = this.getRectangle().center;
                rc.fillText(this.Text, c.x, c.y);
            }
        }
    }

    export class LineShape extends Shape {
        private mLine: LineSegment;
        constructor(start: Point, end: Point, id?: string) {
            super(id);
            this.mLine = new LineSegment(start, end);
        }

        public PickTest(point: Point): boolean {
            return this.mLine.HitTest(point, 5);
        }

        protected getRectangle(): Rectangle {
            let r = new Rectangle(
                this.mLine.start,
                new Size(
                    this.mLine.end.x - this.mLine.start.x,
                    this.mLine.end.y - this.mLine.start.y)
            );
            r.normalize();
            return r;
        }
        protected setRectangle(value: Rectangle): void {
            let r = value.clone();
            r.normalize();

            let s = this.mLine.start;
            let e = this.mLine.end;
            let p = r.rightBottom;
            if (s.x < e.x) {
                s.x = r.x;
                e.x = p.x;
            } else {
                s.x = p.x;
                e.x = r.x;
            }

            if (s.y < e.y) {
                s.y = r.y;
                e.y = p.y;
            } else {
                s.y = p.y;
                e.y = r.y;
            }
        }

        protected OnDrawShape(rc: CanvasRenderingContext2D): void {
            rc.beginPath();
            rc.moveTo(this.mLine.start.x, this.mLine.start.y);
            rc.lineTo(this.mLine.end.x, this.mLine.end.y);
            rc.stroke();
        }
    }

    export class RectangleShape extends Shape {
        private mRectangle: Rectangle;
        constructor(x: number, y: number, w: number, h: number, id?: string) {
            super(id);
            this.mRectangle = new Rectangle(x, y, w, h);
        }

        protected getRectangle(): Rectangle {
            return this.mRectangle;
        }
        protected setRectangle(value: Rectangle): void {
            if (this.mRectangle !== value) {
                this.mRectangle = value;
            }
            this.mRectangle.normalize();
        }

        protected OnDrawShape(rc: CanvasRenderingContext2D): void {
            let r = this.getRectangle();
            if (this.BackgroundColor.A > 0) {
                rc.fillRect(r.x, r.y, r.w, r.h);
            }
            if (this.BorderColor.A > 0) {
                rc.strokeRect(r.x, r.y, r.w, r.h);
            }
        }
    }

    export class PolygonShape extends Shape {
        private mPolygon: Polygon;
        constructor(vertexs?: IReadonlyArray<Point>, id?: string) {
            super(id);
            this.mPolygon = new Polygon(vertexs);
        }

        public PickTest(point: Point): boolean {
            return this.mPolygon.isInPolygon(point);
        }

        protected getRectangle(): Rectangle {
            return this.mPolygon.box;
        }
        protected setRectangle(value: Rectangle): void {
            let r = value;
            r.normalize();
            this.mPolygon.box = r;
        }

        protected OnDrawShape(rc: CanvasRenderingContext2D): void {
            rc.beginPath();
            let first = this.mPolygon.vertexs[0];
            rc.moveTo(first.x, first.y);
            for (let v of this.mPolygon.vertexs) {
                rc.lineTo(v.x, v.y);
            }
            rc.closePath();
            rc.fill();
            rc.stroke();
        }
    }

    export class EPolygonShape extends PolygonShape {
        constructor(x: number, y: number, radius: number, side: number, id?: string) {
            super(EPolygonShape.getVertexs(x, y, radius, side), id);
        }

        protected static getVertexs(x: number, y: number, radius: number, side: number): Point[] {
            const astep = (Math.PI + Math.PI) / side;
            let angle = 0;
            let vertexs: Point[] = [];
            for (let i = 0; i < side; ++i) {
                vertexs.push(new Point(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius));
                angle += astep;
            }
            return vertexs;
        }
    }

    export class CircleShape extends Shape {
        private mCircle: Circle;
        constructor(x: number, y: number, radius: number, id?: string) {
            super(id);
            this.mCircle = new Circle(x, y, radius);
        }

        public PickTest(point: Point): boolean {
            return this.mCircle.isInsideOrBoundary(point);
        }

        protected getRectangle(): Rectangle {
            return this.mCircle.box;
        }
        protected setRectangle(value: Rectangle): void {
            let r = value;
            r.normalize();
            let radius = Math.min(r.w, r.h) / 2;
            this.mCircle.center = r.center;
            this.mCircle.radius = radius;
        }

        protected OnDrawShape(rc: CanvasRenderingContext2D): void {
            let c = this.mCircle.center;
            rc.beginPath();
            rc.arc(c.x, c.y, this.mCircle.radius, 0, Math.PI + Math.PI);
            rc.closePath();
            rc.fill();
            rc.stroke();
        }
    }
}
