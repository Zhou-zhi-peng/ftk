"use strict";
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
            let kl = kIDCharset.length;
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
        Rander(canvas) {
            for (let i = this.mLayerList.length - 1; i >= 0; --i) {
                this.mLayerList[i].Rander(canvas);
            }
        }
    }
    ftk.Stage = Stage;
})(ftk || (ftk = {}));
/// <reference path="./objectnode.ts" />
/// <reference path="./stage.ts" />
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
        set FrameRate(value) { this.mFrameRate = value; }
        get Root() { return this.mRootNode; }
        get R() {
            return this.mResourceManager;
        }
        Run() {
            this.R.Edit().LoadAll().then(() => {
                this.callEventHandler("ready", new ftk.EngineEvent(this, null));
                this.StartLoop();
            }).catch((reason) => {
                this.callEventHandler("fault", new ftk.EngineEvent(this, reason));
            });
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
    class EngineImpl extends AbstractEngine {
        Shutdown() {
            this.callEventHandler("shutdown", new ftk.EngineEvent(this, null));
            this.R.Edit().Clear();
        }
    }
    let _EngineImpl = null;
    function LibrarySetup(options) {
        if (_EngineImpl)
            throw Error("Libraries cannot be initialized more than once!");
        _EngineImpl = new EngineImpl(options.canvas);
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
/// <reference path="./objectnode.ts" />
var ftk;
(function (ftk) {
    class Sprite {
        constructor(id) {
            this.mRectangle = { x: 0, y: 0, w: 0, h: 0 };
            this.mAngle = 0;
            this.mBasePoint = { x: 0, y: 0 };
            if ((!id) || id.length == 0) {
                id = ftk.utility.GenerateIDString(16);
            }
            this.mID = id;
        }
        get Id() {
            return this.mID;
        }
        get Position() {
            return { x: this.mRectangle.x + this.mBasePoint.x, y: this.mRectangle.y + this.mBasePoint.y };
        }
        set Position(pos) {
            this.mRectangle.x = pos.x - this.mBasePoint.x;
            this.mRectangle.y = pos.y - this.mBasePoint.y;
        }
        get Box() {
            return { x: this.mRectangle.x, y: this.mRectangle.y, w: this.mRectangle.w, h: this.mRectangle.h };
        }
        OnResized() {
        }
        get Width() {
            return this.Box.w;
        }
        get Height() {
            return this.Box.h;
        }
        Resize(w, h) {
            this.mRectangle.w = w;
            this.mRectangle.h = h;
            this.OnResized();
        }
        get Angle() {
            return this.mAngle;
        }
        set Angle(angle) {
            this.mAngle = angle;
        }
        get BasePoint() {
            return { x: this.mBasePoint.x, y: this.mBasePoint.y };
        }
        set BasePoint(pos) {
            this.mBasePoint = { x: pos.x, y: pos.y };
        }
        PickTest(point) {
            let box = this.Box;
            return point.x > box.x && (point.x < box.x + box.w)
                && point.y > box.y && (point.y < box.y + box.h);
        }
        Rander(canvas) {
            if (canvas) {
                canvas.save();
                let angle = this.Angle;
                if (angle !== 0) {
                    let box = this.Box;
                    let bp = this.BasePoint;
                    let xc = box.x + bp.x;
                    let yc = box.y + bp.y;
                    canvas.translate(xc, yc);
                    canvas.rotate(angle);
                    canvas.translate(-xc, -yc);
                }
                this.OnRander(canvas);
                canvas.restore();
            }
        }
        OnDispatchTouchEvent(ev, forced) {
        }
        OnDispatchMouseEvent(ev, forced) {
        }
        OnDispatchKeyboardEvent(ev, forced) {
        }
        OnDispatchNoticeEvent(ev, forced) {
        }
        DispatchTouchEvent(ev, forced) {
            if (forced || this.PickTest(ev.ChangedTouches[0])) {
                ev.Target = this;
                ev.StopPropagation = true;
                this.OnDispatchTouchEvent(ev, forced);
            }
        }
        DispatchMouseEvent(ev, forced) {
            if (forced || this.PickTest(ev)) {
                ev.Target = this;
                ev.StopPropagation = true;
                this.OnDispatchMouseEvent(ev, forced);
            }
        }
        DispatchKeyboardEvent(ev, forced) {
            this.OnDispatchKeyboardEvent(ev, forced);
        }
        DispatchNoticeEvent(ev, forced) {
            this.OnDispatchNoticeEvent(ev, forced);
        }
        Update(timestamp) {
        }
    }
    ftk.Sprite = Sprite;
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
        LoadAll() {
            return new Promise((resolve, reject) => {
                let list = new Array();
                this.mResourceList.forEach((r) => {
                    list.push(r.Load());
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
        }
        get Resource() {
            return this.mImage;
        }
        set Resource(value) {
            this.mImage = value;
        }
        OnRander(canvas) {
            let image = this.Resource.Image;
            let box = this.Box;
            canvas.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, box.x, box.y, box.w, box.h);
        }
    }
    ftk.ImageSprite = ImageSprite;
    class ImageButton extends ImageSprite {
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
    ftk.ImageButton = ImageButton;
})(ftk || (ftk = {}));
/// <reference path="./objectnode.ts" />
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
        Rander(canvas) {
            if (!this.Visible)
                return;
            for (let i = this.mNodes.length - 1; i >= 0; --i) {
                this.mNodes[i].Rander(canvas);
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
        OnRander(canvas) {
            let video = this.Resource.Video;
            let box = this.Box;
            canvas.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, box.x, box.y, box.w, box.h);
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
/// <reference path="../../src/engine.ts" />
/// <reference path="../../src/stage.ts" />
/// <reference path="../../src/sprite.ts" />
/// <reference path="../../src/imagesprite.ts" />
/// <reference path="../../src/layer.ts" />
/// <reference path="../../src/videosprite.ts" />
/// <reference path="../../src/net.ts" />
var app;
(function (app) {
    class BackgroundLayer extends ftk.Layer {
        constructor(stage) {
            super();
            let image = ftk.Engine.R.GetImage("res/images/desktop.jpg");
            this.AddNode(new ftk.ImageSprite(image, stage.Width, stage.Height));
            this.EventTransparent = false;
        }
    }
    class StartLayer extends ftk.Layer {
        constructor() {
            super();
            let R = ftk.Engine.R;
            let ready = new ftk.ImageButton(R.GetImage("res/images/ready.png"), "Game.Start.Button");
            ready.DownResource = R.GetImage("res/images/ready-down.png");
            ready.HoverResource = R.GetImage("res/images/ready-hover.png");
            ready.Position = { x: 280, y: 510 };
            this.AddNode(ready);
        }
    }
    class EffectsLayer extends ftk.Layer {
        constructor(stage) {
            super();
            let R = ftk.Engine.R;
            let fireworks = new ftk.particles.FireworkAnimation();
            fireworks.Position = { x: 0, y: 0 };
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
            canvas: canvas
        });
        app.PrepareResources();
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
    }
    ftk.Animation = Animation;
})(ftk || (ftk = {}));
/// <reference path="./sprite.ts" />
var ftk;
(function (ftk) {
    class ParticleAnimation extends ftk.Sprite {
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
        OnRander(canvas) {
            if (this.mParticleRander) {
                let randerHook = this.mParticleRander;
                this.mParticles.forEach((particle) => { randerHook.call(this, canvas, particle); });
            }
            else {
                this.mParticles.forEach((particle) => { particle.Render(canvas); });
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
    ftk.ParticleAnimation = ParticleAnimation;
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
            return {
                x: x * scale,
                y: y * scale
            };
        }
    }
    ftk.Particle = Particle;
})(ftk || (ftk = {}));
/// <reference path="../particleanimation.ts" />
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
        class FireworkAnimation extends ftk.ParticleAnimation {
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