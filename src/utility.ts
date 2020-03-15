namespace ftk.utility {
    const kIDCharset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    export function GenerateIDString(n: number) {
        let res = "";
        let kl = kIDCharset.length-1;
        for (let i = 0; i < n; i++) {
            let id = Math.ceil(Math.random() * kl);
            res += kIDCharset[id];
        }
        return res;
    }

    export function UTF8BufferEncodeLength(input:string):number {
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

    export function UTF8BufferEncode(input:string):ArrayBuffer{
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

    export function UTF8BufferDecode(buffer:ArrayBuffer, offset?:number,length?:number) {
        var output = "";
        var utf16;
        var pos = 0;
        if (!offset) offset = 0;
        if (!length) length = buffer.byteLength;
        var input = new Uint8Array(buffer,offset,length);
        while (pos < length) {
            var byte1 = input[pos++];
            if (byte1 < 128)
                utf16 = byte1;
            else {
                var byte2 = input[pos++] - 128;
                if (byte2 < 0)
                    byte2 =0;
                if (byte1 < 0xE0)             // 2 byte character
                    utf16 = 64 * (byte1 - 0xC0) + byte2;
                else {
                    var byte3 = input[pos++] - 128;
                    if (byte3 < 0)
                        byte3 = 0;
                    if (byte1 < 0xF0)        // 3 byte character
                        utf16 = 4096 * (byte1 - 0xE0) + 64 * byte2 + byte3;
                    else {
                        var byte4 = input[pos++] - 128;
                        if (byte4 < 0)
                            byte4 = 0;
                        if (byte1 < 0xF8)        // 4 byte character
                            utf16 = 262144 * (byte1 - 0xF0) + 4096 * byte2 + 64 * byte3 + byte4;
                        else                     // longer encodings are not supported
                            utf16 = '?'.charCodeAt(0);
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
}