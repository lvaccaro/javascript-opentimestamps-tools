const OpenTimestamps = window.OpenTimestamps

$("#btn-hash").click(function(event) {
    event.preventDefault()
    // begin processing...
    $("#hash-output").val("Waiting for result...")

    const filename = $("#hash-filename").val().replace(/^.*[\\\/]/, '')
    const datafile = $("#hash-filename")[0].files[0]
    if (datafile.size > 100 * 1024) {
        $("#hash-output").val("File too big.. not showing...")
        return
    }

    const hashType = $("#hash-hashType").val()
    var op
    if (hashType == "SHA1") {
        op = new OpenTimestamps.Ops.OpSHA1()
    } else if (hashType == "SHA256") {
        op = new OpenTimestamps.Ops.OpSHA256()
    } else if (hashType == "RIPEMD160") {
        op = new OpenTimestamps.Ops.OpRIPEMD160()
    }

    var reader = new FileReader()
    // Closure to capture the file information
    reader.onload = (function(theFile) {
        return function(e) {
            const binary = new Uint8Array(e.target.result)
            console.log("binary")
            console.log(binary)
            const detachedStamped = OpenTimestamps.DetachedTimestampFile.fromBytes(op, binary)
            const digest = detachedStamped.fileDigest()
            const hashValue = bytesToHex(digest)
            $("#hash-output").val(hashValue)

            // autofill
            $("#stamp-hashType").val(hashType)
            $("#stamp-hashValue").val(hashValue)
            $("#stamp-filename").val(filename+".ots")
            $("#upgrade-filename").val(filename+".ots")
        }
    })(datafile)
    reader.readAsArrayBuffer(datafile)
    return false
})

// TODO: list calendars the hash as been submitted to
$("#btn-stamp").click(function(event) {
    event.preventDefault()
    // begin processing...
    $("#stamp-output").val("Waiting for result...")

    const hashType = $("#stamp-hashType").val()
    var op
    if (hashType == "SHA1") {
        op = new OpenTimestamps.Ops.OpSHA1()
    } else if (hashType == "SHA256") {
        op = new OpenTimestamps.Ops.OpSHA256()
    } else if (hashType == "RIPEMD160") {
        op = new OpenTimestamps.Ops.OpRIPEMD160()
    }

    const hashValue = $("#stamp-hashValue").val()
    const hashData = hexToBytes(hashValue)
    const detachedOriginal = OpenTimestamps.DetachedTimestampFile.fromHash(op, hashData)

    const filename = $("#stamp-filename").val()

    OpenTimestamps.stamp(detachedOriginal).then( () => {
        const byteots = detachedOriginal.serializeToBytes()
        const hexots = bytesToHex(byteots)
        $("#stamp-output").val(hexots)

        const timestampBytes = detachedOriginal.serializeToBytes()
        var blob = new Blob([timestampBytes], {type: "octet/stream"})
        saveAs(blob, filename)

        // autofill
        $("#info-ots").val(hexots)
        $("#info-output").val("Result will be displayed here")
        $("#upgrade-ots").val(hexots)
        $("#upgrade-filename").val(filename)
        $("#upgrade-output").val("Result will be displayed here")
        $("#verify-ots").val(hexots)
        $("#verify-output").val("Result will be displayed here")
    }).catch( err => {
        $("#stamp-output").val("Error: " + err)
    })
    return false
})

$("#btn-load").click(function(event) {
    event.preventDefault()
    // begin processing...
    $("#load-output").val("Waiting for result...")

    const filename = $("#load-filename").val().replace(/^.*[\\\/]/, '')
    const otsfile = $("#load-filename")[0].files[0]

    var reader = new FileReader()
    // Closure to capture the file information.
    reader.onload = (function(theFile) {
        return function(e) {

            const ots = new Uint8Array(e.target.result)

            const detachedStamped = OpenTimestamps.DetachedTimestampFile.deserialize(ots)
            const digest = detachedStamped.fileDigest()
            const hashValue = bytesToHex(digest)
            $("#load-hashValue").val(hashValue)

            const hexots = bytesToHex(ots)
            $("#load-output").val(hexots)

            // autofill
            $("#info-ots").val(hexots)
            $("#info-output").val("Result will be displayed here")
            $("#upgrade-ots").val(hexots)
            $("#upgrade-output").val("Result will be displayed here")
            $("#verify-ots").val(hexots)
            $("#verify-output").val("Result will be displayed here")
            const upgradedOTSfilename = filename.replace('.ots', '.upgraded.ots')
            $("#upgrade-filename").val(upgradedOTSfilename)
            $("#verify-filename").val(upgradedOTSfilename)
        }
    })(otsfile)
    reader.readAsArrayBuffer(otsfile)
    return false
})

