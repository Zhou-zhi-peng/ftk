declare namespace ftk {
    interface IAnimation {
        readonly Playing: boolean;
        Loop: boolean;
        Start(): void;
        Restart(): void;
        Stop(): void;
        Update(timestamp: number, target: Sprite): void;
        ValidateTarget(target: Sprite): boolean;
    }
    abstract class Animation<T> implements IAnimation {
        Loop: boolean;
        Duration: number;
        protected StartValue: T;
        protected EndValue: T;
        constructor(start: T, end: T, duration: number, loop?: boolean, autostart?: boolean);
        readonly Playing: boolean;
        Start(): void;
        Restart(): void;
        Stop(): void;
        Update(timestamp: number, target: Sprite): void;
        ValidateTarget(target: Sprite): boolean;
        protected abstract CalcDistance(start: T, end: T): T;
        protected abstract CalcProgress(start: T, distanceTotal: T, timeProgress: number, timeTotal: number): T;
        protected abstract UpdateTarget(target: Sprite, value: T): void;
    }
    abstract class NumberValueAnimation extends Animation<number> {
        protected CalcDistance(start: number, end: number): number;
        protected CalcProgress(start: number, distanceTotal: number, timeProgress: number, timeTotal: number): number;
    }
    class AngleAnimation extends NumberValueAnimation {
        protected UpdateTarget(target: Sprite, value: number): void;
    }
    class OpacityAnimation extends NumberValueAnimation {
        protected UpdateTarget(target: Sprite, value: number): void;
    }
    class PosXAnimation extends NumberValueAnimation {
        protected UpdateTarget(target: Sprite, value: number): void;
    }
    class PosYAnimation extends NumberValueAnimation {
        protected UpdateTarget(target: Sprite, value: number): void;
    }
    class WidthAnimation extends NumberValueAnimation {
        protected UpdateTarget(target: Sprite, value: number): void;
    }
    class HeightAnimation extends NumberValueAnimation {
        protected UpdateTarget(target: Sprite, value: number): void;
    }
    class PositionAnimation extends Animation<Point> {
        protected CalcDistance(start: Point, end: Point): Point;
        protected CalcProgress(start: Point, distanceTotal: Point, timeProgress: number, timeTotal: number): Point;
        protected UpdateTarget(target: Sprite, value: Point): void;
    }
    class SizeAnimation extends Animation<Size> {
        protected CalcDistance(start: Size, end: Size): Size;
        protected CalcProgress(start: Size, distanceTotal: Size, timeProgress: number, timeTotal: number): Size;
        protected UpdateTarget(target: Sprite, value: Size): void;
    }
    class BoxAnimation extends Animation<Rectangle> {
        protected CalcDistance(start: Rectangle, end: Rectangle): Rectangle;
        protected CalcProgress(start: Rectangle, distanceTotal: Rectangle, timeProgress: number, timeTotal: number): Rectangle;
        protected UpdateTarget(target: Sprite, value: Rectangle): void;
    }
    class KeyframeAnimation implements IAnimation {
        Loop: boolean;
        constructor(loop?: boolean, autostart?: boolean);
        readonly Playing: boolean;
        Start(): void;
        Restart(): void;
        Stop(): void;
        AddFrame(animation: IAnimation): void;
        RemoveFrame(animation: IAnimation): void;
        ClearFrames(): void;
        Update(timestamp: number, target: Sprite): void;
        ValidateTarget(target: Sprite): boolean;
    }

    class SequenceAnimation extends NumberValueAnimation {
        Frames(): IReadonlyArray<ITexture>;
        Interval: number;
        constructor(interval: number, textures?: IReadonlyArray<ITexture>, loop?: boolean, autostart?: boolean);
        public AddFrame(texture: ITexture): void;
        public RemoveAt(index: number): void;
        public ClearFrames(): void;
        public ValidateTarget(target: Sprite): boolean;
        protected UpdateTarget(target: ImageSprite, value: number): void;
    }
}
declare namespace ftk {
    class Color {
        constructor(value: number);
        constructor(r: number, g: number, b: number);
        constructor(r: number, g: number, b: number, a: number);
        constructor(color: Color);
        constructor(color: string);
        Clone(): Color;
        static ClampedColorValue(value: number): number;
        static ClampedAlphaValue(value: number): number;
        addLightness(value: number): void;
        static blend(x: Color, y: Color, alpha: number): Color;
        blend(value: Color, alpha: number): void;
        grayscale(): void;
        inverse(): void;
        R: number;
        G: number;
        B: number;
        A: number;
        readonly Luminance: number;
        readonly RGBValue: number;
        readonly RGBAValue: number;
        setRgba(r: number, g: number, b: number, a?: number): void;
        toRGBString(): string;
        toRGBAString(): string;
        toHEXString(alpha?: boolean): string;
        toString(): string;
        toNumber(): number;
    }
}
declare namespace ftk {
    interface IReadonlyArray<T> extends Iterable<T> {
        readonly length: number;
        [index: number]: T;
    }
    interface IClone<T> {
        clone(): T;
    }
    function NewInstance<T>(typename: string, ...args: any[]): T | undefined;
    interface IEventEmitter {
        addListener(evt: string, listener: Function): void;
        on(evt: string, listener: Function): void;
        once(evt: string, listener: Function): void;
        off(evt: string, listener: Function): void;
        removeListener(evt: string, listener: Function): void;
        resetListeners(): void;
        emit(evt: string, ...args: any[]): void;
        asyncEmit(evt: string, ...args: any[]): void;
    }
    class EventHandlerChain {
        constructor();
        readonly length: number;
        add(handler: Function): void;
        remove(handler: Function): void;
        reset(): void;
        call(ctx: any, ...args: any): void;
    }
    class EventEmitter implements IEventEmitter {
        addListener(evt: string, listener: Function): void;
        on(evt: string, listener: Function): void;
        once(evt: string, listener: Function): void;
        off(evt: string, listener?: Function): void;
        removeListener(evt: string, listener?: Function): void;
        resetListeners(): void;
        emit(evt: string, ...args: any[]): void;
        asyncEmit(evt: string, ...args: any[]): void;
        protected emitEx(isasync: boolean, thisArg: any, evt: string, ...args: any[]): void;
    }
}
declare namespace ftk {
    interface IObjectNode {
        readonly Id: string;
        DispatchTouchEvent(ev: GTouchEvent, forced: boolean): void;
        DispatchMouseEvent(ev: GMouseEvent, forced: boolean): void;
        DispatchKeyboardEvent(ev: GKeyboardEvent, forced: boolean): void;
        DispatchNoticeEvent(ev: NoticeEvent, forced: boolean): void;
        Rander(rc: CanvasRenderingContext2D | null): void;
        Update(timestamp: number): void;
    }
    abstract class GEvent {
        readonly Source: any;
        Target: IObjectNode | null;
        StopPropagation: boolean;
        constructor(source: any);
    }
    class EngineEvent extends GEvent {
        Args: any;
        constructor(source: any, args: any);
    }
    class NoticeEvent extends GEvent {
        readonly Args: any;
        readonly Broadcast: boolean;
        readonly Name: string;
        Result: any;
        constructor(source: any, name: string, broadcast: boolean, args: any);
    }
    enum InputEventType {
        TouchStart = 0,
        TouchEnd = 1,
        MouseEnter = 2,
        MouseLeave = 3,
        MouseDown = 4,
        MouseUp = 5,
        MouseMove = 6,
        KeyDown = 7,
        KeyUp = 8
    }
    interface ITouchPoint {
        readonly identifier: number;
        readonly x: number;
        readonly y: number;
        readonly radiusX: number;
        readonly radiusY: number;
        readonly rotationAngle: number;
        readonly force: number;
        readonly Target: IObjectNode | null;
    }
    abstract class GInputEvent extends GEvent {
        readonly InputType: InputEventType;
        readonly AltKey: boolean;
        readonly CtrlKey: boolean;
        readonly ShiftKey: boolean;
        Captured: boolean;
        CaptureContext: any;
        constructor(source: any, eventType: InputEventType, altKey: boolean, ctrlKey: boolean, shiftKey: boolean);
    }
    class GTouchEvent extends GInputEvent {
        readonly Touches: IReadonlyArray<ITouchPoint>;
        readonly ChangedTouches: IReadonlyArray<ITouchPoint>;
        constructor(source: any, eventType: InputEventType, altKey: boolean, ctrlKey: boolean, shiftKey: boolean, touches: IReadonlyArray<ITouchPoint>, changedTouches: IReadonlyArray<ITouchPoint>);
    }
    class GMouseEvent extends GInputEvent {
        readonly x: number;
        readonly y: number;
        readonly Button: number;
        readonly Wheel: number;
        Cursor: string;
        constructor(source: any, eventType: InputEventType, altKey: boolean, ctrlKey: boolean, shiftKey: boolean, x: number, y: number, button: number, wheel: number);
    }
    class GKeyboardEvent extends GInputEvent {
        readonly KeyCode: number;
        constructor(source: any, eventType: InputEventType, altKey: boolean, ctrlKey: boolean, shiftKey: boolean, keyCode: number);
    }
}
declare namespace ftk.utility {
    function GenerateIDString(n: number): string;
    function UTF8BufferEncodeLength(input: string): number;
    function UTF8BufferEncode(input: string): Uint8Array;
    function UTF8BufferDecode(buffer: ArrayBuffer | Uint8Array): string;
    function HexStringToBuffer(hexString: string): Uint8Array;
    function BufferToHexString(buffer: ArrayBuffer | Uint8Array): string;
    function BufferToBase64(buffer: ArrayBuffer | Uint8Array): string;
    function Base64ToBuffer(base64String: string): Uint8Array;
    function ToURLParameters(data: any, traditional?: boolean): string;
    function PrefixPad(s: string, n: number, pad: string): string;
    function DateFormat(fmt: string, date: Date): string;

