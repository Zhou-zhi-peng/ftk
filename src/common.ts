namespace ftk {
    export interface IReadOnlyArray<T> {
        readonly length: number;
        [index: number]: T;
    }

    export interface IClone<T> {
        clone():T;
    }

    export function NewInstance<T>(typename:string,... args:any[]):T|undefined{
        let g = window as any;
        let f = g[typename];
        if(typeof(f)==="function"){
            let fn = f as Function;
            args.unshift(null);
            let cfn = fn.bind.apply(fn, args as any);
            return cfn() as T;
        }
        return undefined;
    }
}