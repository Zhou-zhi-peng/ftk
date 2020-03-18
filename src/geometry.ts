namespace ftk {
    const PI_HALF = (Math.PI / 2);

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

        public static distance(a: Point, b: Point) {
            let x = Math.abs(a.x - b.x);
            let y = Math.abs(a.y - b.y);
            return Math.sqrt((x * x + y * y));
        }

        public distance(a: Point) {
            return Point.distance(this, a);
        }

        public static rotate(pt: Point, angle: number, basept: Point): Point {
            let p = pt.clone();
            p.rotate(angle, basept);
            return p;
        }

        public rotate(angle: number, basept: Point): void {
            let cosValue = Math.cos(angle);
            let sinValue = Math.sin(angle);
            let x = this.x - basept.x;
            let y = this.y - basept.y;
            this.x = basept.x + (x * cosValue - y * sinValue);
            this.y = basept.y + (x * sinValue + y * cosValue);
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

        public isInside(point: Point): boolean {
            return point.x > this.x && (point.x < this.x + this.w)
                && point.y > this.y && (point.y < this.y + this.h);
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
                    if (px >= x && px <= (this.x + tolerance))
                        return "top|left";
                    else if (px >= (this.x + this.w - tolerance) && px <= (x + w))
                        return "top|right";
                    return "top";
                }
                else if (py >= (this.y + this.h - tolerance) && py <= (y + h)) {
                    if (px >= x && px <= (this.x + tolerance))
                        return "bottom|left";
                    else if (px >= (this.x + this.w - tolerance) && px <= (x + w))
                        return "bottom|right";
                    return "bottom";
                }
                else if (px >= x && px <= (this.x + tolerance))
                    return "left";
                else if (px >= (this.x + this.w - tolerance) && px <= (x + w))
                    return "right";
                return "inside"
            }
            return "none";
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

        public static intersection(r1: Rectangle, r2: Rectangle): Rectangle {
            let merge = Rectangle.union(r1, r2);
            let startX = r1.x == merge.x ? r2.x : r1.x;
            let endX = r1.right == merge.right ? r2.right : r1.right;
            let startY = r1.y == merge.y ? r2.y : r1.y;
            let endY = r1.bottom == merge.bottom ? r2.bottom : r1.bottom;
            return new Rectangle(startX, startY, endX - startX, endY - startY);
        }

        public intersection(r1: Rectangle, r2: Rectangle): void {
            let merge = Rectangle.union(r1, r2);
            let startX = r1.x == merge.x ? r2.x : r1.x;
            let endX = r1.right == merge.right ? r2.right : r1.right;
            let startY = r1.y == merge.y ? r2.y : r1.y;
            let endY = r1.bottom == merge.bottom ? r2.bottom : r1.bottom;
            this.x = startX;
            this.y = startY;
            this.w = endX - startX;
            this.h = endY - startY;
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
                this.start = sx.clone();
                this.end = sy.clone();
            } else if (sx && sy && ex && ey) {
                this.start = new Point(sx, sy);
                this.end = new Point(ex, ey);
            } else {
                this.start = new Point(0, 0);
                this.end = new Point(0, 0);
            }
        }

        public clone(): LineSegment {
            return new LineSegment(this.start, this.end);
        }

        public static isInLineEx(point: Point, lstart: Point, lend: Point): boolean {
            return (((point.x - lstart.x) * (lstart.y - lend.y)) == ((lstart.x - lend.x) * (point.y - lstart.y))
                && (point.x >= Math.min(lstart.x, lend.x) && point.x <= Math.max(lstart.x, lend.x))
                && ((point.y >= Math.min(lstart.y, lend.y)) && (point.y <= Math.max(lstart.y, lend.y))));
        }

        public static isInLine(point: Point, line: LineSegment): boolean {
            return LineSegment.isInLineEx(point, line.start, line.end);
        }

        public isInLine(point: Point): boolean {
            return LineSegment.isInLine(point, this);
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

        public isIntersect(l: LineSegment): boolean {
            return LineSegment.isIntersect(this, l);
        }

        public get angle(): number {
            return Math.atan2(this.end.y - this.start.y, this.end.x - this.start.x);
        }

        public static angleBetween(a: LineSegment, b: LineSegment): number {
            let v1 = a.end.x - a.start.x;
            let v2 = a.end.y - a.start.y;
            let v3 = b.end.x - b.start.x;
            let v4 = b.end.y - b.start.y;
            let fAngle0 = (v1 * v3 + v2 * v4) / ((Math.sqrt(v1 * v1 + v2 * v2)) * (Math.sqrt(v3 * v3 + v4 * v4)));
            let fAngle = Math.acos(fAngle0);

            if (fAngle >= PI_HALF)
                fAngle = Math.PI - fAngle;
            return fAngle;
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
    }

    export class Circle implements IClone<Circle>{
        public center: Point;
        public radius: number;
        constructor();
        constructor(c: Point, radius: number);
        constructor(x: number, y: number, radius: number);
        constructor(x?: any, y?: any, radius?: any) {
            if (x instanceof Point) {
                this.center = x.clone();
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
            return new Circle(this.center, this.radius);
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

        public static isIntersect(a: Circle, b: Circle): boolean {
            let d = Point.distance(a.center, b.center);
            return d < a.radius || d < b.radius;
        }

        public isIntersect(a: Circle): boolean {
            return Circle.isIntersect(this, a);
        }

        public get box(): Rectangle {
            let s = this.radius + this.radius;
            return new Rectangle(
                this.center.x - this.radius,
                this.center.y - this.radius,
                s,
                s);
        }
    }

    export class Polygon implements IClone<Polygon> {
        private mVertexs: Array<Point>;
        public closed: boolean;
        constructor(vertexs?: IReadOnlyArray<Point>) {
            let vs = new Array<Point>();
            if (vertexs) {
                for (let i = 0; i < vertexs.length; ++i) {
                    vs.push(vertexs[i].clone());
                }
            }
            this.mVertexs = vs;
            this.closed = true;
        }

        clone(): Polygon {
            return new Polygon(this.mVertexs);
        }

        public get vertexs(): IReadOnlyArray<Point> {
            return this.mVertexs;
        }

        public static isBoundary(point: Point, p: Polygon): boolean {
            let count = p.mVertexs.length - 1;
            for (let i = 0; i < count; ++i) {
                if (LineSegment.isInLineEx(point, p.mVertexs[i], p.mVertexs[i + 1]))
                    return true;
            }
            return false;
        }

        public isBoundary(point: Point): boolean {
            return Polygon.isBoundary(point, this);
        }

        public static isInPolygon(point: Point, p: Polygon): boolean {
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

        public isInPolygon(point: Point, p: Polygon): boolean {
            return Polygon.isInPolygon(point, this);
        }

        public appendVertex(...points: Point[]): void {
            points.forEach((point) => {
                this.mVertexs.push(point.clone());
            });
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
            if (vs.length == 0)
                return new Rectangle();
            let left = vs[0].x;
            let top = vs[0].y;
            let right = left;
            let bottom = top;
            let count = vs.length;
            for (let i = 1; i <= count; i++) {
                let p = vs[i];
                if (left > p.x)
                    left = p.x;
                if (top > p.y)
                    top = p.y;
                if (right < p.x)
                    right = p.x;
                if (bottom < p.y)
                    bottom = p.y;
            }
            return new Rectangle(left, top, right - left, bottom - top);
        }

        public get center(): Point {
            return this.box.center;
        }
    }

    export class Vector implements IClone<Vector> {
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

        public static add(a: Vector, b: Vector): Vector {
            return new Vector(a.x + b.x, a.y + b.y);
        }

        public add(v: Vector): void {
            this.x += v.x;
            this.y += v.y;
        }

        public static sub(a: Vector, b: Vector): Vector {
            return new Vector(a.x - b.x, a.y - b.y);
        }

        public sub(v: Vector): void {
            this.x -= v.x;
            this.y -= v.y;
        }

        public static mul(v: Vector, scalar: number): Vector {
            return new Vector(v.x * scalar, v.y * scalar);
        }

        public mul(v: number): void {
            this.x *= v;
            this.y *= v;
        }

        public static div(v: Vector, scalar: number): Vector {
            return new Vector(v.x / scalar, v.y / scalar);
        }

        public div(v: number): void {
            this.x /= v;
            this.y /= v;
        }

        public static cross(a: Vector, b: Vector): number {
            return a.x * b.y - a.y * b.x;
        }

        public cross(v: Vector): number {
            return this.x * v.y - this.y * v.x;
        }

        public static dot(a: Vector, b: Vector): number {
            return a.x * b.y + a.y * b.x;
        }

        public dot(v: Vector): number {
            return this.x * v.y + this.y * v.x;
        }

        public static inner(a: Vector, b: Vector): number {
            return a.x * b.x + a.y * b.y;
        }

        public inner(v: Vector): number {
            return this.x * v.x + this.y * v.y;
        }

        public epointual(v: Vector): boolean {
            return this.x == v.x && this.y == v.y;
        }

        public static epointual(a: Vector, b: Vector): boolean {
            return a.x == b.x && a.y == b.y;
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

        public static angleBetween(a: Vector, b: Vector): number {
            return Math.atan2(Vector.cross(a, b), Vector.dot(a, b));
        }

        public static perpendicular(a: Vector, b: Vector): boolean {
            return (!a.isZero) && (!b.isZero) && Vector.inner(a, b) === 0;
        }

        public static isColinear(a: Vector, b: Vector): boolean {
            return a.slope === b.slope;
        }

        public isColinear(v: Vector): boolean {
            return this.slope === this.slope;
        }

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
            return this.lengthQ == 1;
        }

        public get lengthQ(): number {
            return this.x * this.x + this.y * this.y;
        }
    }
}