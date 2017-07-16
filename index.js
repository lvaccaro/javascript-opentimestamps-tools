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
    const ots = hexToBytes($("#ots").val());
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