    namespace Path {
        // 路径分割符
        const sep: string;

        // 正常化路径 （合并路径中的相对访问符 .. 和 .）
        function normalize(path: string): string;

        // 路径拼接
        function join(...args: string[]): string;

        // 提取URL中的路径部分
        function urlpath(url: string): string;

        // 是否为一个正常的URL
        function isurl(path: string): boolean;

        // 将相对路径转为绝对路径，pwd 为当前目录，默认为 '/'
        function resolve(path: string, pwd?: string): string;

        // 获取从path位置到 to 的位置的相对路径，pwd 为当前目录，默认为 '/'
        function relative(path: string, to: string, pwd?: string): string;

        //获取扩展名
        function extname(path: string): string;

        //获取基础名
        function basename(path: string): string;

        //获取路径中最后一个部分的名称( abc/def/efg 返回efg )
        function lastpart(path: string): string;

        //获取目录名称
        function dirname(path: string): string;

        //改变扩展名
        function chextension(path: string, name: string): string;

        //改变基础名
        function chbasename(path: string, name: string): string;

        //改变最后一个部分的名称
        function chlastpart(path: string, name: string): string;

        //是否为绝对路径
        function isabsolute(path: string): boolean;
    }

    namespace api {
        function createOffscreenCanvas(width: number, height: number): HTMLCanvasElement;
    }
}
declare namespace ftk {
    class Stage implements IObjectNode {
        constructor(width: number, height: number, id?: string);
        readonly Id: string;
        Width: number;
        Height: number;
        AddLayer(layer: Layer): Stage;
        RemoveLayer(id: string): Stage;
        GetLayer(id: string): Layer | undefined;
        forEach(callback: (layer: Layer) => void): void;
        Sort(compareCallback: (a: Layer, b: Layer) => number): void;
        MoveToTop(layer: Layer): void;
        MoveToBottom(layer: Layer): void;
        DispatchTouchEvent(ev: GTouchEvent, forced: boolean): void;
        DispatchMouseEvent(ev: GMouseEvent, forced: boolean): void;
        DispatchKeyboardEvent(ev: GKeyboardEvent, forced: boolean): void;
        DispatchNoticeEvent(ev: NoticeEvent, forced: boolean): void;
        Update(timestamp: number): void;
        Rander(rc: CanvasRenderingContext2D): void;
    }
}
declare namespace ftk {
    abstract class Sprite implements IObjectNode {
        constructor(id?: string);
        readonly Id: string;
        Position: Point;
        X: number;
        Y: number;
        Box: Rectangle;
        Size: Size;
        Width: number;
        Height: number;
        protected OnResized(): void;
        Resize(w: number, h: number): void;
        Angle: number;
        Opacity: number;
        BasePoint: Point;
        Visible: boolean;
        readonly Animations: IReadonlyArray<IAnimation>;
        AddAnimation(animation: IAnimation): void;
        RemoveAnimation(animation: IAnimation): boolean;
        ClearAnimations(): void;
        SetBasePointToCenter(): void;
        PickTest(point: Point): boolean;
        Rander(rc: CanvasRenderingContext2D | null): void;
        toTexture(): ITexture;
        protected abstract getRectangle(): Rectangle;
        protected abstract setRectangle(value: Rectangle): void;
        protected abstract OnRander(rc: CanvasRenderingContext2D): void;
        protected OnUpdate(_timestamp: number): void;
        protected OnDispatchTouchEvent(_ev: GTouchEvent, _forced: boolean): void;
        protected OnDispatchMouseEvent(_ev: GMouseEvent, _forced: boolean): void;
        protected OnDispatchKeyboardEvent(_ev: GKeyboardEvent, _forced: boolean): void;
        protected OnDispatchNoticeEvent(_ev: NoticeEvent, _forced: boolean): void;
        protected GetMouseEventPoint(ev: {
            x: number;
            y: number;
        }): Point;
        DispatchTouchEvent(ev: GTouchEvent, forced: boolean): void;
        DispatchMouseEvent(ev: GMouseEvent, forced: boolean): void;
        DispatchKeyboardEvent(ev: GKeyboardEvent, forced: boolean): void;
        DispatchNoticeEvent(ev: NoticeEvent, forced: boolean): void;
        Update(timestamp: number): void;
    }

