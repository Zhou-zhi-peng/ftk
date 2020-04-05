namespace ftk {
    export enum ResourceType {
        Image,
        Video,
        Audio,
        Text,
        Font,
        Blob,
        Animation,
        Raw
    }

    export interface IResource {
        readonly Loaded: boolean;
        readonly Name: string;
        readonly Type: ResourceType;
        Load(): Promise<void>;
    }

    export abstract class Resource implements IResource {
        private mLoaded: boolean;
        private mName: string;
        private mURL: string;
        constructor(url: string, name?: string) {
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

        public get Url(): string { return this.mURL; }
        public abstract get Type(): ResourceType;
        public get Name(): string {
            return this.mName;
        }
        public get Loaded(): boolean {
            return this.mLoaded;
        }

        public Load(): Promise<void> {
            return new Promise<void>((resolve, reject) => {
                if (this.Loaded) {
                    resolve();
                }
                this.OnLoad(resolve, reject);
            });
        }

        protected setLoaded(value: boolean): void {
            this.mLoaded = value;
        }

        protected abstract OnLoad(resolve: () => void, reject: (reason: any) => void): void;
    }

    export class ImageResource extends Resource {
        private mImage: HTMLImageElement;
        constructor(url: string, name?: string) {
            super(url, name);
            this.mImage = new Image();
        }
        public get Type(): ResourceType { return ResourceType.Image; }

        public get Image(): HTMLImageElement {
            return this.mImage;
        }
        protected OnLoad(resolve: () => void, reject: (reason: any) => void): void {
            this.mImage.onload = () => {
                this.setLoaded(true);
                resolve();
            };
            this.mImage.onerror = (ev) => { reject(ev); };
            this.mImage.src = this.Url;
        }
    }

    export class AudioResource extends Resource {
        private mAudio: HTMLAudioElement;
        constructor(url: string, name?: string) {
            super(url, name);
            this.mAudio = new Audio();
            this.mAudio.autoplay = false;
            this.mAudio.controls = false;
            this.mAudio.loop = false;
        }
        public get Type(): ResourceType { return ResourceType.Audio; }

        public get Audio(): HTMLAudioElement {
            return this.mAudio;
        }
        protected OnLoad(resolve: () => void, reject: (reason: any) => void): void {
            this.mAudio.oncanplaythrough = () => {
                this.setLoaded(true);
                resolve();
            };
            this.mAudio.onerror = (ev) => { reject(ev); };
            this.mAudio.src = this.Url;
            this.mAudio.load();
        }
    }

    export class VideoResource extends Resource {
        private mVideo: HTMLVideoElement;
        constructor(url: string, name?: string) {
            super(url, name);
            this.mVideo = document.createElement("video");
            this.mVideo.autoplay = false;
            this.mVideo.controls = false;
            this.mVideo.loop = false;
        }
        public get Type(): ResourceType { return ResourceType.Audio; }

        public get Video(): HTMLVideoElement {
            return this.mVideo;
        }
        protected OnLoad(resolve: () => void, reject: (reason: any) => void): void {
            this.mVideo.oncanplay = () => {
                this.setLoaded(true);
                resolve();
            };
            this.mVideo.onerror = (ev) => { reject(ev); };
            this.mVideo.src = this.Url;
            this.mVideo.load();
        }
    }

    export class TextResource extends Resource {
        private mData: string;
        constructor(url: string, name?: string) {
            super(url, name);
            this.mData = "";
        }
        public get Type(): ResourceType { return ResourceType.Text; }

        public get Text(): string {
            return this.mData;
        }
        protected OnLoad(resolve: () => void, reject: (reason: any) => void): void {
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

    export class BlobResource extends Resource {
        private mData: Blob;
        constructor(url: string, name?: string) {
            super(url, name);
            this.mData = new Blob();
        }
        public get Type(): ResourceType { return ResourceType.Blob; }

        public get Data(): Blob {
            return this.mData;
        }
        protected OnLoad(resolve: () => void, reject: (reason: any) => void): void {
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

    export class RawResource extends Resource {
        private mData: ArrayBuffer;
        constructor(url: string, name?: string) {
            super(url, name);
            this.mData = new ArrayBuffer(0);
        }
        public get Type(): ResourceType { return ResourceType.Raw; }

        public get Data(): ArrayBuffer {
            return this.mData;
        }
        protected OnLoad(resolve: () => void, reject: (reason: any) => void): void {
            let xhr = new XMLHttpRequest();
            xhr.onload = () => {
                let buffer = xhr.response as ArrayBuffer;
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

    export abstract class AnimationResource extends Resource {
        private mAnimationData: any;
        constructor(url: string, name?: string) {
            super(url, name);
        }
        public get Type(): ResourceType { return ResourceType.Animation; }

        public abstract make(): IAnimation;
        protected abstract OnLoadAnimation(animationData: any, resolve: () => void, reject: (reason: any) => void): void;
        protected OnLoad(resolve: () => void, reject: (reason: any) => void): void {
            let xhr = new XMLHttpRequest();
            xhr.onload = () => {
                try {
                    this.mAnimationData = JSON.parse(xhr.responseText);
                    this.OnLoadAnimation(this.mAnimationData, resolve, reject);
                } catch (e) {
                    reject(e);
                }
            };
            xhr.onerror = (ev) => { reject(ev); };
            xhr.onabort = (ev) => { reject(ev); };

            xhr.responseType = "text";
            xhr.open("GET", this.Url, true);
        }
    }

    export interface IResourceDB {
        Get(name: string): IResource | undefined;
        GetImage(name: string): ImageResource | undefined;
        GetAudio(name: string): AudioResource | undefined;
        GetVideo(name: string): VideoResource | undefined;
        Has(name: string): boolean;
        Edit(): IResourceDBEditor;
    }

    export interface IResourceDBEditor {
        Add(resourceUrl: string, name?: string): IResourceDBEditor;
        Add(resource: IResource, name?: string): IResourceDBEditor;
        Remove(name: string): boolean;
        Clear(): void;
        LoadAll(progressHandler?: (progress: number) => void): Promise<void>;
        forEach(callback: (resource: IResource) => boolean): void;
    }

    type ResourceFactoryFn = (url: string, name?: string) => IResource;
    let _extNameMap: Map<string, ResourceFactoryFn> = new Map<string, ResourceFactoryFn>();
    function _registerResourceType(extName: string, type: ResourceType): void {
        let ext = extName.toLowerCase();
        let factoryFn: ResourceFactoryFn;
        switch (type) {
            case ResourceType.Image:
                factoryFn = (url: string, name?: string) => new ImageResource(url, name);
                break;
            case ResourceType.Video:
                factoryFn = (url: string, name?: string) => new VideoResource(url, name);
                break;
            case ResourceType.Audio:
                factoryFn = (url: string, name?: string) => new AudioResource(url, name);
                break;
            case ResourceType.Text:
                factoryFn = (url: string, name?: string) => new TextResource(url, name);
                break;
            case ResourceType.Blob:
                factoryFn = (url: string, name?: string) => new BlobResource(url, name);
                break;
            case ResourceType.Raw:
                factoryFn = (url: string, name?: string) => new RawResource(url, name);
                break;
            default:
                return;
        }
        while (ext.startsWith('.')) {
            ext = ext.slice(0, 1);
        }
        _extNameMap.set(ext, factoryFn);
    }

    export function registerResourceType(extName: string[] | string, type: ResourceType): void {
        if (typeof (extName) === 'string') {
            _registerResourceType(extName, type);
        } else {
            for (let en of extName) {
                _registerResourceType(en, type);
            }
        }
    }

    registerResourceType(["png", "jpg", "bmp", "jpeg", "gif", "ico", "tiff", "webp", "svg"], ResourceType.Image);
    registerResourceType(["mpeg4", "webm", "mp4"], ResourceType.Video);
    registerResourceType(["ogg", "mp3", "wav"], ResourceType.Audio);
    registerResourceType(["txt", "xml", "vsh", "fsh", "atlas", "html", "json"], ResourceType.Text);
    registerResourceType(["blob"], ResourceType.Blob);
    registerResourceType(["bin"], ResourceType.Raw);

    export class ResourceDBEditor implements IResourceDBEditor, IResourceDB {
        private mResourceList: Map<string, IResource> = new Map<string, IResource>();

        public Add(resourceUrl: string, name?: string): IResourceDBEditor;
        public Add(resource: IResource): IResourceDBEditor;
        public Add(resource: IResource | string, name?: string): IResourceDBEditor {
            if (typeof (resource) === 'string') {
                let ext = utility.Path.extname(resource).toLowerCase();
                if (ext.startsWith('.')) {
                    ext = ext.substr(1);
                }
                let factoryFn = _extNameMap.get(ext);
                if (!factoryFn) {
                    factoryFn = (url: string, n?: string) => new RawResource(url, n);
                }
                return this._Add(factoryFn(resource, name));
            }
            return this._Add(resource);
        }

        public Clear(): void {
            this.mResourceList.clear();
        }
        public Remove(name: string): boolean {
            return this.mResourceList.delete(name);
        }
        public Get(name: string): IResource | undefined {
            return this.mResourceList.get(name);
        }
        public Has(name: string): boolean {
            return this.mResourceList.has(name);
        }

        public GetImage(name: string): ImageResource | undefined {
            let r = this.Get(name);
            if (!r) {
                return r;
            }
            if (r instanceof ImageResource) {
                return r;
            }
            return undefined;
        }

        public GetAudio(name: string): AudioResource | undefined {
            let r = this.Get(name);
            if (!r) {
                return r;
            }
            if (r instanceof AudioResource) {
                return r;
            }
            return undefined;
        }


        public GetVideo(name: string): VideoResource | undefined {
            let r = this.Get(name);
            if (!r) {
                return r;
            }
            if (r instanceof VideoResource) {
                return r;
            }
            return undefined;
        }

        public LoadAll(progressHandler?: (progress: number) => void): Promise<void> {
            let total = 0;
            let count = 0;
            if (progressHandler) {
                progressHandler(0);
            }
            return new Promise<void>((resolve, reject) => {
                let list = new Array<Promise<void>>();
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
        public forEach(callback: (resource: IResource) => boolean): void {
            this.mResourceList.forEach((r) => {
                callback(r);
            });
        }

        public Edit(): IResourceDBEditor {
            return this;
        }

        private _Add(resource: IResource): ResourceDBEditor {
            this.mResourceList.set(resource.Name, resource);
            return this;
        }
    }
}
