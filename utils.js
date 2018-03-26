
function string2Bin(str) {
    var result = [];
    for (var i = 0; i < str.length; i++) {
        result.push(str.charCodeAt(i));
    }
    return result;
}
function bin2String(array) {
    return String.fromCharCode.apply(String, array);
}

function ascii2hex(str) {
    var arr = [];
    for (var i = 0, l = str.length; i < l; i ++) {
        var hex = Number(str.charCodeAt(i)).toString(16);
        if (hex<0x10) {
            arr.push("0" + hex);
        } else {
            arr.push(hex);
        }
    }
    return arr.join('');
}

function hex2ascii(hexx) {
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

function bytesToHex (bytes) {
    const hex = [];
    for (var i = 0; i < bytes.length; i++) {
        hex.push((bytes[i] >>> 4).toString(16));
        hex.push((bytes[i] & 0xF).toString(16));
    }
    return hex.join('');
};

function hexToBytes(hex) {
    const bytes = [];
    for (var c = 0; c < hex.length; c += 2) {
        bytes.push(parseInt(hex.substr(c, 2), 16));
    }
    return bytes;
};

function stringToArrayBuffer(str){
    if(/[\u0080-\uffff]/.test(str)){
        throw new Error("this needs encoding, like UTF-8");
    }
    var arr = new Uint8Array(str.length);
    for(var i=str.length; i--; )
        arr[i] = str.charCodeAt(i);
    return arr.buffer;
}

function arrayBufferToString(buffer){
    var arr = new Uint8Array(buffer);
    var str = String.fromCharCode.apply(String, arr);
    /*if(/[\u0080-\uffff]/.test(str)){
        throw new Error("this string seems to contain (still encoded) multibytes");
    }*/
    return str;
}

function upperFirstLetter(string){
    return string[0].toUpperCase() + string.substr(1);
}