    abstract class RectangleSprite extends Sprite {
        constructor(x: number, y: number, w: number, h: number, id?: string);
        protected getRectangle(): Rectangle;
        protected setRectangle(value: Rectangle): void;
    }
}

declare namespace ftk {
    abstract class Shape extends Sprite {
        public LineWidth: number;
        public ForegroundColor: Color;
        public BackgroundColor: Color;
        public BorderColor: Color;
        public Text: string | undefined;

        public constructor(id?: string)
        protected abstract OnDrawShape(rc: CanvasRenderingContext2D): void;
        protected OnRander(rc: CanvasRenderingContext2D): void;
    }

    class LineShape extends Shape {
        constructor(start: Point, end: Point, id?: string);
        public PickTest(point: Point): boolean;

        protected getRectangle(): Rectangle;
        protected setRectangle(value: Rectangle): void;

        protected OnDrawShape(rc: CanvasRenderingContext2D): void;
    }

    class RectangleShape extends Shape {
        constructor(x: number, y: number, w: number, h: number, id?: string);

        protected getRectangle(): Rectangle;
        protected setRectangle(value: Rectangle): void;

        protected OnDrawShape(rc: CanvasRenderingContext2D): void;
    }

    class PolygonShape extends Shape {
        constructor(vertexs?: IReadonlyArray<Point>, id?: string);
        public PickTest(point: Point): boolean;
        protected getRectangle(): Rectangle;
        protected setRectangle(value: Rectangle): void;

