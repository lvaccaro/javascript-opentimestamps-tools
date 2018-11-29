const OpenTimestamps = window.OpenTimestamps;
const calendarURL = 'calendar.irsa.it:80';

$("#btn-hash").click(function(event) {
    event.preventDefault();
    $("#hash-output").val("Waiting for result...");

    var filename = $("#hash-filename").val().replace(/^.*[\\\/]/, '')
    var datafile = $("#hash-filename")[0].files[0];
    if (datafile.size > 100 * 1024) {
        $("#hash-output").val("File too big.. not showing...");
        return;
    }

    var hashType = $("#hash-hashType").val();
    var op;
    if (hashType == "SHA1") {
        op = new OpenTimestamps.Ops.OpSHA1();
    } else if (hashType == "SHA256") {
        op = new OpenTimestamps.Ops.OpSHA256();
    } else if (hashType == "RIPEMD160") {
        op = new OpenTimestamps.Ops.OpRIPEMD160();
    }

    var reader = new FileReader();
    // Closure to capture the file information.
    reader.onload = (function(theFile) {
        return function(e) {
            var binary = new Uint8Array(e.target.result);
            console.log("binary");
            console.log(binary);
            const detached = OpenTimestamps.DetachedTimestampFile.fromBytes(op, binary);
            var digest = detached.fileDigest();
            var hashValue = bytesToHex(digest);

            $("#hash-output").val(hashValue);

            $("#stamp-hashType").val(hashType)
            $("#stamp-hashValue").val(hashValue);

            $("#stamp-filename").val(filename+".ots");
            $("#upgrade-filename").val(filename+".ots");
        };
    })(datafile);
    reader.readAsArrayBuffer(datafile);
    return false;
});

$("#btn-stamp").click(function(event) {
    event.preventDefault();
    $("#stamp-output").val("Waiting for result...");

    var hashValue = $("#stamp-hashValue").val();
    const hashData = hexToBytes(hashValue);
    const options = {calendars: [calendarURL]};

    var hashType = $("#stamp-hashType").val();
    var op;
    if (hashType == "SHA1") {
        op = new OpenTimestamps.Ops.OpSHA1();
    } else if (hashType == "SHA256") {
        op = new OpenTimestamps.Ops.OpSHA256();
    } else if (hashType == "RIPEMD160") {
        op = new OpenTimestamps.Ops.OpRIPEMD160();
    }
    const detachedOriginal = OpenTimestamps.DetachedTimestampFile.fromHash(op, hashData);

    var filename = $("#stamp-filename").val();

    OpenTimestamps.stamp(detachedOriginal, options).then( () => {
        hexots = bytesToHex(detachedOriginal.serializeToBytes());
        $("#stamp-output").val(hexots);

        const timestampBytes = detachedOriginal.serializeToBytes();
        var blob = new Blob([timestampBytes], {type: "octet/stream"});
        saveAs(blob, filename);

        $("#info-ots").val(hexots);
        $("#info-output").val("Result will be displayed here")
        $("#upgrade-ots").val(hexots);
        $("#upgrade-filename").val(filename);
        $("#upgrade-output").val("Result will be displayed here")
        $("#verify-ots").val(hexots);
        $("#verify-output").val("Result will be displayed here")
    }).catch( err => {
        $("#stamp-output").val("Error: " + err);
    });
    return false;
});

$("#btn-load").click(function(event) {
    event.preventDefault();
    $("#load-output").val("Waiting for result...");

    var filename = $("#load-filename").val().replace(/^.*[\\\/]/, '')
    var otsfile = $("#load-filename")[0].files[0];

    var reader = new FileReader();
    // Closure to capture the file information.
    reader.onload = (function(theFile) {
        return function(e) {
            var binary = new Uint8Array(e.target.result);
            var hexots = bytesToHex(binary);
            $("#load-output").val(hexots);

            $("#info-ots").val(hexots);
            $("#info-output").val("Result will be displayed here")
            $("#upgrade-ots").val(hexots);
            $("#upgrade-output").val("Result will be displayed here")
            $("#verify-ots").val(hexots);
            $("#verify-output").val("Result will be displayed here")

            var upgradedOTSfilename = filename.replace('.ots', '.upgraded.ots')
            $("#upgrade-filename").val(upgradedOTSfilename);
            $("#verify-filename").val(upgradedOTSfilename);
        };
    })(otsfile);
    reader.readAsArrayBuffer(otsfile);
    return false;
});

