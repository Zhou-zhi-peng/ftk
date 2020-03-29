namespace ftk {
    export class Color {
        private m_r: number = 0;
        private m_g: number = 0;
        private m_b: number = 0;
        private m_a: number = 1.0;

        public constructor(color: Color | string | number);
        public constructor(r: number, g: number, b: number);
        public constructor(r: number, g: number, b: number, a?: number);
        public constructor(arg1: string | number | Color, arg2?: number, arg3?: number, arg4?: number) {
            if (typeof (arg1) === "string") {
                this.parseString(arg1);
            }
            else if ((typeof (arg1) === "number") && (typeof (arg2) === "number") && (typeof (arg3) === "number")) {
                this.m_r = arg1 & 0xFF;
                this.m_g = arg2 & 0xFF;
                this.m_b = arg3 & 0xFF;
                if (typeof (arg4) === "number") {
                    this.m_a = Color.ClampedAlphaValue(arg4);
                }
            } else if (typeof (arg1) === "object") {
                let color = arg1 as Color;
                this.m_r = color.R;
                this.m_g = color.G;
                this.m_b = color.B;
                this.m_a = color.A;
            } else if (typeof (arg1) === "number") {
                this.m_b = arg1 & 0x000000FF;
                this.m_g = (arg1 & 0x0000FF00) >>> 8;
                this.m_r = (arg1 & 0x00FF0000) >>> 16;
                this.m_a = ((arg1 & 0xFF000000) >>> 24) / 255.0;
            }
        }

        public Clone(): Color {
            return new Color(this.R, this.G, this.B, this.A);
        }

        public addLightness(value: number): void {
            this.R = this.m_r + value;
            this.G = this.m_g + value;
            this.B = this.m_b + value;
        }

        public blend(value: Color, alpha: number): void {
            alpha = Color.ClampedColorValue(alpha);
            this.R = (this.m_r * (1 - alpha)) + (value.R * alpha);
            this.G = (this.m_g * (1 - alpha)) + (value.G * alpha);
            this.B = (this.m_b * (1 - alpha)) + (value.B * alpha);
            this.A = (this.m_a * (1 - alpha)) + (value.A * alpha);
        }

        public grayscale(): void {
            let x = Color.ClampedColorValue((this.m_r + this.m_g + this.m_b) / 3);
            this.m_r = x;
            this.m_g = x;
            this.m_b = x;
        }

        public inverse(): void {
            this.m_r = 0xFF - this.m_r;
            this.m_g = 0xFF - this.m_g;
            this.m_b = 0xFF - this.m_b;
        }

        public get R(): number {
            return this.m_r;
        }
        public set R(value: number) {
            this.m_r = Color.ClampedColorValue(value);
        }

        public get G(): number {
            return this.m_g;
        }
        public set G(value: number) {
            this.m_g = Color.ClampedColorValue(value);
        }

        public get B(): number {
            return this.m_b;
        }
        public set B(value: number) {
            this.m_b = Color.ClampedColorValue(value);
        }

        public get A() {
            return this.m_a;
        }
        public set A(value: number) {
            this.m_a = Color.ClampedAlphaValue(value);
        }

        public get Luminance() {
            return (this.m_r * 0.2126) + (this.m_g * 0.7152) + (this.m_b * 0.0722);
        }

        public get RGBValue(): number {
            return (this.m_r << 16) | (this.m_g << 8) | (this.m_b);
        }

        public get RGBAValue(): number {
            return (this.m_r << 24) | (this.m_g << 16) | (this.m_b << 8) | (Math.round(this.m_a * 255));
        }

        public toRGBString(): string {
            return "rgb(" + this.m_r.toString() + "," + this.m_g.toString() + "," + this.m_b.toString() + ")";
        }
        public toRGBAString(): string {
            return "rgba(" + this.m_r.toString() + "," + this.m_g.toString() + "," + this.m_b.toString() + "," + this.m_a.toString() + ")";
        }

        public toHEXString(alpha?: boolean): string {
            let rs = "#";
            rs += this.pad((this.m_r & 0xFF).toString(16).toUpperCase(), 2);
            rs += this.pad((this.m_g & 0xFF).toString(16).toUpperCase(), 2);
            rs += this.pad((this.m_b & 0xFF).toString(16).toUpperCase(), 2);
            if (alpha) {
                rs += this.pad((Math.round(this.m_a * 255) & 0xFF).toString(16).toUpperCase(), 2);
            }
            return rs;
        }

        public toString(): string {
            return this.toRGBAString();
        }

        public toNumber(): number {
            return (this.m_r << 16)
                | (this.m_g << 8)
                | this.m_b
                | (((this.m_a * 255) & 0xFF) << 24);
        }

        public static ClampedColorValue(value: number): number {
            if (value > 0xFF) {
                return 0xFF;
            }
            else if (value < 0) {
                return 0;
            }
            return Math.round(value);
        }

        public static ClampedAlphaValue(value: number): number {
            return Math.min(Math.max(value, 0.0), 1.0);
        }

        public static blend(x: Color, y: Color, alpha: number): Color {
            alpha = Color.ClampedColorValue(alpha);
            let r = (x.m_r * (1 - alpha)) + (y.m_r * alpha);
            let g = (x.m_g * (1 - alpha)) + (y.m_g * alpha);
            let b = (x.m_b * (1 - alpha)) + (y.m_b * alpha);
            let a = (x.m_a * (1 - alpha)) + (y.m_a * alpha);
            return new Color(r, g, b, a);
        }


        private pad(val: string, len: number): string {
            let padded = [];
            for (let i = 0, j = Math.max(len - val.length, 0); i < j; i++) {
                padded.push('0');
            }
            padded.push(val);
            return padded.join('');
        }

        private parseString(value: string): void {
            let color = value.toUpperCase();
            if (color.startsWith("#")) {
                if (color.length == 4) {
                    this.m_r = (parseInt(color.substr(1, 1), 16) & 0xFF) << 4;
                    this.m_g = (parseInt(color.substr(2, 1), 16) & 0xFF) << 4;
                    this.m_b = (parseInt(color.substr(3, 1), 16) & 0xFF) << 4;
                } else if (color.length >= 7) {
                    this.m_r = parseInt(color.substr(1, 2), 16) & 0xFF;
                    this.m_g = parseInt(color.substr(3, 2), 16) & 0xFF;
                    this.m_b = parseInt(color.substr(5, 2), 16) & 0xFF;
                    if (color.length == 9) {
                        this.m_a = Color.ClampedAlphaValue((parseInt(color.substr(7, 2), 16) & 0xFF) / 255.0);
                    }
                }
            } else if (color.startsWith("RGB")) {
                let start = color.indexOf("(", 3) + 1;
                let end = color.indexOf(")", start);
                color = color.substr(start, end - start);
                let colors = color.split(',');
                if (colors.length >= 3) {
                    this.m_r = parseInt(colors[0].trim(), 10) & 0xFF;
                    this.m_g = parseInt(colors[1].trim(), 10) & 0xFF;
                    this.m_b = parseInt(colors[2].trim(), 10) & 0xFF;
                    if (colors.length >= 4) {
                        this.m_a = Color.ClampedAlphaValue(parseFloat(colors[3].trim()));
                    }
                }
            }
        }
    }
}