        protected OnDrawShape(rc: CanvasRenderingContext2D): void;
    }

    class EPolygonShape extends PolygonShape {
        constructor(x: number, y: number, radius: number, side: number, id?: string);

        protected static getVertexs(x: number, y: number, radius: number, side: number): Point[];
    }

    class CircleShape extends Shape {
        constructor(x: number, y: number, radius: number, id?: string);

        public PickTest(point: Point): boolean;
        protected getRectangle(): Rectangle;
        protected setRectangle(value: Rectangle): void;

        protected OnDrawShape(rc: CanvasRenderingContext2D): void;
    }
}

declare namespace ftk {
    class ParticleSprite extends RectangleSprite {
        constructor();
        readonly Particles: IReadonlyArray<Particle>;
        readonly Emitters: IReadonlyArray<IParticleEmitter>;
        readonly LastUpdateTime: number;
        readonly UpdateTime: number;
        AddParticle(particle: Particle): void;
        ClearParticle(): void;
        AddEmitter(emitter: IParticleEmitter): void;
        RemoveEmitter(emitter: IParticleEmitter): void;
        ClearEmitter(): void;
        DispatchTouchEvent(_ev: GTouchEvent, _forced: boolean): void;
        DispatchMouseEvent(_ev: GMouseEvent, _forced: boolean): void;
        DispatchKeyboardEvent(_ev: GKeyboardEvent, _forced: boolean): void;
        protected OnUpdate(timestamp: number): void;
        protected OnRander(rc: CanvasRenderingContext2D): void;
        protected OnEngineVisibilityStateChanged(visible: boolean, timestamp: number): void;
    }
    abstract class Particle {
        x: number; // 位置
        y: number;
        w: number; // 大小
        h: number;
        vx: number; // 速度
        vy: number;
        maxLife: number; // 预设寿命
        age: number; // 当前寿命
        gravity: number; // 重力
        drag: number; // 阻力(0无穷大，1无阻力)
        elastic: number; // 弹性
        active: boolean;
        readonly PA: ParticleSprite;

        constructor(pa: ParticleSprite, x: number, y: number);
        Update(incremental: number): void;
        abstract Render(rc: CanvasRenderingContext2D): void;
    }

    interface IParticleEmitter {
        Position: Point;
        Update(timestamp: number, ps: ParticleSprite): void;
    }
}

declare namespace ftk.ui {
    abstract class ProgressBar extends RectangleSprite {
        constructor(x: number, y: number, w: number, h: number, id?: string);
        Value: number;
        MaxValue: number;
        MinValue: number;
    }
    class CircularProgressBar extends ProgressBar {
        protected OnRander(rc: CanvasRenderingContext2D): void;
        Color: Color;
    }
    class RectangularProgressBar extends ProgressBar {
        protected OnRander(rc: CanvasRenderingContext2D): void;
        Color: Color;
    }
}
declare namespace ftk {
    interface EngineEventMap {
        "mousedown": GMouseEvent;
        "mouseup": GMouseEvent;
        "mousemove": GMouseEvent;
        "mouseenter": GMouseEvent;
        "mouselevae": GMouseEvent;
        "touchcancel": GTouchEvent;
        "touchend": GTouchEvent;
        "touchmove": GTouchEvent;
        "touchstart": GTouchEvent;
        "keydown": GKeyboardEvent;
        "keyup": GKeyboardEvent;
        "loading": EngineEvent;
        "ready": EngineEvent;
        "shutdown": EngineEvent;
        "update": EngineEvent;
        "rander": EngineEvent;
        "fault": EngineEvent;
        "offline": EngineEvent;
        "online": EngineEvent;
        "visible": EngineEvent;
        "hidden": EngineEvent;
    }

    abstract class AbstractEngine extends EventEmitter {
        constructor(canvas: HTMLCanvasElement);
        readonly FrameRate: number;
        readonly ViewportWidth: number;
        readonly ViewportHeight: number;
        readonly Root: Stage;
        readonly R: IResourceDB;
        readonly LastRanderDuration: number;
        DebugInfoVisible: boolean;
        Run(): void;
        Notify(source: any, name: string, broadcast: boolean, message: any): void;
        OnNotify(name: string, listener: (ev: NoticeEvent) => void): void;
        protected abstract OnRun(): void;
        protected setFrameRate(value: number): void;

        addListener<K extends keyof EngineEventMap>(evt: K, listener: (ev: EngineEventMap[K]) => void): void;
        removeListener<K extends keyof EngineEventMap>(evt: K, listener?: (ev: EngineEventMap[K]) => void): void;
        on<K extends keyof EngineEventMap>(evt: K, listener: (ev: EngineEventMap[K]) => void): void;
        once<K extends keyof EngineEventMap>(evt: K, listener: (ev: EngineEventMap[K]) => void): void;
        off<K extends keyof EngineEventMap>(evt: K, listener: (ev: EngineEventMap[K]) => void): void;
    }
    type LibrarySetupOptions = {
        canvas: HTMLCanvasElement;
        ViewportWidth?: number;
        ViewportHeight?: number;
        VideoQuality?: number;
        FrameRate?: number;
        HideLogo?: boolean;
        HideLoading?: boolean;
    };
    class EngineLogoSprite extends RectangleSprite {
        constructor(x: number, y: number, w: number, h: number, id?: string);
        protected OnRander(rc: CanvasRenderingContext2D): void;
        protected OnUpdate(timestamp: number): void;
    }
    let Engine: AbstractEngine;
    function LibrarySetup(options: LibrarySetupOptions): void;
    function LibraryShutdown(): void;
}
declare namespace ftk {
    const PI_HALF: number;
    const PI_1_5X: number;
    const PI_2_0X: number;
    const RAD: number;
    const DEG: number;

