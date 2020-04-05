namespace ftk.utility {
    const kIDCharset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    export function GenerateIDString(n: number) {
        let res = "";
        let kl = kIDCharset.length - 1;
        for (let i = 0; i < n; i++) {
            let id = Math.ceil(Math.random() * kl);
            res += kIDCharset[id];
        }
        return res;
    }

    export function UTF8BufferEncodeLength(input: string): number {
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

    export function UTF8BufferEncode(input: string): ArrayBuffer {
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
            } else if (charCode <= 0x7FF) {
                output[pos++] = charCode >> 6 & 0x1F | 0xC0;
                output[pos++] = charCode & 0x3F | 0x80;

            } else if (charCode <= 0xFFFF) {
                output[pos++] = charCode >> 12 & 0x0F | 0xE0;
                output[pos++] = charCode >> 6 & 0x3F | 0x80;
                output[pos++] = charCode & 0x3F | 0x80;
            } else {
                output[pos++] = charCode >> 18 & 0x07 | 0xF0;
                output[pos++] = charCode >> 12 & 0x3F | 0x80;
                output[pos++] = charCode >> 6 & 0x3F | 0x80;
                output[pos++] = charCode & 0x3F | 0x80;
            }
        }
        return buffer;
    }

    export function UTF8BufferDecode(buffer: ArrayBuffer, offset?: number, length?: number) {
        let output = "";
        let utf16;
        let pos = 0;
        if (!offset) { offset = 0; }
        if (!length) { length = buffer.byteLength; }
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
                if (byte1 < 0xE0) {             // 2 byte character
                    utf16 = 64 * (byte1 - 0xC0) + byte2;
                }
                else {
                    let byte3 = input[pos++] - 128;
                    if (byte3 < 0) {
                        byte3 = 0;
                    }
                    if (byte1 < 0xF0) {        // 3 byte character
                        utf16 = 4096 * (byte1 - 0xE0) + 64 * byte2 + byte3;
                    }
                    else {
                        let byte4 = input[pos++] - 128;
                        if (byte4 < 0) {
                            byte4 = 0;
                        }
                        if (byte1 < 0xF8) {        // 4 byte character
                            utf16 = 262144 * (byte1 - 0xF0) + 4096 * byte2 + 64 * byte3 + byte4;
                        }
                        else {                     // longer encodings are not supported
                            utf16 = '?'.charCodeAt(0);
                        }
                    }
                }
            }

            if (utf16 > 0xFFFF)   // 4 byte character - express as a surrogate pair
            {
                utf16 -= 0x10000;
                output += String.fromCharCode(0xD800 + (utf16 >> 10)); // lead character
                utf16 = 0xDC00 + (utf16 & 0x3FF);  // trail character
            }
            output += String.fromCharCode(utf16);
        }
        return output;
    }

    export namespace Path {
        const splitPathRegex = /^(\/?|)([\s\S]*?)(?:(\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        const urlRegex = /(\S+):\/\/([\w\-_]+(?:\.[\w\-_]+)+)(?::(\d+))?([^=\?\s]*)?([\@?#].*)?/;
        export const sep: string = '/';
        type urldata = {
            protocol?: string,
            hostname?: string,
            port?: number,
            path: string,
            params?: string
        };

        type pathdata = {
            rootname?: string,
            dirname?: string,
            basename?: string,
            extname?: string
        };

        function _split_path_params(path: string): string[] {
            let x = path.indexOf('?');
            if (x < 0) {
                x = path.indexOf('#');
            }
            if (x < 0) {
                return [path];
            }
            return [path.substr(0, x), path.substr(x)];
        }

        function _url_parse(path: string): urldata {
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
                path: (m[4] ? m[4] : sep),
                params: m[5]
            };
        }

        function _split_path(path: string): string[] {
            return path.split(sep).filter((p) => p && p.length > 0);
        }

        function _normalize_parts(parts: string[]) {
            let up = 0;
            for (let i = parts.length - 1; i >= 0; i--) {
                let last = parts[i];
                if (last === '.') {
                    parts.splice(i, 1);
                } else if (last === '..') {
                    parts.splice(i, 1);
                    up++;
                } else if (up) {
                    parts.splice(i, 1);
                    up--;
                }
            }
            return parts;
        }

        function _path_parse(path: string): pathdata {
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

        function _url_to_string(url: urldata): string {
            let r = '';
            if (url.port) {
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
                    r += sep;
                }
                r += url.path;
            }
            if (url.params) {
                r += url.params;
            }
            return r;
        }

        function _path_to_string(path: pathdata): string {
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

        function _is_absolute_path(path: string): boolean {
            return path.startsWith(sep);
        }

        function _is_end_slash(path: string): boolean {
            return path.endsWith(sep);
        }

        export function normalize(path: string): string {
            let url = _url_parse(path);
            let pathname = url.path;
            if (pathname && pathname.length != 0) {
                let isabs = _is_absolute_path(pathname);
                let isendslash = _is_end_slash(pathname);
                pathname = _normalize_parts(_split_path(pathname)).join(sep);

                if (!pathname && !isabs) {
                    pathname = '.';
                }
                if (pathname && isendslash) {
                    pathname += sep;
                }

                if (isabs) {
                    pathname = sep + pathname;
                }

            }
            url.path = pathname;
            return _url_to_string(url);
        }

        export function join(...args: string[]): string {
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
            pathname = _normalize_parts(parts).join(sep);

            if (isabs) {
                pathname = sep + pathname;
            }
            url.path = pathname;
            return _url_to_string(url);
        }

        export function urlpath(url: string): string {
            return _url_parse(url).path;
        }

        export function isurl(path: string): boolean {
            return urlRegex.test(path);
        }

        export function resolve(path: string, pwd?: string): string {
            let workpath = pwd ? pwd : sep;
            if (isurl(path) || _is_absolute_path(path)) {
                return path;
            }
            return join(workpath, path);
        }

        export function relative(path: string, to: string, pwd?: string): string {
            if (isurl(to)) {
                return to;
            } else {
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
                return outputParts.join(sep);
            }
        }

        export function extname(path: string): string {
            let result = _path_parse(urlpath(path));
            if (result.extname) {
                return result.extname;
            }
            return '';
        }

        export function basename(path: string): string {
            let result = _path_parse(urlpath(path));
            if (result.basename) {
                return result.basename;
            }
            return '';
        }

        export function lastpart(path: string): string {
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

        export function dirname(path: string): string {
            let result = _path_parse(urlpath(path));
            if (result.dirname) {
                return result.dirname;
            }
            return '';
        }

        export function chextension(path: string, name: string): string {
            let u = _url_parse(path);
            let pathname = u.path;
            let p = _path_parse(pathname);
            p.extname = name;
            pathname = _path_to_string(p);
            u.path = pathname;
            return _url_to_string(u);
        }

        export function chbasename(path: string, name: string): string {
            let u = _url_parse(path);
            let pathname = u.path;
            let p = _path_parse(pathname);
            p.basename = name;
            pathname = _path_to_string(p);
            u.path = pathname;
            return _url_to_string(u);
        }

        export function chlastpart(path: string, name: string): string {
            let u = _url_parse(path);
            let pathname = u.path;
            let p = _path_parse(pathname);
            p.basename = name;
            p.extname = undefined;
            pathname = _path_to_string(p);
            u.path = pathname;
            return _url_to_string(u);
        }

        export function isabsolute(path: string): boolean {
            return _is_absolute_path(urlpath(path));
        }
    }

    export namespace api {
        export function createOffscreenCanvas(width: number, height: number): HTMLCanvasElement {
            let globalThis = window as any;
            if (globalThis["OffscreenCanvas"]) {
                let OffscreenCanvas = globalThis["OffscreenCanvas"] as any;
                return new OffscreenCanvas(width, height) as HTMLCanvasElement;
            } else {
                let OffscreenCanvas = document.createElement('canvas');
                OffscreenCanvas.width = width;
                OffscreenCanvas.height = height;
                return OffscreenCanvas;
            }
        }
    }
}