$("#btn-info").click(function(event) {
    event.preventDefault();
    $("#info-output").val("Waiting for result...");

    var hexots = $("#info-ots").val();
    const ots = hexToBytes(hexots);
    const detachedStamped = OpenTimestamps.DetachedTimestampFile.deserialize(ots);
    const info = OpenTimestamps.info(detachedStamped);
    $("#info-output").val(info);

    $("#upgrade-ots").val(hexots);
    $("#upgrade-output").val("Result will be displayed here")
    $("#verify-ots").val(hexots);
    $("#verify-output").val("Result will be displayed here")

    return false;
});

$("#btn-upgrade").click(function(event) {
    event.preventDefault();
    $("#upgrade-output").val("Waiting for result...");

    const ots = hexToBytes($("#upgrade-ots").val());
    const detachedStamped = OpenTimestamps.DetachedTimestampFile.deserialize(ots);
    var options = {whitelist: new OpenTimestamps.Calendar.UrlWhitelist([calendarURL])};
    //var wlist = new OpenTimestamps.Calendar.UrlWhitelist([calendarURL]);


    var filename = $("#upgrade-filename").val();
    $("#verify-filename").val(filename);

    OpenTimestamps.upgrade(detachedStamped, options).then( (changed)=>{
        const timestampBytes = detachedStamped.serializeToBytes();
        var hexots = bytesToHex(timestampBytes);
        if (changed === true) {
            $("#upgrade-output").val(hexots);

            $("#info-ots").val(hexots);
            $("#info-output").val("Result will be displayed here")
            $("#verify-ots").val(hexots);
            $("#verify-output").val("Result will be displayed here")

            var blob = new Blob([timestampBytes], {type: "octet/stream"});
            saveAs(blob, filename);
        } else {
            $("#upgrade-output").val("No upgrade available");
        }
    }).catch( err => {
        $("#upgrade-output").val("Error: " + err);
    });
    return false;
});

$("#btn-verify").click(function(event) {
    event.preventDefault();
    $("#verify-output").val("Waiting for result...");

    const ots = hexToBytes($("#verify-ots").val());
    const detachedStamped = OpenTimestamps.DetachedTimestampFile.deserialize(ots);
    var hashValue = bytesToHex(detachedStamped.fileDigest());
    $("#verify-hashValue").val(hashValue);

    var filename = $("#verify-filename").val();
    var outputText = "";
    var options = {whitelist: new OpenTimestamps.Calendar.UrlWhitelist([calendarURL])};

    OpenTimestamps.upgrade(detachedStamped, options).then( (changed)=>{
        const timestampBytes = detachedStamped.serializeToBytes();
        var hexots = bytesToHex(timestampBytes);
        if (changed === true) {
            outputText += "Upgraded proof"
            $("#verify-output").val(outputText + "\nWaiting for verification results...");

            // update info card
            $("#info-ots").val(hexots);
            $("#info-output").val("Result will be displayed here")
            // update upgrade card
            $("#upgrade-ots").val(hexots);
            $("#upgrade-output").val("Result will be displayed here")
            $("#upgrade-filename").val(filename)
            // update proof file
            var blob = new Blob([timestampBytes], {type: "octet/stream"});
            saveAs(blob, filename);
        } else {
            // unchanged proof
        }
        options = {insight: {urls: ['https://testnet.blockexplorer.com/api',
					                'https://test-insight.bitpay.com/api']
                            }
                  };
        return OpenTimestamps.verifyTimestamp(detachedStamped.timestamp, options)
    }).then( (results)=>{
        if (Object.keys(results).length === 0) {
            if (!detachedStamped.timestamp.isTimestampComplete())
                outputText += "\nPending attestation"
            else
                outputText += "\nInvalid attestation"
        } else {
            Object.keys(results).map(chain => {
                var date = moment(results[chain].timestamp * 1000).tz(moment.tz.guess()).format('YYYY-MM-DD z')
                outputText += "\n" + upperFirstLetter(chain) + ' block ' + results[chain].height + ' attests existence as of ' + date
            })
            $("#verify-output").val(outputText);
        }
    }).catch( err => {
        $("#verify-output").val("Error: " + err);
    });
    return false;
});
