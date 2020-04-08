namespace ftk {
    export interface IGPathActionListener {
        moveTo(from: Point, to: Point): void;
        lineTo(from: Point, to: Point): void;
        bezierCurveTo(from: Point, cs: Point, ce: Point, to: Point): void;
        qbezierCurveTo(from: Point, c: Point, to: Point): void;
        ellipseTo(from: Point, r: Size, rotation: number, laflag: number, sflag: number, to: Point): void;
        closePath(from: Point): void;
    }

    interface IGPathNode extends IClone<IGPathNode> {
        readonly type: number;
        listener: IGPathActionListener;
        to: Point;
        exec(from: Point): void;
        toPathString(): string;
    }

    class GPNMoveTo implements IGPathNode {
        public readonly type: number = 77;
        public listener: IGPathActionListener;
        public to: Point;
        public constructor(x: number, y: number, actionListener: IGPathActionListener) {
            this.to = new Point(x, y);
            this.listener = actionListener;
        }
        public clone(): IGPathNode {
            return new GPNMoveTo(this.to.x, this.to.y, this.listener);
        }
        public exec(from: Point): void {
            this.listener.moveTo(from, this.to);
        }
        public toPathString(): string {
            return 'M ' + this.to.x.toString() + ' ' + this.to.y.toString();
        }
        public toString(): string {
            return this.toPathString();
        }
    }

    class GPNLineTo implements IGPathNode {
        public readonly type: number = 76;
        public listener: IGPathActionListener;
        public to: Point;
        public constructor(x: number, y: number, actionListener: IGPathActionListener) {
            this.to = new Point(x, y);
            this.listener = actionListener;
        }
        public clone(): IGPathNode {
            return new GPNLineTo(this.to.x, this.to.y, this.listener);
        }
        public exec(from: Point): void {
            this.listener.lineTo(from, this.to);
        }
        public toPathString(): string {
            return 'L ' + this.to.x.toString() + ' ' + this.to.y.toString();
        }
        public toString(): string {
            return this.toPathString();
        }
    }

    class GPNBezierCurveTo implements IGPathNode {
        public readonly type: number = 69;
        public listener: IGPathActionListener;
        public to: Point;
        public controlStart: Point;
        public controlEnd: Point;
        public constructor(csx: number, csy: number, cex: number, cey: number, x: number, y: number, actionListener: IGPathActionListener) {
            this.controlStart = new Point(csx, csy);
            this.controlEnd = new Point(cex, cey);
            this.to = new Point(x, y);
            this.listener = actionListener;
        }
        public clone(): IGPathNode {
            return new GPNBezierCurveTo(this.controlStart.x, this.controlStart.y, this.controlEnd.x, this.controlEnd.y, this.to.x, this.to.y, this.listener);
        }
        public exec(from: Point): void {
            this.listener.bezierCurveTo(from, this.controlStart, this.controlEnd, this.to);
        }
        public toPathString(): string {
            return 'C ' + this.controlStart.x.toString() + ' ' + this.controlStart.y.toString() + ', '
                + this.controlEnd.x.toString() + ' ' + this.controlEnd.y.toString() + ', '
                + this.to.x.toString() + ' ' + this.to.y.toString();
        }
        public toString(): string {
            return this.toPathString();
        }
    }

    class GPNQBezierCurveTo implements IGPathNode {
        public readonly type: number = 81;
        public listener: IGPathActionListener;
        public to: Point;
        public control: Point;
        public constructor(cx: number, cy: number, x: number, y: number, actionListener: IGPathActionListener) {
            this.control = new Point(cx, cy);
            this.to = new Point(x, y);
            this.listener = actionListener;
        }
        public clone(): IGPathNode {
            return new GPNQBezierCurveTo(this.control.x, this.control.y, this.to.x, this.to.y, this.listener);
        }

        public exec(from: Point): void {
            this.listener.qbezierCurveTo(from, this.control, this.to);
        }

        public toPathString(): string {
            return 'Q ' + this.control.x.toString() + ' ' + this.control.y.toString() + ', '
                + this.to.x.toString() + ' ' + this.to.y.toString();
        }
        public toString(): string {
            return this.toPathString();
        }
    }

    class GPNEllipseTo implements IGPathNode {
        public readonly type: number = 65;
        public listener: IGPathActionListener;
        public to: Point;
        public radius: Size;
        public rotation: number;
        public laflag: number;
        public sflag: number;

        public constructor(rx: number, ry: number, rotation: number, laflag: number, sflag: number, x: number, y: number, actionListener: IGPathActionListener) {
            this.radius = new Size(rx, ry);
            this.rotation = rotation;
            this.laflag = laflag;
            this.sflag = sflag;
            this.to = new Point(x, y);
            this.listener = actionListener;
        }

        public clone(): IGPathNode {
            return new GPNEllipseTo(this.radius.cx, this.radius.cy, this.rotation, this.laflag, this.sflag, this.to.x, this.to.y, this.listener);
        }

        public exec(from: Point): void {
            this.listener.ellipseTo(from, this.radius, this.rotation, this.laflag, this.laflag, this.to);
        }

        public toPathString(): string {
            return 'A ' + this.radius.cx.toString() + ' ' + this.radius.cy.toString() + ' '
                + this.rotation.toString() + ' '
                + this.laflag.toString() + ' '
                + this.sflag.toString() + ' '
                + this.to.x.toString() + ' ' + this.to.y.toString();
        }
        public toString(): string {
            return this.toPathString();
        }
    }

    class GPNCloseGPath implements IGPathNode {
        public readonly type: number = 90;
        public listener: IGPathActionListener;
        public to: Point = new Point();
        public constructor(actionListener: IGPathActionListener) {
            this.listener = actionListener;
        }

        public clone(): IGPathNode {
            return new GPNCloseGPath(this.listener);
        }

        public exec(from: Point): void {
            this.listener.closePath(from);
        }
        public toPathString(): string {
            return 'Z';
        }
        public toString(): string {
            return this.toPathString();
        }
    }

    class GPathParser {
        private listener: IGPathActionListener;
        private mData: string;
        private mOffset: number;
        public constructor(data: string, listener: IGPathActionListener) {
            this.mData = data;
            this.mOffset = 0;
            this.listener = listener;
        }

        public parseNodes(): IGPathNode[] {
            let prevNode: IGPathNode = new GPNCloseGPath(this.listener);
            let results = new Array<IGPathNode>();
            do {
                const ch = this.getChar();
                switch (ch) {
                    case 77: {
                        const x = this.getNumber();
                        const y = this.getNumber();
                        prevNode = new GPNMoveTo(x, y, this.listener);
                        results.push(prevNode);
                        break;
                    }
                    case 109: {
                        const x = this.getNumber() + prevNode.to.x;
                        const y = this.getNumber() + prevNode.to.y;
                        prevNode = new GPNMoveTo(x, y, this.listener);
                        results.push(prevNode);
                        break;
                    }
                    case 76: {
                        const x = this.getNumber();
                        const y = this.getNumber();
                        prevNode = new GPNLineTo(x, y, this.listener);
                        results.push(prevNode);
                        break;
                    }
                    case 108: {
                        const x = this.getNumber() + prevNode.to.x;
                        const y = this.getNumber() + prevNode.to.y;
                        prevNode = new GPNLineTo(x, y, this.listener);
                        results.push(prevNode);
                        break;
                    }
                    case 72: {
                        const x = this.getNumber();
                        prevNode = new GPNLineTo(x, prevNode.to.y, this.listener);
                        results.push(prevNode);
                        break;
                    }
                    case 104: {
                        const x = this.getNumber() + prevNode.to.x;
                        prevNode = new GPNLineTo(x, prevNode.to.y, this.listener);
                        results.push(prevNode);
                        break;
                    }
                    case 86: {
                        const y = this.getNumber();
                        prevNode = new GPNLineTo(prevNode.to.x, y, this.listener);
                        results.push(prevNode);
                        break;
                    }
                    case 118: {
                        const y = this.getNumber() + prevNode.to.y;
                        prevNode = new GPNLineTo(prevNode.to.x, y, this.listener);
                        results.push(prevNode);
                        break;
                    }
                    case 67: {
                        const c1x = this.getNumber();
                        const c1y = this.getNumber();
                        this.skipComma();
                        const c2x = this.getNumber();
                        const c2y = this.getNumber();
                        this.skipComma();
                        const x = this.getNumber();
                        const y = this.getNumber();
                        prevNode = new GPNBezierCurveTo(c1x, c1y, c2x, c2y, x, y, this.listener);
                        results.push(prevNode);
                        break;
                    }
                    case 99: {
                        const c1x = this.getNumber() + prevNode.to.x;
                        const c1y = this.getNumber() + prevNode.to.y;
                        this.skipComma();
                        const c2x = this.getNumber() + prevNode.to.x;
                        const c2y = this.getNumber() + prevNode.to.y;
                        this.skipComma();
                        const x = this.getNumber() + prevNode.to.x;
                        const y = this.getNumber() + prevNode.to.y;
                        prevNode = new GPNBezierCurveTo(c1x, c1y, c2x, c2y, x, y, this.listener);
                        results.push(prevNode);
                        break;
                    }
                    case 83: {
                        let px: number;
                        let py: number;

                        if (prevNode.type === 69) {
                            px = (prevNode as GPNBezierCurveTo).controlEnd.x;
                            py = (prevNode as GPNBezierCurveTo).controlEnd.y;
                        } else {
                            px = prevNode.to.x;
                            py = prevNode.to.y;
                        }
                        const c1x = prevNode.to.x + (prevNode.to.x - px);
                        const c1y = prevNode.to.y + (prevNode.to.y - py);

                        const c2x = this.getNumber();
                        const c2y = this.getNumber();
                        this.skipComma();
                        const x = this.getNumber();
                        const y = this.getNumber();
                        prevNode = new GPNBezierCurveTo(c1x, c1y, c2x, c2y, x, y, this.listener);
                        results.push(prevNode);
                        break;
                    }
                    case 115: {
                        let px: number;
                        let py: number;

                        if (prevNode.type === 69) {
                            px = (prevNode as GPNBezierCurveTo).controlEnd.x;
                            py = (prevNode as GPNBezierCurveTo).controlEnd.y;
                        } else {
                            px = prevNode.to.x;
                            py = prevNode.to.y;
                        }
                        const c1x = prevNode.to.x + (prevNode.to.x - px);
                        const c1y = prevNode.to.y + (prevNode.to.y - py);

                        const c2x = this.getNumber() + prevNode.to.x;
                        const c2y = this.getNumber() + prevNode.to.y;
                        this.skipComma();
                        const x = this.getNumber() + prevNode.to.x;
                        const y = this.getNumber() + prevNode.to.y;
                        prevNode = new GPNBezierCurveTo(c1x, c1y, c2x, c2y, x, y, this.listener);
                        results.push(prevNode);
                        break;
                    }
                    case 81: {
                        const cx = this.getNumber();
                        const cy = this.getNumber();
                        this.skipComma();
                        const x = this.getNumber();
                        const y = this.getNumber();
                        prevNode = new GPNQBezierCurveTo(cx, cy, x, y, this.listener);
                        results.push(prevNode);
                        break;
                    }
                    case 113: {
                        const cx = this.getNumber() + prevNode.to.x;
                        const cy = this.getNumber() + prevNode.to.y;
                        this.skipComma();
                        const x = this.getNumber() + prevNode.to.x;
                        const y = this.getNumber() + prevNode.to.y;
                        prevNode = new GPNQBezierCurveTo(cx, cy, x, y, this.listener);
                        results.push(prevNode);
                        break;
                    }
                    case 84: {
                        let px: number;
                        let py: number;

                        if (prevNode.type === 81) {
                            px = (prevNode as GPNQBezierCurveTo).control.x;
                            py = (prevNode as GPNQBezierCurveTo).control.y;
                        } else {
                            px = prevNode.to.x;
                            py = prevNode.to.y;
                        }
                        const cx = prevNode.to.x + (prevNode.to.x - px);
                        const cy = prevNode.to.y + (prevNode.to.y - py);

                        const x = this.getNumber();
                        const y = this.getNumber();
                        prevNode = new GPNQBezierCurveTo(cx, cy, x, y, this.listener);
                        results.push(prevNode);
                        break;
                    }
                    case 116: {
                        let px: number;
                        let py: number;

                        if (prevNode.type === 81) {
                            px = (prevNode as GPNQBezierCurveTo).control.x;
                            py = (prevNode as GPNQBezierCurveTo).control.y;
                        } else {
                            px = prevNode.to.x;
                            py = prevNode.to.y;
                        }
                        const cx = prevNode.to.x + (prevNode.to.x - px);
                        const cy = prevNode.to.y + (prevNode.to.y - py);

                        const x = this.getNumber() + prevNode.to.x;
                        const y = this.getNumber() + prevNode.to.y;
                        prevNode = new GPNQBezierCurveTo(cx, cy, x, y, this.listener);
                        results.push(prevNode);
                        break;
                    }
                    case 65: {
                        const rx = this.getNumber();
                        const ry = this.getNumber();
                        const rotation = this.getNumber();
                        const lflag = this.getNumber();
                        const sflag = this.getNumber();
                        const x = this.getNumber();
                        const y = this.getNumber();
                        prevNode = new GPNEllipseTo(rx, ry, rotation, lflag, sflag, x, y, this.listener);
                        results.push(prevNode);
                        break;
                    }
                    case 97: {
                        const rx = this.getNumber();
                        const ry = this.getNumber();
                        const rotation = this.getNumber();
                        const lflag = this.getNumber();
                        const sflag = this.getNumber();
                        const x = this.getNumber() + prevNode.to.x;
                        const y = this.getNumber() + prevNode.to.y;
                        prevNode = new GPNEllipseTo(rx, ry, rotation, lflag, sflag, x, y, this.listener);
                        results.push(prevNode);
                        break;
                    }
                    case 90:
                    case 122:
                        prevNode = new GPNCloseGPath(this.listener);
                        results.push(prevNode);
                        break;
                }
            } while (!this.eof);
            return results;
        }

        private get eof(): boolean {
            return this.mOffset > this.mData.length;
        }
        private getChar(): number {
            return this.mData.charCodeAt(this.mOffset++);
        }
        private ungetChar(): void {
            --this.mOffset;
        }
        private getNumber(): number {
            let ch = this.getChar();
            while (ch !== 43 && ch !== 45 && ch !== 46 && (!(ch >= 48 && ch <= 57)) && (!this.eof)) {
                ch = this.getChar();
            }

            let r = String.fromCharCode(ch);
            ch = this.getChar();
            while (ch === 46 || (ch >= 48 && ch <= 57) && (!this.eof)) {
                r += String.fromCharCode(ch);
                ch = this.getChar();
            }
            let n = parseFloat(r);
            this.ungetChar();
            return n;
        }

        private skipComma(): void {
            let ch = this.getChar();
            while (ch !== 44 && (!this.eof)) {
                ch = this.getChar();
            }
        }
    }

    class _defaultGPathActionListener implements IGPathActionListener {
        public moveTo(): void {
        }
        public lineTo(): void {
        }
        public bezierCurveTo(): void {
        }
        public qbezierCurveTo(): void {
        }
        public ellipseTo(): void {
        }
        public closePath(): void {
        }
    }

    class _fitGPathActionListener implements IGPathActionListener {
        private precision: number;
        public vertexs: Point[] = new Array<Point>();
        public constructor(d: number) {
            this.precision = d;
        }

        public moveTo(_from: Point, to: Point): void {
            this.vertexs.push(to);
        }
        public lineTo(_from: Point, to: Point): void {
            this.vertexs.push(to);
        }
        public bezierCurveTo(from: Point, cs: Point, ce: Point, to: Point): void {
            let b = new BezierCurve(cs, ce, from, to);
            this.vertexs.push(...b.fit(this.precision));
        }
        public qbezierCurveTo(from: Point, c: Point, to: Point): void {
            let b = new QBezierCurve(c, from, to);
            this.vertexs.push(...b.fit(this.precision));
        }
        public ellipseTo(_from: Point, _r: Size, _rotation: number, _laflag: number, _sflag: number, _to: Point): void {
            // let e = new EllipseArc(r, rotation, from, to)
            // this.vertexs.push(...e.fit(this.precision));
        }
        public closePath(_from: Point): void {
            if (this.vertexs.length > 0) {
                this.vertexs.push(this.vertexs[0]);
            }
        }
    }

    const _defaultListener = new _defaultGPathActionListener();

    export class GPath implements IClone<GPath> {
        private mNodes: IGPathNode[];
        private mActionListener: IGPathActionListener;
        public constructor(data: string, listener?: IGPathActionListener) {
            this.mActionListener = listener ? listener : _defaultListener;
            let parser = new GPathParser(data, this.mActionListener);
            this.mNodes = parser.parseNodes();
        }

        public MoveTo(x: number, y: number) {
            this.mNodes.push(new GPNMoveTo(x, y, this.mActionListener));
        }
        public LineTo(x: number, y: number) {
            this.mNodes.push(new GPNLineTo(x, y, this.mActionListener));
        }
        public BezierCurveTo(csx: number, csy: number, cex: number, cey: number, x: number, y: number) {
            this.mNodes.push(new GPNBezierCurveTo(csx, csy, cex, cey, x, y, this.mActionListener));
        }
        public QBezierCurveTo(cx: number, cy: number, x: number, y: number) {
            this.mNodes.push(new GPNQBezierCurveTo(cx, cy, x, y, this.mActionListener));
        }
        public EllipseTo(rx: number, ry: number, rotation: number, laflag: number, sflag: number, x: number, y: number) {
            this.mNodes.push(new GPNEllipseTo(rx, ry, rotation, laflag, sflag, x, y, this.mActionListener));
        }
        public ClosePath() {
            this.mNodes.push(new GPNCloseGPath(this.mActionListener));
        }

        public Execute(): void {
            if (this.mNodes.length === 0) {
                return;
            }

            let last = this.mNodes[0].to;
            for (let v of this.mNodes) {
                v.exec(last);
                last = v.to;
            }
        }

        public Fit(d: number): Point[] {
            let l = new _fitGPathActionListener(d);
            let temp = this.clone(l);
            temp.Execute();
            return l.vertexs;
        }

        public clone(listener?: IGPathActionListener): GPath {
            let l = listener ? listener : this.mActionListener;
            let p = new GPath('', l);
            if (l === this.mActionListener) {
                for (let n of this.mNodes) {
                    p.mNodes.push(n.clone());
                }
            } else {
                for (let n of this.mNodes) {
                    let t = n.clone();
                    t.listener = l;
                    p.mNodes.push(t);
                }
            }
            return p;
        }

        public toPathString(): string {
            let r = [];
            for (const n of this.mNodes) {
                r.push(n.toPathString());
            }
            return r.join(' ');
        }
        public toString(): string {
            return this.toPathString();
        }
    }
}