    class Point implements IClone<Point> {
        x: number;
        y: number;
        constructor();
        constructor(x: number, y: number);
        clone(): Point;
        offset(x: number, y: number): void;
        setV(v: Point): void;
        setV(x: number, y: number): void;
        rotate(angle: number, basept: Point): void;
        distance(a: Point): number;
        equal(b: Point): boolean;
        static distance(a: Point, b: Point): number;
        static rotate(pt: Point, angle: number, basept: Point): Point;
        static equal(a: Point, b: Point): boolean;
    }

    class Size implements IClone<Size> {
        cx: number;
        cy: number;
        constructor();
        constructor(cx: number, cy: number);
        clone(): Size;
        equal(b: Size): boolean;
        static equal(a: Size, b: Size): boolean;
    }
    class Rectangle implements IClone<Rectangle> {
        x: number;
        y: number;
        w: number;
        h: number;
        constructor();
        constructor(point: Point, size: Size);
        constructor(x: number, y: number, w: number, h: number);
        clone(): Rectangle;
        left: number;
        right: number;
        top: number;
        bottom: number;
        center: Point;
        leftTop: Point;
        size: Size;
        rightBottom: Point;
        isInside(point: Point): boolean;
        isBoundary(point: Point): boolean;
        isInsideOrBoundary(point: Point): boolean;
        isIntersect(r: Rectangle): boolean;
        offset(x: number, y: number): void;
        expand(value: number): void;
        normalize(): void;
        HitTest(point: Point, tolerance?: number): string;
        union(a: Rectangle): void;
        intersection(r1: Rectangle, r2: Rectangle): void;
        equal(b: Rectangle): boolean;
        static isIntersect(r0: Rectangle, r1: Rectangle): boolean;
        static normalize(a: Rectangle): Rectangle;
        static intersection(r1: Rectangle, r2: Rectangle): Rectangle;
        static union(a: Rectangle, b: Rectangle): Rectangle;
        static equal(a: Rectangle, b: Rectangle): boolean;
    }
    class LineSegment implements IClone<LineSegment> {
        start: Point;
        end: Point;
        readonly angle: number;
        readonly box: Rectangle;
        readonly center: Point;

        constructor();
        constructor(s: Point, e: Point);
        constructor(sx: number, sy: number, ex: number, ey: number);
        clone(): LineSegment;
        isInLine(point: Point): boolean;
        isIntersect(l: LineSegment): boolean;
        angleBetween(a: LineSegment): number;
        equal(b: LineSegment): boolean;
        static isInLineEx(point: Point, lstart: Point, lend: Point): boolean;
        static isInLine(point: Point, line: LineSegment): boolean;
        static isIntersect(l0: LineSegment, l1: LineSegment): boolean;
        static angleBetween(a: LineSegment, b: LineSegment): number;
        static equal(a: LineSegment, b: LineSegment): boolean;
    }
    class Circle implements IClone<Circle> {
        center: Point;
        radius: number;
        readonly box: Rectangle;

        constructor();
        constructor(c: Point, radius: number);
        constructor(x: number, y: number, radius: number);
        clone(): Circle;
        isInside(point: Point): boolean;
        isBoundary(point: Point): boolean;
        isInsideOrBoundary(point: Point): boolean;
        equal(b: Circle): boolean
        isIntersect(a: Circle): boolean;
        static isIntersect(a: Circle, b: Circle): boolean;
        static isIntersect(a: Circle, b: Circle): boolean;
    }
    class Polygon implements IClone<Polygon> {
        closed: boolean;
        box: Rectangle;
        readonly gravity: Point;
        readonly center: Point;
        readonly vertexs: IReadonlyArray<Point>;
        constructor(vertexs?: IReadonlyArray<Point>);
        clone(): Polygon;
        isBoundary(point: Point): boolean;
        isInPolygon(point: Point): boolean;
        appendVertex(...points: Point[]): void;
        popVertex(): Point | undefined;
        insertVertex(index: number, ...points: Point[]): void;
        removeVertex(index: number, count: number): void;
        equal(b: Polygon): boolean;
        static isBoundary(point: Point, p: Polygon): boolean;
        static isInPolygon(point: Point, p: Polygon): boolean;
        static equal(a: Polygon, b: Polygon): boolean;
    }
    class Vector implements IClone<Vector> {
        x: number;
        y: number;
        length: number;
        readonly isZero: boolean;
        readonly slope: number;
        readonly angle: number;
        readonly normalized: boolean;
        readonly lengthQ: number;

