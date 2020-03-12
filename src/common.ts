namespace ftk {
    export interface Point {
        x: number;
        y: number;
    }

    export interface Rectangle {
        x: number;
        y: number;
        w: number;
        h: number;
    }

    export interface ReadOnlyArray<T> {
        readonly length: number;
        [index: number]: T;
    }
}