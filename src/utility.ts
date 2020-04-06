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

    export function UTF8BufferEncode(input: string): Uint8Array {
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
        return output;
    }

    export function UTF8BufferDecode(buffer: ArrayBuffer | Uint8Array): string {
        let output = "";
        let utf16;
        let pos = 0;
        let input: Uint8Array;
        if (buffer instanceof ArrayBuffer) {
            input = new Uint8Array(buffer);
        } else {
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

    export function HexStringToBuffer(hexString: string): Uint8Array {
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

    export function BufferToHexString(buffer: ArrayBuffer | Uint8Array): string {
        let input: Uint8Array;
        if (buffer instanceof ArrayBuffer) {
            input = new Uint8Array(buffer);
        } else {
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

    function _uint6ToB64(nUint6: number): number {
        return nUint6 < 26 ? nUint6 + 65
            : nUint6 < 52 ? nUint6 + 71
                : nUint6 < 62 ? nUint6 - 4
                    : nUint6 === 62 ? 43
                        : nUint6 === 63 ? 47
                            : 65;
    }

    function _b64ToUint6(nChr: number): number {
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

    export function BufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
        let input: Uint8Array;
        if (buffer instanceof ArrayBuffer) {
            input = new Uint8Array(buffer);
        } else {
            input = buffer;
        }
        let length = input.byteLength;
        let eqLen = (3 - (length % 3)) % 3;
        let sB64Enc = "";
        for (let nMod3, nLen = length, nUint24 = 0, nIdx = 0; nIdx < nLen; nIdx++) {
            nMod3 = nIdx % 3;
            nUint24 |= input[nIdx] << (16 >>> nMod3 & 24);
            if (nMod3 === 2 || length - nIdx === 1) {
                sB64Enc += String.fromCharCode(
                    _uint6ToB64(nUint24 >>> 18 & 63),
                    _uint6ToB64(nUint24 >>> 12 & 63),
                    _uint6ToB64(nUint24 >>> 6 & 63),
                    _uint6ToB64(nUint24 & 63)
                );
                nUint24 = 0;
            }
        }
        return eqLen === 0 ? sB64Enc : sB64Enc.substring(0, sB64Enc.length - eqLen) + (eqLen === 1 ? "=" : "==");
    }

    export function Base64ToBuffer(base64String: string): Uint8Array {
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

    type _URL_PARAMS = { name: string, value: string }[];
    function _toURLParameters(results: _URL_PARAMS, data: any, traditional: boolean, scope: string): void {
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
                } else if (traditional ? (Array.isArray(value)) : (typeof (value) === 'object')) {
                    _toURLParameters(results, value, traditional, newscope);
                } else {
                    results.push({ name: newscope, value });
                }
            }
        } else if (type !== 'undefined') {
            if (data !== null) {
                results.push({ name: data.toString(), value: data.toString() });
            } else {
                results.push({ name: data.toString(), value: 'null' });
            }
        }
    }

    export function ToURLParameters(data: any, traditional?: boolean): string {
        let kvs: _URL_PARAMS = [];
        let prarmStrings: string[] = [];
        _toURLParameters(kvs, data, traditional ? traditional : false, '');
        for (const r of kvs) {
            prarmStrings.push(encodeURIComponent(r.name) + '=' + encodeURIComponent(r.value));
        }
        return prarmStrings.join('&').replace('%20', '+');
    }

    export function PrefixPad(s: string, n: number, pad: string = ' ') {
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

    export function DateFormat(fmt: string, date: Date) {
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
        let data = opt as any;
        for (let k in opt) {
            ret = new RegExp("(" + k + ")").exec(fmt);
            if (ret) {
                fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (data[k]) : (PrefixPad(data[k], ret[1].length, "0")));
            }
        }
        return fmt;
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