$("#btn-info").click(function(event) {
    // begin processing...
    event.preventDefault()
    $("#info-output").val("Waiting for result...")

    const hexots = $("#info-ots").val()
    const ots = hexToBytes(hexots)
    const detachedStamped = OpenTimestamps.DetachedTimestampFile.deserialize(ots)

    const info = OpenTimestamps.info(detachedStamped)
    $("#info-output").val(info)
	$("#info-otsweb").attr('href', 'https://opentimestamps.org/info/?' + hexots)

    // autofill
    $("#upgrade-ots").val(hexots)
    $("#upgrade-output").val("Result will be displayed here")
    $("#verify-ots").val(hexots)
    $("#verify-output").val("Result will be displayed here")

    return false
})

$("#btn-upgrade").click(function(event) {
    event.preventDefault()
    // begin processing...
    $("#upgrade-output").val("Waiting for result...")

    const hexots = $("#upgrade-ots").val()
    const ots = hexToBytes(hexots)
    const detachedStamped = OpenTimestamps.DetachedTimestampFile.deserialize(ots)
    const digest = detachedStamped.fileDigest()
    const hashValue = bytesToHex(digest)
    $("#upgrade-hashValue").val(hashValue)

    const filename = $("#upgrade-filename").val()
    $("#verify-filename").val(filename)

    OpenTimestamps.upgrade(detachedStamped).then( (changed)=>{
        const timestampBytes = detachedStamped.serializeToBytes()
        const hexots = bytesToHex(timestampBytes)
        if (changed === true) {
            $("#upgrade-output").val(hexots)

            var blob = new Blob([timestampBytes], {type: "octet/stream"})
            saveAs(blob, filename)

            // autofill
            $("#info-ots").val(hexots)
            $("#info-output").val("Result will be displayed here")
            $("#verify-ots").val(hexots)
            $("#verify-output").val("Result will be displayed here")
        } else {
            $("#upgrade-output").val("No proof upgrade available")
        }
    }).catch( err => {
        $("#upgrade-output").val("Error: " + err)
    })
    return false
})

// TODO: make upgrade optional
// multiple attestations?
$("#btn-verify").click(function(event) {
    event.preventDefault()
    // begin processing...
    $("#verify-output").val("Waiting for result...")

    var hexots = $("#verify-ots").val()
    const ots = hexToBytes(hexots)
    const detachedStamped = OpenTimestamps.DetachedTimestampFile.deserialize(ots)
    const digest = detachedStamped.fileDigest()
    const hashValue = bytesToHex(digest)
    $("#verify-hashValue").val(hashValue)

    const filename = $("#verify-filename").val()
    var outputText = ""

    OpenTimestamps.upgrade(detachedStamped).then( (changed)=>{
        const timestampBytes = detachedStamped.serializeToBytes()
        hexots = bytesToHex(timestampBytes)
        if (changed === true) {
            outputText += "Upgraded proof"

            // update proof file
            var blob = new Blob([timestampBytes], {type: "octet/stream"})
            saveAs(blob, filename)

            // autofill
            $("#info-ots").val(hexots)
            $("#info-output").val("Result will be displayed here")
            $("#upgrade-ots").val(hexots)
            $("#upgrade-output").val("Result will be displayed here")
            $("#upgrade-filename").val(filename)
        } else {
            outputText += "No proof upgrade available"
        }
        $("#verify-output").val(outputText + "\nWaiting for verification results...")
        return OpenTimestamps.verifyTimestamp(detachedStamped.timestamp)
    }).then( (results)=>{
        if (Object.keys(results).length === 0) {
            if (!detachedStamped.timestamp.isTimestampComplete())
                outputText += "\nPending attestation"
            else
                outputText += "\nInvalid attestation"
        } else {
            Object.keys(results).map(chain => {
                const date = moment(results[chain].timestamp * 1000).tz(moment.tz.guess()).format('YYYY-MM-DD z')
                outputText += "\n" + upperFirstLetter(chain) + ' block ' + results[chain].height + ' attests existence as of ' + date
            })
        }
        $("#verify-output").val(outputText)
    }).catch( err => {
        $("#verify-output").val("Error: " + err)
    })
    return false
})
