"use strict";
var ftk;
(function (ftk) {
    class Animation {
        constructor(start, end, duration, loop, autostart) {
            this.mPlaying = false;
            this.Loop = loop ? loop : false;
            this.Duration = duration;
            this.mStartValue = start;
            this.mEndValue = end;
            this.mDistance = this.CalcDistance(start, end);
            this.mStartTime = 0;
            this.mEndTime = 0;
            this.mFirstFrame = true;
            if (autostart) {
                this.Start();
            }
        }
        get Playing() { return this.mPlaying; }
        Start() {
            if (!this.mPlaying) {
                this.Restart();
            }
        }
        Restart() {
            this.mFirstFrame = true;
            this.mPlaying = true;
        }
        Stop() {
            this.mPlaying = false;
            this.mFirstFrame = true;
        }
        Update(timestamp, target) {
            if (!this.Playing) {
                return;
            }
            if (this.mFirstFrame) {
                this.mStartTime = timestamp;
                this.mEndTime = timestamp + this.Duration;
                this.mFirstFrame = false;
                this.SetTarget(target, this.mStartValue);
            }
            else {
                if (timestamp >= this.mEndTime) {
                    this.SetTarget(target, this.mEndValue);
                    if (this.Loop) {
                        this.mStartTime = timestamp;
                        this.mEndTime = timestamp + this.Duration;
                    }
                    else {
                        this.Stop();
                    }
                }
                else {
                    let count = timestamp - this.mStartTime;
                    let value = this.CalcProgress(this.mStartValue, this.mDistance, count, this.Duration);
                    this.SetTarget(target, value);
                }
            }
        }
    }
    ftk.Animation = Animation;
    class NumberValueAnimation extends Animation {
        CalcDistance(start, end) {
            return end - start;
        }
        CalcProgress(start, distanceTotal, timeProgress, timeTotal) {
            return start + (distanceTotal * timeProgress) / timeTotal;
        }
    }
    ftk.NumberValueAnimation = NumberValueAnimation;
    class AngleAnimation extends NumberValueAnimation {
        SetTarget(target, value) {
            target.Angle = value;
        }
    }
    ftk.AngleAnimation = AngleAnimation;
    class OpacityAnimation extends NumberValueAnimation {
        SetTarget(target, value) {
            target.Opacity = value;
        }
    }
    ftk.OpacityAnimation = OpacityAnimation;
    class PosXAnimation extends NumberValueAnimation {
        SetTarget(target, value) {
            target.X = value;
        }
    }
    ftk.PosXAnimation = PosXAnimation;
    class PosYAnimation extends NumberValueAnimation {
        SetTarget(target, value) {
            target.Y = value;
        }
    }
    ftk.PosYAnimation = PosYAnimation;
    class WidthAnimation extends NumberValueAnimation {
        SetTarget(target, value) {
            target.Width = value;
        }
    }
    ftk.WidthAnimation = WidthAnimation;
    class HeightAnimation extends NumberValueAnimation {
        SetTarget(target, value) {
            target.Height = value;
        }
    }
    ftk.HeightAnimation = HeightAnimation;
    class PositionAnimation extends Animation {
        CalcDistance(start, end) {
            return new ftk.Point(end.x - start.x, end.y - start.y);
        }
        CalcProgress(start, distanceTotal, timeProgress, timeTotal) {
            let x = start.x + (distanceTotal.x * timeProgress) / timeTotal;
            let y = start.y + (distanceTotal.y * timeProgress) / timeTotal;
            return new ftk.Point(x, y);
        }
        SetTarget(target, value) {
            target.Position = value;
        }
    }
    ftk.PositionAnimation = PositionAnimation;
    class SizeAnimation extends Animation {
        CalcDistance(start, end) {
            return new ftk.Size(end.cx - start.cx, end.cy - start.cy);
        }
        CalcProgress(start, distanceTotal, timeProgress, timeTotal) {
            let x = start.cx + (distanceTotal.cx * timeProgress) / timeTotal;
            let y = start.cy + (distanceTotal.cy * timeProgress) / timeTotal;
            return new ftk.Size(x, y);
        }
        SetTarget(target, value) {
            target.size = value;
        }
    }
    ftk.SizeAnimation = SizeAnimation;
    class BoxAnimation extends Animation {
        CalcDistance(start, end) {
            return new ftk.Rectangle(end.x - start.x, end.y - start.y, end.w - start.w, end.h - start.h);
        }
        CalcProgress(start, distanceTotal, timeProgress, timeTotal) {
            let x = start.x + (distanceTotal.x * timeProgress) / timeTotal;
            let y = start.y + (distanceTotal.y * timeProgress) / timeTotal;
            let w = start.w + (distanceTotal.w * timeProgress) / timeTotal;
            let h = start.h + (distanceTotal.h * timeProgress) / timeTotal;
            return new ftk.Rectangle(x, y, w, h);
        }
        SetTarget(target, value) {
            target.Box = value;
        }
    }
    ftk.BoxAnimation = BoxAnimation;
    class KeyframeAnimation {
        constructor(loop, autostart) {
            this.mPlaying = false;
            this.Loop = loop ? loop : false;
            this.mFrames = new Array();
            this.mCurrentFrame = 0;
            if (autostart) {
                this.Start();
            }
        }
        get Playing() { return this.mPlaying; }
        Start() {
            if (!this.mPlaying) {
                this.Restart();
            }
        }
        Restart() {
            this.mPlaying = true;
        }
        Stop() {
            this.mPlaying = false;
        }
        AddFrame(animation) {
            animation.Loop = false;
            this.mFrames.push(animation);
        }
        RemoveFrame(animation) {
            this.mFrames = this.mFrames.filter((a) => { return a !== animation; });
        }
        ClearFrames() {
            this.mFrames = new Array();
        }
        Update(timestamp, target) {
            if (!this.Playing && this.mFrames.length == 0) {
                return;
            }
            let animation = this.mFrames[this.mCurrentFrame];
            if (!animation.Playing) {
                animation.Start();
            }
            animation.Loop = false;
            animation.Update(timestamp, target);
            if (!animation.Playing) {
                this.mCurrentFrame++;
                if (this.mCurrentFrame >= this.mFrames.length) {
                    this.mCurrentFrame = 0;
                    if (!this.Loop) {
                        this.Stop();
                    }
                }
            }
        }
    }
    ftk.KeyframeAnimation = KeyframeAnimation;
})(ftk || (ftk = {}));
var ftk;
(function (ftk) {
    class Color {
        constructor(arg1, arg2, arg3, arg4) {
            this.m_r = 0;
            this.m_g = 0;
            this.m_b = 0;
            this.m_a = 1.0;
            if (typeof (arg1) === "string") {
                this.parseString(arg1);
            }
            else if ((typeof (arg1) === "number") && (typeof (arg2) === "number") && (typeof (arg3) === "number")) {
                this.setRgba(arg1, arg2, arg3, arg4);
            }
            else if (typeof (arg1) === "object") {
                let color = arg1;
                this.m_r = color.R;
                this.m_g = color.G;
                this.m_b = color.B;
                this.m_a = color.A;
            }
            else if (typeof (arg1) === "number") {
                this.m_b = arg1 & 0x000000FF;
                this.m_g = (arg1 & 0x0000FF00) >>> 8;
                this.m_r = (arg1 & 0x00FF0000) >>> 16;
                this.m_a = ((arg1 & 0xFF000000) >>> 24) / 255.0;
            }
        }
        Clone() {
            return new Color(this.R, this.G, this.B, this.A);
        }
        addLightness(value) {
            this.R = this.m_r + value;
            this.G = this.m_g + value;
            this.B = this.m_b + value;
        }
        blend(value, alpha) {
            alpha = Color.ClampedColorValue(alpha);
            this.R = (this.m_r * (1 - alpha)) + (value.R * alpha);
            this.G = (this.m_g * (1 - alpha)) + (value.G * alpha);
            this.B = (this.m_b * (1 - alpha)) + (value.B * alpha);
            this.A = (this.m_a * (1 - alpha)) + (value.A * alpha);
        }
        grayscale() {
            let x = Color.ClampedColorValue((this.m_r + this.m_g + this.m_b) / 3);
            this.m_r = x;
            this.m_g = x;
            this.m_b = x;
        }
        inverse() {
            this.m_r = 0xFF - this.m_r;
            this.m_g = 0xFF - this.m_g;
            this.m_b = 0xFF - this.m_b;
        }
        get R() {
            return this.m_r;
        }
        set R(value) {
            this.m_r = Color.ClampedColorValue(value);
        }
        get G() {
            return this.m_g;
        }
        set G(value) {
            this.m_g = Color.ClampedColorValue(value);
        }
        get B() {
            return this.m_b;
        }
        set B(value) {
            this.m_b = Color.ClampedColorValue(value);
        }
        get A() {
            return this.m_a;
        }
        set A(value) {
            this.m_a = Color.ClampedAlphaValue(value);
        }
        get Luminance() {
            return (this.m_r * 0.2126) + (this.m_g * 0.7152) + (this.m_b * 0.0722);
        }
        get RGBValue() {
            return (this.m_r << 16) | (this.m_g << 8) | (this.m_b);
        }
        get RGBAValue() {
            return (this.m_r << 24) | (this.m_g << 16) | (this.m_b << 8) | (Math.round(this.m_a * 255));
        }
        setRgba(r, g, b, a) {
            this.m_r = r & 0xFF;
            this.m_g = g & 0xFF;
            this.m_b = b & 0xFF;
            if (typeof (a) === "number") {
                this.m_a = Color.ClampedAlphaValue(a);
            }
        }
        toRGBString() {
            return "rgb(" + this.m_r.toString() + "," + this.m_g.toString() + "," + this.m_b.toString() + ")";
        }
        toRGBAString() {
            return "rgba(" + this.m_r.toString() + "," + this.m_g.toString() + "," + this.m_b.toString() + "," + this.m_a.toString() + ")";
        }
        toHEXString(alpha) {
            let rs = "#";
            rs += this.pad((this.m_r & 0xFF).toString(16).toUpperCase(), 2);
            rs += this.pad((this.m_g & 0xFF).toString(16).toUpperCase(), 2);
            rs += this.pad((this.m_b & 0xFF).toString(16).toUpperCase(), 2);
            if (alpha) {
                rs += this.pad((Math.round(this.m_a * 255) & 0xFF).toString(16).toUpperCase(), 2);
            }
            return rs;
        }
        toString() {
            return this.toRGBAString();
        }
        toNumber() {
            return (this.m_r << 16)
                | (this.m_g << 8)
                | this.m_b
                | (((this.m_a * 255) & 0xFF) << 24);
        }
        static ClampedColorValue(value) {
            if (value > 0xFF) {
                return 0xFF;
            }
            else if (value < 0) {
                return 0;
            }
            return Math.round(value);
        }
        static ClampedAlphaValue(value) {
            return Math.min(Math.max(value, 0.0), 1.0);
        }
        static blend(x, y, alpha) {
            alpha = Color.ClampedColorValue(alpha);
            let r = (x.m_r * (1 - alpha)) + (y.m_r * alpha);
            let g = (x.m_g * (1 - alpha)) + (y.m_g * alpha);
            let b = (x.m_b * (1 - alpha)) + (y.m_b * alpha);
            let a = (x.m_a * (1 - alpha)) + (y.m_a * alpha);
            return new Color(r, g, b, a);
        }
        pad(val, len) {
            let padded = [];
            for (let i = 0, j = Math.max(len - val.length, 0); i < j; i++) {
                padded.push('0');
            }
            padded.push(val);
            return padded.join('');
        }
        parseString(value) {
            let color = value.toUpperCase();
            if (color.startsWith("#")) {
                if (color.length == 4) {
                    this.m_r = (parseInt(color.substr(1, 1), 16) & 0xFF) << 4;
                    this.m_g = (parseInt(color.substr(2, 1), 16) & 0xFF) << 4;
                    this.m_b = (parseInt(color.substr(3, 1), 16) & 0xFF) << 4;
                }
                else if (color.length >= 7) {
                    this.m_r = parseInt(color.substr(1, 2), 16) & 0xFF;
                    this.m_g = parseInt(color.substr(3, 2), 16) & 0xFF;
                    this.m_b = parseInt(color.substr(5, 2), 16) & 0xFF;
                    if (color.length == 9) {
                        this.m_a = Color.ClampedAlphaValue((parseInt(color.substr(7, 2), 16) & 0xFF) / 255.0);
                    }
                }
            }
            else if (color.startsWith("RGB")) {
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
    ftk.Color = Color;
})(ftk || (ftk = {}));
var ftk;
(function (ftk) {
    function NewInstance(typename, ...args) {
        const g = window;
        const f = g[typename];
        if (typeof (f) === "function") {
            const fn = f;
            args.unshift(null);
            const cfn = fn.bind.apply(fn, args);
            return cfn();
        }
        return undefined;
    }
    ftk.NewInstance = NewInstance;
    class EventHandlerChain {
        constructor() {
        }
        get length() { return this.mHandlers ? this.mHandlers.length : 0; }
        add(handler) {
            if (!this.mHandlers) {
                this.mHandlers = new Array();
            }
            this.mHandlers.push(handler);
        }
        remove(handler) {
            if (this.mHandlers) {
                let i = this.mHandlers.indexOf(handler);
                if (i >= 0) {
                    this.mHandlers.splice(i, 1);
                }
            }
        }
        reset() {
            this.mHandlers = undefined;
        }
        call(ctx, ...args) {
            if (this.mHandlers && this.mHandlers.length > 0) {
                this.mHandlers.forEach((handler) => {
                    handler.apply(ctx, args);
                });
            }
        }
    }
    ftk.EventHandlerChain = EventHandlerChain;
    class EventEmitter {
        addListener(evt, listener) {
            if (!this.mListeners) {
                this.mListeners = new Map();
            }
            let handlerList = this.mListeners.get(evt);
            if (!handlerList) {
                handlerList = new EventHandlerChain();
                this.mListeners.set(evt, handlerList);
            }
            handlerList.add(listener);
        }
        on(evt, listener) {
            this.addListener(evt, listener);
        }
        once(evt, listener) {
            let _this = this;
            let newlistener = function (...args) {
                listener.apply(this, args);
                _this.removeListener(evt, newlistener);
            };
            this.addListener(evt, newlistener);
        }
        off(evt, listener) {
            this.removeListener(evt, listener);
        }
        removeListener(evt, listener) {
            if (this.mListeners) {
                let handlerList = this.mListeners.get(evt);
                if (handlerList) {
                    if (listener) {
                        handlerList.remove(listener);
                    }
                    else {
                        this.mListeners.delete(evt);
                    }
                }
            }
        }
        resetListeners() {
            this.mListeners = undefined;
        }
        emit(evt, ...args) {
            this.emitEx(this, evt, ...args);
        }
        emitEx(thisArg, evt, ...args) {
            if (this.mListeners) {
                let handlerList = this.mListeners.get(evt);
                if (handlerList) {
                    handlerList.call(thisArg, ...args);
                }
            }
        }
    }
    ftk.EventEmitter = EventEmitter;
})(ftk || (ftk = {}));
var ftk;
(function (ftk) {
    class GEvent {
        constructor(source) {
            this.Source = source;
            this.Target = null;
            this.StopPropagation = false;
        }
    }
    ftk.GEvent = GEvent;
    class EngineEvent extends GEvent {
        constructor(source, args) {
            super(source);
            this.Args = args;
        }
    }
    ftk.EngineEvent = EngineEvent;
    class NoticeEvent extends GEvent {
        constructor(source, name, broadcast, args) {
            super(source);
            this.Name = name;
            this.Broadcast = broadcast;
            this.Args = args;
            this.Result = undefined;
        }
    }
    ftk.NoticeEvent = NoticeEvent;
    let InputEventType;
    (function (InputEventType) {
        InputEventType[InputEventType["TouchStart"] = 0] = "TouchStart";
        InputEventType[InputEventType["TouchEnd"] = 1] = "TouchEnd";
        InputEventType[InputEventType["MouseEnter"] = 2] = "MouseEnter";
        InputEventType[InputEventType["MouseLeave"] = 3] = "MouseLeave";
        InputEventType[InputEventType["MouseDown"] = 4] = "MouseDown";
        InputEventType[InputEventType["MouseUp"] = 5] = "MouseUp";
        InputEventType[InputEventType["MouseMove"] = 6] = "MouseMove";
        InputEventType[InputEventType["KeyDown"] = 7] = "KeyDown";
        InputEventType[InputEventType["KeyUp"] = 8] = "KeyUp";
    })(InputEventType = ftk.InputEventType || (ftk.InputEventType = {}));
    class GInputEvent extends GEvent {
        constructor(source, eventType, altKey, ctrlKey, shiftKey) {
            super(source);
            this.InputType = eventType;
            this.AltKey = altKey;
            this.CtrlKey = ctrlKey;
            this.ShiftKey = shiftKey;
            this.Captured = false;
            this.CaptureContext = null;
        }
    }
    ftk.GInputEvent = GInputEvent;
    class GTouchEvent extends GInputEvent {
        constructor(source, eventType, altKey, ctrlKey, shiftKey, touches, changedTouches) {
            super(source, eventType, altKey, ctrlKey, shiftKey);
            this.Touches = touches;
            this.ChangedTouches = changedTouches;
        }
    }
    ftk.GTouchEvent = GTouchEvent;
    class GMouseEvent extends GInputEvent {
        constructor(source, eventType, altKey, ctrlKey, shiftKey, x, y, button, wheel) {
            super(source, eventType, altKey, ctrlKey, shiftKey);
            this.x = x;
            this.y = y;
            this.Button = button;
            this.Wheel = wheel;
            this.Cursor = "default";
        }
    }
    ftk.GMouseEvent = GMouseEvent;
    class GKeyboardEvent extends GInputEvent {
        constructor(source, eventType, altKey, ctrlKey, shiftKey, keyCode) {
            super(source, eventType, altKey, ctrlKey, shiftKey);
            this.KeyCode = keyCode;
        }
    }
    ftk.GKeyboardEvent = GKeyboardEvent;
})(ftk || (ftk = {}));
var ftk;
(function (ftk) {
    var utility;
    (function (utility) {
        const kIDCharset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        function GenerateIDString(n) {
            let res = "";
            let kl = kIDCharset.length - 1;
            for (let i = 0; i < n; i++) {
                let id = Math.ceil(Math.random() * kl);
                res += kIDCharset[id];
            }
            return res;
        }
        utility.GenerateIDString = GenerateIDString;
        function UTF8BufferEncodeLength(input) {
            let output = 0;
            for (let i = 0; i < input.length; i++) {
                let charCode = input.charCodeAt(i);
                if (charCode > 0x7FF) {
                    if (0xD800 <= charCode && charCode <= 0xDBFF) {
                        i++;
                        output++;
                    }
                    output += 3;
                }
                else if (charCode > 0x7F) {
                    output += 2;
                }
                else {
                    output++;
                }
            }
            return output;
        }
        utility.UTF8BufferEncodeLength = UTF8BufferEncodeLength;
        function UTF8BufferEncode(input) {
            let buffer = new ArrayBuffer(UTF8BufferEncodeLength(input));
            let output = new Uint8Array(buffer);
            let pos = 0;
            for (let i = 0; i < input.length; i++) {
                let charCode = input.charCodeAt(i);
                if (0xD800 <= charCode && charCode <= 0xDBFF) {
                    let lowCharCode = input.charCodeAt(++i);
                    charCode = ((charCode - 0xD800) << 10) + (lowCharCode - 0xDC00) + 0x10000;
                }
                if (charCode <= 0x7F) {
                    output[pos++] = charCode;
                }
                else if (charCode <= 0x7FF) {
                    output[pos++] = charCode >> 6 & 0x1F | 0xC0;
                    output[pos++] = charCode & 0x3F | 0x80;
                }
                else if (charCode <= 0xFFFF) {
                    output[pos++] = charCode >> 12 & 0x0F | 0xE0;
                    output[pos++] = charCode >> 6 & 0x3F | 0x80;
                    output[pos++] = charCode & 0x3F | 0x80;
                }
                else {
                    output[pos++] = charCode >> 18 & 0x07 | 0xF0;
                    output[pos++] = charCode >> 12 & 0x3F | 0x80;
                    output[pos++] = charCode >> 6 & 0x3F | 0x80;
                    output[pos++] = charCode & 0x3F | 0x80;
                }
            }
            return buffer;
        }
        utility.UTF8BufferEncode = UTF8BufferEncode;
        function UTF8BufferDecode(buffer, offset, length) {
            let output = "";
            let utf16;
            let pos = 0;
            if (!offset) {
                offset = 0;
            }
            if (!length) {
                length = buffer.byteLength;
            }
            let input = new Uint8Array(buffer, offset, length);
            while (pos < length) {
                let byte1 = input[pos++];
                if (byte1 < 128) {
                    utf16 = byte1;
                }
                else {
                    let byte2 = input[pos++] - 128;
                    if (byte2 < 0) {
                        byte2 = 0;
                    }
                    if (byte1 < 0xE0) {
                        utf16 = 64 * (byte1 - 0xC0) + byte2;
                    }
                    else {
                        let byte3 = input[pos++] - 128;
                        if (byte3 < 0) {
                            byte3 = 0;
                        }
                        if (byte1 < 0xF0) {
                            utf16 = 4096 * (byte1 - 0xE0) + 64 * byte2 + byte3;
                        }
                        else {
                            let byte4 = input[pos++] - 128;
                            if (byte4 < 0) {
                                byte4 = 0;
                            }
                            if (byte1 < 0xF8) {
                                utf16 = 262144 * (byte1 - 0xF0) + 4096 * byte2 + 64 * byte3 + byte4;
                            }
                            else {
                                utf16 = '?'.charCodeAt(0);
                            }
                        }
                    }
                }
                if (utf16 > 0xFFFF) {
                    utf16 -= 0x10000;
                    output += String.fromCharCode(0xD800 + (utf16 >> 10));
                    utf16 = 0xDC00 + (utf16 & 0x3FF);
                }
                output += String.fromCharCode(utf16);
            }
            return output;
        }
        utility.UTF8BufferDecode = UTF8BufferDecode;
    })(utility = ftk.utility || (ftk.utility = {}));
})(ftk || (ftk = {}));
var ftk;
(function (ftk) {
    class Stage {
        constructor(width, height, id) {
            this.mLayerList = new Array();
            if ((!id) || id.length == 0) {
                id = ftk.utility.GenerateIDString(16);
            }
            this.mID = id;
            this.mWidth = width;
            this.mHeight = height;
        }
        get Id() {
            return this.mID;
        }
        get Width() {
            return this.mWidth;
        }
        set Width(value) {
            this.mWidth = value;
        }
        get Height() {
            return this.mHeight;
        }
        set Height(value) {
            this.mHeight = value;
        }
        AddLayer(layer) {
            this.mLayerList.unshift(layer);
            return this;
        }
        RemoveLayer(id) {
            for (let i = 0; i < this.mLayerList.length; ++i) {
                if (this.mLayerList[i].Id === id) {
                    this.mLayerList.splice(i--, 1);
                }
            }
            return this;
        }
        GetLayer(id) {
            for (let l of this.mLayerList) {
                if (l.Id === id) {
                    return l;
                }
            }
            return undefined;
        }
        forEach(callback) {
            this.mLayerList.forEach(callback);
        }
        Sort(compareCallback) {
            this.mLayerList.sort(compareCallback);
        }
        MoveToTop(layer) {
            this.RemoveLayer(layer.Id);
            this.mLayerList.unshift(layer);
        }
        MoveToBottom(layer) {
            this.RemoveLayer(layer.Id);
            this.mLayerList.push(layer);
        }
        DispatchTouchEvent(ev, forced) {
            for (let l of this.mLayerList) {
                l.DispatchTouchEvent(ev, forced);
                if (ev.StopPropagation) {
                    break;
                }
            }
        }
        DispatchMouseEvent(ev, forced) {
            for (let l of this.mLayerList) {
                l.DispatchMouseEvent(ev, forced);
                if (ev.StopPropagation) {
                    break;
                }
            }
        }
        DispatchKeyboardEvent(ev, forced) {
            for (let l of this.mLayerList) {
                l.DispatchKeyboardEvent(ev, forced);
                if (ev.StopPropagation) {
                    break;
                }
            }
        }
        DispatchNoticeEvent(ev, forced) {
            for (let l of this.mLayerList) {
                l.DispatchNoticeEvent(ev, forced);
                if (ev.StopPropagation) {
                    break;
                }
            }
        }
        Update(timestamp) {
            this.mLayerList.forEach((node) => {
                node.Update(timestamp);
            });
        }
        Rander(rc) {
            for (let i = this.mLayerList.length - 1; i >= 0; --i) {
                this.mLayerList[i].Rander(rc);
            }
        }
    }
    ftk.Stage = Stage;
})(ftk || (ftk = {}));
var ftk;
(function (ftk) {
    class Sprite {
        constructor(id) {
            this.mAngle = 0;
            this.mBasePoint = new ftk.Point();
            if ((!id) || id.length == 0) {
                id = ftk.utility.GenerateIDString(16);
            }
            this.mID = id;
            this.mVisible = true;
            this.mOpacity = 1;
        }
        get Id() {
            return this.mID;
        }
        get Position() {
            let r = this.getRectangle();
            return new ftk.Point(r.x + this.mBasePoint.x, r.y + this.mBasePoint.y);
        }
        set Position(pos) {
            let r = this.getRectangle();
            r.x = pos.x - this.mBasePoint.x;
            r.y = pos.y - this.mBasePoint.y;
            this.setRectangle(r);
        }
        get X() {
            let r = this.getRectangle();
            return r.x + this.mBasePoint.x;
        }
        set X(value) {
            let r = this.getRectangle();
            r.x = value - this.mBasePoint.x;
            this.setRectangle(r);
        }
        get Y() {
            let r = this.getRectangle();
            return r.y + this.mBasePoint.y;
        }
        set Y(value) {
            let r = this.getRectangle();
            r.y = value - this.mBasePoint.y;
            this.setRectangle(r);
        }
        get Box() {
            return this.getRectangle().clone();
        }
        set Box(value) {
            this.setRectangle(value.clone());
            this.OnResized();
        }
        get size() {
            let r = this.getRectangle();
            return r.size;
        }
        set size(value) {
            let r = this.getRectangle();
            r.size = value;
            this.setRectangle(r);
            this.OnResized();
        }
        get Width() {
            let r = this.getRectangle();
            return r.w;
        }
        set Width(value) {
            let r = this.getRectangle();
            r.w = value;
            this.setRectangle(r);
            this.OnResized();
        }
        get Height() {
            let r = this.getRectangle();
            return r.h;
        }
        set Height(value) {
            let r = this.getRectangle();
            r.h = value;
            this.setRectangle(r);
            this.OnResized();
        }
        Resize(w, h) {
            this.size = new ftk.Size(w, h);
        }
        get Angle() {
            return this.mAngle;
        }
        set Angle(value) {
            this.mAngle = value;
        }
        get Opacity() {
            return this.mOpacity;
        }
        set Opacity(value) {
            this.mOpacity = value;
        }
        get BasePoint() {
            return this.mBasePoint.clone();
        }
        set BasePoint(pos) {
            this.mBasePoint = pos.clone();
        }
        setBasePointToCenter() {
            let r = this.getRectangle();
            this.mBasePoint.x = r.w / 2;
            this.mBasePoint.y = r.h / 2;
        }
        get Visible() {
            return this.mVisible;
        }
        set Visible(value) {
            this.mVisible = value;
        }
        get Animations() {
            if (this.mAnimations) {
                return this.mAnimations;
            }
            return [];
        }
        AddAnimation(animation) {
            if (!this.mAnimations) {
                this.mAnimations = new Array();
            }
            this.mAnimations.push(animation);
        }
        RemoveAnimation(animation) {
            if (!this.mAnimations) {
                return false;
            }
            let r = false;
            for (let i = 0; i < this.mAnimations.length; ++i) {
                if (this.mAnimations[i] === animation) {
                    this.mAnimations.splice(i, 1);
                    r = true;
                }
            }
            return r;
        }
        ClearAnimations() {
            this.mAnimations = undefined;
        }
        PickTest(point) {
            let box = this.getRectangle();
            return point.x > box.x && (point.x < box.x + box.w)
                && point.y > box.y && (point.y < box.y + box.h);
        }
        Rander(rc) {
            if (rc && this.Visible) {
                rc.save();
                let angle = this.Angle;
                if (angle !== 0) {
                    let box = this.getRectangle();
                    let bp = this.BasePoint;
                    let xc = box.x + bp.x;
                    let yc = box.y + bp.y;
                    rc.translate(xc, yc);
                    rc.rotate(angle);
                    rc.translate(-xc, -yc);
                }
                let opacity = this.Opacity;
                if (opacity < 1) {
                    if (opacity > 0) {
                        rc.globalAlpha = this.mOpacity;
                        this.OnRander(rc);
                    }
                }
                else {
                    this.OnRander(rc);
                }
                rc.restore();
            }
        }
        DispatchTouchEvent(ev, forced) {
            if (this.mVisible && (forced
                || this.PickTest(this.GetMouseEventPoint(ev.ChangedTouches[0])))) {
                ev.Target = this;
                ev.StopPropagation = true;
                this.OnDispatchTouchEvent(ev, forced);
            }
        }
        DispatchMouseEvent(ev, forced) {
            if (this.mVisible && (forced
                || this.PickTest(this.GetMouseEventPoint(ev)))) {
                ev.Target = this;
                ev.StopPropagation = true;
                this.OnDispatchMouseEvent(ev, forced);
            }
        }
        DispatchKeyboardEvent(ev, forced) {
            if (this.mVisible) {
                this.OnDispatchKeyboardEvent(ev, forced);
            }
        }
        DispatchNoticeEvent(ev, forced) {
            this.OnDispatchNoticeEvent(ev, forced);
        }
        Update(timestamp) {
            if (this.mAnimations) {
                let anis = this.mAnimations;
                for (let a of anis) {
                    a.Update(timestamp, this);
                }
            }
            this.OnUpdate(timestamp);
        }
        OnResized() {
        }
        OnUpdate(_timestamp) {
        }
        OnDispatchTouchEvent(_ev, _forced) {
        }
        OnDispatchMouseEvent(_ev, _forced) {
        }
        OnDispatchKeyboardEvent(_ev, _forced) {
        }
        OnDispatchNoticeEvent(_ev, _forced) {
        }
        GetMouseEventPoint(ev) {
            let angle = this.Angle;
            let pt = new ftk.Point(ev.x, ev.y);
            if (angle === 0) {
                return pt;
            }
            pt.rotate(-angle, this.Position);
            return pt;
        }
    }
    ftk.Sprite = Sprite;
    class RectangleSprite extends Sprite {
        constructor(x, y, w, h, id) {
            super(id);
            this.mRectangle = new ftk.Rectangle(x, y, w, h);
        }
        getRectangle() {
            return this.mRectangle;
        }
        setRectangle(value) {
            if (this.mRectangle !== value) {
                this.mRectangle = value;
            }
            this.mRectangle.normalize();
        }
    }
    ftk.RectangleSprite = RectangleSprite;
})(ftk || (ftk = {}));
var ftk;
(function (ftk) {
    class ParticleSprite extends ftk.RectangleSprite {
        constructor() {
            super(0, 0, 0, 0);
            this.mParticles = new Array();
            this.mTicks = 0;
            this.mLastUpdateTime = 0;
            this.mUpdateTime = 0;
            this.mParticleRander = null;
        }
        get Particles() {
            return this.mParticles;
        }
        get Ticks() {
            return this.mTicks;
        }
        get LastUpdateTime() {
            return this.mLastUpdateTime;
        }
        get UpdateTime() {
            return this.mUpdateTime;
        }
        AddParticle(particle) {
            this.mParticles.push(particle);
        }
        DispatchTouchEvent(_ev, _forced) {
        }
        DispatchMouseEvent(_ev, _forced) {
        }
        DispatchKeyboardEvent(_ev, _forced) {
        }
        OnRander(rc) {
            let r = this.getRectangle();
            rc.beginPath();
            rc.rect(r.x, r.y, r.w, r.h);
            rc.clip();
            if (this.mParticleRander) {
                let randerHook = this.mParticleRander;
                this.mParticles.forEach((particle) => { randerHook.call(this, rc, particle); });
            }
            else {
                this.mParticles.forEach((particle) => { particle.Render(rc); });
            }
        }
        Update(timestamp) {
            this.mUpdateTime = timestamp;
            if (!this.OnUpdate()) {
                let arr = this.mParticles;
                for (let p of arr) {
                    p.Update(timestamp);
                }
                let j = 0;
                for (let p of arr) {
                    if (p.active) {
                        arr[j++] = p;
                    }
                }
                arr.length = j;
            }
            ++this.mTicks;
            this.mLastUpdateTime = timestamp;
        }
        OnUpdate() {
            return false;
        }
    }
    ftk.ParticleSprite = ParticleSprite;
    class Particle {
        constructor(pa, x, y) {
            this.PA = pa;
            this.x = x;
            this.y = y;
            this.w = 0;
            this.h = 0;
            this.vx = 0;
            this.vy = 0;
            this.ax = 0;
            this.ay = 0;
            this.maxLife = 0;
            this.age = 0;
            this.exp = 0;
            this.gravity = 0.07;
            this.drag = 0.998;
            this.birth = -1;
            this.active = true;
        }
        Update(timestamp) {
            let r = this.PA.Box;
            if (this.active || r.isInside(this.x, this.y)) {
                if (this.birth < 0) {
                    this.birth = timestamp;
                }
                else {
                    this.age = timestamp - this.birth;
                }
                if (this.age >= this.maxLife) {
                    this.active = false;
                }
                this.vy += this.gravity + this.ay;
                this.vx += this.ax;
                if (this.drag !== 1) {
                    this.vx *= this.drag;
                }
                this.x += this.vx;
                this.y += this.vy;
                if (this.exp !== 0) {
                    this.w += this.exp;
                    this.h += this.exp;
                }
            }
        }
    }
    ftk.Particle = Particle;
})(ftk || (ftk = {}));
var ftk;
(function (ftk) {
    var ui;
    (function (ui) {
        class ProgressBar extends ftk.RectangleSprite {
            constructor(x, y, w, h, id) {
                super(x, y, w, h, id);
                this.Position = new ftk.Point(x, y);
                this.Resize(w, h);
                this.mValue = 0;
                this.mMin = 0;
                this.mMax = 100;
            }
            get Value() {
                return this.mValue;
            }
            set Value(value) {
                if (value < this.mMin) {
                    value = this.mMin;
                }
                if (value > this.mMax) {
                    value = this.mMax;
                }
                this.mValue = value;
            }
            get MaxValue() {
                return this.mMax;
            }
            set MaxValue(value) {
                if (value < this.mMin) {
                    value = this.mMin;
                }
                this.mMax = value;
            }
            get MinValue() {
                return this.mMin;
            }
            set MinValue(value) {
                if (value > this.mMax) {
                    value = this.mMax;
                }
                this.mMin = value;
            }
        }
        ui.ProgressBar = ProgressBar;
        class CircularProgressBar extends ProgressBar {
            constructor() {
                super(...arguments);
                this.mColor = new ftk.Color("#0F0");
            }
            OnRander(rc) {
                let box = this.Box;
                let r = Math.min(box.w, box.h) / 2;
                let xc = box.x + box.w / 2;
                let yc = box.y + box.h / 2;
                let end = this.Value / Math.abs(this.MaxValue - this.MinValue) * (2 * Math.PI);
                let bgn = this.mColor.Clone();
                let tscr = this.mColor.Clone();
                bgn.addLightness(-100);
                tscr.addLightness(100);
                rc.lineWidth = r / 6;
                rc.beginPath();
                rc.strokeStyle = bgn.toRGBAString();
                rc.arc(xc, yc, r, end, 2 * Math.PI);
                rc.stroke();
                rc.beginPath();
                rc.arc(xc, yc, r, 0, end);
                rc.strokeStyle = this.Color.toRGBAString();
                rc.stroke();
                let percentage = Math.floor(this.Value).toString() + '%';
                rc.textAlign = "center";
                rc.textBaseline = "middle";
                rc.font = (r / 3).toFixed(0) + "px bold Arial";
                rc.fillStyle = this.mColor.toRGBAString();
                rc.shadowColor = tscr.toRGBAString();
                rc.shadowBlur = ((r / 3));
                rc.fillText(percentage, xc, yc);
            }
            get Color() {
                return this.mColor;
            }
            set Color(value) {
                this.mColor = value;
            }
        }
        ui.CircularProgressBar = CircularProgressBar;
        class RectangularProgressBar extends ProgressBar {
            constructor() {
                super(...arguments);
                this.mColor = new ftk.Color("#0F0");
            }
            OnRander(rc) {
                let box = this.Box;
                let size = Math.max(box.w, box.h);
                let end = this.Value / Math.abs(this.MaxValue - this.MinValue) * size;
                let bgn = this.mColor.Clone();
                let tcr = this.mColor.Clone();
                let tscr = this.mColor.Clone();
                bgn.addLightness(-100);
                tcr.inverse();
                tscr.addLightness(100);
                rc.fillStyle = bgn.toRGBAString();
                rc.fillRect(box.x, box.y, box.w, box.h);
                rc.fillStyle = this.mColor.toRGBAString();
                if (box.w > box.h) {
                    rc.fillRect(box.x, box.y, end, box.h);
                }
                else {
                    rc.fillRect(box.x, box.y + (box.h - end), box.w, end);
                }
                let percentage = Math.floor(this.Value).toString() + '%';
                rc.textAlign = "center";
                rc.textBaseline = "middle";
                rc.font = (Math.min(box.w, box.h) * 0.8).toFixed(0) + "px bold Arial";
                rc.fillStyle = tcr.toRGBAString();
                rc.shadowColor = tscr.toRGBAString();
                rc.shadowBlur = (Math.min(box.w, box.h) * 0.2);
                rc.fillText(percentage, box.x + box.w / 2, box.y + box.h / 2);
            }
            get Color() {
                return this.mColor;
            }
            set Color(value) {
                this.mColor = value;
            }
        }
        ui.RectangularProgressBar = RectangularProgressBar;
    })(ui = ftk.ui || (ftk.ui = {}));
})(ftk || (ftk = {}));
var ftk;
(function (ftk) {
    class AbstractEngine extends ftk.EventEmitter {
        constructor(canvas) {
            super();
            this.mEngineUpdateEventArg = new ftk.EngineEvent(this, 0);
            this.mEngineRanderEventArg = new ftk.EngineEvent(this, null);
            canvas.addEventListener("mousedown", (ev) => { this.OnMouseDown(ev); });
            canvas.addEventListener("mouseup", (ev) => { this.OnMouseUp(ev); });
            canvas.addEventListener("mousemove", (ev) => { this.OnMouseMove(ev); });
            this.mCanvas = canvas;
            this.mRC = canvas.getContext("2d", { alpha: false });
            this.mOffscreenCanvas = AbstractEngine.createOffscreenCanvas(this.mCanvas.width, this.mCanvas.height);
            this.mOffscreenRC = this.mOffscreenCanvas.getContext("2d", { alpha: false });
            this.mRootNode = new ftk.Stage(canvas.width, canvas.height);
            this.mEventPrevTarget = null;
            this.mEventCaptured = false;
            this.mEventCaptureContext = undefined;
            this.mResourceManager = new ftk.ResourceDBEditor();
            this.mFrameRate = 60;
            this.mLastRanderDuration = 0;
            this.DebugInfoVisible = false;
        }
        get FrameRate() { return this.mFrameRate; }
        get ViewportWidth() { return this.mCanvas.width; }
        get ViewportHeight() { return this.mCanvas.height; }
        get Root() { return this.mRootNode; }
        get R() {
            return this.mResourceManager;
        }
        get LastRanderDuration() {
            return this.mLastRanderDuration;
        }
        Run() {
            this.mRC.clearRect(0, 0, this.ViewportWidth, this.ViewportHeight);
            this.StartLoop();
            this.OnRun();
        }
        Notify(source, name, broadcast, message) {
            let ev = new ftk.NoticeEvent(source, name, broadcast, message);
            let root = this.Root;
            if (broadcast) {
                root.DispatchNoticeEvent(ev, false);
            }
            this.emit(name, ev);
            return undefined;
        }
        setFrameRate(value) { this.mFrameRate = value; }
        StartLoop() {
            let lastUpdateTime = 0;
            let looper = (timestamp) => {
                let t = 1000 / this.FrameRate;
                if (timestamp - lastUpdateTime > t) {
                    this.MainLoop(timestamp);
                    lastUpdateTime = timestamp;
                }
                requestAnimationFrame(looper);
            };
            requestAnimationFrame(looper);
        }
        MainLoop(timestamp) {
            let root = this.Root;
            root.Update(timestamp);
            this.mEngineUpdateEventArg.Args = timestamp;
            this.emit("update", this.mEngineUpdateEventArg);
            this.Rander();
        }
        Rander() {
            let now = Date.now();
            let root = this.Root;
            this.mOffscreenRC.save();
            root.Rander(this.mOffscreenRC);
            this.mOffscreenRC.restore();
            this.mEngineRanderEventArg.Args = this.mOffscreenRC;
            this.emit('rander', this.mEngineRanderEventArg);
            this.mRC.drawImage(this.mOffscreenCanvas, 0, 0);
            this.mLastRanderDuration = Date.now() - now;
            if (this.DebugInfoVisible) {
                this.mRC.save();
                this.DrawDebugInfo(this.mRC);
                this.mRC.restore();
            }
        }
        createGMouseEvent(type, ev) {
            let rect = this.mCanvas.getBoundingClientRect();
            let gev = new ftk.GMouseEvent(this, type, ev.altKey, ev.ctrlKey, ev.shiftKey, ev.clientX - rect.left, ev.clientY - rect.top, ev.button, 0);
            if (this.mEventCaptured) {
                gev.CaptureContext = this.mEventCaptureContext;
            }
            return gev;
        }
        OnMouseEvent(type, ev) {
            let root = this.Root;
            let gev = this.createGMouseEvent(type, ev);
            root.DispatchMouseEvent(gev, false);
            if (gev.StopPropagation) {
                ev.stopPropagation();
            }
            if (gev.Target) {
                switch (gev.InputType) {
                    case ftk.InputEventType.MouseDown: {
                        this.emit("mousedown", gev);
                        break;
                    }
                    case ftk.InputEventType.MouseMove: {
                        if (this.mEventPrevTarget != gev.Target) {
                            if (this.mEventPrevTarget) {
                                let newev = this.createGMouseEvent(ftk.InputEventType.MouseLeave, ev);
                                this.mEventPrevTarget.DispatchMouseEvent(newev, true);
                                this.emit("mouselevae", newev);
                            }
                            if (gev.Target) {
                                let newev = this.createGMouseEvent(ftk.InputEventType.MouseEnter, ev);
                                gev.Target.DispatchMouseEvent(newev, true);
                                this.emit("mouseenter", newev);
                            }
                        }
                        this.emit("mousemove", gev);
                        break;
                    }
                    case ftk.InputEventType.MouseUp: {
                        this.emit("mouseup", gev);
                        break;
                    }
                }
            }
            if (this.mCanvas.style.cursor !== gev.Cursor) {
                this.mCanvas.style.cursor = gev.Cursor;
            }
            this.mEventPrevTarget = gev.Target;
            this.mEventCaptured = gev.Captured;
            this.mEventCaptureContext = gev.Captured ? gev.CaptureContext : undefined;
        }
        OnMouseDown(ev) {
            this.OnMouseEvent(ftk.InputEventType.MouseDown, ev);
        }
        OnMouseUp(ev) {
            this.OnMouseEvent(ftk.InputEventType.MouseUp, ev);
        }
        OnMouseMove(ev) {
            this.OnMouseEvent(ftk.InputEventType.MouseMove, ev);
        }
        static createOffscreenCanvas(width, height) {
            let globalThis = window;
            if (globalThis["OffscreenCanvas"]) {
                let OffscreenCanvas = globalThis["OffscreenCanvas"];
                return new OffscreenCanvas(width, height);
            }
            else {
                let OffscreenCanvas = document.createElement('canvas');
                OffscreenCanvas.width = width;
                OffscreenCanvas.height = height;
                return OffscreenCanvas;
            }
        }
    }
    ftk.AbstractEngine = AbstractEngine;
    class EngineLogoSprite extends ftk.RectangleSprite {
        constructor(x, y, w, h, id) {
            super(x, y, w, h, id);
            this.mColor0 = new ftk.Color(0xff0060ff);
            this.mColor1 = new ftk.Color(0xff0000ff);
            this.mShadowBlur = 5;
            this.BasePoint = new ftk.Point(w / 2, h / 2);
        }
        OnRander(rc) {
            let box = this.Box;
            this.DrawEngineLogo(rc, box.x, box.y, Math.min(box.w, box.h));
        }
        OnUpdate(timestamp) {
            this.mShadowBlur = Math.sin(timestamp / 300) * 15 + 20;
        }
        DrawEngineLogo(rc, x, y, size) {
            let r0 = size / 2;
            let r1 = r0 / 1.67;
            let xc = x + r0;
            let yc = y + r0;
            const astep = Math.PI / 3;
            rc.beginPath();
            let angle = astep;
            rc.moveTo(xc + r0, yc);
            for (let i = 1; i < 6; ++i) {
                rc.lineTo(xc + Math.cos(angle) * r0, yc + Math.sin(angle) * r0);
                angle += astep;
            }
            rc.closePath();
            rc.fillStyle = this.mColor0.toRGBAString();
            let shadowColor = new ftk.Color(rc.fillStyle);
            shadowColor.addLightness(0x50);
            rc.shadowColor = shadowColor.toRGBAString();
            rc.shadowBlur = this.mShadowBlur;
            rc.fill();
            rc.beginPath();
            angle = astep;
            rc.moveTo(xc + r1, yc);
            for (let i = 1; i < 6; ++i) {
                rc.lineTo(xc + Math.cos(angle) * r1, yc + Math.sin(angle) * r1);
                angle += astep;
            }
            rc.closePath();
            rc.shadowBlur = 0;
            rc.fillStyle = this.mColor1.toRGBAString();
            rc.fill();
            rc.beginPath();
            let x0 = xc + r0;
            let y0 = yc;
            let x1 = xc + r1;
            let y1 = yc;
            angle = astep;
            rc.moveTo(x1, y1);
            for (let i = 1; i < 7; ++i) {
                x1 = xc + Math.cos(angle) * r1;
                y1 = yc + Math.sin(angle) * r1;
                let nx = xc + Math.cos(angle) * r0;
                let ny = yc + Math.sin(angle) * r0;
                rc.lineTo(x1, y1);
                rc.lineTo(nx, ny);
                rc.lineTo(x0, y0);
                rc.moveTo(x1, y1);
                x0 = nx;
                y0 = ny;
                angle += astep;
            }
            rc.lineWidth = 0.8;
            rc.strokeStyle = "#fff";
            rc.stroke();
            rc.fillStyle = this.mColor1.toRGBAString();
            rc.strokeStyle = "#fff";
            rc.lineWidth = 0.5;
            rc.font = (size / 6).toString() + "px serif";
            rc.textBaseline = "middle";
            rc.textAlign = "center";
            rc.fillText("F T K", xc, yc);
            rc.strokeText("F T K", xc, yc);
        }
    }
    ftk.EngineLogoSprite = EngineLogoSprite;
    class EngineImpl extends AbstractEngine {
        constructor(options) {
            super(options.canvas);
            if (options.FrameRate) {
                this.setFrameRate(options.FrameRate);
            }
            if (!options.HideLogo) {
                this.AddEngineLogo();
            }
            if (!options.HideLoading) {
                this.AddLoadingProgressBar();
                this.addListener("loading", (ev) => {
                    let progress = ev.Args;
                    if (this.mLoadingProgressBar) {
                        this.mLoadingProgressBar.Value = progress;
                    }
                });
            }
            this.mRanderDurationList = Array();
            this.addListener("ready", () => {
                if (this.mBackgroundLayer) {
                    if (this.mLogo) {
                        this.mBackgroundLayer.RemoveNode(this.mLogo.Id);
                        this.mLogo = undefined;
                    }
                    if (this.mLoadingProgressBar) {
                        this.mBackgroundLayer.RemoveNode(this.mLoadingProgressBar.Id);
                        this.mLoadingProgressBar = undefined;
                    }
                    this.Root.RemoveLayer(this.mBackgroundLayer.Id);
                    this.mBackgroundLayer = undefined;
                }
            });
        }
        OnRun() {
            if (this.mLogo) {
                setTimeout(() => {
                    if (this.mLogo) {
                        this.mLogo.Visible = false;
                    }
                    if (this.mLoadingProgressBar) {
                        this.mLoadingProgressBar.Visible = true;
                    }
                    this._Start();
                }, 2000);
            }
            else {
                if (this.mLoadingProgressBar) {
                    this.mLoadingProgressBar.Visible = true;
                }
                this._Start();
            }
        }
        Shutdown() {
            this.emit("shutdown", new ftk.EngineEvent(this, null));
            this.R.Edit().Clear();
        }
        DrawDebugInfo(rc) {
            if (this.mRanderDurationList.length >= 32) {
                this.mRanderDurationList.shift();
            }
            this.mRanderDurationList.push(this.LastRanderDuration);
            let duration = 0;
            this.mRanderDurationList.forEach((v) => { duration += v; });
            duration = Math.ceil(duration / this.mRanderDurationList.length);
            rc.fillStyle = 'rgba(0,0,0,0.7)';
            rc.strokeStyle = 'rgba(80,80,80,0.7)';
            rc.fillRect(0, 0, 120, 70);
            rc.strokeRect(0, 0, 120, 70);
            rc.font = '16px serif';
            rc.fillStyle = '#FFFFFF';
            rc.textBaseline = 'top';
            rc.textAlign = 'start';
            rc.fillText('LDUT: ' + duration.toString() + ' ms', 10, 5, 120);
            rc.fillText('RFPS: ' + Math.ceil(1000 / (duration + 1)).toString(), 10, 25, 120);
            rc.fillText('SFPS: ' + this.FrameRate.toString(), 10, 45, 120);
        }
        _Start() {
            this.R.Edit().LoadAll((progress) => {
                this.emit("loading", new ftk.EngineEvent(this, progress));
            }).then(() => {
                this.emit("ready", new ftk.EngineEvent(this, null));
            }).catch((reason) => {
                this.emit("fault", new ftk.EngineEvent(this, reason));
            });
        }
        AddBackgroundLayer() {
            if (!this.mBackgroundLayer) {
                this.mBackgroundLayer = new ftk.ColoredLayer();
                this.mBackgroundLayer.BackgroundColor = new ftk.Color("#000");
                this.Root.AddLayer(this.mBackgroundLayer);
            }
            return this.mBackgroundLayer;
        }
        AddEngineLogo() {
            let size = Math.min(this.ViewportWidth, this.ViewportHeight) / 5;
            let x = (this.ViewportWidth - size) / 2;
            let y = (this.ViewportHeight - size) / 2;
            this.mLogo = new EngineLogoSprite(x, y, size, size);
            this.AddBackgroundLayer().AddNode(this.mLogo);
        }
        AddLoadingProgressBar() {
            let size = Math.min(this.ViewportWidth, this.ViewportHeight) / 5;
            let x = (this.ViewportWidth - size) / 2;
            let y = (this.ViewportHeight - size) / 2;
            this.mLoadingProgressBar = new ftk.ui.CircularProgressBar(x, y, size, size);
            this.mLoadingProgressBar.Visible = false;
            this.AddBackgroundLayer().AddNode(this.mLoadingProgressBar);
        }
    }
    let _EngineImpl = null;
    function LibrarySetup(options) {
        if (_EngineImpl) {
            throw Error("Libraries cannot be initialized more than once!");
        }
        _EngineImpl = new EngineImpl(options);
        ftk.Engine = _EngineImpl;
    }
    ftk.LibrarySetup = LibrarySetup;
    function LibraryShutdown() {
        if (_EngineImpl) {
            _EngineImpl.Shutdown();
        }
        _EngineImpl = null;
        ftk.Engine = undefined;
    }
    ftk.LibraryShutdown = LibraryShutdown;
})(ftk || (ftk = {}));
var ftk;
(function (ftk) {
    const PI_HALF = (Math.PI / 2);
    class Point {
        constructor(x, y) {
            this.x = x || 0;
            this.y = y || 0;
        }
        clone() {
            return new Point(this.x, this.y);
        }
        offset(x, y) {
            this.x += x;
            this.y += y;
        }
        setV(x, y) {
            if (x instanceof Point) {
                this.x = x.x;
                this.y = x.y;
            }
            else {
                this.x = x;
                this.y = y || 0;
            }
        }
        distance(a) {
            return Point.distance(this, a);
        }
        rotate(angle, basept) {
            let cosValue = Math.cos(angle);
            let sinValue = Math.sin(angle);
            let x = this.x - basept.x;
            let y = this.y - basept.y;
            this.x = basept.x + (x * cosValue - y * sinValue);
            this.y = basept.y + (x * sinValue + y * cosValue);
        }
        static distance(a, b) {
            let x = Math.abs(a.x - b.x);
            let y = Math.abs(a.y - b.y);
            return Math.sqrt((x * x + y * y));
        }
        static rotate(pt, angle, basept) {
            let p = pt.clone();
            p.rotate(angle, basept);
            return p;
        }
    }
    ftk.Point = Point;
    class Size {
        constructor(cx, cy) {
            this.cx = cx || 0;
            this.cy = cy || 0;
        }
        clone() {
            return new Size(this.cx, this.cy);
        }
    }
    ftk.Size = Size;
    class Rectangle {
        constructor(x, y, w, h) {
            if (x instanceof Point) {
                this.x = x.x;
                this.y = x.y;
                this.w = y.cx;
                this.h = y.cy;
            }
            else {
                this.x = x || 0;
                this.y = y || 0;
                this.w = w || 0;
                this.h = h || 0;
            }
        }
        clone() {
            return new Rectangle(this.x, this.y, this.w, this.h);
        }
        get left() {
            return this.x;
        }
        set left(value) {
            this.x = value;
        }
        get right() {
            return this.x + this.w;
        }
        set right(value) {
            this.w = value - this.x;
        }
        get top() {
            return this.y;
        }
        set top(value) {
            this.y = value;
        }
        get bottom() {
            return this.y + this.h;
        }
        set bottom(value) {
            this.h = value - this.y;
        }
        get center() {
            return new Point(this.x + this.w / 2, this.y + this.h / 2);
        }
        set center(value) {
            let ox = this.w / 2;
            let oy = this.h / 2;
            this.x = value.x - ox;
            this.y = value.y - oy;
        }
        get leftTop() {
            return new Point(this.x, this.y);
        }
        set leftTop(value) {
            this.x = value.x;
            this.y = value.y;
        }
        get size() {
            return new Size(this.w, this.h);
        }
        set size(value) {
            this.w = value.cx;
            this.h = value.cy;
        }
        get rightBottom() {
            return new Point(this.right, this.bottom);
        }
        set rightBottom(value) {
            this.right = value.x;
            this.bottom = value.y;
        }
        isPointInside(point) {
            return this.isInside(point.x, point.y);
        }
        isInside(x, y) {
            return x > this.x && (x < this.x + this.w)
                && y > this.y && (y < this.y + this.h);
        }
        isBoundary(point) {
            if (point.x > this.x && (point.x < this.x + this.w)) {
                return point.y === this.y || point.y === this.bottom;
            }
            else if (point.x > this.x && (point.x < this.x + this.w)) {
                return point.x === this.x || point.x === this.right;
            }
            return false;
        }
        isInsideOrBoundary(point) {
            return point.x >= this.x && (point.x <= this.x + this.w)
                && point.y >= this.y && (point.y <= this.y + this.h);
        }
        isIntersect(r) {
            return Rectangle.isIntersect(this, r);
        }
        offset(x, y) {
            this.x += x;
            this.y += y;
        }
        expand(value) {
            this.x -= value;
            this.y -= value;
            this.w += value;
            this.h += value;
        }
        normalize() {
            let x = 0;
            let w = 0;
            let y = 0;
            let h = 0;
            if (this.w < 0) {
                x = this.x + this.w;
                w = -this.w;
            }
            else {
                x = this.x;
                w = this.w;
            }
            if (this.h < 0) {
                y = this.y + this.h;
                h = -this.h;
            }
            else {
                y = this.y;
                h = this.h;
            }
            this.x = x;
            this.y = y;
            this.w = w;
            this.h = h;
        }
        HitTest(point, tolerance) {
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
        union(a) {
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
        intersection(r1, r2) {
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
        static isIntersect(r0, r1) {
            let a = r0.leftTop;
            let b = r0.rightBottom;
            let c = r1.leftTop;
            let d = r1.rightBottom;
            return (Math.min(a.x, b.x) <= Math.max(c.x, d.x)
                && Math.min(c.y, d.y) <= Math.max(a.y, b.y)
                && Math.min(c.x, d.x) <= Math.max(a.x, b.x)
                && Math.min(a.y, b.y) <= Math.max(c.y, d.y));
        }
        static normalize(a) {
            let x = 0;
            let w = 0;
            let y = 0;
            let h = 0;
            if (a.w < 0) {
                x = a.x + a.w;
                w = -a.w;
            }
            else {
                x = a.x;
                w = a.w;
            }
            if (a.h < 0) {
                y = a.y + a.h;
                h = -a.h;
            }
            else {
                y = a.y;
                h = a.h;
            }
            return new Rectangle(x, y, w, h);
        }
        static union(a, b) {
            let r1 = Rectangle.normalize(a);
            let r2 = Rectangle.normalize(b);
            let startX = r1.x < r2.x ? r1.x : r2.x;
            let endX = r1.right > r2.right ? r1.right : r2.right;
            let startY = r1.y < r2.y ? r1.y : r2.y;
            let endY = r1.bottom > r2.bottom ? r1.bottom : r2.bottom;
            return new Rectangle(startX, startY, endX - startX, endY - startY);
        }
        static intersection(r1, r2) {
            let merge = Rectangle.union(r1, r2);
            let startX = r1.x == merge.x ? r2.x : r1.x;
            let endX = r1.right == merge.right ? r2.right : r1.right;
            let startY = r1.y == merge.y ? r2.y : r1.y;
            let endY = r1.bottom == merge.bottom ? r2.bottom : r1.bottom;
            return new Rectangle(startX, startY, endX - startX, endY - startY);
        }
    }
    ftk.Rectangle = Rectangle;
    class LineSegment {
        constructor(sx, sy, ex, ey) {
            if (sx instanceof Point && sy instanceof Point) {
                this.start = sx.clone();
                this.end = sy.clone();
            }
            else if (sx && sy && ex && ey) {
                this.start = new Point(sx, sy);
                this.end = new Point(ex, ey);
            }
            else {
                this.start = new Point(0, 0);
                this.end = new Point(0, 0);
            }
        }
        clone() {
            return new LineSegment(this.start, this.end);
        }
        isInLine(point) {
            return LineSegment.isInLine(point, this);
        }
        HitTest(point, tolerance) {
            return LineSegment.isInLineR(point, tolerance, this);
        }
        isIntersect(l) {
            return LineSegment.isIntersect(this, l);
        }
        get angle() {
            return Math.atan2(this.end.y - this.start.y, this.end.x - this.start.x);
        }
        angleBetween(a) {
            return LineSegment.angleBetween(this, a);
        }
        get box() {
            let r = new Rectangle(this.start.x, this.start.y, this.end.x - this.start.x, this.end.y - this.start.y);
            r.normalize();
            return r;
        }
        get center() {
            return new Point(this.start.x + ((this.end.x - this.start.x) / 2), this.start.y + ((this.end.y - this.start.y) / 2));
        }
        static isInLineEx(point, lstart, lend) {
            return (((point.x - lstart.x) * (lstart.y - lend.y)) == ((lstart.x - lend.x) * (point.y - lstart.y))
                && (point.x >= Math.min(lstart.x, lend.x) && point.x <= Math.max(lstart.x, lend.x))
                && ((point.y >= Math.min(lstart.y, lend.y)) && (point.y <= Math.max(lstart.y, lend.y))));
        }
        static isInLine(point, line) {
            return LineSegment.isInLineEx(point, line.start, line.end);
        }
        static isInLineR(o, r, line) {
            let a;
            let b;
            let c;
            let dist1;
            let dist2;
            let angle1;
            let angle2;
            if (line.start.x === line.end.x) {
                a = 1;
                b = 0;
                c = -line.start.x;
            }
            else if (line.start.y === line.end.y) {
                a = 0;
                b = 1;
                c = -line.start.y;
            }
            else {
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
        static isIntersect(l0, l1) {
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
        static angleBetween(a, b) {
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
    }
    ftk.LineSegment = LineSegment;
    class Circle {
        constructor(x, y, radius) {
            if (x instanceof Point) {
                this.center = x.clone();
                this.radius = y;
            }
            else if (typeof (x) === "number") {
                this.center = new Point(x, y);
                this.radius = radius;
            }
            else {
                this.center = new Point();
                this.radius = 0;
            }
        }
        clone() {
            return new Circle(this.center, this.radius);
        }
        isInside(point) {
            return Point.distance(this.center, point) < this.radius;
        }
        isBoundary(point) {
            return Point.distance(this.center, point) === this.radius;
        }
        isInsideOrBoundary(point) {
            return Point.distance(this.center, point) <= this.radius;
        }
        isIntersect(a) {
            return Circle.isIntersect(this, a);
        }
        get box() {
            let s = this.radius + this.radius;
            return new Rectangle(this.center.x - this.radius, this.center.y - this.radius, s, s);
        }
        static isIntersect(a, b) {
            let d = Point.distance(a.center, b.center);
            return d < a.radius || d < b.radius;
        }
    }
    ftk.Circle = Circle;
    class Polygon {
        constructor(vertexs) {
            let vs = new Array();
            if (vertexs) {
                for (let v of vertexs) {
                    vs.push(v.clone());
                }
            }
            this.mVertexs = vs;
            this.closed = true;
        }
        get vertexs() {
            return this.mVertexs;
        }
        get gravity() {
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
        get box() {
            let vs = this.mVertexs;
            if (vs.length == 0) {
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
        set box(value) {
            let b = this.box;
            let ofsx = value.x - b.x;
            let ofsy = value.y - b.y;
            if (value.w === b.w && value.h === b.h) {
                for (let v of this.mVertexs) {
                    v.x += ofsx;
                    v.y += ofsy;
                }
            }
            else {
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
        get center() {
            return this.box.center;
        }
        clone() {
            return new Polygon(this.mVertexs);
        }
        isBoundary(point) {
            return Polygon.isBoundary(point, this);
        }
        isInPolygon(point) {
            return Polygon.isInPolygon(point, this);
        }
        appendVertex(...points) {
            points.forEach((point) => {
                this.mVertexs.push(point.clone());
            });
        }
        popVertex() {
            return this.mVertexs.pop();
        }
        insertVertex(index, ...points) {
            this.mVertexs.splice(index, 0, ...points);
        }
        removeVertex(index, count) {
            this.mVertexs.splice(index, count);
        }
        static isBoundary(point, p) {
            let count = p.mVertexs.length - 1;
            for (let i = 0; i < count; ++i) {
                if (LineSegment.isInLineEx(point, p.mVertexs[i], p.mVertexs[i + 1])) {
                    return true;
                }
            }
            return false;
        }
        static isInPolygon(point, p) {
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
    }
    ftk.Polygon = Polygon;
    class Vector {
        constructor(x, y) {
            this.x = x || 0;
            this.y = y || 0;
        }
        get isZero() {
            return this.x === 0 && this.x === this.y;
        }
        get slope() {
            return this.y / this.x;
        }
        get angle() {
            return Math.atan2(this.y, this.x);
        }
        get length() {
            return Math.sqrt(this.lengthQ);
        }
        set length(value) {
            let a = this.angle;
            this.x = Math.cos(a) * value;
            this.y = Math.sin(a) * value;
        }
        get normalized() {
            return this.lengthQ == 1;
        }
        get lengthQ() {
            return this.x * this.x + this.y * this.y;
        }
        clone() {
            return new Vector(this.x, this.y);
        }
        setV(x, y) {
            if (x instanceof Vector) {
                this.x = x.x;
                this.y = x.y;
            }
            else {
                this.x = x;
                this.y = y || 0;
            }
        }
        add(v) {
            this.x += v.x;
            this.y += v.y;
        }
        sub(v) {
            this.x -= v.x;
            this.y -= v.y;
        }
        mul(v) {
            this.x *= v;
            this.y *= v;
        }
        div(v) {
            this.x /= v;
            this.y /= v;
        }
        cross(v) {
            return this.x * v.y - this.y * v.x;
        }
        dot(v) {
            return this.x * v.y + this.y * v.x;
        }
        inner(v) {
            return this.x * v.x + this.y * v.y;
        }
        epointual(v) {
            return this.x == v.x && this.y == v.y;
        }
        normalize() {
            let l = this.length;
            this.div(l);
        }
        zero() {
            this.x = 0;
            this.y = 0;
        }
        reverse() {
            this.x = -this.x;
            this.y = -this.y;
        }
        rotate(angle) {
            let cosValue = Math.cos(angle);
            let sinValue = Math.sin(angle);
            let x = this.x;
            let y = this.y;
            this.x = x * cosValue - y * sinValue;
            this.y = x * sinValue + y * cosValue;
        }
        isColinear() {
            return this.slope === this.slope;
        }
        static add(a, b) {
            return new Vector(a.x + b.x, a.y + b.y);
        }
        static sub(a, b) {
            return new Vector(a.x - b.x, a.y - b.y);
        }
        static mul(v, scalar) {
            return new Vector(v.x * scalar, v.y * scalar);
        }
        static div(v, scalar) {
            return new Vector(v.x / scalar, v.y / scalar);
        }
        static cross(a, b) {
            return a.x * b.y - a.y * b.x;
        }
        static dot(a, b) {
            return a.x * b.y + a.y * b.x;
        }
        static inner(a, b) {
            return a.x * b.x + a.y * b.y;
        }
        static epointual(a, b) {
            return a.x == b.x && a.y == b.y;
        }
        static angleBetween(a, b) {
            return Math.atan2(Vector.cross(a, b), Vector.dot(a, b));
        }
        static perpendicular(a, b) {
            return (!a.isZero) && (!b.isZero) && Vector.inner(a, b) === 0;
        }
        static isColinear(a, b) {
            return a.slope === b.slope;
        }
    }
    ftk.Vector = Vector;
})(ftk || (ftk = {}));
var ftk;
(function (ftk) {
    let ResourceType;
    (function (ResourceType) {
        ResourceType[ResourceType["Image"] = 0] = "Image";
        ResourceType[ResourceType["Video"] = 1] = "Video";
        ResourceType[ResourceType["Audio"] = 2] = "Audio";
        ResourceType[ResourceType["Text"] = 3] = "Text";
        ResourceType[ResourceType["Blob"] = 4] = "Blob";
        ResourceType[ResourceType["Raw"] = 5] = "Raw";
    })(ResourceType = ftk.ResourceType || (ftk.ResourceType = {}));
    class Resource {
        constructor(url, name) {
            if (!name) {
                let urlArr = url.split('?');
                if (urlArr.length == 1) {
                    urlArr = url.split('#');
                }
                name = urlArr[0];
            }
            this.mName = name;
            this.mLoaded = false;
            this.mURL = url;
        }
        get Url() { return this.mURL; }
        get Name() {
            return this.mName;
        }
        get Loaded() {
            return this.mLoaded;
        }
        Load() {
            return new Promise((resolve, reject) => {
                if (this.Loaded) {
                    resolve();
                }
                this.OnLoad(resolve, reject);
            });
        }
        setLoaded(value) {
            this.mLoaded = value;
        }
    }
    ftk.Resource = Resource;
    class ImageResource extends Resource {
        constructor(url, name) {
            super(url, name);
            this.mImage = new Image();
        }
        get Type() { return ResourceType.Image; }
        get Image() {
            return this.mImage;
        }
        OnLoad(resolve, reject) {
            this.mImage.onload = () => {
                this.setLoaded(true);
                resolve();
            };
            this.mImage.onerror = (ev) => { reject(ev); };
            this.mImage.src = this.Url;
        }
    }
    ftk.ImageResource = ImageResource;
    class AudioResource extends Resource {
        constructor(url, name) {
            super(url, name);
            this.mAudio = new Audio();
            this.mAudio.autoplay = false;
            this.mAudio.controls = false;
            this.mAudio.loop = false;
        }
        get Type() { return ResourceType.Audio; }
        get Audio() {
            return this.mAudio;
        }
        OnLoad(resolve, reject) {
            this.mAudio.oncanplaythrough = () => {
                this.setLoaded(true);
                resolve();
            };
            this.mAudio.onerror = (ev) => { reject(ev); };
            this.mAudio.src = this.Url;
            this.mAudio.load();
        }
    }
    ftk.AudioResource = AudioResource;
    class VideoResource extends Resource {
        constructor(url, name) {
            super(url, name);
            this.mVideo = document.createElement("video");
            this.mVideo.autoplay = false;
            this.mVideo.controls = false;
            this.mVideo.loop = false;
        }
        get Type() { return ResourceType.Audio; }
        get Video() {
            return this.mVideo;
        }
        OnLoad(resolve, reject) {
            this.mVideo.oncanplay = () => {
                this.setLoaded(true);
                resolve();
            };
            this.mVideo.onerror = (ev) => { reject(ev); };
            this.mVideo.src = this.Url;
            this.mVideo.load();
        }
    }
    ftk.VideoResource = VideoResource;
    class TextResource extends Resource {
        constructor(url, name) {
            super(url, name);
            this.mData = "";
        }
        get Type() { return ResourceType.Text; }
        get Text() {
            return this.mData;
        }
        OnLoad(resolve, reject) {
            let xhr = new XMLHttpRequest();
            xhr.onload = () => {
                this.mData = xhr.responseText;
                this.setLoaded(true);
                resolve();
            };
            xhr.onerror = (ev) => { reject(ev); };
            xhr.onabort = (ev) => { reject(ev); };
            xhr.responseType = "text";
            xhr.open("GET", this.Url, true);
        }
    }
    ftk.TextResource = TextResource;
    class BlobResource extends Resource {
        constructor(url, name) {
            super(url, name);
            this.mData = new Blob();
        }
        get Type() { return ResourceType.Blob; }
        get Data() {
            return this.mData;
        }
        OnLoad(resolve, reject) {
            let xhr = new XMLHttpRequest();
            xhr.onload = () => {
                this.mData = xhr.response;
                this.setLoaded(true);
                resolve();
            };
            xhr.onerror = (ev) => { reject(ev); };
            xhr.onabort = (ev) => { reject(ev); };
            xhr.responseType = "blob";
            xhr.open("GET", this.Url, true);
        }
    }
    ftk.BlobResource = BlobResource;
    class RawResource extends Resource {
        constructor(url, name) {
            super(url, name);
            this.mData = new ArrayBuffer(0);
        }
        get Type() { return ResourceType.Raw; }
        get Data() {
            return this.mData;
        }
        OnLoad(resolve, reject) {
            let xhr = new XMLHttpRequest();
            xhr.onload = () => {
                let buffer = xhr.response;
                this.mData = buffer;
                this.setLoaded(true);
                resolve();
            };
            xhr.onerror = (ev) => { reject(ev); };
            xhr.onabort = (ev) => { reject(ev); };
            xhr.responseType = "arraybuffer";
            xhr.open("GET", this.Url, true);
        }
    }
    ftk.RawResource = RawResource;
    class ResourceDBEditor {
        constructor() {
            this.mResourceList = new Map();
        }
        Add(resource) {
            this.mResourceList.set(resource.Name, resource);
            return this;
        }
        Clear() {
            this.mResourceList.clear();
        }
        Remove(name) {
            return this.mResourceList.delete(name);
        }
        Get(name) {
            return this.mResourceList.get(name);
        }
        Has(name) {
            return this.mResourceList.has(name);
        }
        GetImage(name) {
            let r = this.Get(name);
            if (!r) {
                return r;
            }
            if (r instanceof ImageResource) {
                return r;
            }
            return undefined;
        }
        GetAudio(name) {
            let r = this.Get(name);
            if (!r) {
                return r;
            }
            if (r instanceof AudioResource) {
                return r;
            }
            return undefined;
        }
        GetVideo(name) {
            let r = this.Get(name);
            if (!r) {
                return r;
            }
            if (r instanceof VideoResource) {
                return r;
            }
            return undefined;
        }
        LoadAll(progressHandler) {
            let total = 0;
            let count = 0;
            if (progressHandler) {
                progressHandler(0);
            }
            return new Promise((resolve, reject) => {
                let list = new Array();
                this.mResourceList.forEach((r) => {
                    if (!r.Loaded) {
                        let p = r.Load();
                        if (progressHandler) {
                            p.then(() => {
                                ++count;
                                progressHandler((count * 100) / total);
                            }).catch((reason) => {
                                let msg = 'load resource [' + r.Name + '] : ';
                                if (reason) {
                                    msg += reason.toString();
                                }
                                reject(msg);
                            });
                        }
                        list.push(p);
                        ++total;
                    }
                });
                Promise.all(list).then(() => {
                    resolve();
                }).catch((reason) => {
                    reject(reason);
                });
            });
        }
        forEach(callback) {
            this.mResourceList.forEach((r) => {
                callback(r);
            });
        }
        Edit() {
            return this;
        }
    }
    ftk.ResourceDBEditor = ResourceDBEditor;
})(ftk || (ftk = {}));
var ftk;
(function (ftk) {
    class ImageSprite extends ftk.RectangleSprite {
        constructor(resource, w, h, id) {
            super(0, 0, 0, 0, id);
            if (resource) {
                this.mImage = resource;
            }
            else {
                this.mImage = new ftk.ImageResource("");
            }
            if (w && h) {
                this.Resize(w, h);
            }
            else {
                this.Resize(this.mImage.Image.naturalWidth, this.mImage.Image.naturalHeight);
            }
            let size = this.Box.size;
            this.BasePoint = new ftk.Point(size.cx / 2, size.cy / 2);
        }
        get Resource() {
            return this.mImage;
        }
        set Resource(value) {
            this.mImage = value;
        }
        OnRander(rc) {
            let image = this.Resource.Image;
            let box = this.Box;
            rc.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, box.x, box.y, box.w, box.h);
        }
    }
    ftk.ImageSprite = ImageSprite;
})(ftk || (ftk = {}));
var ftk;
(function (ftk) {
    class Layer {
        constructor() {
            this.mID = ftk.utility.GenerateIDString(32);
            this.mNodes = new Array();
            this.mVisible = true;
            this.mEventTransparent = true;
            this.mUpdateForHide = false;
        }
        get Id() {
            return this.mID;
        }
        get Visible() {
            return this.mVisible;
        }
        set Visible(value) {
            this.mVisible = value;
        }
        get UpdateForHide() {
            return this.mUpdateForHide;
        }
        set UpdateForHide(value) {
            this.mUpdateForHide = value;
        }
        get EventTransparent() {
            return this.mEventTransparent;
        }
        set EventTransparent(value) {
            this.mEventTransparent = value;
        }
        AddNode(node) {
            this.mNodes.push(node);
            return this;
        }
        RemoveNode(id) {
            for (let i = 0; i < this.mNodes.length; ++i) {
                if (this.mNodes[i].Id === id) {
                    this.mNodes.splice(i--, 1);
                }
            }
            return this;
        }
        GetNode(id) {
            for (let n of this.mNodes) {
                if (n.Id === id) {
                    return n;
                }
            }
            return undefined;
        }
        forEach(callback) {
            this.mNodes.forEach(callback);
        }
        Sort(compareCallback) {
            this.mNodes.sort(compareCallback);
        }
        Rander(rc) {
            if (!this.Visible) {
                return;
            }
            for (let i = this.mNodes.length - 1; i >= 0; --i) {
                this.mNodes[i].Rander(rc);
            }
        }
        DispatchTouchEvent(ev, forced) {
            if (this.Visible) {
                if (!this.EventTransparent) {
                    ev.Target = this;
                    ev.StopPropagation = true;
                }
                for (let n of this.mNodes) {
                    n.DispatchTouchEvent(ev, forced);
                    if (ev.StopPropagation) {
                        break;
                    }
                }
            }
        }
        DispatchMouseEvent(ev, forced) {
            if (this.Visible) {
                if (!this.EventTransparent) {
                    ev.Target = this;
                    ev.StopPropagation = true;
                }
                for (let n of this.mNodes) {
                    n.DispatchMouseEvent(ev, forced);
                    if (ev.StopPropagation) {
                        break;
                    }
                }
            }
        }
        DispatchKeyboardEvent(ev, forced) {
            if (this.Visible) {
                if (!this.EventTransparent) {
                    ev.Target = this;
                    ev.StopPropagation = true;
                }
                for (let n of this.mNodes) {
                    n.DispatchKeyboardEvent(ev, forced);
                    if (ev.StopPropagation) {
                        break;
                    }
                }
            }
        }
        DispatchNoticeEvent(ev, forced) {
            for (let n of this.mNodes) {
                n.DispatchNoticeEvent(ev, forced);
                if (ev.StopPropagation) {
                    break;
                }
            }
        }
        Update(timestamp) {
            if (this.Visible || this.UpdateForHide) {
                this.forEach((node) => {
                    node.Update(timestamp);
                });
            }
        }
    }
    ftk.Layer = Layer;
    class ColoredLayer extends Layer {
        constructor() {
            super();
            this.mBackgroundColor = new ftk.Color("#00F");
        }
        get BackgroundColor() {
            return this.mBackgroundColor;
        }
        set BackgroundColor(value) {
            this.mBackgroundColor = value.Clone();
        }
        Rander(rc) {
            rc.fillStyle = this.BackgroundColor.toRGBAString();
            rc.fillRect(0, 0, rc.canvas.width, rc.canvas.height);
            super.Rander(rc);
        }
    }
    ftk.ColoredLayer = ColoredLayer;
    class BackgroundImageLayer extends Layer {
        constructor() {
            super();
            this.mBackgroundImage = new ftk.ImageResource("");
            this.mRepeatStyle = "stretch";
        }
        get BackgroundImage() {
            return this.mBackgroundImage;
        }
        set BackgroundImage(value) {
            this.mBackgroundImage = value;
        }
        get RepeatStyle() {
            return this.mRepeatStyle;
        }
        set RepeatStyle(value) {
            this.mRepeatStyle = value;
        }
        Rander(rc) {
            let image = this.BackgroundImage.Image;
            let style = this.RepeatStyle;
            if (style === "stretch") {
                rc.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, 0, 0, rc.canvas.width, rc.canvas.height);
            }
            else if (style === "fit-stretch") {
                let fitRatioX = image.naturalWidth / rc.canvas.width;
                let fitRatioY = image.naturalHeight / rc.canvas.height;
                let fitratio = Math.min(fitRatioX, fitRatioY);
                let w = image.naturalWidth * fitratio;
                let h = image.naturalHeight * fitratio;
                let x = (rc.canvas.width - w) / 2;
                let y = (rc.canvas.height - h) / 2;
                rc.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, x, y, w, h);
            }
            else if (style === "center") {
                let x = (rc.canvas.width - image.naturalWidth) / 2;
                let y = (rc.canvas.height - image.naturalHeight) / 2;
                rc.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, x, y, image.naturalWidth, image.naturalHeight);
            }
            else if (style === "none") {
                rc.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, 0, 0, image.naturalWidth, image.naturalHeight);
            }
            else {
                let pattern = rc.createPattern(image, 'repeat');
                let oldfs = rc.fillStyle;
                rc.fillStyle = pattern;
                rc.fillRect(0, 0, rc.canvas.width, rc.canvas.height);
                rc.fillStyle = oldfs;
            }
            super.Rander(rc);
        }
    }
    ftk.BackgroundImageLayer = BackgroundImageLayer;
})(ftk || (ftk = {}));
var ftk;
(function (ftk) {
    var net;
    (function (net) {
        class Channel extends ftk.EventEmitter {
            constructor(options) {
                super();
                this.mSocket = null;
                this.mReconnectInterval = options.reconnectInterval;
                this.mMaxReconnectCount = options.maxReconnectCount ? options.maxReconnectCount : 0;
                this.mReconnectCount = 0;
                this.mCloseing = false;
                this.mWaitingQueue = new Array();
                this.connect(options.url, options.protocols);
            }
            get Connected() {
                return (!this.mCloseing) && (this.mSocket !== null) && (this.mSocket.readyState === WebSocket.OPEN);
            }
            get WaitingQueueLength() {
                return this.mWaitingQueue.length;
            }
            SendMessage(data) {
                if (this.mSocket && this.Connected) {
                    this.mSocket.send(data);
                }
                else {
                    if (this.mCloseing) {
                        this.emit('error', "Can't try an operation on an unrecoverable channel.");
                    }
                    else {
                        if (this.mWaitingQueue.length > 1024 * 8) {
                            this.mWaitingQueue.shift();
                        }
                        this.mWaitingQueue.push(data);
                    }
                }
            }
            connect(url, protocols) {
                this._Close();
                this.mSocket = new WebSocket(url, protocols);
                this.mSocket.binaryType = "arraybuffer";
                this.mSocket.onclose = (ev) => {
                    if (ev.code !== 255) {
                        this.reconnect(url, protocols);
                    }
                };
                this.mSocket.onerror = () => {
                    if ((!this.mSocket) || this.mSocket.readyState != WebSocket.OPEN) {
                        this.reconnect(url, protocols);
                    }
                };
                this.mSocket.onmessage = (ev) => {
                    this.OnMessageHandle(ev.data);
                };
                this.mSocket.onopen = () => {
                    this.mReconnectCount = 0;
                    let s = this.mSocket;
                    this.mWaitingQueue.forEach((buffer) => {
                        s.send(buffer);
                    });
                    this.mWaitingQueue.length = 0;
                };
            }
            reconnect(url, protocols) {
                if (this.mMaxReconnectCount > 0 && (++this.mReconnectCount > this.mMaxReconnectCount)) {
                    this.Close();
                    this.emit('error', 'Reconnect exceeds maximum number.');
                }
                else {
                    setTimeout(() => {
                        this.emit('reconnect', this.mReconnectCount);
                        if (!this.mCloseing) {
                            this.connect(url, protocols);
                        }
                    }, this.mReconnectInterval);
                }
            }
            _Close() {
                if (this.mSocket) {
                    this.mSocket.onclose = null;
                    this.mSocket.onerror = null;
                    this.mSocket.onmessage = null;
                    this.mSocket.onopen = null;
                    if (this.mSocket.readyState !== WebSocket.CLOSED) {
                        this.mSocket.close(255, "call close function");
                    }
                }
            }
            Close() {
                this.mCloseing = true;
                this.mWaitingQueue.length = 0;
                this._Close();
            }
        }
        net.Channel = Channel;
        class StringChannel extends Channel {
            Send(data) {
                this.SendMessage(data);
            }
            OnMessageHandle(data) {
                if (data instanceof ArrayBuffer) {
                    this.emit('message', ftk.utility.UTF8BufferDecode(data));
                }
                else {
                    this.emit('message', data);
                }
            }
        }
        net.StringChannel = StringChannel;
        class JsonChannel extends Channel {
            Send(data) {
                this.SendMessage(JSON.stringify(data));
            }
            OnMessageHandle(data) {
                let json;
                try {
                    if (data instanceof ArrayBuffer) {
                        json = JSON.parse(ftk.utility.UTF8BufferDecode(data));
                    }
                    else {
                        json = JSON.parse(data);
                    }
                }
                catch (ex) {
                    this.emit('error', "Unexpected end of JSON input");
                    return;
                }
                this.emit('message', json);
            }
        }
        net.JsonChannel = JsonChannel;
        class ArrayBufferChannel extends Channel {
            Send(data) {
                if (data instanceof ArrayBuffer) {
                    this.SendMessage(data);
                }
                else if (ArrayBuffer.isView(data)) {
                    this.SendMessage(data);
                }
                else if (data || typeof (data) !== 'undefined' || data !== null) {
                    this.SendMessage(ftk.utility.UTF8BufferEncode(data.toString()));
                }
            }
            OnMessageHandle(data) {
                if (data instanceof ArrayBuffer) {
                    this.emit('message', data);
                }
                else {
                    this.emit('message', ftk.utility.UTF8BufferEncode(data));
                }
            }
        }
        net.ArrayBufferChannel = ArrayBufferChannel;
    })(net = ftk.net || (ftk.net = {}));
})(ftk || (ftk = {}));
var ftk;
(function (ftk) {
    class Shape extends ftk.Sprite {
        constructor(id) {
            super(id);
            this.LineWidth = 1;
            this.ForegroundColor = new ftk.Color(0, 0, 0);
            this.BackgroundColor = new ftk.Color(0, 0, 255);
            this.BorderColor = new ftk.Color(255, 255, 255);
            this.Text = undefined;
        }
        OnRander(rc) {
            rc.lineWidth = this.LineWidth;
            rc.fillStyle = this.BackgroundColor.toRGBAString();
            rc.strokeStyle = this.BorderColor.toRGBAString();
            this.OnDrawShape(rc);
            if (this.Text && this.Text.length > 0) {
                rc.textAlign = 'center';
                rc.textBaseline = 'middle';
                rc.fillStyle = this.ForegroundColor.toRGBAString();
                let c = this.getRectangle().center;
                rc.fillText(this.Text, c.x, c.y);
            }
        }
    }
    ftk.Shape = Shape;
    class LineShape extends Shape {
        constructor(start, end, id) {
            super(id);
            this.mLine = new ftk.LineSegment(start, end);
        }
        PickTest(point) {
            return this.mLine.HitTest(point, 5);
        }
        getRectangle() {
            let r = new ftk.Rectangle(this.mLine.start, new ftk.Size(this.mLine.end.x - this.mLine.start.x, this.mLine.end.y - this.mLine.start.y));
            r.normalize();
            return r;
        }
        setRectangle(value) {
            let r = value.clone();
            r.normalize();
            let s = this.mLine.start;
            let e = this.mLine.end;
            let p = r.rightBottom;
            if (s.x < e.x) {
                s.x = r.x;
                e.x = p.x;
            }
            else {
                s.x = p.x;
                e.x = r.x;
            }
            if (s.y < e.y) {
                s.y = r.y;
                e.y = p.y;
            }
            else {
                s.y = p.y;
                e.y = r.y;
            }
        }
        OnDrawShape(rc) {
            rc.beginPath();
            rc.moveTo(this.mLine.start.x, this.mLine.start.y);
            rc.lineTo(this.mLine.end.x, this.mLine.end.y);
            rc.stroke();
        }
    }
    ftk.LineShape = LineShape;
    class RectangleShape extends Shape {
        constructor(x, y, w, h, id) {
            super(id);
            this.mRectangle = new ftk.Rectangle(x, y, w, h);
        }
        getRectangle() {
            return this.mRectangle;
        }
        setRectangle(value) {
            if (this.mRectangle !== value) {
                this.mRectangle = value;
            }
            this.mRectangle.normalize();
        }
        OnDrawShape(rc) {
            let r = this.getRectangle();
            rc.fillRect(r.x, r.y, r.w, r.h);
            rc.strokeRect(r.x, r.y, r.w, r.h);
        }
    }
    ftk.RectangleShape = RectangleShape;
    class PolygonShape extends Shape {
        constructor(vertexs, id) {
            super(id);
            this.mPolygon = new ftk.Polygon(vertexs);
        }
        PickTest(point) {
            return this.mPolygon.isInPolygon(point);
        }
        getRectangle() {
            return this.mPolygon.box;
        }
        setRectangle(value) {
            let r = value;
            r.normalize();
            this.mPolygon.box = r;
        }
        OnDrawShape(rc) {
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
    ftk.PolygonShape = PolygonShape;
    class EPolygonShape extends PolygonShape {
        constructor(x, y, radius, side, id) {
            super(EPolygonShape.getVertexs(x, y, radius, side), id);
        }
        static getVertexs(x, y, radius, side) {
            const astep = (Math.PI + Math.PI) / side;
            let angle = 0;
            let vertexs = [];
            for (let i = 0; i < side; ++i) {
                vertexs.push(new ftk.Point(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius));
                angle += astep;
            }
            return vertexs;
        }
    }
    ftk.EPolygonShape = EPolygonShape;
    class CircleShape extends Shape {
        constructor(x, y, radius, id) {
            super(id);
            this.mCircle = new ftk.Circle(x, y, radius);
        }
        PickTest(point) {
            return this.mCircle.isInsideOrBoundary(point);
        }
        getRectangle() {
            return this.mCircle.box;
        }
        setRectangle(value) {
            let r = value;
            r.normalize();
            let radius = Math.min(r.w, r.h) / 2;
            this.mCircle.center = r.center;
            this.mCircle.radius = radius;
        }
        OnDrawShape(rc) {
            let c = this.mCircle.center;
            rc.beginPath();
            rc.arc(c.x, c.y, this.mCircle.radius, 0, Math.PI + Math.PI);
            rc.closePath();
            rc.fill();
            rc.stroke();
        }
    }
    ftk.CircleShape = CircleShape;
})(ftk || (ftk = {}));
var ftk;
(function (ftk) {
    class VideoSprite extends ftk.RectangleSprite {
        constructor(resource, w, h, id) {
            super(0, 0, 0, 0, id);
            if (resource) {
                this.mVideo = resource;
            }
            else {
                this.mVideo = new ftk.VideoResource("");
            }
            if (w && h) {
                this.Resize(w, h);
            }
            else {
                this.Resize(this.mVideo.Video.videoWidth, this.mVideo.Video.videoHeight);
            }
        }
        get Resource() {
            return this.mVideo;
        }
        set Resource(value) {
            this.mVideo = value;
        }
        Play() {
            this.Resource.Video.play();
        }
        Pause() {
            this.Resource.Video.pause();
        }
        OnRander(rc) {
            let video = this.Resource.Video;
            let box = this.Box;
            rc.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, box.x, box.y, box.w, box.h);
        }
    }
    ftk.VideoSprite = VideoSprite;
})(ftk || (ftk = {}));
var ftk;
(function (ftk) {
    var particles;
    (function (particles) {
        class FireworkSparkParticle extends ftk.Particle {
            constructor(pa, x, y) {
                super(pa, x, y);
                this.hue = Math.floor(Math.random() * 360);
                this.maxLife = this.age;
                this.drag = 0.9;
                this.color = this.randColor();
            }
            Render(rc) {
                rc.fillStyle = this.color;
                rc.fillRect(this.x - 1, this.y - 1, 2, 2);
            }
            Update(timestamp) {
                super.Update(timestamp);
                if (Math.random() < 0.5) {
                    this.color = this.randColor();
                }
            }
            randColor() {
                let components = [
                    (Math.random() * 128 + 128) & 0xff, (Math.random() * 128 + 128) & 0xff, (Math.random() * 128 + 128) & 0xff
                ];
                components[Math.floor(Math.random() * 3)] = Math.floor(Math.random() * 200 + 55) & 0xff;
                if (Math.random() < 0.3) {
                    components[Math.floor(Math.random() * 3)] = (Math.random() * 200 + 55) & 0xff;
                }
                return "rgb(" + components.join(',') + ")";
            }
        }
        particles.FireworkSparkParticle = FireworkSparkParticle;
        class FireworkFlameParticle extends ftk.Particle {
            constructor(pa, x, y) {
                super(pa, x, y);
                this.age /= 2;
            }
            Update(timestamp) {
                let spark = new FireworkSparkParticle(this.PA, this.x, this.y);
                spark.vx /= 10;
                spark.vy /= 10;
                spark.vx += this.vx / 2;
                spark.vy += this.vy / 2;
                this.PA.AddParticle(spark);
                super.Update(timestamp);
            }
            Render(_rc) {
            }
        }
        particles.FireworkFlameParticle = FireworkFlameParticle;
        class FireworkParticle extends ftk.Particle {
            constructor(pa, x, y) {
                super(pa, x, y);
                this.maxLife = 5;
                this.age = 0;
            }
            Update(timestamp) {
                super.Update(timestamp);
                let bits = Math.ceil(this.age * 10 / this.maxLife);
                for (let i = 0; i < bits; ++i) {
                    let flame = new FireworkFlameParticle(this.PA, this.x, this.y);
                    flame.vy *= 1.5;
                    flame.vx *= 1.5;
                    this.PA.AddParticle(flame);
                }
            }
            Render(_rc) {
            }
        }
        particles.FireworkParticle = FireworkParticle;
        class FireworkAnimation extends ftk.ParticleSprite {
            OnUpdate() {
                if ((this.Ticks % 40) === 0) {
                    let fw = new FireworkParticle(this, Math.random() * window.innerWidth, Math.random() * window.innerHeight * 0.75);
                    fw.vx *= 5;
                    fw.vy *= 3;
                    this.AddParticle(fw);
                }
                return false;
            }
        }
        particles.FireworkAnimation = FireworkAnimation;
    })(particles = ftk.particles || (ftk.particles = {}));
})(ftk || (ftk = {}));
var ftk;
(function (ftk) {
    var ui;
    (function (ui) {
        class ImageButton extends ftk.ImageSprite {
            constructor(resource, id, w, h) {
                super(resource, w, h, id);
                this.mPressState = false;
                this.mNormalImage = this.Resource;
            }
            get Resource() {
                return super.Resource;
            }
            set Resource(value) {
                super.Resource = value;
                this.mNormalImage = value;
            }
            get HoverResource() {
                return this.mHoverImage;
            }
            set HoverResource(value) {
                this.mHoverImage = value;
            }
            get DownResource() {
                return this.mDownImage;
            }
            set DownResource(value) {
                this.mDownImage = value;
            }
            OnDispatchMouseEvent(ev, _forced) {
                switch (ev.InputType) {
                    case ftk.InputEventType.MouseEnter:
                        if (this.mHoverImage && (!this.mPressState)) {
                            super.Resource = this.mHoverImage;
                        }
                        break;
                    case ftk.InputEventType.MouseLeave:
                        if (this.mNormalImage) {
                            super.Resource = this.mNormalImage;
                        }
                        this.mPressState = false;
                        break;
                    case ftk.InputEventType.MouseDown:
                        if (this.mDownImage && (!this.mPressState)) {
                            super.Resource = this.mDownImage;
                            this.mPressState = true;
                        }
                        break;
                    case ftk.InputEventType.MouseUp:
                        if (this.mHoverImage && (this.mPressState)) {
                            this.mPressState = false;
                            super.Resource = this.mHoverImage;
                        }
                        break;
                }
                ev.Cursor = "pointer";
            }
        }
        ui.ImageButton = ImageButton;
    })(ui = ftk.ui || (ftk.ui = {}));
})(ftk || (ftk = {}));
var ftk;
(function (ftk) {
    var ui;
    (function (ui) {
        class Panel extends ftk.RectangleShape {
            OnRander(rc) {
                rc.shadowBlur = 3;
                rc.shadowColor = this.BorderColor.toRGBAString();
                rc.shadowOffsetX = 2;
                rc.shadowOffsetY = 2;
                super.OnRander(rc);
            }
        }
        ui.Panel = Panel;
    })(ui = ftk.ui || (ftk.ui = {}));
})(ftk || (ftk = {}));
//# sourceMappingURL=ftk.js.map