        constructor();
        constructor(x: number, y: number);
        clone(): Vector;
        setV(v: Vector): void;
        setV(x: number, y: number): void;
        add(v: Vector): void;
        sub(v: Vector): void;
        mul(v: number): void;
        div(v: number): void;
        cross(v: Vector): number;
        dot(v: Vector): number;
        inner(v: Vector): number;
        equal(v: Vector): boolean;
        normalize(): void;
        zero(): void;
        reverse(): void;
        rotate(angle: number): void;
        isColinear(): boolean;

        static add(a: Vector, b: Vector): Vector;
        static sub(a: Vector, b: Vector): Vector;
        static mul(v: Vector, scalar: number): Vector;
        static div(v: Vector, scalar: number): Vector;
        static cross(a: Vector, b: Vector): number;
        static dot(a: Vector, b: Vector): number;
        static inner(a: Vector, b: Vector): number;
        static equal(a: Vector, b: Vector): boolean;
        static angleBetween(a: Vector, b: Vector): number;
        static perpendicular(a: Vector, b: Vector): boolean;
        static isColinear(a: Vector, b: Vector): boolean;
    }
}
declare namespace ftk {
    enum ResourceType {
        Image = 0,
        Video = 1,
        Audio = 2,
        Text = 3,
        Blob = 4,
        Raw = 5
    }
    interface IResource {
        readonly Loaded: boolean;
        readonly Name: string;
        readonly Type: ResourceType;
        Load(): Promise<void>;
    }
    abstract class Resource implements IResource {
        constructor(url: string, name?: string);
        readonly Url: string;
        abstract readonly Type: ResourceType;
        readonly Name: string;
        readonly Loaded: boolean;
        protected setLoaded(value: boolean): void;
        protected abstract OnLoad(resolve: () => void, reject: () => void): void;
        Load(): Promise<void>;
    }
    class ImageResource extends Resource {
        constructor(url: string, name?: string);
        readonly Type: ResourceType;
        readonly Image: HTMLImageElement;
        protected OnLoad(resolve: () => void, reject: () => void): void;
    }
    class AudioResource extends Resource {
        constructor(url: string, name?: string);
        readonly Type: ResourceType;
        readonly Audio: HTMLAudioElement;
        protected OnLoad(resolve: () => void, reject: () => void): void;
    }
    class VideoResource extends Resource {
        constructor(url: string, name?: string);
        readonly Type: ResourceType;
        readonly Video: HTMLVideoElement;
        protected OnLoad(resolve: () => void, reject: () => void): void;
    }
    class TextResource extends Resource {
        constructor(url: string, name?: string);
        readonly Type: ResourceType;
        readonly Text: string;
        protected OnLoad(resolve: () => void, reject: () => void): void;
    }
    class BlobResource extends Resource {
        constructor(url: string, name?: string);
        readonly Type: ResourceType;
        readonly Data: Blob;
        protected OnLoad(resolve: () => void, reject: () => void): void;
    }
    class RawResource extends Resource {
        constructor(url: string, name?: string);
        readonly Type: ResourceType;
        readonly Data: ArrayBuffer;
        protected OnLoad(resolve: () => void, reject: () => void): void;
    }
    interface IResourceDB {
        Get(name: string): IResource | undefined;
        GetImage(name: string): ImageResource | undefined;
        GetAudio(name: string): AudioResource | undefined;
        GetVideo(name: string): VideoResource | undefined;
        Has(name: string): boolean;
        Edit(): IResourceDBEditor;
    }
    interface IResourceDBEditor {
        Add(resourceUrl: string, name?: string): IResourceDBEditor;
        Add(resource: IResource, name?: string): IResourceDBEditor;
        Remove(name: string): boolean;
        Clear(): void;
        LoadAll(progressHandler?: (progress: number) => void): Promise<void>;
        forEach(callback: (resource: IResource) => boolean): void;
    }
    class ResourceDBEditor implements IResourceDBEditor, IResourceDB {
        Add(resourceUrl: string, name?: string): IResourceDBEditor;
        Add(resource: IResource, name?: string): IResourceDBEditor;
        Clear(): void;
        Remove(name: string): boolean;
        Get(name: string): IResource | undefined;
        Has(name: string): boolean;
        GetImage(name: string): ImageResource | undefined;
        GetAudio(name: string): AudioResource | undefined;
        GetVideo(name: string): VideoResource | undefined;
        LoadAll(progressHandler?: (progress: number) => void): Promise<void>;
        forEach(callback: (resource: IResource) => boolean): void;
        Edit(): IResourceDBEditor;
    }

    function registerResourceType(extName: string[] | string, type: ResourceType): void;
}

declare namespace ftk {
    interface ITexture {
        readonly Width: number;
        readonly Height: number;
        Draw(rc: CanvasRenderingContext2D, dx: number, dy: number, dw: number, dh: number): void;
        Clip(x: number, y: number, w: number, h: number): ITexture;
        BuildOutline(threshold?: number): Polygon;
    }

    type TextureImageSource = HTMLVideoElement | HTMLCanvasElement | HTMLImageElement | HTMLVideoElement | ImageBitmap;
    const EmptyTexture: ITexture;
    function createTexture(image: TextureImageSource | ImageResource | VideoResource | undefined, x?: number, y?: number, w?: number, h?: number): ITexture;
}

