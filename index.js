const OpenTimestamps = window.OpenTimestamps;


$("#btn-gethash").click(function(event){
    event.preventDefault();
    var hashType = $("#gethash-type").val();
    var file = $("#gethash-file")[0].files[0];
    if (file.size > 100 * 1024) {
        $("#gethash-hash").val("File too big.. not showing...");
        return;
    }
    var reader = new FileReader();
    // Closure to capture the file information.
    reader.onload = (function(theFile) {
        return function(e) {
            var binary = new Uint8Array(e.target.result);
            console.log("binary");
            console.log(binary);
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
            $("#gethash-hash").val(bytesToHex(encrypted));
        };
    })(file);
    reader.readAsArrayBuffer(file);
    return false;
});

$("#btn-stamp").click(function(event){
    event.preventDefault();
    var hashType = $("#stamp-type").val();
    var hash = $("#stamp-hash").val();
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
    OpenTimestamps.stamp(detached).then( () => {
        $("#stamp-ots").val(bytesToHex(detached.serializeToBytes()));
    });
    return false;
});


$("#btn-info").click(function(event){
    event.preventDefault();
    const ots = hexToBytes($("#info-ots").val());
    const detachedOts = OpenTimestamps.DetachedTimestampFile.deserialize(ots);
    const infoResult = OpenTimestamps.info(detachedOts);
    $("#info-info").val(infoResult);
    return false;
});

$("#btn-upgrade").click(function(event){
    event.preventDefault();
    const ots = hexToBytes($("#upgrade-inots").val());
    const detachedOts = OpenTimestamps.DetachedTimestampFile.deserialize(ots);
    OpenTimestamps.upgrade(detachedOts).then( (changed)=>{
        $("#upgrade-outots").val(bytesToHex(detachedOts.serializeToBytes()));
        if(changed === true) {
            $("#upgrade-log").val("OTS upgraded");
        } else {
            $("#upgrade-log").val("OTS not changed");
        }
    });
    return false;
});

$("#btn-verify").click(function(event){
    event.preventDefault();
    var hashType = $("#verify-type").val();
    var op;
    if (hashType == "SHA1"){
        op = new OpenTimestamps.Ops.OpSHA1();
    }else if (hashType == "SHA256"){
        op = new OpenTimestamps.Ops.OpSHA256();
    }else if (hashType == "RIPEMD160"){
        op = new OpenTimestamps.Ops.OpRIPEMD160();
    }
    const hash =  hexToBytes($("#verify-hash").val());
    const ots = hexToBytes($("#verify-ots").val());
    const detached = OpenTimestamps.DetachedTimestampFile.fromHash(op, hash);
    const detachedOts = OpenTimestamps.DetachedTimestampFile.deserialize(ots);
    OpenTimestamps.verify(detachedOts,detached).then( (verifyResults)=>{
        if(Object.keys(verifyResults).length === 0){
            $("#verify-log").val("Pending attestation");
        }else{
            var text = "";
            Object.keys(results).map(chain => {
                var date = moment(results[chain].timestamp * 1000).tz(moment.tz.guess()).format('YYYY-MM-DD z')
                text += upperFirstLetter(chain) + ' block ' + results[chain].height + ' attests existence as of ' + date + "\n"
            })
            $("#verify-log").val(text);
        }
    }).catch( err => {
        $("#verify-log").val("Bad attestation" + err);
    });
    return false;
});

$("#btn-upload").click(function(event){
    event.preventDefault();
    var file = $("#upload-file")[0].files[0];
    var reader = new FileReader();
    // Closure to capture the file information.
    reader.onload = (function(theFile) {
        return function(e) {
            var binary = new Uint8Array(e.target.result);
            $("#upload-hex").val(bytesToHex(binary));
        };
    })(file);
    reader.readAsArrayBuffer(file);
    return false;
});


$("#btn-download").click(function(event){
    event.preventDefault();
    var filename = $("#download-filename").val();
    var hex = $("#download-hex").val();
    var text = hex2ascii(hex);
    var blob = new Blob([text], {type: "octet/stream"});
    saveAs(blob, filename);
    return false;
});
