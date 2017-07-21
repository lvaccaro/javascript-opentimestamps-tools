const OpenTimestamps = require('javascript-opentimestamps');


$("#btn-generate").click(function(event){
    event.preventDefault();
    var hexFile = $("#file").val();
    var binary = hexToBytes(hexFile);
    var hashType = $("#hashtype_file").val();
    var op;
    if (hashType == "SHA1"){
        op = new OpenTimestamps.Ops.OpSHA1();
    }else if (hashType == "SHA256"){
        op = new OpenTimestamps.Ops.OpSHA256();
    }else if (hashType == "RIPEMD160"){
        op = new OpenTimestamps.Ops.OpRIPEMD160();
    }
    const detached = OpenTimestamps.DetachedTimestampFile.fromBytes(op, binary);
    var encrypted = detached.fileDigest();
    $("#hash").val(bytesToHex(encrypted));
    $("#hashtype").val(hashType);
    return false;
});

$("#choose-file").change(function(event) {
    var input = event.target;
    var file = input.files[0];
    //var sha256 = CryptoJS.algo.SHA256.create();
    var shaObj = new jsSHA("SHA-256", "ARRAYBUFFER");
    console.log("TOTAL LENGTH: "+file.size);

    if (file.size > 100 * 1024) {
        $("#file").val("File too big.. not showing...");
    }

    parseFile(file,
        function (data) {

            console.log("LENGTH: " + data.byteLength);
            shaObj.update(data);

            //sha256.update(data);
        }, function (data) {
            console.log("COMPLETE ");
            //var hash = sha256.finalize();
            //var hashHex = hash.toString(CryptoJS.enc.Hex);
            var hashHex = shaObj.getHash("HEX");
            console.log(hashHex);
            $("#hash").val(hashHex);
            var hashType = $("#hashtype_file").val();
            $("#hashtype").val(hashType);
        });
});

function parseFile(file, callbackProgress, callbackFinal) {
    var chunkSize  = 1024; // bytes
    var offset     = 0;
    var timeout;

    var size=chunkSize;
    var partial;
    while (offset < file.size) {
        partial = file.slice(offset, offset+size);

        var reader = new FileReader;
        reader.size = chunkSize;
        reader.offset = offset;
        reader.onload = function(evt) {
            //console.log(this.offset, this.size, this.result);
            callbackProgress(evt.target.result);

            if(timeout !== undefined){
                clearTimeout(timeout);
            }
            timeout = setTimeout(function () {
                callbackFinal();
            }, 10*1000);
        };
        reader.readAsArrayBuffer(partial);
        offset += chunkSize;
    }

}


$("#btn-stamp").click(function(event){
    event.preventDefault();

    // Check parameters
    var hashType = $("#hashtype").val();
    var hash = $("#hash").val();
    const hashData = hexToBytes(hash);

    var op;
    if (hashType == "SHA1"){
        op = new OpenTimestamps.Ops.OpSHA1();
    }else if (hashType == "SHA256"){
        op = new OpenTimestamps.Ops.OpSHA256();
    }else if (hashType == "RIPEMD160"){
        op = new OpenTimestamps.Ops.OpRIPEMD160();
    }
    const detached = OpenTimestamps.DetachedTimestampFile.fromHash(op, hashData);

    OpenTimestamps.stamp(detached).then( ()=>{

        const ctx = new OpenTimestamps.Context.StreamSerialization();
        detached.serialize(ctx);
        //$("#ots").val(ascii2hex(bin2String(ctx.getOutput())));
        $("#ots").val(bytesToHex(ctx.getOutput()));


        const infoResult = OpenTimestamps.info(detached);
        console.log(infoResult);
        $("#info").val(infoResult);

    });
    return false;
});

$("#btn-upgrade").click(function(event){
    event.preventDefault();

    // Check parameters
    const ots = hexToBytes($("#ots").val());
    const detachedOts = OpenTimestamps.DetachedTimestampFile.deserialize(ots);

    OpenTimestamps.upgrade(detachedOts).then( (changed)=>{

        const ctx = new OpenTimestamps.Context.StreamSerialization();
        detachedOts.serialize(ctx);
        $("#ots").val(bytesToHex(ctx.getOutput()));

        const infoResult = OpenTimestamps.info(detachedOts);
        console.log(infoResult);
        $("#info").val(infoResult);

        if(changed === true) {
            $("#upgrade").val("OTS upgraded");
        } else {
            $("#upgrade").val("OTS not changed");
        }

    });
    return false;
});

$("#btn-verify").click(function(event){
    event.preventDefault();

    // Check parameters
    var hashType = $("#hashtype").val();
    var op;
    if (hashType == "SHA1"){
        op = new OpenTimestamps.Ops.OpSHA1();
    }else if (hashType == "SHA256"){
        op = new OpenTimestamps.Ops.OpSHA256();
    }else if (hashType == "RIPEMD160"){
        op = new OpenTimestamps.Ops.OpRIPEMD160();
    }
    const hash =  hexToBytes($("#hash").val());
    const ots = hexToBytes($("#ots").val());
    const detached = OpenTimestamps.DetachedTimestampFile.fromHash(op, hash);
    const detachedOts = OpenTimestamps.DetachedTimestampFile.deserialize(ots);

    OpenTimestamps.verify(detachedOts,detached).then( (verifyResult)=>{

        $("#verify").val(verifyResult);

    });
    return false;
});

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
