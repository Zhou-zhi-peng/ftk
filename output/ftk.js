"use strict";
var ftk;
(function (ftk) {
    let AnimationPlayState;
    (function (AnimationPlayState) {
        AnimationPlayState[AnimationPlayState["Stop"] = 0] = "Stop";
        AnimationPlayState[AnimationPlayState["Suspended"] = 1] = "Suspended";
        AnimationPlayState[AnimationPlayState["Playing"] = 2] = "Playing";
    })(AnimationPlayState = ftk.AnimationPlayState || (ftk.AnimationPlayState = {}));
    class Animation {
        constructor(start, end, duration, loop, autostart) {
            this.mPlayState = AnimationPlayState.Stop;
            this.Loop = loop ? loop : false;
            this.Duration = duration;
            this.mStartValue = start;
            this.mEndValue = end;
            this.mDistance = this.CalcDistance(start, end);
            this.mStartTime = 0;
            this.mEndTime = 0;
            this.mSuspendTime = 0;
            this.mFirstFrame = true;
            if (autostart) {
                this.Start();
            }
        }
        get PlayState() { return this.mPlayState; }
        Start() {
            if (this.mPlayState !== AnimationPlayState.Playing) {
                this.Restart();
            }
        }
        Restart() {
            this.mFirstFrame = true;
            this.mSuspendTime = 0;
            this.mPlayState = AnimationPlayState.Playing;
        }
        Stop() {
            this.mPlayState = AnimationPlayState.Stop;
            this.mFirstFrame = true;
            this.mSuspendTime = 0;
        }
        Suspend(timestamp) {
            if (this.mPlayState === AnimationPlayState.Playing) {
                if (!timestamp) {
                    this.mSuspendTime = performance.now();
                }
                else {
                    this.mSuspendTime = timestamp;
                }
                this.mPlayState = AnimationPlayState.Suspended;
            }
        }
        Resume(timestamp) {
            if (this.mPlayState === AnimationPlayState.Suspended) {
                let ts = timestamp ? timestamp : performance.now();
                let t = this.mSuspendTime - this.mStartTime;
                if (t < 0) {
                    throw new RangeError('SuspendTime < StartTime');
                }
                this.mStartTime = ts - t;
                this.mEndTime = this.mStartTime + this.Duration;
                this.mPlayState = AnimationPlayState.Playing;
            }
        }
        Update(timestamp, target) {
            if (this.mPlayState !== AnimationPlayState.Playing) {
                return;
            }
            if (this.mFirstFrame) {
                this.mStartTime = timestamp;
                this.mEndTime = timestamp + this.Duration;
                this.mFirstFrame = false;
                this.UpdateTarget(target, this.mStartValue);
            }
            else {
                if (timestamp >= this.mEndTime) {
                    this.UpdateTarget(target, this.mEndValue);
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
                    this.UpdateTarget(target, value);
                }
            }
        }
        ValidateTarget(_target) {
            return true;
        }
        get StartValue() { return this.mStartValue; }
        set StartValue(value) {
            this.mStartValue = value;
            this.mDistance = this.CalcDistance(this.mStartValue, this.mEndValue);
        }
        get EndValue() { return this.mEndValue; }
        set EndValue(value) {
            this.mEndValue = value;
            this.mDistance = this.CalcDistance(this.mStartValue, this.mEndValue);
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
        UpdateTarget(target, value) {
            target.Angle = value;
        }
    }
    ftk.AngleAnimation = AngleAnimation;
    class OpacityAnimation extends NumberValueAnimation {
        UpdateTarget(target, value) {
            target.Opacity = value;
        }
    }
    ftk.OpacityAnimation = OpacityAnimation;
    class PosXAnimation extends NumberValueAnimation {
        UpdateTarget(target, value) {
            target.X = value;
        }
    }
    ftk.PosXAnimation = PosXAnimation;
    class PosYAnimation extends NumberValueAnimation {
        UpdateTarget(target, value) {
            target.Y = value;
        }
    }
    ftk.PosYAnimation = PosYAnimation;
    class WidthAnimation extends NumberValueAnimation {
        UpdateTarget(target, value) {
            target.Width = value;
        }
    }
    ftk.WidthAnimation = WidthAnimation;
    class HeightAnimation extends NumberValueAnimation {
        UpdateTarget(target, value) {
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
        UpdateTarget(target, value) {
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
        UpdateTarget(target, value) {
            target.Size = value;
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
        UpdateTarget(target, value) {
            target.Box = value;
        }
    }
    ftk.BoxAnimation = BoxAnimation;
    class KeyframeAnimation {
        constructor(loop, autostart) {
            this.mPlayState = AnimationPlayState.Stop;
            this.Loop = loop ? loop : false;
            this.mFrames = new Array();
            this.mCurrentFrame = 0;
            if (autostart) {
                this.Start();
            }
        }
        get PlayState() { return this.mPlayState; }
        Start() {
            if (this.mPlayState !== AnimationPlayState.Playing) {
                this.Restart();
            }
        }
        Restart() {
            this.mPlayState = AnimationPlayState.Playing;
            let cur = this.mFrames[this.mCurrentFrame];
            if (cur) {
                cur.Stop();
            }
            this.mCurrentFrame = 0;
            cur = this.mFrames[this.mCurrentFrame];
            if (cur) {
                cur.Restart();
            }
        }
        Stop() {
            this.mPlayState = AnimationPlayState.Stop;
            let cur = this.mFrames[this.mCurrentFrame];
            if (cur) {
                cur.Stop();
            }
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
        Suspend(timestamp) {
            if (this.mPlayState === AnimationPlayState.Playing) {
                let cur = this.mFrames[this.mCurrentFrame];
                if (cur) {
                    cur.Suspend(timestamp);
                }
                this.mPlayState = AnimationPlayState.Suspended;
            }
        }
        Resume(timestamp) {
            if (this.mPlayState === AnimationPlayState.Suspended) {
                let cur = this.mFrames[this.mCurrentFrame];
                if (cur) {
                    cur.Resume(timestamp);
                }
                this.mPlayState = AnimationPlayState.Playing;
            }
        }
        Update(timestamp, target) {
            if ((this.PlayState !== AnimationPlayState.Playing) && this.mFrames.length == 0) {
                return;
            }
            let animation = this.mFrames[this.mCurrentFrame];
            if (animation.PlayState !== AnimationPlayState.Playing) {
                animation.Start();
            }
            animation.Loop = false;
            animation.Update(timestamp, target);
            if (animation.PlayState !== AnimationPlayState.Playing) {
                this.mCurrentFrame++;
                if (this.mCurrentFrame >= this.mFrames.length) {
                    this.mCurrentFrame = 0;
                    if (!this.Loop) {
                        this.Stop();
                    }
                }
            }
        }
        ValidateTarget(_target) {
            return true;
        }
    }
    ftk.KeyframeAnimation = KeyframeAnimation;
    class SequenceAnimation extends NumberValueAnimation {
        constructor(interval, textures, loop, autostart) {
            super(0, 0, 0, loop, autostart);
            this.mTextureList = new Array();
            this.mInterval = interval;
            if (textures) {
                for (let t of textures) {
                    this.mTextureList.push(t);
                }
            }
            this.EndValue = this.mTextureList.length - 1;
            this.Duration = this.mTextureList.length * interval;
        }
        get Frames() {
            return this.mTextureList;
        }
        get Interval() {
            return this.mInterval;
        }
        set Interval(value) {
            this.mInterval = value;
            this.Duration = this.mTextureList.length * value;
        }
        AddFrame(texture) {
            this.mTextureList.push(texture);
            this.EndValue = this.mTextureList.length - 1;
            this.Duration = this.mTextureList.length * this.mInterval;
        }
        RemoveAt(index) {
            this.mTextureList.slice(index, index + 1);
            this.EndValue = this.mTextureList.length - 1;
            this.Duration = this.mTextureList.length * this.mInterval;
        }
        ClearFrames() {
            this.mTextureList.length = 0;
            this.EndValue = 0;
            this.Duration = 0;
        }
        ValidateTarget(target) {
            return target instanceof ftk.ImageSprite;
        }
        UpdateTarget(target, value) {
            if (this.mTextureList.length > 0) {
                target.Texture = this.mTextureList[Math.floor(value)];
            }
        }
    }
    ftk.SequenceAnimation = SequenceAnimation;
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
    ftk.VERSION = '1.0.0.1';
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
        acall(ctx, ...args) {
            if (this.mHandlers && this.mHandlers.length > 0) {
                let handlers = this.mHandlers;
                let promise = new Promise((resolve, reject) => {
                    try {
                        handlers.forEach((handler) => {
                            handler.apply(ctx, args);
                        });
                        resolve();
                    }
                    catch (e) {
                        reject(e);
                    }
                });
                promise.then(() => { }).catch(() => { });
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
            this.emitEx(false, this, evt, ...args);
        }
        asyncEmit(evt, ...args) {
            this.emitEx(true, this, evt, ...args);
        }
        emitEx(isasync, thisArg, evt, ...args) {
            if (this.mListeners) {
                let handlerList = this.mListeners.get(evt);
                if (handlerList) {
                    if (isasync) {
                        handlerList.acall(thisArg, ...args);
                    }
                    else {
                        handlerList.call(thisArg, ...args);
                    }
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
            let output = new Uint8Array(UTF8BufferEncodeLength(input));
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
            return output;
        }
        utility.UTF8BufferEncode = UTF8BufferEncode;
        function UTF8BufferDecode(buffer) {
            let output = "";
            let utf16;
            let pos = 0;
            let input;
            if (buffer instanceof ArrayBuffer) {
                input = new Uint8Array(buffer);
            }
            else {
                input = buffer;
            }
            let length = input.byteLength;
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
        function HexStringToBuffer(hexString) {
            let rawStr = hexString.trim().toUpperCase();
            let len = rawStr.length;
            let curCharCode = 0;
            let utf8Arr = [];
            let i = 0;
            while (i < len) {
                let h = 0;
                while ((i < len) && ((h < 48 || h > 57) && (h < 65 || h > 70))) {
                    h = rawStr.charCodeAt(i);
                    i++;
                }
                if (i >= len) {
                    break;
                }
                let l = 0;
                while ((i < len) && ((l < 48 || l > 57) && (l < 65 || l > 70))) {
                    l = rawStr.charCodeAt(i);
                    i++;
                }
                if (l >= 48 && l <= 57) {
                    l = l - 48;
                }
                else if (l >= 65 && l <= 70) {
                    l = l - 65 + 10;
                }
                else {
                    break;
                }
                if (h >= 48 && h <= 57) {
                    h = h - 48;
                }
                else if (h >= 65 && h <= 70) {
                    h = h - 65 + 10;
                }
                else {
                    break;
                }
                curCharCode = l + (h << 4);
                utf8Arr.push(curCharCode);
            }
            return new Uint8Array(utf8Arr);
        }
        utility.HexStringToBuffer = HexStringToBuffer;
        function BufferToHexString(buffer) {
            let input;
            if (buffer instanceof ArrayBuffer) {
                input = new Uint8Array(buffer);
            }
            else {
                input = buffer;
            }
            if (input && input.byteLength) {
                let length = input.byteLength;
                let output = "";
                for (let i = 0; i < length; i++) {
                    let tmp = input[i].toString(16);
                    if (tmp.length > 1) {
                        output = output + tmp + " ";
                    }
                    else {
                        output = output + "0" + tmp + " ";
                    }
                }
                return output;
            }
            return "";
        }
        utility.BufferToHexString = BufferToHexString;
        function _uint6ToB64(nUint6) {
            return nUint6 < 26 ? nUint6 + 65
                : nUint6 < 52 ? nUint6 + 71
                    : nUint6 < 62 ? nUint6 - 4
                        : nUint6 === 62 ? 43
                            : nUint6 === 63 ? 47
                                : 65;
        }
        function _b64ToUint6(nChr) {
            return nChr > 64 && nChr < 91 ?
                nChr - 65
                : nChr > 96 && nChr < 123 ?
                    nChr - 71
                    : nChr > 47 && nChr < 58 ?
                        nChr + 4
                        : nChr === 43 ?
                            62
                            : nChr === 47 ?
                                63
                                :
                                    0;
        }
        function BufferToBase64(buffer) {
            let input;
            if (buffer instanceof ArrayBuffer) {
                input = new Uint8Array(buffer);
            }
            else {
                input = buffer;
            }
            let length = input.byteLength;
            let eqLen = (3 - (length % 3)) % 3;
            let sB64Enc = "";
            for (let nMod3, nLen = length, nUint24 = 0, nIdx = 0; nIdx < nLen; nIdx++) {
                nMod3 = nIdx % 3;
                nUint24 |= input[nIdx] << (16 >>> nMod3 & 24);
                if (nMod3 === 2 || length - nIdx === 1) {
                    sB64Enc += String.fromCharCode(_uint6ToB64(nUint24 >>> 18 & 63), _uint6ToB64(nUint24 >>> 12 & 63), _uint6ToB64(nUint24 >>> 6 & 63), _uint6ToB64(nUint24 & 63));
                    nUint24 = 0;
                }
            }
            return eqLen === 0 ? sB64Enc : sB64Enc.substring(0, sB64Enc.length - eqLen) + (eqLen === 1 ? "=" : "==");
        }
        utility.BufferToBase64 = BufferToBase64;
        function Base64ToBuffer(base64String) {
            let sB64Enc = base64String.replace(/[^A-Za-z0-9\+\/]/g, "");
            let nInLen = sB64Enc.length;
            let nOutLen = nInLen * 3 + 1 >>> 2;
            let aBytes = new Uint8Array(nOutLen);
            for (let nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
                nMod4 = nInIdx & 3;
                nUint24 |= _b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 18 - 6 * nMod4;
                if (nMod4 === 3 || nInLen - nInIdx === 1) {
                    for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
                        aBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
                    }
                    nUint24 = 0;
                }
            }
            return aBytes;
        }
        utility.Base64ToBuffer = Base64ToBuffer;
        function _toURLParameters(results, data, traditional, scope) {
            let type = typeof (data);
            if (type === 'object') {
                let is_array = Array.isArray(data);
                for (const key in data) {
                    let value = data[key];
                    let newscope = key;
                    if (scope) {
                        newscope = traditional ? scope : scope + '[' + (is_array ? '' : newscope) + ']';
                    }
                    if (!scope && is_array) {
                        data.add(value.name, value.value);
                    }
                    else if (traditional ? (Array.isArray(value)) : (typeof (value) === 'object')) {
                        _toURLParameters(results, value, traditional, newscope);
                    }
                    else {
                        results.push({ name: newscope, value });
                    }
                }
            }
            else if (type !== 'undefined') {
                if (data !== null) {
                    results.push({ name: data.toString(), value: data.toString() });
                }
                else {
                    results.push({ name: data.toString(), value: 'null' });
                }
            }
        }
        function ToURLParameters(data, traditional) {
            let kvs = [];
            let prarmStrings = [];
            _toURLParameters(kvs, data, traditional ? traditional : false, '');
            for (const r of kvs) {
                prarmStrings.push(encodeURIComponent(r.name) + '=' + encodeURIComponent(r.value));
            }
            return prarmStrings.join('&').replace('%20', '+');
        }
        utility.ToURLParameters = ToURLParameters;
        function PrefixPad(s, n, pad = ' ') {
            if (n <= s.length) {
                return s.substr(s.length - n);
            }
            if (s.length == 0) {
                return Array(n).join(pad);
            }
            if (n === 2) {
                return pad + s;
            }
            return (Array(n - s.length + 1).join(pad) + s);
        }
        utility.PrefixPad = PrefixPad;
        function DateFormat(fmt, date) {
            let ret;
            const opt = {
                "Y+": date.getFullYear().toString(),
                "m+": (date.getMonth() + 1).toString(),
                "d+": date.getDate().toString(),
                "H+": date.getHours().toString(),
                "M+": date.getMinutes().toString(),
                "S+": date.getSeconds().toString(),
                "X+": date.getMilliseconds().toString(),
            };
            let data = opt;
            for (let k in opt) {
                ret = new RegExp("(" + k + ")").exec(fmt);
                if (ret) {
                    fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (data[k]) : (PrefixPad(data[k], ret[1].length, "0")));
                }
            }
            return fmt;
        }
        utility.DateFormat = DateFormat;
        let Path;
        (function (Path) {
            const splitPathRegex = /^(\/?|)([\s\S]*?)(?:(\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
            const urlRegex = /(\S+):\/\/([\w\-_]+(?:\.[\w\-_]+)+)(?::(\d+))?([^=\?\s]*)?([\@?#].*)?/;
            Path.sep = '/';
            function _split_path_params(path) {
                let x = path.indexOf('?');
                if (x < 0) {
                    x = path.indexOf('#');
                }
                if (x < 0) {
                    return [path];
                }
                return [path.substr(0, x), path.substr(x)];
            }
            function _url_parse(path) {
                let m = urlRegex.exec(path);
                if (!m || (!m[1])) {
                    let s = _split_path_params(path);
                    return {
                        path: s[0],
                        params: s[1]
                    };
                }
                return {
                    protocol: m[1],
                    hostname: m[2],
                    port: (m[3] ? parseInt(m[3], 10) : undefined),
                    path: (m[4] ? m[4] : Path.sep),
                    params: m[5]
                };
            }
            function _split_path(path) {
                return path.split(Path.sep).filter((p) => p && p.length > 0);
            }
            function _normalize_parts(parts) {
                let up = 0;
                for (let i = parts.length - 1; i >= 0; i--) {
                    let last = parts[i];
                    if (last === '.') {
                        parts.splice(i, 1);
                    }
                    else if (last === '..') {
                        parts.splice(i, 1);
                        up++;
                    }
                    else if (up) {
                        parts.splice(i, 1);
                        up--;
                    }
                }
                return parts;
            }
            function _path_parse(path) {
                let m = splitPathRegex.exec(path);
                if (!m) {
                    return { basename: path };
                }
                return {
                    rootname: m[1],
                    dirname: m[2],
                    basename: m[3],
                    extname: m[4]
                };
            }
            function _url_to_string(url) {
                let r = '';
                if (url.protocol) {
                    r += url.protocol;
                    r += "://";
                }
                if (url.hostname) {
                    r += url.hostname;
                }
                if (url.port) {
                    r += ':' + url.port.toString();
                }
                if (url.path) {
                    if (r.length > 0 && !_is_absolute_path(url.path)) {
                        r += Path.sep;
                    }
                    r += url.path;
                }
                if (url.params) {
                    r += url.params;
                }
                return r;
            }
            function _path_to_string(path) {
                let r = '';
                if (path.rootname) {
                    r += path.rootname;
                }
                if (path.dirname) {
                    r += path.dirname;
                }
                if (path.basename) {
                    r += path.basename;
                }
                if (path.extname) {
                    if (!path.extname.startsWith('.')) {
                        r += '.';
                    }
                    r += path.extname;
                }
                return r;
            }
            function _is_absolute_path(path) {
                return path.startsWith(Path.sep);
            }
            function _is_end_slash(path) {
                return path.endsWith(Path.sep);
            }
            function normalize(path) {
                let url = _url_parse(path);
                let pathname = url.path;
                if (pathname && pathname.length != 0) {
                    let isabs = _is_absolute_path(pathname);
                    let isendslash = _is_end_slash(pathname);
                    pathname = _normalize_parts(_split_path(pathname)).join(Path.sep);
                    if (!pathname && !isabs) {
                        pathname = '.';
                    }
                    if (pathname && isendslash) {
                        pathname += Path.sep;
                    }
                    if (isabs) {
                        pathname = Path.sep + pathname;
                    }
                }
                url.path = pathname;
                return _url_to_string(url);
            }
            Path.normalize = normalize;
            function join(...args) {
                if (args.length === 0) {
                    return '';
                }
                if (args.length === 1) {
                    return args[0];
                }
                let first = args[0];
                let url = _url_parse(first);
                let pathname = url.path;
                let isabs = _is_absolute_path(pathname);
                let parts = _split_path(pathname);
                for (let i = 1; i < args.length; ++i) {
                    parts.push(..._split_path(args[i]));
                }
                pathname = _normalize_parts(parts).join(Path.sep);
                if (isabs) {
                    pathname = Path.sep + pathname;
                }
                url.path = pathname;
                return _url_to_string(url);
            }
            Path.join = join;
            function urlpath(url) {
                return _url_parse(url).path;
            }
            Path.urlpath = urlpath;
            function isurl(path) {
                return urlRegex.test(path);
            }
            Path.isurl = isurl;
            function resolve(path, pwd) {
                let workpath = pwd ? pwd : Path.sep;
                if (isurl(path) || _is_absolute_path(path)) {
                    return path;
                }
                return join(workpath, path);
            }
            Path.resolve = resolve;
            function relative(path, to, pwd) {
                if (isurl(to)) {
                    return to;
                }
                else {
                    let fromParts = _split_path(resolve(path, pwd));
                    let toParts = _split_path(resolve(to, pwd));
                    let length = Math.min(fromParts.length, toParts.length);
                    let samePartsLength = length;
                    for (let i = 0; i < length; i++) {
                        if (fromParts[i] !== toParts[i]) {
                            samePartsLength = i;
                            break;
                        }
                    }
                    let outputParts = [];
                    for (let i = samePartsLength; i < fromParts.length; i++) {
                        outputParts.push('..');
                    }
                    outputParts = outputParts.concat(toParts.slice(samePartsLength));
                    return outputParts.join(Path.sep);
                }
            }
            Path.relative = relative;
            function extname(path) {
                let result = _path_parse(urlpath(path));
                if (result.extname) {
                    return result.extname;
                }
                return '';
            }
            Path.extname = extname;
            function basename(path) {
                let result = _path_parse(urlpath(path));
                if (result.basename) {
                    return result.basename;
                }
                return '';
            }
            Path.basename = basename;
            function lastpart(path) {
                let result = _path_parse(urlpath(path));
                let n = '';
                if (result.basename) {
                    n += result.basename;
                }
                if (result.extname) {
                    n += result.extname;
                }
                return n;
            }
            Path.lastpart = lastpart;
            function dirname(path) {
                let result = _path_parse(urlpath(path));
                if (result.dirname) {
                    return result.dirname;
                }
                return '';
            }
            Path.dirname = dirname;
            function chextension(path, name) {
                let u = _url_parse(path);
                let pathname = u.path;
                let p = _path_parse(pathname);
                p.extname = name;
                pathname = _path_to_string(p);
                u.path = pathname;
                return _url_to_string(u);
            }
            Path.chextension = chextension;
            function chbasename(path, name) {
                let u = _url_parse(path);
                let pathname = u.path;
                let p = _path_parse(pathname);
                p.basename = name;
                pathname = _path_to_string(p);
                u.path = pathname;
                return _url_to_string(u);
            }
            Path.chbasename = chbasename;
            function chlastpart(path, name) {
                let u = _url_parse(path);
                let pathname = u.path;
                let p = _path_parse(pathname);
                p.basename = name;
                p.extname = undefined;
                pathname = _path_to_string(p);
                u.path = pathname;
                return _url_to_string(u);
            }
            Path.chlastpart = chlastpart;
            function isabsolute(path) {
                return _is_absolute_path(urlpath(path));
            }
            Path.isabsolute = isabsolute;
        })(Path = utility.Path || (utility.Path = {}));
        let api;
        (function (api) {
            function createOffscreenCanvas(width, height) {
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
            api.createOffscreenCanvas = createOffscreenCanvas;
        })(api = utility.api || (utility.api = {}));
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
        get Size() {
            let r = this.getRectangle();
            return r.size;
        }
        set Size(value) {
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
            this.Size = new ftk.Size(w, h);
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
        SetBasePointToCenter() {
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
            if (!animation.ValidateTarget(this)) {
                throw new TypeError('Animation ValidateTarget failed.');
            }
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
            if (ev.Name === 'Engine.VisibilityStateChanged') {
                let visible = (ev.Args.visible);
                let timestamp = (ev.Args.timestamp);
                this.OnEngineVisibilityStateChanged(visible, timestamp);
            }
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
        toTexture() {
            let r = this.getRectangle();
            let canvas = ftk.utility.api.createOffscreenCanvas(r.w, r.h);
            let rc = canvas.getContext('2d');
            if (rc) {
                rc.translate(-r.x, -r.y);
                this.Rander(rc);
                rc.translate(r.x, r.y);
            }
            return ftk.createTexture(canvas);
        }
        OnEngineVisibilityStateChanged(visible, timestamp) {
            if (this.mAnimations) {
                let anis = this.mAnimations;
                for (let a of anis) {
                    if (visible) {
                        a.Resume(timestamp);
                    }
                    else {
                        a.Suspend(timestamp);
                    }
                }
            }
        }
        OnUpdate(_timestamp) {
        }
        OnResized() {
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
            this.mBufferParticles = new Array();
            this.mParticleEmitters = new Array();
            this.mLastUpdateTime = -1;
            this.mUpdateTime = 0;
            this.mSuspendTime = 0;
        }
        get Particles() {
            return this.mParticles;
        }
        get Emitters() {
            return this.mParticleEmitters;
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
        ClearParticle() {
            this.mParticles.length = 0;
        }
        AddEmitter(emitter) {
            this.mParticleEmitters.push(emitter);
        }
        RemoveEmitter(emitter) {
            this.mParticleEmitters = this.mParticleEmitters.filter((e) => e != emitter);
        }
        ClearEmitter() {
            this.mParticleEmitters.length = 0;
        }
        DispatchTouchEvent(_ev, _forced) {
        }
        DispatchMouseEvent(_ev, _forced) {
        }
        DispatchKeyboardEvent(_ev, _forced) {
        }
        OnUpdate(timestamp) {
            if (this.mLastUpdateTime < 0) {
                this.mLastUpdateTime = timestamp;
            }
            this.mUpdateTime = timestamp;
            let incremental = timestamp - this.mLastUpdateTime;
            let arr = this.mParticles;
            let buf = this.mBufferParticles;
            let box = this.getRectangle();
            for (let p of arr) {
                p.Update(incremental, box);
                if (p.active) {
                    buf.push(p);
                }
            }
            this.SwapBuffer();
            for (let pe of this.mParticleEmitters) {
                pe.Update(timestamp, this);
            }
            this.mLastUpdateTime = timestamp;
        }
        OnRander(rc) {
            let r = this.getRectangle();
            rc.beginPath();
            rc.rect(r.x, r.y, r.w, r.h);
            rc.clip();
            for (let p of this.mParticles) {
                p.Render(rc);
            }
        }
        OnEngineVisibilityStateChanged(visible, timestamp) {
            super.OnEngineVisibilityStateChanged(visible, timestamp);
            if (visible) {
                this.mLastUpdateTime = timestamp - (this.mSuspendTime - this.mLastUpdateTime);
                this.mSuspendTime = 0;
            }
            else {
                this.mSuspendTime = timestamp;
            }
        }
        SwapBuffer() {
            let t = this.mParticles;
            this.mParticles = this.mBufferParticles;
            this.mBufferParticles = t;
            this.mBufferParticles.length = 0;
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
            this.maxLife = 0;
            this.age = 0;
            this.gravity = 1;
            this.drag = 1;
            this.elastic = 0;
            this.active = true;
        }
        Update(incremental, rect) {
            if (this.active) {
                this.age += incremental;
                if (this.age >= this.maxLife) {
                    this.active = false;
                }
                if (this.drag !== 1) {
                    this.vx *= this.drag;
                    this.vy *= this.drag;
                }
                this.vy += this.gravity;
                this.x += this.vx;
                this.y += this.vy;
                if (this.elastic !== 0) {
                    let right = rect.right;
                    let bottom = rect.bottom;
                    if (this.x <= rect.x || this.x >= right) {
                        this.vx = (-this.vx) * this.elastic;
                        if (this.x <= rect.x) {
                            this.x = rect.x;
                        }
                        else if (this.x > right) {
                            this.x = right;
                        }
                    }
                    if (this.y <= rect.y || this.y >= bottom) {
                        this.vy = (-this.vy) * this.elastic;
                        if (this.y <= rect.y) {
                            this.y = rect.y;
                        }
                        else if (this.y > bottom) {
                            this.y = bottom;
                        }
                    }
                }
                else if (!rect.isInside(this.x, this.y)) {
                    this.active = false;
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
            this.mNEventEmitter = new ftk.EventEmitter();
            canvas.addEventListener("mousedown", (ev) => { this.OnMouseDown(ev); });
            canvas.addEventListener("mouseup", (ev) => { this.OnMouseUp(ev); });
            canvas.addEventListener("mousemove", (ev) => { this.OnMouseMove(ev); });
            document.addEventListener("visibilitychange", () => {
                this.OnVisibilityState(document.visibilityState == "visible");
            });
            window.addEventListener('offline', () => {
                this.OnOnlineState(false);
            });
            window.addEventListener('online', () => {
                this.OnOnlineState(true);
            });
            this.mCanvas = canvas;
            this.mRC = canvas.getContext("2d", { alpha: false });
            this.mOffscreenCanvas = ftk.utility.api.createOffscreenCanvas(this.mCanvas.width, this.mCanvas.height);
            this.mOffscreenRC = this.mOffscreenCanvas.getContext("2d", { alpha: false });
            this.mRootNode = new ftk.Stage(canvas.width, canvas.height);
            this.mEventPrevTarget = null;
            this.mEventCaptured = false;
            this.mEventCaptureContext = undefined;
            this.mResourceManager = new ftk.ResourceDBEditor();
            this.mFrameRate = 60;
            this.mLastRanderDuration = 0;
            this.DebugInfoVisible = false;
            this.mVisibilityState = !document.hidden;
            this.mOnlineState = window.navigator.onLine;
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
        get VisibilityState() {
            return this.mVisibilityState;
        }
        get OnlineState() {
            return this.mOnlineState;
        }
        Run() {
            this.mRC.clearRect(0, 0, this.ViewportWidth, this.ViewportHeight);
            this.StartLoop();
            this.OnRun();
        }
        getViewportImage() {
            return this.mCanvas.toDataURL();
        }
        Notify(source, name, broadcast, message) {
            let ev = new ftk.NoticeEvent(source, name, broadcast, message);
            let root = this.Root;
            if (broadcast) {
                root.DispatchNoticeEvent(ev, false);
            }
            this.mNEventEmitter.asyncEmit(name, ev);
        }
        OnNotify(name, listener) {
            this.mNEventEmitter.addListener(name, listener);
        }
        OnVisibilityState(visible) {
            this.mVisibilityState = visible;
            let ev = new ftk.NoticeEvent(this, 'Engine.VisibilityStateChanged', true, {
                visible,
                timestamp: performance.now()
            });
            this.Root.DispatchNoticeEvent(ev, true);
            this.emit(visible ? 'visible' : 'hidden', visible);
            console.log('Engine.VisibilityStateChanged', visible);
        }
        OnOnlineState(online) {
            this.mOnlineState = online;
            let ev = new ftk.NoticeEvent(this, 'Engine.OnlineStateChanged', true, {
                online,
                timestamp: performance.now()
            });
            this.Root.DispatchNoticeEvent(ev, true);
            this.emit(online ? 'online' : 'offline', online);
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
            if (this.VisibilityState) {
                let root = this.Root;
                root.Update(timestamp);
                this.mEngineUpdateEventArg.Args = timestamp;
                this.emit("update", this.mEngineUpdateEventArg);
                this.Rander();
            }
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
                        this.mBackgroundLayer.Remove(this.mLogo.Id);
                        this.mLogo = undefined;
                    }
                    if (this.mLoadingProgressBar) {
                        this.mBackgroundLayer.Remove(this.mLoadingProgressBar.Id);
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
            this.AddBackgroundLayer().Add(this.mLogo);
        }
        AddLoadingProgressBar() {
            let size = Math.min(this.ViewportWidth, this.ViewportHeight) / 5;
            let x = (this.ViewportWidth - size) / 2;
            let y = (this.ViewportHeight - size) / 2;
            this.mLoadingProgressBar = new ftk.ui.CircularProgressBar(x, y, size, size);
            this.mLoadingProgressBar.Visible = false;
            this.AddBackgroundLayer().Add(this.mLoadingProgressBar);
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
    ftk.PI_HALF = (Math.PI / 2);
    ftk.PI_1_5X = (Math.PI + ftk.PI_HALF);
    ftk.PI_2_0X = Math.PI * 2;
    ftk.RAD = Math.PI / 180;
    ftk.DEG = 180 / Math.PI;
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
        equal(b) {
            return this.x === b.x && this.y === b.y;
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
        static equal(a, b) {
            return a.equal(b);
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
        equal(b) {
            return this.cx === b.cx && this.cy === b.cy;
        }
        static equal(a, b) {
            return a.equal(b);
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
        equal(b) {
            return this.x === b.x && this.y === b.y && this.w === b.w && this.h === b.h;
        }
        intersection(r1, r2) {
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
            let startX = r1.x === merge.x ? r2.x : r1.x;
            let endX = r1.right === merge.right ? r2.right : r1.right;
            let startY = r1.y === merge.y ? r2.y : r1.y;
            let endY = r1.bottom === merge.bottom ? r2.bottom : r1.bottom;
            return new Rectangle(startX, startY, endX - startX, endY - startY);
        }
        static equal(a, b) {
            return a.equal(b);
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
        equal(b) {
            return this.start.equal(b.start) && this.end.equal(b.end);
        }
        static isInLineEx(point, lstart, lend) {
            return (((point.x - lstart.x) * (lstart.y - lend.y)) === ((lstart.x - lend.x) * (point.y - lstart.y))
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
            if (fAngle >= ftk.PI_HALF) {
                fAngle = Math.PI - fAngle;
            }
            return fAngle;
        }
        static equal(a, b) {
            return a.equal(b);
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
        equal(b) {
            return this.center.equal(b.center) && this.radius === b.radius;
        }
        get box() {
            let s = this.radius + this.radius;
            return new Rectangle(this.center.x - this.radius, this.center.y - this.radius, s, s);
        }
        static isIntersect(a, b) {
            let d = Point.distance(a.center, b.center);
            return d < a.radius || d < b.radius;
        }
        static equal(a, b) {
            return a.equal(b);
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
        pushVertex(x, y) {
            let p = new Point(x, y);
            this.mVertexs.push(p);
            return p;
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
        equal(b) {
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
        static equal(a, b) {
            return a.equal(b);
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
            return this.lengthQ === 1;
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
        equal(v) {
            return this.x === v.x && this.y === v.y;
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
        static equal(a, b) {
            return a.x === b.x && a.y === b.y;
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
    function DToR(angle) {
        return angle * ftk.RAD;
    }
    ftk.DToR = DToR;
    function RToD(angle) {
        return angle * ftk.DEG;
    }
    ftk.RToD = RToD;
})(ftk || (ftk = {}));
var ftk;
(function (ftk) {
    const kStrokeBegin = 1;
    const kFillBegin = 2;
    const kPathBegin = 4;
    const kNoneBegin = 0;
    class GraphicsSprite extends ftk.RectangleSprite {
        constructor() {
            super(...arguments);
            this.mDrawList = new Array();
            this.mBeginState = kNoneBegin;
        }
        beginStroke(width, color) {
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
        beginFill(color) {
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
        beginLinearGradientFill(color, startX, startY, endX, endY) {
            let start = new ftk.Point(startX, startY);
            let end = new ftk.Point(endX, endY);
            let d = ftk.Point.distance(start, end);
            let s = (d / color.length) / d;
            let colorList = new Array();
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
        beginRadialGradientFill(color, startX, startY, startR, endX, endY, endR) {
            let start = new ftk.Point(startX, startY);
            let end = new ftk.Point(endX, endY);
            let d = ftk.Point.distance(start, end);
            let s = (d / color.length) / d;
            let colorList = new Array();
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
        beginClipPath() {
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
        clear() {
            this.mBeginState = kNoneBegin;
            this.mDrawList.length = 0;
        }
        cubicCurveTo(c1x, c1y, c2x, c2y, x, y) {
            if (this.mBeginState === kNoneBegin) {
                return;
            }
            this.mDrawList.push((rc) => {
                rc.bezierCurveTo(c1x, c1y, c2x, c2y, x, y);
            });
        }
        curveTo(cx, cy, x, y) {
            if (this.mBeginState === kNoneBegin) {
                return;
            }
            this.mDrawList.push((rc) => {
                rc.quadraticCurveTo(cx, cy, x, y);
            });
        }
        arc(centerX, centerY, radius, startAngle, endAngle, anticlockwise) {
            if (this.mBeginState === kNoneBegin) {
                return;
            }
            this.mDrawList.push((rc) => {
                rc.arc(centerX, centerY, radius, startAngle, endAngle, anticlockwise);
            });
        }
        arcTo(startX, startY, endX, endY, radius) {
            if (this.mBeginState === kNoneBegin) {
                return;
            }
            this.mDrawList.push((rc) => {
                rc.arcTo(startX, startY, endX, endY, radius);
            });
        }
        circle(centerX, centerY, radius) {
            if (this.mBeginState === kNoneBegin) {
                return;
            }
            this.mDrawList.push((rc) => {
                rc.arc(centerX, centerY, radius, 0, ftk.PI_2_0X);
            });
        }
        ellipse(x, y, w, h, rotation, startAngle, endAngle) {
            if (this.mBeginState === kNoneBegin) {
                return;
            }
            let rx = w / 2;
            let ry = h / 2;
            let sa = startAngle ? startAngle : 0;
            let ea = endAngle ? endAngle : ftk.PI_2_0X;
            this.mDrawList.push((rc) => {
                rc.ellipse(x, y, rx, ry, rotation, sa, ea);
            });
        }
        rect(x, y, w, h) {
            if (this.mBeginState === kNoneBegin) {
                return;
            }
            this.mDrawList.push((rc) => {
                rc.rect(x, y, w, h);
            });
        }
        roundRect(x, y, w, h, radius) {
            if (this.mBeginState === kNoneBegin) {
                return;
            }
            this.mDrawList.push((rc) => {
                rc.arc(x + radius, y + radius, radius, Math.PI, ftk.PI_1_5X);
                rc.lineTo(w - radius + x, y);
                rc.arc(w - radius + x, radius + y, radius, ftk.PI_1_5X, ftk.PI_2_0X);
                rc.lineTo(w + x, h + y - radius);
                rc.arc(w - radius + x, h - radius + y, radius, 0, ftk.PI_HALF);
                rc.lineTo(radius + x, h + y);
                rc.arc(radius + x, h - radius + y, radius, ftk.PI_HALF, Math.PI);
            });
        }
        endFill() {
            if ((this.mBeginState & kFillBegin) !== kFillBegin) {
                return;
            }
            this.mBeginState &= (~kFillBegin);
            this.mDrawList.push((rc) => {
                rc.closePath();
                rc.fill();
            });
        }
        endStroke(close) {
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
        endClipPath() {
            if ((this.mBeginState & kPathBegin) !== kPathBegin) {
                return;
            }
            this.mBeginState &= (~kPathBegin);
            this.mDrawList.push((rc) => {
                rc.closePath();
                rc.clip();
            });
        }
        lineTo(x, y) {
            if (this.mBeginState === kNoneBegin) {
                return;
            }
            this.mDrawList.push((rc) => {
                rc.lineTo(x, y);
            });
        }
        moveTo(x, y) {
            if (this.mBeginState === kNoneBegin) {
                return;
            }
            this.mDrawList.push((rc) => {
                rc.moveTo(x, y);
            });
        }
        polygon(vertexs) {
            if (this.mBeginState === kNoneBegin) {
                return;
            }
            if (vertexs.length > 2) {
                let first = vertexs[0].clone();
                let vs = new Array();
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
        epolygon(x, y, radius, side) {
            if (this.mBeginState === kNoneBegin) {
                return;
            }
            if (side > 2) {
                const astep = (Math.PI + Math.PI) / side;
                let angle = 0;
                let vs = new Array();
                for (let i = 0; i < side; ++i) {
                    vs.push(new ftk.Point(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius));
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
        star(x, y, radius1, radius2, count, rotation) {
            if (this.mBeginState === kNoneBegin) {
                return;
            }
            if (count > 2) {
                const astep = (Math.PI + Math.PI) / count;
                let rot = rotation || 0;
                let angle1 = rot;
                let angle2 = astep / 2 + rot;
                let vs = new Array();
                for (let i = 0; i < count; ++i) {
                    vs.push(new ftk.Point(x + Math.cos(angle1) * radius1, y + Math.sin(angle1) * radius1));
                    vs.push(new ftk.Point(x + Math.cos(angle2) * radius2, y + Math.sin(angle2) * radius2));
                    angle1 += astep;
                    angle2 += astep;
                }
                vs.push(new ftk.Point(x + Math.cos(angle1) * radius1, y + Math.sin(angle1) * radius1));
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
        clearRect(x, y, w, h) {
            this.mDrawList.push((rc) => {
                rc.clearRect(x, y, w, h);
            });
        }
        fillBackground(color) {
            let c = color.toRGBAString();
            this.mDrawList.push((rc) => {
                let r = this.getRectangle();
                let f = rc.fillStyle;
                rc.fillStyle = c;
                rc.fillRect(0, 0, r.w, r.h);
                rc.fillStyle = f;
            });
        }
        drawTexture(t, dx, dy, dw, dh) {
            this.mDrawList.push((rc) => {
                t.Draw(rc, dx, dy, dw, dh);
            });
        }
        beginText(fontName, fontSize) {
            this.mDrawList.push((rc) => {
                rc.save();
                rc.font = fontSize.toString() + "px " + fontName;
            });
        }
        text(s, dx, dy, dw, color) {
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
        endText() {
            this.mDrawList.push((rc) => {
                rc.restore();
            });
        }
        OnRander(rc) {
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
                rc.stroke();
            }
            if ((this.mBeginState & kStrokeBegin) === kStrokeBegin) {
                rc.stroke();
            }
            rc.restore();
        }
    }
    ftk.GraphicsSprite = GraphicsSprite;
})(ftk || (ftk = {}));
var ftk;
(function (ftk) {
    let ResourceType;
    (function (ResourceType) {
        ResourceType[ResourceType["Image"] = 0] = "Image";
        ResourceType[ResourceType["Video"] = 1] = "Video";
        ResourceType[ResourceType["Audio"] = 2] = "Audio";
        ResourceType[ResourceType["Text"] = 3] = "Text";
        ResourceType[ResourceType["Font"] = 4] = "Font";
        ResourceType[ResourceType["Blob"] = 5] = "Blob";
        ResourceType[ResourceType["Animation"] = 6] = "Animation";
        ResourceType[ResourceType["Raw"] = 7] = "Raw";
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
            let client = new ftk.net.StringHttpClient();
            client.on('load', (res) => {
                this.mData = res.response;
                this.setLoaded(true);
                resolve();
            });
            client.on('error', (ev) => reject(ev));
            client.Get(this.Url);
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
            let client = new ftk.net.HttpClient();
            client.on('load', (res) => {
                this.mData = res.response;
                this.setLoaded(true);
                resolve();
            });
            client.on('error', (ev) => reject(ev));
            client.ResponseType = ftk.net.HttpResponseType.Blob;
            client.Get(this.Url);
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
            let client = new ftk.net.HttpClient();
            client.on('load', (res) => {
                this.mData = res.response;
                this.setLoaded(true);
                resolve();
            });
            client.on('error', (ev) => reject(ev));
            client.ResponseType = ftk.net.HttpResponseType.Buffer;
            client.Get(this.Url);
        }
    }
    ftk.RawResource = RawResource;
    class AnimationResource extends Resource {
        constructor(url, name) {
            super(url, name);
        }
        get Type() { return ResourceType.Animation; }
        OnLoad(resolve, reject) {
            let client = new ftk.net.JsonHttpClient();
            client.on('load', (res) => {
                try {
                    this.mAnimationData = res.response;
                    this.OnLoadAnimation(this.mAnimationData, resolve, reject);
                }
                catch (e) {
                    reject(e);
                }
            });
            client.on('error', (ev) => reject(ev));
            client.Get(this.Url);
        }
    }
    ftk.AnimationResource = AnimationResource;
    let _extNameMap = new Map();
    function _registerResourceType(extName, type) {
        let ext = extName.toLowerCase();
        let factoryFn;
        switch (type) {
            case ResourceType.Image:
                factoryFn = (url, name) => new ImageResource(url, name);
                break;
            case ResourceType.Video:
                factoryFn = (url, name) => new VideoResource(url, name);
                break;
            case ResourceType.Audio:
                factoryFn = (url, name) => new AudioResource(url, name);
                break;
            case ResourceType.Text:
                factoryFn = (url, name) => new TextResource(url, name);
                break;
            case ResourceType.Blob:
                factoryFn = (url, name) => new BlobResource(url, name);
                break;
            case ResourceType.Raw:
                factoryFn = (url, name) => new RawResource(url, name);
                break;
            default:
                return;
        }
        while (ext.startsWith('.')) {
            ext = ext.substr(1);
        }
        _extNameMap.set(ext, factoryFn);
    }
    function registerResourceType(extName, type) {
        if (typeof (extName) === 'string') {
            _registerResourceType(extName, type);
        }
        else {
            for (let en of extName) {
                _registerResourceType(en, type);
            }
        }
    }
    ftk.registerResourceType = registerResourceType;
    registerResourceType(["png", "jpg", "bmp", "jpeg", "gif", "ico", "tiff", "webp", "svg"], ResourceType.Image);
    registerResourceType(["mpeg4", "webm", "mp4"], ResourceType.Video);
    registerResourceType(["ogg", "mp3", "wav"], ResourceType.Audio);
    registerResourceType(["txt", "xml", "vsh", "fsh", "atlas", "html", "json"], ResourceType.Text);
    registerResourceType(["blob"], ResourceType.Blob);
    registerResourceType(["bin"], ResourceType.Raw);
    class ResourceDBEditor {
        constructor() {
            this.mResourceList = new Map();
        }
        Add(resource, name) {
            if (typeof (resource) === 'string') {
                let ext = ftk.utility.Path.extname(resource).toLowerCase();
                if (ext.startsWith('.')) {
                    ext = ext.substr(1);
                }
                let factoryFn = _extNameMap.get(ext);
                if (!factoryFn) {
                    factoryFn = (url, n) => new RawResource(url, n);
                }
                return this._Add(factoryFn(resource, name));
            }
            return this._Add(resource);
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
        _Add(resource) {
            this.mResourceList.set(resource.Name, resource);
            return this;
        }
    }
    ftk.ResourceDBEditor = ResourceDBEditor;
})(ftk || (ftk = {}));
var ftk;
(function (ftk) {
    class ImageSprite extends ftk.RectangleSprite {
        constructor(texture, id) {
            super(0, 0, 0, 0, id);
            this.mTexture = texture ? texture : ftk.EmptyTexture;
            this.Resize(this.mTexture.Width, this.mTexture.Height);
        }
        get Texture() {
            return this.mTexture;
        }
        set Texture(value) {
            this.mTexture = value;
        }
        OnRander(rc) {
            let box = this.Box;
            this.mTexture.Draw(rc, box.x, box.y, box.w, box.h);
        }
    }
    ftk.ImageSprite = ImageSprite;
})(ftk || (ftk = {}));
var ftk;
(function (ftk) {
    class Layer {
        constructor(id) {
            this.mID = id ? id : ftk.utility.GenerateIDString(32);
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
        Add(node) {
            this.mNodes.push(node);
            return this;
        }
        Remove(id) {
            for (let i = 0; i < this.mNodes.length; ++i) {
                if (this.mNodes[i].Id === id) {
                    this.mNodes.splice(i--, 1);
                }
            }
            return this;
        }
        RemoveAll() {
            this.mNodes.length = 0;
            return this;
        }
        Get(id) {
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
        constructor(color, id) {
            super(id);
            if (color) {
                this.mBackgroundColor = new ftk.Color(color);
            }
            else {
                this.mBackgroundColor = new ftk.Color("#00F");
            }
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
    let BackgroundImageRepeatStyle;
    (function (BackgroundImageRepeatStyle) {
        BackgroundImageRepeatStyle[BackgroundImageRepeatStyle["none"] = 0] = "none";
        BackgroundImageRepeatStyle[BackgroundImageRepeatStyle["repeat"] = 1] = "repeat";
        BackgroundImageRepeatStyle[BackgroundImageRepeatStyle["center"] = 2] = "center";
        BackgroundImageRepeatStyle[BackgroundImageRepeatStyle["stretch"] = 3] = "stretch";
        BackgroundImageRepeatStyle[BackgroundImageRepeatStyle["fitStretch"] = 4] = "fitStretch";
    })(BackgroundImageRepeatStyle = ftk.BackgroundImageRepeatStyle || (ftk.BackgroundImageRepeatStyle = {}));
    class BackgroundImageLayer extends Layer {
        constructor(texture, id) {
            super(id);
            this.BackgroundTexture = texture ? texture : ftk.EmptyTexture;
            this.RepeatStyle = BackgroundImageRepeatStyle.stretch;
        }
        Rander(rc) {
            let texture = this.BackgroundTexture;
            let style = this.RepeatStyle;
            if (style === BackgroundImageRepeatStyle.stretch) {
                texture.Draw(rc, 0, 0, rc.canvas.width, rc.canvas.height);
            }
            else if (style === BackgroundImageRepeatStyle.fitStretch) {
                let fitRatioX = texture.Width / rc.canvas.width;
                let fitRatioY = texture.Height / rc.canvas.height;
                let fitratio = Math.min(fitRatioX, fitRatioY);
                let w = texture.Width * fitratio;
                let h = texture.Height * fitratio;
                let x = (rc.canvas.width - w) / 2;
                let y = (rc.canvas.height - h) / 2;
                texture.Draw(rc, x, y, w, h);
            }
            else if (style === BackgroundImageRepeatStyle.center) {
                let x = (rc.canvas.width - texture.Width) / 2;
                let y = (rc.canvas.height - texture.Height) / 2;
                texture.Draw(rc, x, y, texture.Width, texture.Height);
            }
            else if (style === BackgroundImageRepeatStyle.none) {
                texture.Draw(rc, 0, 0, texture.Width, texture.Height);
            }
            else {
                let rw = rc.canvas.width % texture.Width;
                let rh = rc.canvas.height % texture.Height;
                let rwtx = texture.Clip(0, 0, rw, rc.canvas.height);
                let rhtx = texture.Clip(0, 0, rc.canvas.width, rh);
                let tw = texture.Width;
                let th = texture.Height;
                let cw = rc.canvas.width;
                let ch = rc.canvas.height;
                for (let x = 0; x < cw; x += tw) {
                    for (let y = 0; y < ch; y += th) {
                        if (cw - x < tw) {
                            rwtx.Draw(rc, x, y, rhtx.Width, rhtx.Height);
                        }
                        else if (ch - y < th) {
                            rhtx.Draw(rc, x, y, rhtx.Width, rhtx.Height);
                        }
                        else {
                            texture.Draw(rc, x, y, tw, th);
                        }
                    }
                }
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
        class _HttpResponseImpl {
            constructor(xhr, dataFormater) {
                this.mXHR = xhr;
                this.mDataFormater = dataFormater;
            }
            get status() {
                return this.mXHR.status;
            }
            get message() {
                return this.mXHR.statusText;
            }
            get responseType() {
                return this.mXHR.responseType;
            }
            get response() {
                return this.mDataFormater(this.mXHR.response);
            }
            getHeader(name) {
                return this.mXHR.getResponseHeader(name);
            }
            getAllHeaders() {
                return this.mXHR.getAllResponseHeaders();
            }
        }
        let HttpResponseType;
        (function (HttpResponseType) {
            HttpResponseType[HttpResponseType["Buffer"] = 0] = "Buffer";
            HttpResponseType[HttpResponseType["Blob"] = 1] = "Blob";
            HttpResponseType[HttpResponseType["Text"] = 2] = "Text";
            HttpResponseType[HttpResponseType["XML"] = 3] = "XML";
            HttpResponseType[HttpResponseType["JSON"] = 4] = "JSON";
        })(HttpResponseType = net.HttpResponseType || (net.HttpResponseType = {}));
        class HttpClient extends ftk.EventEmitter {
            constructor() {
                super();
                this.mXHR = null;
                this.mHeaders = new Map();
                this.Sync = false;
                this.Timeout = 0;
                this.mResponseType = '';
            }
            get ResponseType() {
                switch (this.mResponseType.toLowerCase()) {
                    case 'arraybuffer':
                        return HttpResponseType.Buffer;
                    case 'blob':
                        return HttpResponseType.Blob;
                    case 'document':
                        return HttpResponseType.XML;
                    case 'json':
                        return HttpResponseType.JSON;
                    case 'text':
                        return HttpResponseType.Text;
                }
                return HttpResponseType.Text;
            }
            set ResponseType(value) {
                switch (value) {
                    case HttpResponseType.Buffer:
                        this.mResponseType = 'arraybuffer';
                        break;
                    case HttpResponseType.Blob:
                        this.mResponseType = 'blob';
                        break;
                    case HttpResponseType.XML:
                        this.mResponseType = 'document';
                        break;
                    case HttpResponseType.JSON:
                        this.mResponseType = 'json';
                        break;
                    case HttpResponseType.Text:
                        this.mResponseType = 'text';
                        break;
                    default:
                        this.mResponseType = '';
                        break;
                }
            }
            Get(url, data) {
                return this.Request('GET', url, data);
            }
            Post(url, data) {
                return this.Request('POST', url, data);
            }
            Put(url, data) {
                return this.Request('PUT', url, data);
            }
            Delete(url, data) {
                return this.Request('DELETE', url, data);
            }
            Request(method, url, data) {
                let xhr = new XMLHttpRequest();
                let response = new _HttpResponseImpl(xhr, (d) => { return this.FormatResult(d); });
                if (!this.Sync) {
                    xhr.onloadstart = () => {
                        try {
                            this.emit('start');
                        }
                        catch (e) {
                            console.error(e);
                        }
                    };
                    xhr.onprogress = (ev) => {
                        try {
                            this.emit('progress', ev.loaded, ev.total);
                        }
                        catch (e) {
                            console.error(e);
                        }
                    };
                    xhr.onload = () => {
                        try {
                            this.emit('load', response);
                        }
                        catch (e) {
                            try {
                                this.emit('error', e.message);
                            }
                            catch (e) {
                                console.error(e);
                            }
                            console.error(e);
                        }
                    };
                    xhr.onabort = () => {
                        try {
                            this.emit('error', 'abort');
                        }
                        catch (e) {
                            console.error(e);
                        }
                    };
                    xhr.onerror = () => {
                        try {
                            this.emit('error', 'unknown error');
                        }
                        catch (e) {
                            console.error(e);
                        }
                    };
                    xhr.ontimeout = () => {
                        try {
                            this.emit('error', 'timeout');
                        }
                        catch (e) {
                            console.error(e);
                        }
                    };
                    xhr.onloadend = () => {
                        xhr.onloadstart = null;
                        xhr.onprogress = null;
                        xhr.onload = null;
                        xhr.onabort = null;
                        xhr.onerror = null;
                        xhr.ontimeout = null;
                        xhr.onloadend = null;
                        try {
                            this.emit('end');
                        }
                        catch (e) {
                            console.error(e);
                        }
                    };
                }
                let reqUrl = url;
                let isget = method.toLowerCase() === 'get';
                if (isget && typeof (data) !== 'undefined') {
                    let i = reqUrl.indexOf('?');
                    if (i < 0) {
                        i = reqUrl.indexOf('#');
                    }
                    if (i < 0) {
                        reqUrl += '?';
                        reqUrl += ftk.utility.ToURLParameters(data, true);
                    }
                    else {
                        if (reqUrl[i] === '?') {
                            reqUrl = reqUrl.substr(0, i + 1)
                                + ftk.utility.ToURLParameters(data, true)
                                + reqUrl.substr(i + 1);
                        }
                        else {
                            reqUrl = reqUrl.substr(0, i)
                                + '?'
                                + ftk.utility.ToURLParameters(data, true)
                                + reqUrl.substr(i);
                        }
                    }
                }
                this.mHeaders.forEach((k, v) => {
                    xhr.setRequestHeader(k, v);
                });
                xhr.timeout = this.Timeout;
                xhr.open(method, reqUrl, !this.Sync, this.Username, this.Password);
                if (!isget) {
                    let reqData = this.FormatParameters(data);
                    if (reqData !== null) {
                        xhr.send(reqData);
                    }
                }
                else {
                    xhr.send();
                }
                this.mXHR = xhr;
                return response;
            }
            SetHeader(name, value) {
                if (typeof (value) === 'undefined' || value === null) {
                    this.mHeaders.delete(name);
                }
                else {
                    this.mHeaders.set(name, value.toString());
                }
            }
            Cancel() {
                if (this.mXHR) {
                    this.mXHR.abort();
                }
            }
            FormatParameters(data) {
                if (typeof (data) === 'undefined' || data === null) {
                    return null;
                }
                return data;
            }
            FormatResult(data) {
                return data;
            }
        }
        net.HttpClient = HttpClient;
        class XMLHttpClient extends HttpClient {
            constructor() {
                super();
                this.ResponseType = HttpResponseType.XML;
            }
            FormatParameters(data) {
                let r = super.FormatParameters(data);
                if (r instanceof Node) {
                    let serializer = new XMLSerializer();
                    return serializer.serializeToString(r);
                }
                return r.toString();
            }
        }
        net.XMLHttpClient = XMLHttpClient;
        class JsonHttpClient extends HttpClient {
            constructor() {
                super();
                this.ResponseType = HttpResponseType.JSON;
            }
            FormatParameters(data) {
                let r = super.FormatParameters(data);
                return JSON.stringify(r);
            }
        }
        net.JsonHttpClient = JsonHttpClient;
        class StringHttpClient extends HttpClient {
            constructor() {
                super();
                this.ResponseType = HttpResponseType.Text;
            }
            FormatParameters(data) {
                let r = super.FormatParameters(data);
                if (r !== null) {
                    return r.toString();
                }
                return '';
            }
        }
        net.StringHttpClient = StringHttpClient;
        class BufferHttpClient extends HttpClient {
            constructor() {
                super();
                this.ResponseType = HttpResponseType.Buffer;
            }
            FormatParameters(data) {
                if (data instanceof ArrayBuffer) {
                    return data;
                }
                else if (ArrayBuffer.isView(data)) {
                    return data;
                }
                else if (data || typeof (data) !== 'undefined' || data !== null) {
                    return ftk.utility.UTF8BufferEncode(data.toString());
                }
                return new Uint8Array(0);
            }
        }
        net.BufferHttpClient = BufferHttpClient;
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
            this.FontName = "serif";
            this.FontSize = 16;
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
                rc.font = this.FontSize.toString() + 'px ' + this.FontName;
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
            if (this.BackgroundColor.A > 0) {
                rc.fillRect(r.x, r.y, r.w, r.h);
            }
            if (this.BorderColor.A > 0) {
                rc.strokeRect(r.x, r.y, r.w, r.h);
            }
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
    class _Texture {
        constructor(image, x, y, w, h) {
            let iw;
            let ih;
            if (image instanceof HTMLImageElement) {
                iw = image.naturalWidth;
                ih = image.naturalHeight;
            }
            else if (image instanceof HTMLVideoElement) {
                iw = image.videoWidth;
                ih = image.videoHeight;
            }
            else {
                iw = image.width;
                ih = image.height;
            }
            let tx = x || 0;
            let ty = y || 0;
            let tw = w || iw;
            let th = h || ih;
            if (tx < 0) {
                tx = 0;
            }
            else if (tx > iw) {
                tx = iw;
            }
            if (ty < 0) {
                ty = 0;
            }
            else if (ty > ih) {
                ty = ih;
            }
            this.mRect = new ftk.Rectangle(tx, ty, tw, th);
            if (this.mRect.right > iw) {
                this.mRect.right = iw;
            }
            if (this.mRect.bottom > ih) {
                this.mRect.bottom = ih;
            }
            this.mImage = image;
        }
        Draw(rc, dx, dy, dw, dh) {
            let r = this.mRect;
            if (r.w < 0 || r.h < 0) {
                return;
            }
            rc.drawImage(this.mImage, r.x, r.y, r.w, r.h, dx, dy, dw, dh);
        }
        Clip(x, y, w, h) {
            let sx = x;
            let sy = y;
            let sw = w;
            let sh = h;
            if (sx < 0) {
                sx = 0;
            }
            else if (sx > this.mRect.w) {
                sx = this.mRect.w;
            }
            if (sy < 0) {
                sy = 0;
            }
            else if (sy > this.mRect.h) {
                sy = this.mRect.h;
            }
            if (sw < 0) {
                sw = 0;
            }
            else if (sw > this.mRect.w) {
                sw = this.mRect.w;
            }
            if (sh < 0) {
                sh = 0;
            }
            else if (sh > this.mRect.h) {
                sh = this.mRect.h;
            }
            return new _Texture(this.mImage, sx + this.mRect.x, sy + this.mRect.y, sw, sh);
        }
        BuildOutline(threshold) {
            let polygon = new ftk.Polygon();
            let rc = ftk.utility.api.createOffscreenCanvas(this.mRect.w, this.mRect.h).getContext('2d');
            if (rc) {
                this.Draw(rc, 0, 0, this.Width, this.Height);
                let img = rc.getImageData(0, 0, this.Width, this.Height);
                const w = img.width << 2;
                const a = threshold || 0;
                let idx = 3;
                let start = 0;
                let v = new ftk.Point(-1, -1);
                let vf = v;
                let l = 0;
                for (let y = 0; y < img.height; ++y) {
                    for (let x = 0; x < img.width; ++x) {
                        if (img.data[idx] > a) {
                            if (x !== v.x) {
                                if (l > 0) {
                                    polygon.pushVertex(v.x, y - 1);
                                    l = 0;
                                }
                                v = polygon.pushVertex(x, y);
                            }
                            else {
                                ++l;
                            }
                            break;
                        }
                        idx += 4;
                    }
                    start += w;
                    idx = start + 3;
                }
                vf = v;
                start = img.data.length - w;
                idx = start + 3;
                l = 0;
                for (let x = 0; x < img.width; ++x) {
                    for (let y = img.height; y >= 0; --y) {
                        if (img.data[idx] > a && (y > vf.y || x > vf.x)) {
                            if (y !== v.y) {
                                if (l > 0) {
                                    polygon.pushVertex(x - 1, v.y);
                                    l = 0;
                                }
                                v = polygon.pushVertex(x, y);
                            }
                            else {
                                ++l;
                            }
                            break;
                        }
                        idx -= w;
                    }
                    start += 4;
                    idx = start + 3;
                }
                vf = v;
                start = img.data.length;
                idx = start - 1;
                l = 0;
                for (let y = img.height; y >= 0; --y) {
                    for (let x = img.width; x >= 0; --x) {
                        if (img.data[idx] > a && (y < vf.y || x > vf.x)) {
                            if (x !== v.x) {
                                if (l > 0) {
                                    polygon.pushVertex(v.x, y + 1);
                                    l = 0;
                                }
                                v = polygon.pushVertex(x, y);
                            }
                            else {
                                ++l;
                            }
                            break;
                        }
                        idx -= 4;
                    }
                    start -= w;
                    idx = start - 1;
                }
                vf = v;
                let vt = polygon.vertexs[0];
                start = w;
                idx = start - 1;
                for (let x = img.width; x >= 0; --x) {
                    for (let y = 0; y < img.height; ++y) {
                        if (img.data[idx] > a && (y < vt.y || x > vt.x) && (y < vf.y || x < vf.x)) {
                            if (y !== v.y) {
                                if (l > 0) {
                                    polygon.pushVertex(x + 1, v.y);
                                    l = 0;
                                }
                                v = polygon.pushVertex(x, y);
                            }
                            else {
                                ++l;
                            }
                            break;
                        }
                        idx += w;
                    }
                    start -= 4;
                    idx = start - 1;
                }
            }
            return polygon;
        }
        get Width() {
            return this.mRect.w;
        }
        get Height() {
            return this.mRect.h;
        }
    }
    ftk.EmptyTexture = new _Texture(new Image(), 0, 0, 0, 0);
    function createTexture(image, x, y, w, h) {
        if (!image) {
            return ftk.EmptyTexture;
        }
        else if (image instanceof ftk.ImageResource) {
            return new _Texture(image.Image, x, y, w, h);
        }
        else if (image instanceof ftk.VideoResource) {
            return new _Texture(image.Video, x, y, w, h);
        }
        return new _Texture(image, x, y, w, h);
    }
    ftk.createTexture = createTexture;
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
    var ui;
    (function (ui) {
        class ImageButton extends ftk.ImageSprite {
            constructor(texture, id) {
                super(texture, id);
                this.mPressState = false;
                this.mNormalTexture = this.Texture;
            }
            get Texture() {
                return super.Texture;
            }
            set Texture(value) {
                super.Texture = value;
                this.mNormalTexture = value;
            }
            OnDispatchMouseEvent(ev, _forced) {
                switch (ev.InputType) {
                    case ftk.InputEventType.MouseEnter:
                        if (this.HoverTexture && (!this.mPressState)) {
                            super.Texture = this.HoverTexture;
                        }
                        break;
                    case ftk.InputEventType.MouseLeave:
                        if (this.mNormalTexture) {
                            super.Texture = this.mNormalTexture;
                        }
                        this.mPressState = false;
                        break;
                    case ftk.InputEventType.MouseDown:
                        if (this.DownTexture && (!this.mPressState)) {
                            super.Texture = this.DownTexture;
                            this.mPressState = true;
                        }
                        break;
                    case ftk.InputEventType.MouseUp:
                        if (this.HoverTexture && (this.mPressState)) {
                            this.mPressState = false;
                            super.Texture = this.HoverTexture;
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