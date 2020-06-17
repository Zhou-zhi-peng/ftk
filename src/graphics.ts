namespace ftk {
    type PathDrawFunction = (rc: CanvasRenderingContext2D) => void;
    const kStrokeBegin = 1;
    const kFillBegin = 2;
    const kPathBegin = 4;
    const kNoneBegin = 0;

    class _drawGPathActionListener implements IGPathActionListener {
        private graphics: GraphicsSprite;
        public constructor(graphics: GraphicsSprite) {
            this.graphics = graphics;
        }

        public moveTo(_from: Point, to: Point): void {
            this.graphics.moveTo(to.x, to.y);
        }
        public lineTo(_from: Point, to: Point): void {
            this.graphics.lineTo(to.x, to.y);
        }
        public bezierCurveTo(_from: Point, cs: Point, ce: Point, to: Point): void {
            this.graphics.cubicCurveTo(cs.x, cs.y, ce.x, ce.y, to.x, to.y);
        }
        public qbezierCurveTo(_from: Point, c: Point, to: Point): void {
            this.graphics.curveTo(c.x, c.y, to.x, to.y);
        }
        public ellipseTo(from: Point, r: Size, rotation: number, _laflag: number, _sflag: number, to: Point): void {
            if (r.cx == r.cy) {
                this.graphics.arcTo(from.x, from.y, to.x, to.y, r.cx);
            } else {
                this.graphics.ellipse(to.x, to.y, r.cx, r.cy, rotation);
            }
        }
        public closePath(_from: Point): void {
        }
    }

    export class GraphicsSprite extends RectangleSprite {
        private mDrawList: PathDrawFunction[] = new Array<PathDrawFunction>();
        private mBeginState: number = kNoneBegin;
        public beginStroke(width: number, color: Color): void {
            if ((this.mBeginState & kStrokeBegin) === kStrokeBegin) {
                this.endStroke();
            }

            let beginPath = this.mBeginState === kNoneBegin;
            this.mBeginState |= kStrokeBegin;
            let c = color.toRGBAString();

            this.mDrawList.push((rc) => {
                rc.lineWidth = width;
                rc.strokeStyle = c;
            });
            if (beginPath) {
                this.mDrawList.push((rc) => {
                    rc.beginPath();
                });
            }
        }

        public beginFill(color: Color): void {
            if ((this.mBeginState & kFillBegin) === kFillBegin) {
                this.endFill();
            }
            let beginPath = this.mBeginState === kNoneBegin;
            this.mBeginState |= kFillBegin;
            let c = color.toRGBAString();
            this.mDrawList.push((rc) => {
                rc.fillStyle = c;
            });
            if (beginPath) {
                this.mDrawList.push((rc) => {
                    rc.beginPath();
                });
            }
        }

        public beginLinearGradientFill(color: IReadonlyArray<Color>, startX: number, startY: number, endX: number, endY: number): void {
            let start = new Point(startX, startY);
            let end = new Point(endX, endY);
            let d = Point.distance(start, end);
            let s = (d / color.length) / d;
            let colorList: string[] = new Array<string>();
            if ((this.mBeginState & kFillBegin) === kFillBegin) {
                this.endFill();
            }
            for (const c of color) {
                colorList.push(c.toRGBAString());
            }
            let beginPath = this.mBeginState === kNoneBegin;
            this.mBeginState |= kFillBegin;
            this.mDrawList.push((rc) => {
                let gradient = rc.createLinearGradient(start.x, start.y, end.x, end.y);
                let offset = 0;
                for (let c of colorList) {
                    gradient.addColorStop(offset, c);
                    offset += s;
                }
                rc.fillStyle = gradient;
            });
            if (beginPath) {
                this.mDrawList.push((rc) => {
                    rc.beginPath();
                });
            }
        }

        public beginRadialGradientFill(color: IReadonlyArray<Color>, startX: number, startY: number, startR: number, endX: number, endY: number, endR: number): void {
            let start = new Point(startX, startY);
            let end = new Point(endX, endY);
            let d = Point.distance(start, end);
            let s = (d / color.length) / d;
            let colorList: string[] = new Array<string>();
            if ((this.mBeginState & kFillBegin) === kFillBegin) {
                this.endFill();
            }
            for (const c of color) {
                colorList.push(c.toRGBAString());
            }
            let beginPath = this.mBeginState === kNoneBegin;
            this.mBeginState |= kFillBegin;
            this.mDrawList.push((rc) => {
                let gradient = rc.createRadialGradient(start.x, start.y, startR, end.x, end.y, endR);
                let offset = 0;
                for (let c of colorList) {
                    gradient.addColorStop(offset, c);
                    offset += s;
                }
                rc.fillStyle = gradient;
            });
            if (beginPath) {
                this.mDrawList.push((rc) => {
                    rc.beginPath();
                });
            }
        }

        public beginClipPath(): void {
            if ((this.mBeginState & kFillBegin) === kFillBegin) {
                this.endClipPath();
            }
            let beginPath = this.mBeginState === kNoneBegin;
            this.mBeginState |= kPathBegin;
            if (beginPath) {
                this.mDrawList.push((rc) => {
                    rc.beginPath();
                });
            }
        }

        public clear(): void {
            this.mBeginState = kNoneBegin;
            this.mDrawList.length = 0;
        }
        public cubicCurveTo(c1x: number, c1y: number, c2x: number, c2y: number, x: number, y: number): void {
            if (this.mBeginState === kNoneBegin) {
                return;
            }
            this.mDrawList.push((rc) => {
                rc.bezierCurveTo(c1x, c1y, c2x, c2y, x, y);
            });
        }

        public curveTo(cx: number, cy: number, x: number, y: number): void {
            if (this.mBeginState === kNoneBegin) {
                return;
            }

            this.mDrawList.push((rc) => {
                rc.quadraticCurveTo(cx, cy, x, y);
            });
        }

        public arc(centerX: number, centerY: number, radius: number, startAngle: number, endAngle: number, anticlockwise: boolean): void {
            if (this.mBeginState === kNoneBegin) {
                return;
            }
            this.mDrawList.push((rc) => {
                rc.arc(centerX, centerY, radius, startAngle, endAngle, anticlockwise);
            });
        }

        public arcTo(startX: number, startY: number, endX: number, endY: number, radius: number): void {
            if (this.mBeginState === kNoneBegin) {
                return;
            }
            this.mDrawList.push((rc) => {
                rc.arcTo(startX, startY, endX, endY, radius);
            });
        }

        public circle(centerX: number, centerY: number, radius: number): void {
            if (this.mBeginState === kNoneBegin) {
                return;
            }
            this.mDrawList.push((rc) => {
                rc.arc(centerX, centerY, radius, 0, PI_2_0X);
            });
        }

        public ellipse(x: number, y: number, rx: number, ry: number, rotation: number, startAngle?: number, endAngle?: number): void {
            if (this.mBeginState === kNoneBegin) {
                return;
            }

            let sa = startAngle ? startAngle : 0;
            let ea = endAngle ? endAngle : PI_2_0X;
            this.mDrawList.push((rc) => {
                rc.ellipse(x, y, rx, ry, rotation, sa, ea);
            });
        }

        public rect(x: number, y: number, w: number, h: number): void {
            if (this.mBeginState === kNoneBegin) {
                return;
            }
            this.mDrawList.push((rc) => {
                rc.rect(x, y, w, h);
            });
        }

        public roundRect(x: number, y: number, w: number, h: number, radius: number): void {
            if (this.mBeginState === kNoneBegin) {
                return;
            }

            this.mDrawList.push((rc) => {
                rc.arc(x + radius, y + radius, radius, Math.PI, PI_1_5X);
                rc.lineTo(w - radius + x, y);
                rc.arc(w - radius + x, radius + y, radius, PI_1_5X, PI_2_0X);
                rc.lineTo(w + x, h + y - radius);
                rc.arc(w - radius + x, h - radius + y, radius, 0, PI_HALF);
                rc.lineTo(radius + x, h + y);
                rc.arc(radius + x, h - radius + y, radius, PI_HALF, Math.PI);
            });
        }

        public gpath(path: string): void;
        public gpath(path: GPath): void;
        public gpath(path: any): void {
            let gp: GPath;
            let l = new _drawGPathActionListener(this);
            if (typeof (path) === 'string') {
                gp = new GPath(path, l);
            } else {
                gp = path.clone(l);
            }
            gp.Execute();
        }

        public endFill(): void {
            if ((this.mBeginState & kFillBegin) !== kFillBegin) {
                return;
            }

            this.mBeginState &= (~kFillBegin);
            this.mDrawList.push((rc) => {
                rc.closePath();
                rc.fill();
            });
        }

        public endStroke(close?: boolean): void {
            if ((this.mBeginState & kStrokeBegin) !== kStrokeBegin) {
                return;
            }
            this.mBeginState &= (~kStrokeBegin);
            this.mDrawList.push((rc) => {
                if (close) {
                    rc.closePath();
                }
                rc.stroke();
            });
        }

        public endClipPath(): void {
            if ((this.mBeginState & kPathBegin) !== kPathBegin) {
                return;
            }

            this.mBeginState &= (~kPathBegin);
            this.mDrawList.push((rc) => {
                rc.closePath();
                rc.clip();
            });
        }

        public lineTo(x: number, y: number): void {
            if (this.mBeginState === kNoneBegin) {
                return;
            }
            this.mDrawList.push((rc) => {
                rc.lineTo(x, y);
            });
        }

        public moveTo(x: number, y: number): void {
            if (this.mBeginState === kNoneBegin) {
                return;
            }
            this.mDrawList.push((rc) => {
                rc.moveTo(x, y);
            });
        }

        public polygon(vertexs: IReadonlyArray<Point>): void {
            if (this.mBeginState === kNoneBegin) {
                return;
            }

            if (vertexs.length > 2) {
                let first = vertexs[0].clone();
                let vs = new Array<Point>();
                for (let i = 1; i < vertexs.length; ++i) {
                    vs.push(vertexs[i].clone());
                }
                this.mDrawList.push((rc) => {
                    rc.moveTo(first.x, first.y);
                    for (const v of vs) {
                        rc.lineTo(v.x, v.y);
                    }
                    rc.closePath();
                });
            }
        }


        public epolygon(x: number, y: number, radius: number, side: number): void {
            if (this.mBeginState === kNoneBegin) {
                return;
            }

            if (side > 2) {
                const astep = (Math.PI + Math.PI) / side;
                let angle = 0;
                let vs: Point[] = new Array<Point>();
                for (let i = 0; i < side; ++i) {
                    vs.push(new Point(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius));
                    angle += astep;
                }

                let first = vs[0];
                this.mDrawList.push((rc) => {
                    rc.moveTo(first.x, first.y);
                    for (let i = 1; i < vs.length; ++i) {
                        let v = vs[i];
                        rc.lineTo(v.x, v.y);
                    }
                    rc.closePath();
                });
            }
        }

        public star(x: number, y: number, radius1: number, radius2: number, count: number, rotation?: number): void {
            if (this.mBeginState === kNoneBegin) {
                return;
            }

            if (count > 2) {
                const astep = (Math.PI + Math.PI) / count;
                let rot = rotation || 0;
                let angle1 = rot;
                let angle2 = astep / 2 + rot;
                let vs: Point[] = new Array<Point>();
                for (let i = 0; i < count; ++i) {
                    vs.push(new Point(x + Math.cos(angle1) * radius1, y + Math.sin(angle1) * radius1));
                    vs.push(new Point(x + Math.cos(angle2) * radius2, y + Math.sin(angle2) * radius2));
                    angle1 += astep;
                    angle2 += astep;
                }
                vs.push(new Point(x + Math.cos(angle1) * radius1, y + Math.sin(angle1) * radius1));

                let first = vs[0];
                this.mDrawList.push((rc) => {
                    rc.moveTo(first.x, first.y);
                    for (let i = 1; i < vs.length; ++i) {
                        let v = vs[i];
                        rc.lineTo(v.x, v.y);
                    }
                    rc.closePath();
                });
            }
        }


        public clearRect(x: number, y: number, w: number, h: number): void {
            this.mDrawList.push((rc) => {
                rc.clearRect(x, y, w, h);
            });
        }

        public fillBackground(color: Color): void {
            let c = color.toRGBAString();
            this.mDrawList.push((rc) => {
                let r = this.getRectangle();
                let f = rc.fillStyle;
                rc.fillStyle = c;
                rc.fillRect(0, 0, r.w, r.h);
                rc.fillStyle = f;
            });
        }

        public drawTexture(t: ITexture, dx: number, dy: number, dw: number, dh: number): void {
            this.mDrawList.push((rc) => {
                t.Draw(rc, dx, dy, dw, dh);
            });
        }

        public beginText(fontName: string, fontSize: number): void {
            this.mDrawList.push((rc) => {
                rc.save();
                rc.font = fontSize.toString() + "px " + fontName;
            });
        }
        public text(s: string, dx: number, dy: number, dw: number, color?: Color): void {
            let c = color ? color.toRGBAString() : undefined;
            this.mDrawList.push((rc) => {
                let f = rc.fillStyle;
                if (c) {
                    rc.fillStyle = c;
                }
                rc.fillText(s, dx, dy, dw);
                rc.fillStyle = f;
            });
        }
        public endText(): void {
            this.mDrawList.push((rc) => {
                rc.restore();
            });
        }

        protected OnRander(rc: CanvasRenderingContext2D): void {
            let rect = this.getRectangle();
            rc.save();
            rc.beginPath();
            rc.rect(rect.x, rect.y, rect.w, rect.h);
            rc.clip();
            rc.translate(rect.x, rect.y);
            for (const a of this.mDrawList) {
                a(rc);
            }

            if ((this.mBeginState & kFillBegin) === kFillBegin) {
                rc.fill();
            }

            if ((this.mBeginState & kStrokeBegin) === kStrokeBegin) {
                rc.stroke();
            }
            rc.restore();
        }
    }
}