declare namespace ftk {
    class ImageSprite extends RectangleSprite {
        public constructor(texture?: ITexture, id?: string);
        Texture: ITexture;
        protected OnRander(rc: CanvasRenderingContext2D): void;
    }
}
declare namespace ftk {
    class Layer implements IObjectNode {
        constructor(id?: string);
        readonly Id: string;
        Visible: boolean;
        UpdateForHide: boolean;
        EventTransparent: boolean;
        Add(node: IObjectNode): Layer;
        Remove(id: string): Layer;
        RemoveAll(): Layer;
        Get(id: string): IObjectNode | undefined;
        forEach(callback: (node: IObjectNode) => void): void;
        Sort(compareCallback: (a: IObjectNode, b: IObjectNode) => number): void;
        Rander(rc: CanvasRenderingContext2D): void;
        DispatchTouchEvent(ev: GTouchEvent, forced: boolean): void;
        DispatchMouseEvent(ev: GMouseEvent, forced: boolean): void;
        DispatchKeyboardEvent(ev: GKeyboardEvent, forced: boolean): void;
        DispatchNoticeEvent(ev: NoticeEvent, forced: boolean): void;
        Update(timestamp: number): void;
    }
    class ColoredLayer extends Layer {
        constructor(color?: Color | string | number, id?: string);
        BackgroundColor: Color;
        Rander(rc: CanvasRenderingContext2D): void;
    }

    enum BackgroundImageRepeatStyle {
        none,
        repeat,
        center,
        stretch,
        fitStretch,
    }

    class BackgroundImageLayer extends Layer {
        BackgroundTexture: ITexture;
        RepeatStyle: BackgroundImageRepeatStyle;
        constructor(texture?: ITexture, id?: string);
        Rander(rc: CanvasRenderingContext2D): void;
    }
}
declare namespace ftk.net {
    type ChannelOptions = {
        url: string;
        reconnectInterval: number;
        maxReconnectCount?: number;
        protocols?: string | string[];
    };

    interface ChannelEventMap {
        'error': (message: string) => void;
        'reconnect': (count: number) => void;
    }

    abstract class Channel extends EventEmitter {
        constructor(options: ChannelOptions);
        readonly Connected: boolean;
        readonly WaitingQueueLength: number;
        protected abstract OnMessageHandle(data: string | ArrayBuffer): void;
        protected SendMessage(data: string | ArrayBuffer | ArrayBufferView): void;

        addListener<K extends keyof ChannelEventMap>(evt: K, listener: ChannelEventMap[K]): void;
        removeListener<K extends keyof ChannelEventMap>(evt: K, listener?: ChannelEventMap[K]): void;
        on<K extends keyof ChannelEventMap>(evt: K, listener: ChannelEventMap[K]): void;
        once<K extends keyof ChannelEventMap>(evt: K, listener: ChannelEventMap[K]): void;
        off<K extends keyof ChannelEventMap>(evt: K, listener: ChannelEventMap[K]): void;
    }

    interface StringChannelEventMap extends ChannelEventMap {
        'message': (message: string) => void;
    }

    class StringChannel extends Channel {
        protected OnMessageHandle(data: string | ArrayBuffer): void;
        Send(data: string): void;

        addListener<K extends keyof StringChannelEventMap>(evt: K, listener: StringChannelEventMap[K]): void;
        removeListener<K extends keyof StringChannelEventMap>(evt: K, listener?: StringChannelEventMap[K]): void;
        on<K extends keyof StringChannelEventMap>(evt: K, listener: StringChannelEventMap[K]): void;
        once<K extends keyof StringChannelEventMap>(evt: K, listener: StringChannelEventMap[K]): void;
        off<K extends keyof StringChannelEventMap>(evt: K, listener: StringChannelEventMap[K]): void;
    }

    interface JsonChannelEventMap extends ChannelEventMap {
        'message': (message: any) => void;
    }

    class JsonChannel extends Channel {
        protected OnMessageHandle(data: string | ArrayBuffer): void;
        Send(data: any): void;

        addListener<K extends keyof JsonChannelEventMap>(evt: K, listener: JsonChannelEventMap[K]): void;
        removeListener<K extends keyof JsonChannelEventMap>(evt: K, listener?: JsonChannelEventMap[K]): void;
        on<K extends keyof JsonChannelEventMap>(evt: K, listener: JsonChannelEventMap[K]): void;
        once<K extends keyof JsonChannelEventMap>(evt: K, listener: JsonChannelEventMap[K]): void;
        off<K extends keyof JsonChannelEventMap>(evt: K, listener: JsonChannelEventMap[K]): void;
    }

    interface ArrayBufferChannelEventMap extends ChannelEventMap {
        'message': (message: ArrayBuffer) => void;
    }

    class ArrayBufferChannel extends Channel {
        protected OnMessageHandle(data: string | ArrayBuffer): void;
        Send(data: any): void;

        addListener<K extends keyof ArrayBufferChannelEventMap>(evt: K, listener: ArrayBufferChannelEventMap[K]): void;
        removeListener<K extends keyof ArrayBufferChannelEventMap>(evt: K, listener?: ArrayBufferChannelEventMap[K]): void;
        on<K extends keyof ArrayBufferChannelEventMap>(evt: K, listener: ArrayBufferChannelEventMap[K]): void;
        once<K extends keyof ArrayBufferChannelEventMap>(evt: K, listener: ArrayBufferChannelEventMap[K]): void;
        off<K extends keyof ArrayBufferChannelEventMap>(evt: K, listener: ArrayBufferChannelEventMap[K]): void;
    }

