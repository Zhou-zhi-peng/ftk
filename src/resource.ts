namespace ftk {
    export enum ResourceType {
        Image,
        Video,
        Audio,
        Text,
        Blob,
        Raw
    }

    export interface IResource {
        readonly Loaded: boolean;
        readonly Name: string;
        readonly Type: ResourceType;
        Load(): Promise<void>;
    }

    export abstract class Resource implements IResource{
        private mLoaded: boolean;
        private mName: string;
        private mURL: string;
        constructor(url: string, name?: string) {
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

        public get Url():string{return this.mURL;}
        public abstract get Type(): ResourceType;
        public get Name(): string {
            return this.mName;
        }
        public get Loaded(): boolean {
            return this.mLoaded;
        }

        protected setLoaded(value:boolean):void{
            this.mLoaded = value;
        }
        
        protected abstract OnLoad(resolve:()=>void, reject:()=>void):void;
        public Load(): Promise<void> {
            return new Promise<void>((resolve, reject) => {
                if (this.Loaded)
                    resolve();
                this.OnLoad(resolve, reject);
            });
        }
    }

    export class ImageResource extends Resource {
        private mImage: HTMLImageElement;
        constructor(url: string, name?: string) {
            super(url,name);
            this.mImage = new Image();
        }
        public get Type(): ResourceType {return ResourceType.Image;}

        public get Image(): HTMLImageElement {
            return this.mImage;
        }
        protected OnLoad(resolve:()=>void, reject:()=>void):void{
            this.mImage.onload = () => {
                this.setLoaded(true);
                resolve();
            }
            this.mImage.onerror = () => { reject(); }
            this.mImage.src = this.Url;
        }
    }

    export class AudioResource extends Resource {
        private mAudio: HTMLAudioElement;
        constructor(url: string, name?: string) {
            super(url,name);
            this.mAudio = new Audio();
            this.mAudio.autoplay = false;
            this.mAudio.controls = false;
            this.mAudio.loop = false;
        }
        public get Type(): ResourceType {return ResourceType.Audio;}

        public get Audio(): HTMLAudioElement {
            return this.mAudio;
        }
        protected OnLoad(resolve:()=>void, reject:()=>void):void{
            this.mAudio.oncanplaythrough = () => {
                this.setLoaded(true);
                resolve();
            }
            this.mAudio.onerror = () => { reject(); }
            this.mAudio.src = this.Url;
            this.mAudio.load();
        }
    }

    export class VideoResource extends Resource {
        private mVideo: HTMLVideoElement;
        constructor(url: string, name?: string) {
            super(url,name);
            this.mVideo = document.createElement("video");
            this.mVideo.autoplay = false;
            this.mVideo.controls = false;
            this.mVideo.loop = false;
        }
        public get Type(): ResourceType {return ResourceType.Audio;}

        public get Video(): HTMLVideoElement {
            return this.mVideo;
        }
        protected OnLoad(resolve:()=>void, reject:()=>void):void{
            this.mVideo.oncanplay = () => {
                this.setLoaded(true);
                resolve();
            }
            this.mVideo.onerror = () => { reject(); }
            this.mVideo.src = this.Url;
            this.mVideo.load();
        }
    }

    export class TextResource extends Resource {
        private mData: string;
        constructor(url: string, name?: string) {
            super(url,name);
            this.mData = "";
        }
        public get Type(): ResourceType {return ResourceType.Text;}

        public get Text(): string {
            return this.mData;
        }
        protected OnLoad(resolve:()=>void, reject:()=>void):void{
            let xhr = new XMLHttpRequest();
            xhr.onload = () => {
                this.mData = xhr.responseText;
                this.setLoaded(true);
                resolve();
            }
            xhr.onerror = () => { reject(); }
            xhr.onabort = () => { reject(); }

            xhr.responseType = "text";
            xhr.open("GET",this.Url,true);
        }
    }

    export class BlobResource extends Resource {
        private mData: Blob;
        constructor(url: string, name?: string) {
            super(url,name);
            this.mData = new Blob();
        }
        public get Type(): ResourceType {return ResourceType.Blob;}

        public get Data(): Blob {
            return this.mData;
        }
        protected OnLoad(resolve:()=>void, reject:()=>void):void{
            let xhr = new XMLHttpRequest();
            xhr.onload = () => {
                this.mData = xhr.response;
                this.setLoaded(true);
                resolve();
            }
            xhr.onerror = () => { reject(); }
            xhr.onabort = () => { reject(); }

            xhr.responseType = "blob";
            xhr.open("GET",this.Url,true);
        }
    }

    export class RawResource extends Resource {
        private mData: ArrayBuffer;
        constructor(url: string, name?: string) {
            super(url,name);
            this.mData = new ArrayBuffer(0);
        }
        public get Type(): ResourceType {return ResourceType.Raw;}

        public get Data(): ArrayBuffer {
            return this.mData;
        }
        protected OnLoad(resolve:()=>void, reject:()=>void):void{
            let xhr = new XMLHttpRequest();
            xhr.onload = () => {
                let buffer = xhr.response as ArrayBuffer;
                this.mData = buffer;
                this.setLoaded(true);
                resolve();
            }
            xhr.onerror = () => { reject(); }
            xhr.onabort = () => { reject(); }

            xhr.responseType = "arraybuffer";
            xhr.open("GET",this.Url,true);
        }
    }

    export interface IResourceDB {
        Get(name: string): IResource | undefined;
        GetImage(name: string): ImageResource | undefined;
        GetAudio(name: string): AudioResource | undefined;
        GetVideo(name: string): VideoResource | undefined;
        Has(name: string): boolean;
        Edit():IResourceDBEditor;
    }

    export interface IResourceDBEditor {
        Add(resource: IResource): IResourceDBEditor;
        Remove(name: string): boolean;
        Clear():void;
        LoadAll(): Promise<void>;
        forEach(callback: (resource: IResource) => boolean): void;
    }

    export class ResourceDBEditor implements IResourceDBEditor, IResourceDB {
        private mResourceList: Map<string, IResource> = new Map<string, IResource>();
        public Add(resource: IResource): ResourceDBEditor {
            this.mResourceList.set(resource.Name, resource);
            return this;
        }
        public Clear():void{
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
            if (!r)
                return r;
            if (r instanceof ImageResource)
                return r;
            return undefined;
        }

        public GetAudio(name: string): AudioResource | undefined {
            let r = this.Get(name);
            if (!r)
                return r;
            if (r instanceof AudioResource)
                return r;
            return undefined;
        }


        public GetVideo(name: string): VideoResource | undefined {
            let r = this.Get(name);
            if (!r)
                return r;
            if (r instanceof VideoResource)
                return r;
            return undefined;
        }

        public LoadAll(): Promise<void> {
            return new Promise<void>((resolve, reject) => {
                let list = new Array<Promise<void>>();
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
        public forEach(callback: (resource: IResource) => boolean): void {
            this.mResourceList.forEach((r) => {
                callback(r);
            });
        }

        public Edit():IResourceDBEditor{
            return this;
        }
    }
}
