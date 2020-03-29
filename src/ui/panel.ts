namespace ftk.ui {
    export class Panel extends RectangleShape {
        protected OnRander(rc: CanvasRenderingContext2D): void {
            rc.shadowBlur = 3;
            rc.shadowColor = this.BorderColor.toRGBAString();
            rc.shadowOffsetX = 2;
            rc.shadowOffsetY = 2;
            super.OnRander(rc);
        }
    }
}
