"use strict";
var ftk;
(function (ftk) {
    function NewInstance(typename, ...args) {
        let g = window;
        let f = g[typename];
        if (typeof (f) === "function") {
            let fn = f;
            args.unshift(null);
            let cfn = fn.bind.apply(fn, args);
            return cfn();
        }
        return undefined;
    }
    ftk.NewInstance = NewInstance;
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
            var output = 0;
            for (var i = 0; i < input.length; i++) {
                var charCode = input.charCodeAt(i);
                if (charCode > 0x7FF) {
                    if (0xD800 <= charCode && charCode <= 0xDBFF) {
                        i++;
                        output++;
                    }
                    output += 3;
                }
                else if (charCode > 0x7F)
                    output += 2;
                else
                    output++;
            }
            return output;
        }
        utility.UTF8BufferEncodeLength = UTF8BufferEncodeLength;
        function UTF8BufferEncode(input) {
            let buffer = new ArrayBuffer(UTF8BufferEncodeLength(input));
            let output = new Uint8Array(buffer);
            let pos = 0;
            for (var i = 0; i < input.length; i++) {
                var charCode = input.charCodeAt(i);
                if (0xD800 <= charCode && charCode <= 0xDBFF) {
                    var lowCharCode = input.charCodeAt(++i);
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
            var output = "";
            var utf16;
            var pos = 0;
            if (!offset)
                offset = 0;
            if (!length)
                length = buffer.byteLength;
            var input = new Uint8Array(buffer, offset, length);
            while (pos < length) {
                var byte1 = input[pos++];
                if (byte1 < 128)
                    utf16 = byte1;
                else {
                    var byte2 = input[pos++] - 128;
                    if (byte2 < 0)
                        byte2 = 0;
                    if (byte1 < 0xE0) // 2 byte character
                        utf16 = 64 * (byte1 - 0xC0) + byte2;
                    else {
                        var byte3 = input[pos++] - 128;
                        if (byte3 < 0)
                            byte3 = 0;
                        if (byte1 < 0xF0) // 3 byte character
                            utf16 = 4096 * (byte1 - 0xE0) + 64 * byte2 + byte3;
                        else {
                            var byte4 = input[pos++] - 128;
                            if (byte4 < 0)
                                byte4 = 0;
                            if (byte1 < 0xF8) // 4 byte character
                                utf16 = 262144 * (byte1 - 0xF0) + 4096 * byte2 + 64 * byte3 + byte4;
                            else // longer encodings are not supported
                                utf16 = '?'.charCodeAt(0);
                        }
                    }
                }
                if (utf16 > 0xFFFF) // 4 byte character - express as a surrogate pair
                 {
                    utf16 -= 0x10000;
                    output += String.fromCharCode(0xD800 + (utf16 >> 10)); // lead character
                    utf16 = 0xDC00 + (utf16 & 0x3FF); // trail character
                }
                output += String.fromCharCode(utf16);
            }
            return output;
        }
        utility.UTF8BufferDecode = UTF8BufferDecode;
    })(utility = ftk.utility || (ftk.utility = {}));
})(ftk || (ftk = {}));
/// <reference path="./objectnode.ts" />
/// <reference path="./utility.ts" />
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
            for (let i = 0; i < this.mLayerList.length; ++i) {
                if (this.mLayerList[i].Id === id) {
                    return this.mLayerList[i];
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
            let values = this.mLayerList;
            for (let i = 0; i < values.length; ++i) {
                values[i].DispatchTouchEvent(ev, forced);
                if (ev.StopPropagation)
                    break;
            }
        }
        DispatchMouseEvent(ev, forced) {
            let values = this.mLayerList;
            for (let i = 0; i < values.length; ++i) {
                values[i].DispatchMouseEvent(ev, forced);
                if (ev.StopPropagation)
                    break;
            }
        }
        DispatchKeyboardEvent(ev, forced) {
            let values = this.mLayerList;
            for (let i = 0; i < values.length; ++i) {
                values[i].DispatchKeyboardEvent(ev, forced);
                if (ev.StopPropagation)
                    break;
            }
        }
        DispatchNoticeEvent(ev, forced) {
            let values = this.mLayerList;
            for (let i = 0; i < values.length; ++i) {
                values[i].DispatchNoticeEvent(ev, forced);
                if (ev.StopPropagation)
                    break;
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
/// <reference path="./objectnode.ts" />
var ftk;
(function (ftk) {
    class Sprite {
        constructor(id) {
            this.mRectangle = new ftk.Rectangle();
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
            return new ftk.Point(this.mRectangle.x + this.mBasePoint.x, this.mRectangle.y + this.mBasePoint.y);
        }
        set Position(pos) {
            this.mRectangle.x = pos.x - this.mBasePoint.x;
            this.mRectangle.y = pos.y - this.mBasePoint.y;
        }
        get X() {
            return this.mRectangle.x + this.mBasePoint.x;
        }
        set X(value) {
            this.mRectangle.x = value - this.mBasePoint.x;
        }
        get Y() {
            return this.mRectangle.y + this.mBasePoint.y;
        }
        set Y(value) {
            this.mRectangle.y = value - this.mBasePoint.y;
        }
        get Box() {
            return this.mRectangle.clone();
        }
        set Box(value) {
            this.mRectangle = value.clone();
        }
        get size() {
            return this.mRectangle.size;
        }
        set size(value) {
            this.mRectangle.size = value;
        }
        get Width() {
            return this.mRectangle.w;
        }
        set Width(value) {
            this.mRectangle.w = value;
        }
        get Height() {
            return this.mRectangle.h;
        }
        set Height(value) {
            this.mRectangle.h = value;
        }
        OnResized() {
        }
        Resize(w, h) {
            this.mRectangle.w = w;
            this.mRectangle.h = h;
            this.OnResized();
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
        get Visible() {
            return this.mVisible;
        }
        set Visible(value) {
            this.mVisible = value;
        }
        get Animations() {
            if (this.mAnimations)
                return this.mAnimations;
            return [];
        }
        AddAnimation(animation) {
            if (!this.mAnimations)
                this.mAnimations = new Array();
            this.mAnimations.push(animation);
        }
        RemoveAnimation(animation) {
            if (!this.mAnimations)
                return false;
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
            let box = this.Box;
            return point.x > box.x && (point.x < box.x + box.w)
                && point.y > box.y && (point.y < box.y + box.h);
        }
        Rander(rc) {
            if (rc && this.Visible) {
                rc.save();
                let angle = this.Angle;
                if (angle !== 0) {
                    let box = this.Box;
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
        OnUpdate(timestamp) {
        }
        OnDispatchTouchEvent(ev, forced) {
        }
        OnDispatchMouseEvent(ev, forced) {
        }
        OnDispatchKeyboardEvent(ev, forced) {
        }
        OnDispatchNoticeEvent(ev, forced) {
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
                for (let i = 0; i < anis.length; ++i) {
                    anis[i].Update(timestamp, this);
                }
            }
            this.OnUpdate(timestamp);
        }
    }
    ftk.Sprite = Sprite;
})(ftk || (ftk = {}));
/// <reference path="./sprite.ts" />
var ftk;
(function (ftk) {
    class ParticleSprite extends ftk.Sprite {
        constructor() {
            super();
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
        DispatchTouchEvent(ev, forced) {
        }
        DispatchMouseEvent(ev, forced) {
        }
        DispatchKeyboardEvent(ev, forced) {
        }
        OnRander(rc) {
            if (this.mParticleRander) {
                let randerHook = this.mParticleRander;
                this.mParticles.forEach((particle) => { randerHook.call(this, rc, particle); });
            }
            else {
                this.mParticles.forEach((particle) => { particle.Render(rc); });
            }
        }
        OnUpdate() {
            return false;
        }
        Update(timestamp) {
            this.mUpdateTime = timestamp;
            if (!this.OnUpdate()) {
                let arr = this.mParticles;
                for (var i = 0; i < arr.length; ++i) {
                    arr[i].Update();
                }
                var j = 0;
                for (var i = 0; i < arr.length; ++i) {
                    if (arr[i].active) {
                        arr[j++] = arr[i];
                    }
                }
                arr.length = j;
            }
            ++this.mTicks;
            this.mLastUpdateTime = timestamp;
        }
    }
    ftk.ParticleSprite = ParticleSprite;
    class Particle {
        constructor(pa, x, y) {
            this.mPA = pa;
            this.x = x;
            this.y = y;
            let pt = this.randPointOnCircle(Math.random() + 1);
            this.vx = pt.x;
            this.vy = pt.y;
            this.life = Math.floor(Math.random() * 20) + 40;
            this.bounce = 0.6;
            this.gravity = 0.07;
            this.drag = 0.998;
            this.active = true;
        }
        get PA() {
            return this.mPA;
        }
        Update() {
            if (--this.life < 0) {
                this.active = false;
            }
            this.vy += this.gravity;
            this.vx *= this.drag;
            this.x += this.vx;
            this.y += this.vy;
        }
        randPointOnCircle(size) {
            if (size == null) {
                size = 1;
            }
            var x = 0.0;
            var y = 0.0;
            var s = 0.0;
            do {
                x = (Math.random() - 0.5) * 2.0;
                y = (Math.random() - 0.5) * 2.0;
                s = x * x + y * y;
            } while (s > 1);
            var scale = size / Math.sqrt(s);
            return new ftk.Point(x * scale, y * scale);
        }
    }
    ftk.Particle = Particle;
})(ftk || (ftk = {}));
var ftk;
(function (ftk) {
    class Color {
        constructor(arg1, arg2, arg3, arg4) {
            this.m_r = 0;
            this.m_g = 0;
            this.m_b = 0;
            this.m_a = 1.0;
            if (typeof (arg1) === "string")
                this.parseString(arg1);
            else if ((typeof (arg1) === "number") && (typeof (arg2) === "number") && (typeof (arg3) === "number")) {
                this.m_r = arg1 & 0xFF;
                this.m_g = arg2 & 0xFF;
                this.m_b = arg3 & 0xFF;
                if (typeof (arg4) === "number") {
                    this.m_a = Color.ClampedAlphaValue(arg4);
                }
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
                    this.m_r = parseInt(colors[0].trim()) & 0xFF;
                    this.m_g = parseInt(colors[1].trim()) & 0xFF;
                    this.m_b = parseInt(colors[2].trim()) & 0xFF;
                    if (colors.length >= 4) {
                        this.m_a = Color.ClampedAlphaValue(parseFloat(colors[3].trim()));
                    }
                }
            }
        }
        static ClampedColorValue(value) {
            if (value > 0xFF)
                return 0xFF;
            else if (value < 0)
                return 0;
            return Math.round(value);
        }
        static ClampedAlphaValue(value) {
            return Math.min(Math.max(value, 0.0), 1.0);
        }
        addLightness(value) {
            this.R = this.m_r + value;
            this.G = this.m_g + value;
            this.B = this.m_b + value;
        }
        static blend(x, y, alpha) {
            alpha = Color.ClampedColorValue(alpha);
            let r = (x.m_r * (1 - alpha)) + (y.m_r * alpha);
            let g = (x.m_g * (1 - alpha)) + (y.m_g * alpha);
            let b = (x.m_b * (1 - alpha)) + (y.m_b * alpha);
            let a = (x.m_a * (1 - alpha)) + (y.m_a * alpha);
            return new Color(r, g, b, a);
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
        get G() {
            return this.m_g;
        }
        get B() {
            return this.m_b;
        }
        get A() {
            return this.m_a;
        }
        get Luminance() {
            return (this.m_r * 0.2126) + (this.m_g * 0.7152) + (this.m_b * 0.0722);
        }
        set R(value) {
            this.m_r = Color.ClampedColorValue(value);
        }
        set G(value) {
            this.m_g = Color.ClampedColorValue(value);
        }
        set B(value) {
            this.m_b = Color.ClampedColorValue(value);
        }
        set A(value) {
            this.m_a = Color.ClampedAlphaValue(value);
        }
        get RGBValue() {
            return (this.m_r << 16) | (this.m_g << 8) | (this.m_b);
        }
        get RGBAValue() {
            return (this.m_r << 24) | (this.m_g << 16) | (this.m_b << 8) | (Math.round(this.m_a * 255));
        }
        toRGBString() {
            return "rgb(" + this.m_r + "," + this.m_g + "," + this.m_b + ")";
        }
        toRGBAString() {
            return "rgba(" + this.m_r + "," + this.m_g + "," + this.m_b + "," + this.m_a + ")";
        }
        pad(val, len) {
            let padded = [];
            for (var i = 0, j = Math.max(len - val.length, 0); i < j; i++) {
                padded.push('0');
            }
            padded.push(val);
            return padded.join('');
        }
        toHEXString(alpha) {
            let rs = "#";
            rs += this.pad((this.m_r & 0xFF).toString(16).toUpperCase(), 2);
            rs += this.pad((this.m_g & 0xFF).toString(16).toUpperCase(), 2);
            rs += this.pad((this.m_b & 0xFF).toString(16).toUpperCase(), 2);
            if (alpha)
                rs += this.pad((Math.round(this.m_a * 255) & 0xFF).toString(16).toUpperCase(), 2);
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
    }
    ftk.Color = Color;
})(ftk || (ftk = {}));
/// <reference path="../particlesystem.ts" />
/// <reference path="../color.ts" />
var ftk;
(function (ftk) {
    var particles;
    (function (particles) {
        class SpeedParticle extends ftk.Particle {
            constructor(pa, x, y, color) {
                super(pa, x, y);
                this.drag = 0;
                this.color = color;
                this.size = Math.random() * 10;
            }
            Render(rc) {
                rc.beginPath();
                rc.fillStyle = this.color.toRGBAString();
                rc.arc(this.x, this.y, this.size, 0, 2 * Math.PI, true);
                rc.fill();
            }
            Update() {
                super.Update();
                this.color.A = this.life;
            }
        }
        particles.SpeedParticle = SpeedParticle;
    })(particles = ftk.particles || (ftk.particles = {}));
})(ftk || (ftk = {}));
/// <reference path="../particlesystem.ts" />
/// <reference path="../particles/seed.ts" />
var ftk;
(function (ftk) {
    var ui;
    (function (ui) {
        class ProgressBar extends ftk.Sprite {
            constructor(x, y, w, h, id) {
                super(id);
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
                if (value < this.mMin)
                    value = this.mMin;
                if (value > this.mMax)
                    value = this.mMax;
                this.mValue = value;
            }
            get MaxValue() {
                return this.mMax;
            }
            set MaxValue(value) {
                if (value < this.mMin)
                    value = this.mMin;
                this.mMax = value;
            }
            get MinValue() {
                return this.mMin;
            }
            set MinValue(value) {
                if (value > this.mMax)
                    value = this.mMax;
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
                var percentage = Math.floor(this.Value) + '%';
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
                var percentage = Math.floor(this.Value) + '%';
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
/// <reference path="./objectnode.ts" />
/// <reference path="./stage.ts" />
/// <reference path="./sprite.ts" />
/// <reference path="./ui/progressbar.ts" />
var ftk;
(function (ftk) {
    class EventHandlerChain {
        constructor() {
            this.mHandlers = new Array();
        }
        get length() { return this.mHandlers.length; }
        add(handler) {
            this.mHandlers.push(handler);
        }
        remove(handler) {
            let i = this.mHandlers.indexOf(handler);
            if (i >= 0) {
                this.mHandlers.splice(i, 1);
            }
        }
        call(ctx, ...args) {
            let r;
            this.mHandlers.forEach((handler) => {
                r = handler.apply(ctx, args);
            });
            return r;
        }
    }
    class AbstractEngine {
        constructor(canvas) {
            this.mEngineUpdateEventArg = new ftk.EngineEvent(this, 0);
            this.mEngineRanderEventArg = new ftk.EngineEvent(this, null);
            canvas.addEventListener("mousedown", (ev) => { this.OnMouseDown(ev); });
            canvas.addEventListener("mouseup", (ev) => { this.OnMouseUp(ev); });
            canvas.addEventListener("mousemove", (ev) => { this.OnMouseMove(ev); });
            this.mCanvas = canvas;
            this.mRC = canvas.getContext("2d");
            this.mRootNode = new ftk.Stage(canvas.width, canvas.height);
            this.mEventPrevTarget = null;
            this.mEventCaptured = false;
            this.mEventCaptureContext = undefined;
            this.mEventHandlerMap = new Map();
            this.mNoticeHandlerMap = new Map();
            this.mResourceManager = new ftk.ResourceDBEditor();
            this.mFrameRate = 60;
            this.mEventHandlerMap.set("mousedown", new EventHandlerChain());
            this.mEventHandlerMap.set("mouseup", new EventHandlerChain());
            this.mEventHandlerMap.set("mousemove", new EventHandlerChain());
            this.mEventHandlerMap.set("mouseenter", new EventHandlerChain());
            this.mEventHandlerMap.set("mouselevae", new EventHandlerChain());
            this.mEventHandlerMap.set("touchcancel", new EventHandlerChain());
            this.mEventHandlerMap.set("touchend", new EventHandlerChain());
            this.mEventHandlerMap.set("touchmove", new EventHandlerChain());
            this.mEventHandlerMap.set("touchstart", new EventHandlerChain());
            this.mEventHandlerMap.set("keydown", new EventHandlerChain());
            this.mEventHandlerMap.set("keyup", new EventHandlerChain());
            this.mEventHandlerMap.set("loading", new EventHandlerChain());
            this.mEventHandlerMap.set("ready", new EventHandlerChain());
            this.mEventHandlerMap.set("shutdown", new EventHandlerChain());
            this.mEventHandlerMap.set("update", new EventHandlerChain());
            this.mEventHandlerMap.set("rander", new EventHandlerChain());
            this.mEventHandlerMap.set("pause", new EventHandlerChain());
            this.mEventHandlerMap.set("resume", new EventHandlerChain());
            this.mEventHandlerMap.set("fault", new EventHandlerChain());
            this.mEventHandlerMap.set("offline", new EventHandlerChain());
            this.mEventHandlerMap.set("online", new EventHandlerChain());
            this.mEventHandlerMap.set("active", new EventHandlerChain());
            this.mEventHandlerMap.set("inactive", new EventHandlerChain());
        }
        get FrameRate() { return this.mFrameRate; }
        setFrameRate(value) { this.mFrameRate = value; }
        get ViewportWidth() { return this.mCanvas.width; }
        get ViewportHeight() { return this.mCanvas.height; }
        get Root() { return this.mRootNode; }
        get R() {
            return this.mResourceManager;
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
            let hc = this.mNoticeHandlerMap.get(name);
            if (hc)
                return hc.call(this, ev);
            return undefined;
        }
        addMouseListener(name, handler) {
            let hc = this.mEventHandlerMap.get(name);
            if (hc)
                return hc.add(handler);
        }
        addTouchListener(name, handler) {
            let hc = this.mEventHandlerMap.get(name);
            if (hc)
                return hc.add(handler);
        }
        addKeyboardListener(name, handler) {
            let hc = this.mEventHandlerMap.get(name);
            if (hc)
                return hc.add(handler);
        }
        addEngineListener(name, handler) {
            let hc = this.mEventHandlerMap.get(name);
            if (hc)
                return hc.add(handler);
        }
        addNoticeListener(name, handler) {
            let hc = this.mEventHandlerMap.get(name);
            if (hc)
                return hc.add(handler);
        }
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
            this.callEventHandler("update", this.mEngineUpdateEventArg);
            this.Rander();
        }
        Rander() {
            let root = this.Root;
            this.mRC.save();
            root.Rander(this.mRC);
            this.mEngineRanderEventArg.Args = this.mRC;
            this.mRC.restore();
        }
        createGMouseEvent(type, ev) {
            let gev = new ftk.GMouseEvent(this, type, ev.altKey, ev.ctrlKey, ev.shiftKey, ev.clientX, ev.clientY, ev.button, 0);
            if (this.mEventCaptured)
                gev.CaptureContext = this.mEventCaptureContext;
            return gev;
        }
        callEventHandler(name, ev) {
            let hc = this.mEventHandlerMap.get(name);
            if (hc)
                hc.call(this, ev);
        }
        OnMouseEvent(type, ev) {
            let root = this.Root;
            let gev = this.createGMouseEvent(type, ev);
            root.DispatchMouseEvent(gev, false);
            if (gev.StopPropagation)
                ev.stopPropagation();
            if (gev.Target) {
                switch (gev.InputType) {
                    case ftk.InputEventType.MouseDown: {
                        this.callEventHandler("mousedown", gev);
                        break;
                    }
                    case ftk.InputEventType.MouseMove: {
                        if (this.mEventPrevTarget != gev.Target) {
                            if (this.mEventPrevTarget) {
                                let newev = this.createGMouseEvent(ftk.InputEventType.MouseLeave, ev);
                                this.mEventPrevTarget.DispatchMouseEvent(newev, true);
                                this.callEventHandler("mouselevae", newev);
                            }
                            if (gev.Target) {
                                let newev = this.createGMouseEvent(ftk.InputEventType.MouseEnter, ev);
                                gev.Target.DispatchMouseEvent(newev, true);
                                this.callEventHandler("mouseenter", newev);
                            }
                        }
                        this.callEventHandler("mousemove", gev);
                        break;
                    }
                    case ftk.InputEventType.MouseUp: {
                        this.callEventHandler("mouseup", gev);
                        break;
                    }
                }
            }
            if (this.mCanvas.style.cursor !== gev.Cursor)
                this.mCanvas.style.cursor = gev.Cursor;
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
    class EngineLogoSprite extends ftk.Sprite {
        constructor(x, y, w, h, id) {
            super(id);
            this.mColor0 = new ftk.Color(0xff0060ff);
            this.mColor1 = new ftk.Color(0xff0000ff);
            this.mShadowBlur = 5;
            this.Position = new ftk.Point(x, y);
            this.Resize(w, h);
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
            //canvas.closePath();
            rc.lineWidth = 0.8;
            rc.strokeStyle = "#fff";
            rc.stroke();
            rc.fillStyle = this.mColor1.toRGBAString();
            rc.strokeStyle = "#fff";
            rc.lineWidth = 0.5;
            rc.font = (size / 6) + "px serif";
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
            if (options.FrameRate)
                this.setFrameRate(options.FrameRate);
            if (!options.HideLogo)
                this.AddEngineLogo();
            if (!options.HideLoading) {
                this.AddLoadingProgressBar();
                this.addEngineListener("loading", (ev) => {
                    let progress = ev.Args;
                    if (this.mLoadingProgressBar) {
                        this.mLoadingProgressBar.Value = progress;
                    }
                });
            }
            this.addEngineListener("ready", (ev) => {
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
                    if (this.mLogo)
                        this.mLogo.Visible = false;
                    if (this.mLoadingProgressBar)
                        this.mLoadingProgressBar.Visible = true;
                    this._Start();
                }, 2000);
            }
            else {
                if (this.mLoadingProgressBar)
                    this.mLoadingProgressBar.Visible = true;
                this._Start();
            }
        }
        Shutdown() {
            this.callEventHandler("shutdown", new ftk.EngineEvent(this, null));
            this.R.Edit().Clear();
        }
        _Start() {
            this.R.Edit().LoadAll((progress) => {
                this.callEventHandler("loading", new ftk.EngineEvent(this, progress));
            }).then(() => {
                this.callEventHandler("ready", new ftk.EngineEvent(this, null));
            }).catch((reason) => {
                this.callEventHandler("fault", new ftk.EngineEvent(this, reason));
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
        if (_EngineImpl)
            throw Error("Libraries cannot be initialized more than once!");
        _EngineImpl = new EngineImpl(options);
        ftk.Engine = _EngineImpl;
    }
    ftk.LibrarySetup = LibrarySetup;
    function LibraryShutdown(options) {
        if (_EngineImpl)
            _EngineImpl.Shutdown();
        _EngineImpl = null;
        ftk.Engine = undefined;
    }
    ftk.LibraryShutdown = LibraryShutdown;
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
                if (urlArr.length == 1)
                    urlArr = url.split('#');
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
        setLoaded(value) {
            this.mLoaded = value;
        }
        Load() {
            return new Promise((resolve, reject) => {
                if (this.Loaded)
                    resolve();
                this.OnLoad(resolve, reject);
            });
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
            this.mImage.onerror = () => { reject(); };
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
            this.mAudio.onerror = () => { reject(); };
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
            this.mVideo.onerror = () => { reject(); };
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
            xhr.onerror = () => { reject(); };
            xhr.onabort = () => { reject(); };
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
            xhr.onerror = () => { reject(); };
            xhr.onabort = () => { reject(); };
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
            xhr.onerror = () => { reject(); };
            xhr.onabort = () => { reject(); };
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
            if (!r)
                return r;
            if (r instanceof ImageResource)
                return r;
            return undefined;
        }
        GetAudio(name) {
            let r = this.Get(name);
            if (!r)
                return r;
            if (r instanceof AudioResource)
                return r;
            return undefined;
        }
        GetVideo(name) {
            let r = this.Get(name);
            if (!r)
                return r;
            if (r instanceof VideoResource)
                return r;
            return undefined;
        }
        LoadAll(progressHandler) {
            let total = 0;
            let count = 0;
            if (progressHandler)
                progressHandler(0);
            return new Promise((resolve, reject) => {
                let list = new Array();
                this.mResourceList.forEach((r) => {
                    if (!r.Loaded) {
                        let p = r.Load();
                        if (progressHandler) {
                            p.then(() => {
                                ++count;
                                progressHandler((count * 100) / total);
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
/// <reference path="./sprite.ts" />
/// <reference path="./resource.ts" />
var ftk;
(function (ftk) {
    class ImageSprite extends ftk.Sprite {
        constructor(resource, w, h, id) {
            super(id);
            if (resource)
                this.mImage = resource;
            else
                this.mImage = new ftk.ImageResource("");
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
/// <reference path="./objectnode.ts" />
/// <reference path="./color.ts" />
/// <reference path="./resource.ts" />
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
            for (let i = 0; i < this.mNodes.length; ++i) {
                if (this.mNodes[i].Id === id) {
                    return this.mNodes[i];
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
            if (!this.Visible)
                return;
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
                let values = this.mNodes;
                for (let i = 0; i < values.length; ++i) {
                    values[i].DispatchTouchEvent(ev, forced);
                    if (ev.StopPropagation)
                        break;
                }
            }
        }
        DispatchMouseEvent(ev, forced) {
            if (this.Visible) {
                if (!this.EventTransparent) {
                    ev.Target = this;
                    ev.StopPropagation = true;
                }
                let values = this.mNodes;
                for (let i = 0; i < values.length; ++i) {
                    values[i].DispatchMouseEvent(ev, forced);
                    if (ev.StopPropagation)
                        break;
                }
            }
        }
        DispatchKeyboardEvent(ev, forced) {
            if (this.Visible) {
                if (!this.EventTransparent) {
                    ev.Target = this;
                    ev.StopPropagation = true;
                }
                let values = this.mNodes;
                for (let i = 0; i < values.length; ++i) {
                    values[i].DispatchKeyboardEvent(ev, forced);
                    if (ev.StopPropagation)
                        break;
                }
            }
        }
        DispatchNoticeEvent(ev, forced) {
            let values = this.mNodes;
            for (let i = 0; i < values.length; ++i) {
                values[i].DispatchNoticeEvent(ev, forced);
                if (ev.StopPropagation)
                    break;
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
                let x = (rc.canvas.width - image.naturalWidth) / 2;
                let y = (rc.canvas.height - image.naturalHeight) / 2;
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
/// <reference path="./sprite.ts" />
/// <reference path="./resource.ts" />
var ftk;
(function (ftk) {
    class VideoSprite extends ftk.Sprite {
        constructor(resource, w, h, id) {
            super(id);
            if (resource)
                this.mVideo = resource;
            else
                this.mVideo = new ftk.VideoResource("");
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
        OnRander(rc) {
            let video = this.Resource.Video;
            let box = this.Box;
            rc.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, box.x, box.y, box.w, box.h);
        }
        Play() {
            this.Resource.Video.play();
        }
        Pause() {
            this.Resource.Video.pause();
        }
    }
    ftk.VideoSprite = VideoSprite;
})(ftk || (ftk = {}));
/// <reference path="../imagesprite.ts" />
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
            OnDispatchMouseEvent(ev, forced) {
                switch (ev.InputType) {
                    case ftk.InputEventType.MouseEnter:
                        if (this.mHoverImage && (!this.mPressState))
                            super.Resource = this.mHoverImage;
                        break;
                    case ftk.InputEventType.MouseLeave:
                        if (this.mNormalImage)
                            super.Resource = this.mNormalImage;
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
/// <reference path="./utility.ts" />
var ftk;
(function (ftk) {
    var net;
    (function (net) {
        const _voidfunction = () => { };
        class Channel {
            constructor(options) {
                this.mSocket = null;
                this.mReconnectInterval = options.reconnectInterval;
                this.mMaxReconnectCount = options.maxReconnectCount ? options.maxReconnectCount : 0;
                this.mReconnectCount = 0;
                this.mCloseing = false;
                this.mWaitingQueue = new Array();
                this.mOnReconnect = _voidfunction;
                this.mOnError = _voidfunction;
                this.connect(options.url, options.protocols);
            }
            get OnReconnect() {
                if (!this.mOnReconnect)
                    return _voidfunction;
                return this.mOnReconnect;
            }
            set OnReconnect(value) {
                this.mOnReconnect = value;
            }
            get OnError() {
                if (!this.mOnError)
                    return _voidfunction;
                return this.mOnError;
            }
            set OnError(value) {
                this.mOnError = value;
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
                this.mSocket.onerror = (ev) => {
                    if ((!this.mSocket) || this.mSocket.readyState != WebSocket.OPEN) {
                        this.reconnect(url, protocols);
                    }
                };
                this.mSocket.onmessage = (ev) => {
                    this.OnMessageHandle(ev.data);
                };
                this.mSocket.onopen = (ev) => {
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
                    this.OnError("Reconnect exceeds maximum number.");
                }
                else {
                    setTimeout(() => {
                        this.OnReconnect(this.mReconnectCount);
                        if (!this.mCloseing)
                            this.connect(url, protocols);
                    }, this.mReconnectInterval);
                }
            }
            SendMessage(data) {
                if (this.mSocket && this.Connected) {
                    this.mSocket.send(data);
                }
                else {
                    if (this.mCloseing) {
                        this.OnError("Can't try an operation on an unrecoverable channel.");
                    }
                    else {
                        if (this.mWaitingQueue.length > 1024 * 8)
                            this.mWaitingQueue.shift();
                        this.mWaitingQueue.push(data);
                    }
                }
            }
            get Connected() {
                return (!this.mCloseing) && (this.mSocket !== null) && (this.mSocket.readyState === WebSocket.OPEN);
            }
            get WaitingQueueLength() {
                return this.mWaitingQueue.length;
            }
            _Close() {
                if (this.mSocket) {
                    this.mSocket.onclose = null;
                    this.mSocket.onerror = null;
                    this.mSocket.onmessage = null;
                    this.mSocket.onopen = null;
                    if (this.mSocket.readyState !== WebSocket.CLOSED)
                        this.mSocket.close(255, "call close function");
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
            constructor() {
                super(...arguments);
                this.mOnMessage = _voidfunction;
            }
            OnMessageHandle(data) {
                this.OnMessage(ftk.utility.UTF8BufferDecode(data));
            }
            get OnMessage() {
                if (!this.mOnMessage)
                    return _voidfunction;
                return this.mOnMessage;
            }
            set OnMessage(value) {
                this.mOnMessage = value;
            }
            Send(data) {
                this.SendMessage(ftk.utility.UTF8BufferEncode(data));
            }
        }
        net.StringChannel = StringChannel;
        class JsonChannel extends Channel {
            constructor() {
                super(...arguments);
                this.mOnMessage = _voidfunction;
            }
            OnMessageHandle(data) {
                let json;
                try {
                    json = JSON.parse(ftk.utility.UTF8BufferDecode(data));
                }
                catch (ex) {
                    this.OnError("Unexpected end of JSON input");
                    return;
                }
                this.OnMessage(json);
            }
            get OnMessage() {
                if (!this.mOnMessage)
                    return _voidfunction;
                return this.mOnMessage;
            }
            set OnMessage(value) {
                this.mOnMessage = value;
            }
            Send(data) {
                this.SendMessage(ftk.utility.UTF8BufferEncode(JSON.stringify(data)));
            }
        }
        net.JsonChannel = JsonChannel;
        class ArrayBufferChannel extends Channel {
            constructor() {
                super(...arguments);
                this.mOnMessage = _voidfunction;
            }
            OnMessageHandle(data) {
                this.OnMessage(data);
            }
            get OnMessage() {
                if (!this.mOnMessage)
                    return _voidfunction;
                return this.mOnMessage;
            }
            set OnMessage(value) {
                this.mOnMessage = value;
            }
            Send(data) {
                this.SendMessage(data);
            }
        }
        net.ArrayBufferChannel = ArrayBufferChannel;
    })(net = ftk.net || (ftk.net = {}));
})(ftk || (ftk = {}));
/// <reference path="../../src/common.ts" />
/// <reference path="../../src/engine.ts" />
/// <reference path="../../src/stage.ts" />
/// <reference path="../../src/sprite.ts" />
/// <reference path="../../src/imagesprite.ts" />
/// <reference path="../../src/layer.ts" />
/// <reference path="../../src/videosprite.ts" />
/// <reference path="../../src/ui/button.ts" />
/// <reference path="../../src/ui/progressbar.ts" />
/// <reference path="../../src/net.ts" />
var app;
(function (app) {
    class BackgroundLayer extends ftk.BackgroundImageLayer {
        constructor(stage) {
            super();
            let image = ftk.Engine.R.GetImage("res/images/desktop.jpg");
            if (image)
                this.BackgroundImage = image;
            this.RepeatStyle = "repeat";
            this.EventTransparent = false;
        }
    }
    class StartLayer extends ftk.Layer {
        constructor() {
            super();
            let R = ftk.Engine.R;
            let ready = new ftk.ui.ImageButton(R.GetImage("res/images/ready.png"), "Game.Start.Button");
            ready.DownResource = R.GetImage("res/images/ready-down.png");
            ready.HoverResource = R.GetImage("res/images/ready-hover.png");
            ready.Position = new ftk.Point(280, 200);
            this.AddNode(ready);
            let ani = new ftk.KeyframeAnimation(true, true);
            ani.AddFrame(new ftk.AngleAnimation(0, Math.PI * 2, 1000, true, true));
            ani.AddFrame(new ftk.OpacityAnimation(0, 1, 3000, true, true));
            ani.AddFrame(new ftk.BoxAnimation(new ftk.Rectangle(280, 200, 50, 50), new ftk.Rectangle(200, 150, 300, 100), 3000, true, true));
            ready.AddAnimation(ani);
            /*let p:ftk.ui.ProgressBar = new ftk.ui.CircularProgressBar(200, 200, 100, 100);
            p.Value = 35;
            this.AddNode(p);

            p = new ftk.ui.RectangularProgressBar(100, 330, 500, 20);
            p.Value = 35;
            this.AddNode(p);*/
        }
    }
    class EffectsLayer extends ftk.Layer {
        constructor(stage) {
            super();
            let R = ftk.Engine.R;
            let fireworks = new ftk.particles.FireworkAnimation();
            fireworks.Position = new ftk.Point(0, 0);
            fireworks.Resize(stage.Width, stage.Height);
            this.AddNode(fireworks);
        }
    }
    class DemoGame {
        constructor() {
            this.mEffectsLayer = new EffectsLayer(ftk.Engine.Root);
            ftk.Engine.Root.AddLayer(new BackgroundLayer(ftk.Engine.Root));
            ftk.Engine.Root.AddLayer(new StartLayer());
            ftk.Engine.Root.AddLayer(this.mEffectsLayer);
            ftk.Engine.addMouseListener("mouseup", (ev) => {
                console.log(ev.Target);
                if (ev.Target) {
                    if (ev.Target.Id === "Game.Start.Button") {
                        this.mEffectsLayer.Visible = !this.mEffectsLayer.Visible;
                        let a = ftk.Engine.R.GetAudio("res/audios/bk.mp3");
                        if (this.mEffectsLayer.Visible) {
                            //video.Play();
                            //if(a)a.Audio.play();
                        }
                        else {
                            //if(a)a.Audio.pause();
                        }
                    }
                }
            });
            ftk.Engine.addEngineListener("fault", (ev) => {
                this.OnGameFault(ev.Args);
            });
        }
        OnGameFault(reason) {
            console.error("game fault:", reason);
        }
        StartUp() {
            console.log("game StartUp!");
        }
    }
    function Main(canvas) {
        ftk.LibrarySetup({
            canvas: canvas,
            HideLoading: false,
            HideLogo: false
        });
        app.PrepareResources();
        ftk.Engine.addEngineListener("loading", (ev) => {
            let progress = ev.Args;
            console.log(progress);
        });
        ftk.Engine.addEngineListener("ready", (ev) => {
            console.log("program start.");
            let game = new DemoGame();
            game.StartUp();
        });
        ftk.Engine.Run();
    }
    app.Main = Main;
})(app || (app = {}));
var app;
(function (app) {
    function PrepareResources() {
        let R = ftk.Engine.R.Edit();
        let ImageR = ftk.ImageResource;
        let AudioR = ftk.AudioResource;
        let VideoR = ftk.VideoResource;
        R.Add(new ImageR("res/images/desktop.jpg"));
        R.Add(new ImageR("res/images/ready.png"));
        R.Add(new ImageR("res/images/ready-down.png"));
        R.Add(new ImageR("res/images/ready-hover.png"));
        R.Add(new ImageR("res/images/desktop.jpg"));
        R.Add(new AudioR("res/audios/bk.mp3"));
    }
    app.PrepareResources = PrepareResources;
})(app || (app = {}));
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
            if (autostart)
                this.Start();
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
            if (!this.Playing)
                return;
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
                    else
                        this.Stop();
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
            if (autostart)
                this.Start();
        }
        ;
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
            if (!this.Playing && this.mFrames.length == 0)
                return;
            let animation = this.mFrames[this.mCurrentFrame];
            if (!animation.Playing)
                animation.Start();
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
        static distance(a, b) {
            let x = Math.abs(a.x - b.x);
            let y = Math.abs(a.y - b.y);
            return Math.sqrt((x * x + y * y));
        }
        distance(a) {
            return Point.distance(this, a);
        }
        static rotate(pt, angle, basept) {
            let p = pt.clone();
            p.rotate(angle, basept);
            return p;
        }
        rotate(angle, basept) {
            let cosValue = Math.cos(angle);
            let sinValue = Math.sin(angle);
            let x = this.x - basept.x;
            let y = this.y - basept.y;
            this.x = basept.x + (x * cosValue - y * sinValue);
            this.y = basept.y + (x * sinValue + y * cosValue);
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
        isInside(point) {
            return point.x > this.x && (point.x < this.x + this.w)
                && point.y > this.y && (point.y < this.y + this.h);
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
                return "inside";
            }
            return "none";
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
        static intersection(r1, r2) {
            let merge = Rectangle.union(r1, r2);
            let startX = r1.x == merge.x ? r2.x : r1.x;
            let endX = r1.right == merge.right ? r2.right : r1.right;
            let startY = r1.y == merge.y ? r2.y : r1.y;
            let endY = r1.bottom == merge.bottom ? r2.bottom : r1.bottom;
            return new Rectangle(startX, startY, endX - startX, endY - startY);
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
        static isInLineEx(point, lstart, lend) {
            return (((point.x - lstart.x) * (lstart.y - lend.y)) == ((lstart.x - lend.x) * (point.y - lstart.y))
                && (point.x >= Math.min(lstart.x, lend.x) && point.x <= Math.max(lstart.x, lend.x))
                && ((point.y >= Math.min(lstart.y, lend.y)) && (point.y <= Math.max(lstart.y, lend.y))));
        }
        static isInLine(point, line) {
            return LineSegment.isInLineEx(point, line.start, line.end);
        }
        isInLine(point) {
            return LineSegment.isInLine(point, this);
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
        isIntersect(l) {
            return LineSegment.isIntersect(this, l);
        }
        get angle() {
            return Math.atan2(this.end.y - this.start.y, this.end.x - this.start.x);
        }
        static angleBetween(a, b) {
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
        static isIntersect(a, b) {
            let d = Point.distance(a.center, b.center);
            return d < a.radius || d < b.radius;
        }
        isIntersect(a) {
            return Circle.isIntersect(this, a);
        }
        get box() {
            let s = this.radius + this.radius;
            return new Rectangle(this.center.x - this.radius, this.center.y - this.radius, s, s);
        }
    }
    ftk.Circle = Circle;
    class Polygon {
        constructor(vertexs) {
            let vs = new Array();
            if (vertexs) {
                for (let i = 0; i < vertexs.length; ++i) {
                    vs.push(vertexs[i].clone());
                }
            }
            this.mVertexs = vs;
            this.closed = true;
        }
        clone() {
            return new Polygon(this.mVertexs);
        }
        get vertexs() {
            return this.mVertexs;
        }
        static isBoundary(point, p) {
            let count = p.mVertexs.length - 1;
            for (let i = 0; i < count; ++i) {
                if (LineSegment.isInLineEx(point, p.mVertexs[i], p.mVertexs[i + 1]))
                    return true;
            }
            return false;
        }
        isBoundary(point) {
            return Polygon.isBoundary(point, this);
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
        isInPolygon(point, p) {
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
        get center() {
            return this.box.center;
        }
    }
    ftk.Polygon = Polygon;
    class Vector {
        constructor(x, y) {
            this.x = x || 0;
            this.y = y || 0;
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
        static add(a, b) {
            return new Vector(a.x + b.x, a.y + b.y);
        }
        add(v) {
            this.x += v.x;
            this.y += v.y;
        }
        static sub(a, b) {
            return new Vector(a.x - b.x, a.y - b.y);
        }
        sub(v) {
            this.x -= v.x;
            this.y -= v.y;
        }
        static mul(v, scalar) {
            return new Vector(v.x * scalar, v.y * scalar);
        }
        mul(v) {
            this.x *= v;
            this.y *= v;
        }
        static div(v, scalar) {
            return new Vector(v.x / scalar, v.y / scalar);
        }
        div(v) {
            this.x /= v;
            this.y /= v;
        }
        static cross(a, b) {
            return a.x * b.y - a.y * b.x;
        }
        cross(v) {
            return this.x * v.y - this.y * v.x;
        }
        static dot(a, b) {
            return a.x * b.y + a.y * b.x;
        }
        dot(v) {
            return this.x * v.y + this.y * v.x;
        }
        static inner(a, b) {
            return a.x * b.x + a.y * b.y;
        }
        inner(v) {
            return this.x * v.x + this.y * v.y;
        }
        epointual(v) {
            return this.x == v.x && this.y == v.y;
        }
        static epointual(a, b) {
            return a.x == b.x && a.y == b.y;
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
        static angleBetween(a, b) {
            return Math.atan2(Vector.cross(a, b), Vector.dot(a, b));
        }
        static perpendicular(a, b) {
            return (!a.isZero) && (!b.isZero) && Vector.inner(a, b) === 0;
        }
        static isColinear(a, b) {
            return a.slope === b.slope;
        }
        isColinear(v) {
            return this.slope === this.slope;
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
    }
    ftk.Vector = Vector;
})(ftk || (ftk = {}));
/// <reference path="../particlesystem.ts" />
var ftk;
(function (ftk) {
    var particles;
    (function (particles) {
        class FireworkSparkParticle extends ftk.Particle {
            constructor(pa, x, y) {
                super(pa, x, y);
                this.hue = Math.floor(Math.random() * 360);
                this.lifeMax = this.life;
                this.drag = 0.9;
                this.color = this.randColor();
            }
            Render(rc) {
                rc.fillStyle = this.color;
                rc.fillRect(this.x - 1, this.y - 1, 2, 2);
            }
            Update() {
                super.Update();
                if (Math.random() < 0.5) {
                    this.color = this.randColor();
                }
            }
            randColor() {
                var components = [
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
                this.life *= 2;
            }
            Update() {
                var spark = new FireworkSparkParticle(this.PA, this.x, this.y);
                spark.vx /= 10;
                spark.vy /= 10;
                spark.vx += this.vx / 2;
                spark.vy += this.vy / 2;
                this.PA.AddParticle(spark);
                super.Update();
            }
            Render(rc) {
            }
        }
        particles.FireworkFlameParticle = FireworkFlameParticle;
        class FireworkParticle extends ftk.Particle {
            constructor(pa, x, y) {
                super(pa, x, y);
                this.lifeMax = 5;
                this.life = this.lifeMax;
            }
            Update() {
                super.Update();
                var bits = Math.ceil(this.life * 10 / this.lifeMax);
                var dd = (this.lifeMax - this.life) / this.lifeMax + 0.2;
                for (var i = 0; i < bits; ++i) {
                    var flame = new FireworkFlameParticle(this.PA, this.x, this.y);
                    flame.vy *= 1.5;
                    flame.vx *= 1.5;
                    this.PA.AddParticle(flame);
                }
            }
            Render(rc) {
            }
        }
        particles.FireworkParticle = FireworkParticle;
        class FireworkAnimation extends ftk.ParticleSprite {
            OnUpdate() {
                if ((this.Ticks % 40) === 0) {
                    var fw = new FireworkParticle(this, Math.random() * window.innerWidth, Math.random() * window.innerHeight * 0.75);
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
//# sourceMappingURL=ftk.js.map