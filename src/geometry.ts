namespace ftk {
    export const PI_HALF = (Math.PI / 2);
    export const PI_1_5X = (Math.PI + PI_HALF);
    export const PI_2_0X = Math.PI * 2;
    export const RAD = Math.PI / 180;
    export const DEG = 180 / Math.PI;

    export class Point implements IClone<Point> {
        public x: number;
        public y: number;
        constructor();
        constructor(x: number, y: number);
        constructor(x?: any, y?: any) {
            this.x = x || 0;
            this.y = y || 0;
        }

        public clone(): Point {
            return new Point(this.x, this.y);
        }

        public offset(x: number, y: number) {
            this.x += x;
            this.y += y;
        }

        public setV(v: Point): void;
        public setV(x: number, y: number): void;
        public setV(x: any, y?: number): void {
            if (x instanceof Point) {
                this.x = x.x;
                this.y = x.y;
            } else {
                this.x = x;
                this.y = y || 0;
            }
        }

        public distance(a: Point) {
            return Point.distance(this, a);
        }

        public rotate(angle: number, basept: Point): void {
            let cosValue = Math.cos(angle);
            let sinValue = Math.sin(angle);
            let x = this.x - basept.x;
            let y = this.y - basept.y;
            this.x = basept.x + (x * cosValue - y * sinValue);
            this.y = basept.y + (x * sinValue + y * cosValue);
        }

        public equal(b: Point): boolean {
            return this.x === b.x && this.y === b.y;
        }

        public static distance(a: Point, b: Point) {
            let x = Math.abs(a.x - b.x);
            let y = Math.abs(a.y - b.y);
            return Math.sqrt((x * x + y * y));
        }
        public static rotate(pt: Point, angle: number, basept: Point): Point {
            let p = pt.clone();
            p.rotate(angle, basept);
            return p;
        }

        public static equal(a: Point, b: Point): boolean {
            return a.equal(b);
        }

        public static angle(a: Point, b: Point): number {
            return Math.atan2(b.y - a.y, b.x - a.x);
        }
    }

    export class Size implements IClone<Size> {
        public cx: number;
        public cy: number;
        constructor();
        constructor(cx: number, cy: number);
        constructor(cx?: any, cy?: any) {
            this.cx = cx || 0;
            this.cy = cy || 0;
        }

        public clone(): Size {
            return new Size(this.cx, this.cy);
        }
        public equal(b: Size): boolean {
            return this.cx === b.cx && this.cy === b.cy;
        }

        public static equal(a: Size, b: Size): boolean {
            return a.equal(b);
        }
    }

    export class Rectangle implements IClone<Rectangle>  {
        public x: number;
        public y: number;
        public w: number;
        public h: number;
        constructor();
        constructor(point: Point, size: Size);
        constructor(x: number, y: number, w: number, h: number);
        constructor(x?: any, y?: any, w?: any, h?: any) {
            if (x instanceof Point) {
                this.x = x.x;
                this.y = x.y;
                this.w = y.cx;
                this.h = y.cy;
            } else {
                this.x = x || 0;
                this.y = y || 0;
                this.w = w || 0;
                this.h = h || 0;
            }
        }

        public clone(): Rectangle {
            return new Rectangle(this.x, this.y, this.w, this.h);
        }

        public get left(): number {
            return this.x;
        }
        public set left(value: number) {
            this.x = value;
        }

        public get right(): number {
            return this.x + this.w;
        }
        public set right(value: number) {
            this.w = value - this.x;
        }

        public get top(): number {
            return this.y;
        }
        public set top(value: number) {
            this.y = value;
        }

        public get bottom(): number {
            return this.y + this.h;
        }
        public set bottom(value: number) {
            this.h = value - this.y;
        }

        public get center(): Point {
            return new Point(this.x + this.w / 2, this.y + this.h / 2);
        }

        public set center(value: Point) {
            let ox = this.w / 2;
            let oy = this.h / 2;
            this.x = value.x - ox;
            this.y = value.y - oy;
        }

        public get length(): number {
            return this.w + this.w + this.h + this.h;
        }

        public get leftTop(): Point {
            return new Point(this.x, this.y);
        }

        public set leftTop(value: Point) {
            this.x = value.x;
            this.y = value.y;
        }

        public get size(): Size {
            return new Size(this.w, this.h);
        }

        public set size(value: Size) {
            this.w = value.cx;
            this.h = value.cy;
        }

        public get rightBottom(): Point {
            return new Point(this.right, this.bottom);
        }

        public set rightBottom(value: Point) {
            this.right = value.x;
            this.bottom = value.y;
        }

        public isPointInside(point: Point): boolean {
            return this.isInside(point.x, point.y);
        }

        public isInside(x: number, y: number): boolean {
            return x > this.x && (x < this.x + this.w)
                && y > this.y && (y < this.y + this.h);
        }

        public isBoundary(point: Point): boolean {
            if (point.x > this.x && (point.x < this.x + this.w)) {
                return point.y === this.y || point.y === this.bottom;
            } else if (point.x > this.x && (point.x < this.x + this.w)) {
                return point.x === this.x || point.x === this.right;
            }
            return false;
        }

        public isInsideOrBoundary(point: Point): boolean {
            return point.x >= this.x && (point.x <= this.x + this.w)
                && point.y >= this.y && (point.y <= this.y + this.h);
        }

        public isIntersect(r: Rectangle) {
            return Rectangle.isIntersect(this, r);
        }

        public offset(x: number, y: number) {
            this.x += x;
            this.y += y;
        }

        public expand(value: number) {
            this.x -= value;
            this.y -= value;
            this.w += value;
            this.h += value;
        }

        public normalize(): void {
            let x = 0;
            let w = 0;
            let y = 0;
            let h = 0;
            if (this.w < 0) {
                x = this.x + this.w;
                w = -this.w;
            } else {
                x = this.x;
                w = this.w;
            }

            if (this.h < 0) {
                y = this.y + this.h;
                h = -this.h;
            } else {
                y = this.y;
                h = this.h;
            }
            this.x = x;
            this.y = y;
            this.w = w;
            this.h = h;
        }

        public HitTest(point: Point, tolerance?: number): string {
            tolerance = tolerance || 0;
            let px = point.x;
            let py = point.y;
            let x = this.x - tolerance;
            let y = this.y - tolerance;
            let w = this.w + tolerance * 2;
            let h = this.h + tolerance * 2;
            if ((px >= x && px <= (x + w)) && (py >= y && py <= (y + h))) {
                if (py >= y && py <= (this.y + tolerance)) {
                    if (px >= x && px <= (this.x + tolerance)) {
                        return "top|left";
                    }
                    else if (px >= (this.x + this.w - tolerance) && px <= (x + w)) {
                        return "top|right";
                    }
                    return "top";
                }
                else if (py >= (this.y + this.h - tolerance) && py <= (y + h)) {
                    if (px >= x && px <= (this.x + tolerance)) {
                        return "bottom|left";
                    }
                    else if (px >= (this.x + this.w - tolerance) && px <= (x + w)) {
                        return "bottom|right";
                    }
                    return "bottom";
                }
                else if (px >= x && px <= (this.x + tolerance)) {
                    return "left";
                }
                else if (px >= (this.x + this.w - tolerance) && px <= (x + w)) {
                    return "right";
                }
                return "inside";
            }
            return "none";
        }

        public union(a: Rectangle): void {
            this.normalize();
            let r1 = Rectangle.normalize(a);
            let r2 = this;
            let startX = r1.x < r2.x ? r1.x : r2.x;
            let endX = r1.right > r2.right ? r1.right : r2.right;
            let startY = r1.y < r2.y ? r1.y : r2.y;
            let endY = r1.bottom > r2.bottom ? r1.bottom : r2.bottom;
            this.x = startX;
            this.y = startY;
            this.w = endX - startX;
            this.h = endY - startY;
        }

        public equal(b: Rectangle): boolean {
            return this.x === b.x && this.y === b.y && this.w === b.w && this.h === b.h;
        }

        public intersection(r1: Rectangle, r2: Rectangle): void {
            let merge = Rectangle.union(r1, r2);
            let startX = r1.x === merge.x ? r2.x : r1.x;
            let endX = r1.right === merge.right ? r2.right : r1.right;
            let startY = r1.y === merge.y ? r2.y : r1.y;
            let endY = r1.bottom === merge.bottom ? r2.bottom : r1.bottom;
            this.x = startX;
            this.y = startY;
            this.w = endX - startX;
            this.h = endY - startY;
        }

        public static isIntersect(r0: Rectangle, r1: Rectangle) {
            let a = r0.leftTop;
            let b = r0.rightBottom;
            let c = r1.leftTop;
            let d = r1.rightBottom;
            return (Math.min(a.x, b.x) <= Math.max(c.x, d.x)
                && Math.min(c.y, d.y) <= Math.max(a.y, b.y)
                && Math.min(c.x, d.x) <= Math.max(a.x, b.x)
                && Math.min(a.y, b.y) <= Math.max(c.y, d.y));
        }

        public static normalize(a: Rectangle): Rectangle {
            let x = 0;
            let w = 0;
            let y = 0;
            let h = 0;
            if (a.w < 0) {
                x = a.x + a.w;
                w = -a.w;
            } else {
                x = a.x;
                w = a.w;
            }

            if (a.h < 0) {
                y = a.y + a.h;
                h = -a.h;
            } else {
                y = a.y;
                h = a.h;
            }
            return new Rectangle(x, y, w, h);
        }

        public static union(a: Rectangle, b: Rectangle): Rectangle {
            let r1 = Rectangle.normalize(a);
            let r2 = Rectangle.normalize(b);
            let startX = r1.x < r2.x ? r1.x : r2.x;
            let endX = r1.right > r2.right ? r1.right : r2.right;
            let startY = r1.y < r2.y ? r1.y : r2.y;
            let endY = r1.bottom > r2.bottom ? r1.bottom : r2.bottom;
            return new Rectangle(startX, startY, endX - startX, endY - startY);
        }

        public static intersection(r1: Rectangle, r2: Rectangle): Rectangle {
            let merge = Rectangle.union(r1, r2);
            let startX = r1.x === merge.x ? r2.x : r1.x;
            let endX = r1.right === merge.right ? r2.right : r1.right;
            let startY = r1.y === merge.y ? r2.y : r1.y;
            let endY = r1.bottom === merge.bottom ? r2.bottom : r1.bottom;
            return new Rectangle(startX, startY, endX - startX, endY - startY);
        }

        public static equal(a: Rectangle, b: Rectangle): boolean {
            return a.equal(b);
        }
    }

    export class LineSegment implements IClone<LineSegment>  {
        public start: Point;
        public end: Point;
        constructor();
        constructor(s: Point, e: Point);
        constructor(sx: number, sy: number, ex: number, ey: number);
        constructor(sx?: any, sy?: any, ex?: number, ey?: number) {
            if (sx instanceof Point && sy instanceof Point) {
                this.start = sx;
                this.end = sy;
            } else if (sx && sy && ex && ey) {
                this.start = new Point(sx, sy);
                this.end = new Point(ex, ey);
            } else {
                this.start = new Point(0, 0);
                this.end = new Point(0, 0);
            }
        }

        public clone(): LineSegment {
            return new LineSegment(this.start.clone(), this.end.clone());
        }

        public isInLine(point: Point): boolean {
            return LineSegment.isInLine(point, this);
        }


        public HitTest(point: Point, tolerance: number) {
            return LineSegment.isInLineR(point, tolerance, this);
        }


        public isIntersect(l: LineSegment): boolean {
            return LineSegment.isIntersect(this, l);
        }

        public get angle(): number {
            return Math.atan2(this.end.y - this.start.y, this.end.x - this.start.x);
        }
        public angleBetween(a: LineSegment): number {
            return LineSegment.angleBetween(this, a);
        }

        public get box(): Rectangle {
            let r = new Rectangle(
                this.start.x,
                this.start.y,
                this.end.x - this.start.x,
                this.end.y - this.start.y);
            r.normalize();
            return r;
        }

        public get center(): Point {
            return new Point(
                this.start.x + ((this.end.x - this.start.x) / 2),
                this.start.y + ((this.end.y - this.start.y) / 2)
            );
        }

        public get length(): number {
            return Point.distance(this.start, this.end);
        }

        public get offsetX(): number {
            return this.end.x - this.start.x;
        }

        public get offsetY(): number {
            return this.end.y - this.start.y;
        }

        public getAtByLength(length: number): Point {// 需要优化
            let ll = this.length;
            let r = length / ll;
            let cx = this.offsetX * r;
            let cy = this.offsetY * r;
            return new Point(this.start.x + cx, this.start.y + cy);
        }

        public equal(b: LineSegment): boolean {
            return this.start.equal(b.start) && this.end.equal(b.end);
        }

        public static isInLineEx(point: Point, lstart: Point, lend: Point): boolean {
            return (((point.x - lstart.x) * (lstart.y - lend.y)) === ((lstart.x - lend.x) * (point.y - lstart.y))
                && (point.x >= Math.min(lstart.x, lend.x) && point.x <= Math.max(lstart.x, lend.x))
                && ((point.y >= Math.min(lstart.y, lend.y)) && (point.y <= Math.max(lstart.y, lend.y))));
        }

        public static isInLine(point: Point, line: LineSegment): boolean {
            return LineSegment.isInLineEx(point, line.start, line.end);
        }
        public static isInLineR(o: Point, r: number, line: LineSegment) {
            let a: number;
            let b: number;
            let c: number;
            let dist1: number;
            let dist2: number;
            let angle1: number;
            let angle2: number;

            if (line.start.x === line.end.x) {
                a = 1;
                b = 0;
                c = -line.start.x;
            } else if (line.start.y === line.end.y) {
                a = 0;
                b = 1;
                c = -line.start.y;
            } else {
                a = line.start.y - line.end.y;
                b = line.end.x - line.start.x;
                c = line.start.x * line.end.y - line.start.y * line.end.x;
            }
            dist1 = a * o.x + b * o.y + c;
            dist1 *= dist1;
            dist2 = (a * a + b * b) * r * r;
            if (dist1 > dist2) {
                return false;
            }
            angle1 = (o.x - line.start.x) * (line.end.x - line.start.x) + (o.y - line.start.y) * (line.end.y - line.start.y);
            angle2 = (o.x - line.end.x) * (line.start.x - line.end.x) + (o.y - line.end.y) * (line.start.y - line.end.y);
            if (angle1 > 0 && angle2 > 0) {
                return true;
            }
            return false;
        }

        public static isIntersect(l0: LineSegment, l1: LineSegment): boolean {
            let a = l0.start;
            let b = l0.end;
            let c = l1.start;
            let d = l1.end;
            if (!(Math.min(a.x, b.x) <= Math.max(c.x, d.x)
                && Math.min(c.y, d.y) <= Math.max(a.y, b.y)
                && Math.min(c.x, d.x) <= Math.max(a.x, b.x)
                && Math.min(a.y, b.y) <= Math.max(c.y, d.y))) {
                return false;
            }

            let u = (c.x - a.x) * (b.y - a.y) - (b.x - a.x) * (c.y - a.y);
            let v = (d.x - a.x) * (b.y - a.y) - (b.x - a.x) * (d.y - a.y);
            let w = (a.x - c.x) * (d.y - c.y) - (d.x - c.x) * (a.y - c.y);
            let z = (b.x - c.x) * (d.y - c.y) - (d.x - c.x) * (b.y - c.y);
            return (u * v === 0 && w * z === 0);
        }

        public static angleBetween(a: LineSegment, b: LineSegment): number {
            let v1 = a.end.x - a.start.x;
            let v2 = a.end.y - a.start.y;
            let v3 = b.end.x - b.start.x;
            let v4 = b.end.y - b.start.y;
            let fAngle0 = (v1 * v3 + v2 * v4) / ((Math.sqrt(v1 * v1 + v2 * v2)) * (Math.sqrt(v3 * v3 + v4 * v4)));
            let fAngle = Math.acos(fAngle0);

            if (fAngle >= PI_HALF) {
                fAngle = Math.PI - fAngle;
            }
            return fAngle;
        }

        public static equal(a: LineSegment, b: LineSegment): boolean {
            return a.equal(b);
        }
    }

    export class Circle implements IClone<Circle>{
        public center: Point;
        public radius: number;
        constructor();
        constructor(c: Point, radius: number);
        constructor(x: number, y: number, radius: number);
        constructor(x?: any, y?: any, radius?: any) {
            if (x instanceof Point) {
                this.center = x;
                this.radius = y;
            } else if (typeof (x) === "number") {
                this.center = new Point(x, y);
                this.radius = radius;
            } else {
                this.center = new Point();
                this.radius = 0;
            }
        }

        public clone(): Circle {
            return new Circle(this.center.clone(), this.radius);
        }

        public isInside(point: Point): boolean {
            return Point.distance(this.center, point) < this.radius;
        }

        public isBoundary(point: Point): boolean {
            return Point.distance(this.center, point) === this.radius;
        }

        public isInsideOrBoundary(point: Point): boolean {
            return Point.distance(this.center, point) <= this.radius;
        }

        public isIntersect(a: Circle): boolean {
            return Circle.isIntersect(this, a);
        }

        public equal(b: Circle): boolean {
            return this.center.equal(b.center) && this.radius === b.radius;
        }

        public get diameter(): number {
            return this.radius + this.radius;
        }

        public get length(): number {
            return Math.PI * this.diameter;
        }

        public get box(): Rectangle {
            let s = this.radius + this.radius;
            return new Rectangle(
                this.center.x - this.radius,
                this.center.y - this.radius,
                s,
                s);
        }

        public static isIntersect(a: Circle, b: Circle): boolean {
            let d = Point.distance(a.center, b.center);
            return d < a.radius || d < b.radius;
        }

        public static equal(a: Circle, b: Circle): boolean {
            return a.equal(b);
        }
    }

    export class Ellipse implements IClone<Ellipse>{
        public center: Point;
        public radius: Size;
        public rotation: number;
        constructor();
        constructor(center: Point, radius: Size, rotation: number);
        constructor(x: number, y: number, radiusX: number, radiusY: number, rotation: number);
        constructor(...args: any[]) {
            if (args[0] instanceof Point) {
                this.center = args[0];
                this.radius = args[1];
                this.rotation = args[2];
            } else if (typeof (args[0]) === "number") {
                this.center = new Point(args[0], args[1]);
                this.radius = new Size(args[2], args[3]);
                this.rotation = args[4];
            } else {
                this.center = new Point();
                this.radius = new Size();
                this.rotation = 0;
            }
        }

        public clone(): Ellipse {
            return new Ellipse(this.center.clone(), this.radius.clone(), this.rotation);
        }

        public isInside(point: Point): boolean {
            return this.getPointRelationship(point) < 1;
        }

        public isBoundary(point: Point): boolean {
            return this.getPointRelationship(point) === 1;
        }

        public isInsideOrBoundary(point: Point): boolean {
            return this.getPointRelationship(point) <= 1;
        }

        public equal(b: Ellipse): boolean {
            return this.center.equal(b.center) && this.radius.equal(b.radius) && this.rotation == this.rotation;
        }

        public static equal(a: Ellipse, b: Ellipse): boolean {
            return a.equal(b);
        }

        private getPointRelationship(point: Point): number {
            let x = (point.x - this.center.x) * Math.cos(this.rotation) + (point.y - this.center.y) * Math.sin(this.rotation);
            let y = -(point.x - this.center.x) * Math.sin(this.rotation) + (point.y - this.center.y) * Math.cos(this.rotation);
            let r = (x / this.radius.cx) * (x / this.radius.cx) + (y / this.radius.cy) * (y / this.radius.cy);
            return r;
        }
    }

    export class EllipseArc implements IClone<EllipseArc>{
        public center: Point;
        public radius: Size;
        public rotation: number;
        public startAngle: number;
        public endAngle: number;
        constructor();
        constructor(center: Point, radius: Size, rotation: number, startAngle: number, endAngle: number);
        constructor(x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number);
        constructor(...args: any[]) {
            if (args[0] instanceof Point) {
                this.center = args[0];
                this.radius = args[1];
                this.rotation = args[2];
                this.startAngle = args[3];
                this.endAngle = args[4];
            } else if (typeof (args[0]) === "number") {
                this.center = new Point(args[0], args[1]);
                this.radius = new Size(args[2], args[3]);
                this.rotation = args[4];
                this.startAngle = args[5];
                this.endAngle = args[6];
            } else {
                this.center = new Point();
                this.radius = new Size();
                this.rotation = 0;
                this.startAngle = 0;
                this.endAngle = 0;
            }
        }

        public clone(): EllipseArc {
            return new EllipseArc(this.center.clone(), this.radius.clone(), this.rotation, this.startAngle, this.endAngle);
        }

        public isBoundary(point: Point): boolean {
            if (this.getPointRelationship(point) === 1) {
                let a = Point.angle(this.center, point);
                return (a >= this.startAngle && a <= this.endAngle);
            }
            return false;
        }

        public equal(b: EllipseArc): boolean {
            return this.center.equal(b.center)
                && this.radius.equal(b.radius)
                && this.rotation == b.rotation
                && this.startAngle == b.startAngle
                && this.endAngle == b.endAngle;
        }

        public static equal(a: Ellipse, b: Ellipse): boolean {
            return a.equal(b);
        }

        private getPointRelationship(point: Point): number {
            let x = (point.x - this.center.x) * Math.cos(this.rotation) + (point.y - this.center.y) * Math.sin(this.rotation);
            let y = -(point.x - this.center.x) * Math.sin(this.rotation) + (point.y - this.center.y) * Math.cos(this.rotation);
            let r = (x / this.radius.cx) * (x / this.radius.cx) + (y / this.radius.cy) * (y / this.radius.cy);
            return r;
        }
    }

    export class Polygon implements IClone<Polygon> {
        private mVertexs: Point[];
        public closed: boolean;
        constructor(vertexs?: IReadonlyArray<Point>, clone?: boolean) {
            let vs = new Array<Point>();
            if (vertexs) {
                if (clone) {
                    for (let v of vertexs) {
                        vs.push(v.clone());
                    }
                } else {
                    vs.push(...vertexs);
                }
            }
            this.mVertexs = vs;
            this.closed = true;
        }

        public get vertexs(): IReadonlyArray<Point> {
            return this.mVertexs;
        }
        public get gravity(): Point {
            let area = 0.0;
            let gx = 0.0;
            let gy = 0.0;
            let count = this.mVertexs.length;
            for (let i = 1; i <= count; i++) {
                let vix = this.mVertexs[(i % count)].x;
                let viy = this.mVertexs[(i % count)].y;
                let nextx = this.mVertexs[(i - 1)].x;
                let nexty = this.mVertexs[(i - 1)].y;
                let temp = (vix * nexty - viy * nextx) / 2.0;
                area += temp;
                gx += temp * (vix + nextx) / 3.0;
                gy += temp * (viy + nexty) / 3.0;
            }
            gx = gx / area;
            gy = gy / area;
            return new Point(gx, gy);
        }

        public get box(): Rectangle {
            let vs = this.mVertexs;
            if (vs.length === 0) {
                return new Rectangle();
            }
            let left = vs[0].x;
            let top = vs[0].y;
            let right = left;
            let bottom = top;
            let count = vs.length;
            for (let i = 1; i <= count; i++) {
                let p = vs[i];
                if (left > p.x) {
                    left = p.x;
                }
                if (top > p.y) {
                    top = p.y;
                }
                if (right < p.x) {
                    right = p.x;
                }
                if (bottom < p.y) {
                    bottom = p.y;
                }
            }
            return new Rectangle(left, top, right - left, bottom - top);
        }

        public set box(value: Rectangle) {
            let b = this.box;
            let ofsx = value.x - b.x;
            let ofsy = value.y - b.y;

            if (value.w === b.w && value.h === b.h) {
                for (let v of this.mVertexs) {
                    v.x += ofsx;
                    v.y += ofsy;
                }
            } else {
                let bx = b.x;
                let by = b.y;
                let sx = value.w / b.w;
                let sy = value.h / b.h;
                for (let v of this.mVertexs) {
                    v.x = ofsx + bx + ((v.x - bx) * sx);
                    v.y = ofsy + by + ((v.y - by) * sy);
                }
            }
        }

        public get center(): Point {
            return this.box.center;
        }

        public get length(): number {
            if (this.mVertexs.length < 2) {
                return 0;
            }
            let l = 0;
            for (let i = 1; i < this.mVertexs.length; ++i) {
                l += Point.distance(this.mVertexs[i - 1], this.mVertexs[i]);
            }
            if (this.closed) {
                let first = this.mVertexs[0];
                let last = this.mVertexs[this.mVertexs.length - 1];
                l += Point.distance(first, last);
            }
            return l;
        }
        public clone(): Polygon {
            return new Polygon(this.mVertexs);
        }

        public isBoundary(point: Point): boolean {
            return Polygon.isBoundary(point, this);
        }

        public isInPolygon(point: Point): boolean {
            return Polygon.isInPolygon(point, this);
        }

        public appendVertex(...points: Point[]): void {
            points.forEach((point) => {
                this.mVertexs.push(point.clone());
            });
        }

        public pushVertex(x: number, y: number): Point {
            let p = new Point(x, y);
            this.mVertexs.push(p);
            return p;
        }

        public popVertex(): Point | undefined {
            return this.mVertexs.pop();
        }

        public insertVertex(index: number, ...points: Point[]): void {
            this.mVertexs.splice(index, 0, ...points);
        }

        public removeVertex(index: number, count: number): void {
            this.mVertexs.splice(index, count);
        }

        public equal(b: Polygon): boolean {
            let av = this.mVertexs;
            let bv = b.mVertexs;
            if (av.length != bv.length) {
                return false;
            }
            for (let i = 0; i < av.length; ++i) {
                if (!av[i].equal(bv[i])) {
                    return false;
                }
            }
            return true;
        }

        public static isBoundary(point: Point, p: Polygon): boolean {
            let count = p.mVertexs.length - 1;
            for (let i = 0; i < count; ++i) {
                if (LineSegment.isInLineEx(point, p.mVertexs[i], p.mVertexs[i + 1])) {
                    return true;
                }
            }
            return false;
        }

        public static isInPolygon(point: Point, p: Polygon): boolean {
            if (!p.closed) {
                return false;
            }
            let x = point.x;
            let y = point.y;
            let vs = p.mVertexs;
            let count = vs.length;
            let j = count - 1;
            let isin = false;
            for (let i = 0; i < count; i++) {
                let vi = vs[i];
                let vj = vs[j];
                if ((vi.y < y && vj.y >= y || vj.y < y && vi.y >= y) && (vi.x <= x || vj.x <= x)) {
                    if (vi.x + (y - vi.y) / (vj.y - vi.y) * (vj.x - vi.x) < x) {
                        isin = !isin;
                    }
                }
                j = i;
            }
            return isin;
        }

        public static equal(a: Polygon, b: Polygon): boolean {
            return a.equal(b);
        }
    }

    export class BezierCurve implements IClone<BezierCurve> {
        public controlStart: Point;
        public controlEnd: Point;
        public start: Point;
        public end: Point;
        public constructor();
        public constructor(cs: Point, ce: Point, s: Point, e: Point);
        public constructor(csx: number, csy: number, cex: number, cey: number, sx: number, sy: number, ex: number, ey: number);
        public constructor(...args: any[]) {
            if (args[0] instanceof Point) {
                this.controlStart = args[0];
                this.controlEnd = args[1];
                this.start = args[2];
                this.end = args[3];
            } else if (typeof (args[0]) === 'number') {
                this.controlStart = new Point(args[0], args[1]);
                this.controlEnd = new Point(args[2], args[3]);
                this.start = new Point(args[4], args[5]);
                this.end = new Point(args[6], args[7]);
            } else {
                this.controlStart = new Point();
                this.controlEnd = new Point();
                this.start = new Point();
                this.end = new Point();
            }
        }

        public clone(): BezierCurve {
            return new BezierCurve(this.controlStart.clone(), this.controlEnd.clone(), this.start.clone(), this.end.clone());
        }

        public fit(stept: number): Point[] {
            let results = [];
            for (let t = 0; t < 1; t += stept) {
                results.push(this.getCurvePoint(t));
            }
            results.push(this.end);
            return results;
        }

        public fitToPolygon(stept: number): Polygon {
            let p = new Polygon(this.fit(stept));
            p.closed = false;
            return p;
        }

        protected getCurvePoint(t: number): Point {
            let t0 = 1 - t;
            let t0pow2 = t0 * t0;
            let t0pow3 = t0pow2 * t0;
            let tpow2 = t * t;
            let tpow3 = tpow2 * t;

            let x = this.start.x * t0pow3 +
                this.controlStart.x * t * t0pow2 * 3 +
                this.controlEnd.x * tpow2 * t0 * 3 +
                this.end.x * tpow3;
            let y = this.start.y * t0pow3 +
                this.controlStart.y * t * t0pow2 * 3 +
                this.controlEnd.y * tpow2 * t0 * 3 +
                this.end.y * tpow3;
            return new Point(x, y);
        }
    }

    export class QBezierCurve implements IClone<QBezierCurve> {
        public control: Point;
        public start: Point;
        public end: Point;
        public constructor();
        public constructor(c: Point, s: Point, e: Point);
        public constructor(cx: number, cy: number, sx: number, sy: number, ex: number, ey: number);
        public constructor(...args: any[]) {
            if (args[0] instanceof Point) {
                this.control = args[0];
                this.start = args[1];
                this.end = args[2];
            } else if (typeof (args[0]) === 'number') {
                this.control = new Point(args[0], args[1]);
                this.start = new Point(args[2], args[3]);
                this.end = new Point(args[4], args[5]);
            } else {
                this.control = new Point();
                this.start = new Point();
                this.end = new Point();
            }
        }

        public clone(): QBezierCurve {
            return new QBezierCurve(this.control.clone(), this.start.clone(), this.end.clone());
        }

        public fit(stept: number): Point[] {
            let results = [];
            for (let t = 0; t < 1; t += stept) {
                results.push(this.getCurvePoint(t));
            }
            results.push(this.end);
            return results;
        }

        public fitToPolygon(stept: number): Polygon {
            let p = new Polygon(this.fit(stept));
            p.closed = false;
            return p;
        }

        protected getCurvePoint(t: number): Point {
            let t0 = 1 - t;
            let t0pow = t0 * t0;
            let tpow = t * t;
            let x = this.start.x * t0pow +
                this.control.x * t * t0 * 2 +
                this.end.x * tpow;
            let y = this.start.y * t0pow +
                this.control.y * t * (1 - t) * 2 +
                this.end.y * tpow;
            return new Point(x, y);
        }
    }

    export class Vector implements IClone<Vector> {

        public get isZero(): boolean {
            return this.x === 0 && this.x === this.y;
        }

        public get slope(): number {
            return this.y / this.x;
        }

        public get angle(): number {
            return Math.atan2(this.y, this.x);
        }

        public get length(): number {
            return Math.sqrt(this.lengthQ);
        }

        public set length(value: number) {
            let a = this.angle;
            this.x = Math.cos(a) * value;
            this.y = Math.sin(a) * value;
        }

        public get normalized(): boolean {
            return this.lengthQ === 1;
        }

        public get lengthQ(): number {
            return this.x * this.x + this.y * this.y;
        }
        public x: number;
        public y: number;
        constructor();
        constructor(x: number, y: number);
        constructor(x?: any, y?: any) {
            this.x = x || 0;
            this.y = y || 0;
        }

        public clone(): Vector {
            return new Vector(this.x, this.y);
        }
        public setV(v: Vector): void;
        public setV(x: number, y: number): void;
        public setV(x: any, y?: number): void {
            if (x instanceof Vector) {
                this.x = x.x;
                this.y = x.y;
            } else {
                this.x = x;
                this.y = y || 0;
            }
        }

        public add(v: Vector): void {
            this.x += v.x;
            this.y += v.y;
        }

        public sub(v: Vector): void {
            this.x -= v.x;
            this.y -= v.y;
        }

        public mul(v: number): void {
            this.x *= v;
            this.y *= v;
        }

        public div(v: number): void {
            this.x /= v;
            this.y /= v;
        }

        public cross(v: Vector): number {
            return this.x * v.y - this.y * v.x;
        }

        public dot(v: Vector): number {
            return this.x * v.y + this.y * v.x;
        }

        public inner(v: Vector): number {
            return this.x * v.x + this.y * v.y;
        }

        public equal(v: Vector): boolean {
            return this.x === v.x && this.y === v.y;
        }

        public normalize(): void {
            let l = this.length;
            this.div(l);
        }

        public zero(): void {
            this.x = 0;
            this.y = 0;
        }

        public reverse(): void {
            this.x = -this.x;
            this.y = -this.y;
        }

        public rotate(angle: number): void {
            let cosValue = Math.cos(angle);
            let sinValue = Math.sin(angle);
            let x = this.x;
            let y = this.y;
            this.x = x * cosValue - y * sinValue;
            this.y = x * sinValue + y * cosValue;
        }

        public isColinear(): boolean {
            return this.slope === this.slope;
        }

        public static add(a: Vector, b: Vector): Vector {
            return new Vector(a.x + b.x, a.y + b.y);
        }

        public static sub(a: Vector, b: Vector): Vector {
            return new Vector(a.x - b.x, a.y - b.y);
        }

        public static mul(v: Vector, scalar: number): Vector {
            return new Vector(v.x * scalar, v.y * scalar);
        }

        public static div(v: Vector, scalar: number): Vector {
            return new Vector(v.x / scalar, v.y / scalar);
        }

        public static cross(a: Vector, b: Vector): number {
            return a.x * b.y - a.y * b.x;
        }

        public static dot(a: Vector, b: Vector): number {
            return a.x * b.y + a.y * b.x;
        }

        public static inner(a: Vector, b: Vector): number {
            return a.x * b.x + a.y * b.y;
        }

        public static equal(a: Vector, b: Vector): boolean {
            return a.x === b.x && a.y === b.y;
        }

        public static angleBetween(a: Vector, b: Vector): number {
            return Math.atan2(Vector.cross(a, b), Vector.dot(a, b));
        }

        public static perpendicular(a: Vector, b: Vector): boolean {
            return (!a.isZero) && (!b.isZero) && Vector.inner(a, b) === 0;
        }

        public static isColinear(a: Vector, b: Vector): boolean {
            return a.slope === b.slope;
        }
    }

    export function DToR(angle: number) {
        return angle * RAD;
    }
    export function RToD(angle: number) {
        return angle * DEG;
    }
}