    interface IHttpResponse {
        readonly status: number;
        readonly message: string;
        readonly responseType: string;
        readonly response: any;
        getHeader(name: string): string | null;
        getAllHeaders(): string;
    }

    enum HttpResponseType {
        Buffer,
        Blob,
        Text,
        XML,
        JSON
    }

    interface HttpClientEventMap {
        'start': () => void;
        'progress': (loaded: number, total: number) => void;
        'load': (response: IHttpResponse) => void;
        'error': (message: string) => void;
        'end': () => void;
    }

    class HttpClient extends EventEmitter {
        Username: string | undefined;
        Password: string | undefined;
        ResponseType: HttpResponseType;
        Sync: boolean;
        Timeout: number;

        constructor();

        Get(url: string, data?: any): IHttpResponse;
        Post(url: string, data?: any): IHttpResponse;
        Put(url: string, data?: any): IHttpResponse;
        Delete(url: string, data?: any): IHttpResponse;

        Request(method: string, url: string, data?: any): IHttpResponse;
        SetHeader(name: string, value: any): void;

        Cancel(): void;

        addListener<K extends keyof HttpClientEventMap>(evt: K, listener: HttpClientEventMap[K]): void;
        removeListener<K extends keyof HttpClientEventMap>(evt: K, listener?: HttpClientEventMap[K]): void;
        on<K extends keyof HttpClientEventMap>(evt: K, listener: HttpClientEventMap[K]): void;
        once<K extends keyof HttpClientEventMap>(evt: K, listener: HttpClientEventMap[K]): void;
        off<K extends keyof HttpClientEventMap>(evt: K, listener: HttpClientEventMap[K]): void;

        protected FormatParameters(data: any): any;
        protected FormatResult(data: any): any;
    }

    class XMLHttpClient extends HttpClient {
        constructor();
        protected FormatParameters(data: any): any;
    }

    class JsonHttpClient extends HttpClient {
        constructor();
        protected FormatParameters(data: any): any;
    }

    class StringHttpClient extends HttpClient {
        constructor();
        protected FormatParameters(data: any): any;
    }

    class BufferHttpClient extends HttpClient {
        constructor();
        protected FormatParameters(data: any): any;
    }
}

declare namespace ftk {
    class VideoSprite extends RectangleSprite {
        constructor(resource?: VideoResource, w?: number, h?: number, id?: string);
        Resource: VideoResource;
        protected OnRander(rc: CanvasRenderingContext2D): void;
        Play(): void;
        Pause(): void;
    }
}

declare namespace ftk.ui {
    class ImageButton extends ImageSprite {
        Texture: ITexture;
        HoverTexture: ITexture | undefined;
        DownTexture: ITexture | undefined;

        constructor(texture?: ITexture, id?: string);
        protected OnDispatchMouseEvent(ev: GMouseEvent, _forced: boolean): void;
    }
}
declare namespace ftk.ui {
    class Panel extends RectangleShape {
        protected OnRander(rc: CanvasRenderingContext2D): void;
    }
}

declare namespace ftk {
    class GraphicsSprite extends RectangleSprite {
        clear(): void;
        beginStroke(width: number, color: Color): void;
        beginFill(color: Color): void;
        beginLinearGradientFill(color: IReadonlyArray<Color>, startX: number, startY: number, endX: number, endY: number): void;
        beginRadialGradientFill(color: IReadonlyArray<Color>, startX: number, startY: number, startR: number, endX: number, endY: number, endR: number): void;
        beginClipPath(): void;
        endFill(): void;
        endStroke(close?: boolean): void;
        endClipPath(): void;

        cubicCurveTo(c1x: number, c1y: number, c2x: number, c2y: number, x: number, y: number): void;
        curveTo(cx: number, cy: number, x: number, y: number): void;
        arc(centerX: number, centerY: number, radius: number, startAngle: number, endAngle: number, anticlockwise: boolean): void;
        arcTo(startX: number, startY: number, endX: number, endY: number, radius: number): void;
        circle(centerX: number, centerY: number, radius: number): void;
        ellipse(x: number, y: number, w: number, h: number, rotation: number, startAngle?: number, endAngle?: number): void;
        rect(x: number, y: number, w: number, h: number): void;
        roundRect(x: number, y: number, w: number, h: number, radius: number): void;
        lineTo(x: number, y: number): void;
        moveTo(x: number, y: number): void;
        polygon(vertexs: IReadonlyArray<Point>): void;
        epolygon(x: number, y: number, radius: number, side: number): void;
        star(x: number, y: number, radius1: number, radius2: number, count: number, rotation?: number): void;

        fillBackground(color: Color): void;
        drawTexture(t: ITexture, dx: number, dy: number, dw: number, dh: number): void;

        beginText(fontName: string, fontSize: number): void;
        text(s: string, dx: number, dy: number, dw: number, color?: Color): void;
        endText(): void;

        clearRect(x: number, y: number, w: number, h: number): void;

        protected OnRander(rc: CanvasRenderingContext2D): void;
    }
}
