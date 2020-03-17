namespace ftk {
    export interface IObjectNode {
        readonly Id: string;
        DispatchTouchEvent(ev: GTouchEvent, forced: boolean): void;
        DispatchMouseEvent(ev: GMouseEvent, forced: boolean): void;
        DispatchKeyboardEvent(ev: GKeyboardEvent, forced: boolean): void;
        DispatchNoticeEvent(ev: NoticeEvent, forced: boolean): void;
        Rander(rc: CanvasRenderingContext2D | null): void;
        Update(timestamp: number): void;
    }

    export abstract class GEvent{
        public readonly Source: any;
        public Target: IObjectNode | null;
        public StopPropagation: boolean;
        constructor(
            source: any
        ) {
            this.Source = source;
            this.Target = null;
            this.StopPropagation = false;
        }
    }

    export class EngineEvent extends GEvent{
        public Args:any;
        constructor(source: any,args:any){
            super(source);
            this.Args = args;
        }
    }

    export class NoticeEvent extends GEvent{
        public readonly Args:any;
        public readonly Broadcast:boolean;
        public readonly Name:string;
        public Result:any;
        constructor(source: any,name:string,broadcast:boolean, args:any){
            super(source);
            this.Name = name;
            this.Broadcast = broadcast;
            this.Args = args;
            this.Result = undefined;
        }
    }

    export enum InputEventType {
        TouchStart,
        TouchEnd,
        MouseEnter,
        MouseLeave,
        MouseDown,
        MouseUp,
        MouseMove,
        KeyDown,
        KeyUp,
    }
    
    export interface GTouchPoint {
        readonly identifier: number;
        readonly x: number;
        readonly y: number;
        readonly radiusX: number;
        readonly radiusY: number;
        readonly rotationAngle: number;
        readonly force: number;
        readonly Target: IObjectNode | null;
    }


    export abstract class GInputEvent extends GEvent {
        public readonly InputType: InputEventType;
        public readonly AltKey: boolean;
        public readonly CtrlKey: boolean;
        public readonly ShiftKey: boolean;
        public Captured: boolean;
        public CaptureContext: any;

        constructor(
            source: any,
            eventType: InputEventType,
            altKey: boolean,
            ctrlKey: boolean,
            shiftKey: boolean
        ) {
            super(source);
            this.InputType = eventType;
            this.AltKey = altKey;
            this.CtrlKey = ctrlKey;
            this.ShiftKey = shiftKey;
            this.Captured = false;
            this.CaptureContext = null;
        }
    }
    export class GTouchEvent extends GInputEvent {
        public readonly Touches: IReadOnlyArray<GTouchPoint>;
        public readonly ChangedTouches: IReadOnlyArray<GTouchPoint>;
        constructor(
            source: any,
            eventType: InputEventType,
            altKey: boolean,
            ctrlKey: boolean,
            shiftKey: boolean,
            touches: IReadOnlyArray<GTouchPoint>,
            changedTouches: IReadOnlyArray<GTouchPoint>
        ) {
            super(
                source,
                eventType,
                altKey,
                ctrlKey,
                shiftKey
            );
            this.Touches = touches;
            this.ChangedTouches = changedTouches;
        }
    }

    export class GMouseEvent extends GInputEvent {
        public readonly x: number;
        public readonly y: number;
        public readonly Button: number;
        public readonly Wheel: number;
        public Cursor: string;
        constructor(
            source: any,
            eventType: InputEventType,
            altKey: boolean,
            ctrlKey: boolean,
            shiftKey: boolean,
            x: number,
            y: number,
            button: number,
            wheel: number
        ) {
            super(
                source,
                eventType,
                altKey,
                ctrlKey,
                shiftKey
            );
            this.x = x;
            this.y = y;
            this.Button = button;
            this.Wheel = wheel;
            this.Cursor = "default";
        }
    }

    export class GKeyboardEvent extends GInputEvent {
        public readonly KeyCode: number;
        constructor(
            source: any,
            eventType: InputEventType,
            altKey: boolean,
            ctrlKey: boolean,
            shiftKey: boolean,
            keyCode: number
        ) {
            super(
                source,
                eventType,
                altKey,
                ctrlKey,
                shiftKey
            );
            this.KeyCode = keyCode;
        }
    }
}
