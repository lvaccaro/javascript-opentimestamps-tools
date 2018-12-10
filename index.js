const OpenTimestamps = window.OpenTimestamps
const calendarsList = [
    //'http://calendar.irsa.it:80',
    'https://alice.btc.calendar.opentimestamps.org', 
    'https://bob.btc.calendar.opentimestamps.org',
    'https://finney.calendar.eternitywall.com'
    ]
const wcalendars = [
     //'http://calendar.irsa.it:80',
    'https://alice.btc.calendar.opentimestamps.org', 
    'https://bob.btc.calendar.opentimestamps.org',
    'https://finney.calendar.eternitywall.com'
]
const whitelistedCalendars = new OpenTimestamps.Calendar.UrlWhitelist(wcalendars)
const blockexplorers = {
    urls: [
        //'https://blockstream.info/testnet/api',
        //'https://testnet.blockexplorer.com/api'
        'https://blockstream.info/api',
        'https://blockexplorer.com/api'
    ]
}

$("#btn-hash").click(function(event) {
    event.preventDefault()
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

$("#btn-stamp").click(function(event) {
    // list calendars the hash as been submitted to
    event.preventDefault()
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

    const options = { calendars: calendarsList }
    OpenTimestamps.stamp(detachedOriginal, options).then( () => {
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
    event.preventDefault()
    $("#info-output").val("Waiting for result...")

    const hexots = $("#info-ots").val()
    const ots = hexToBytes(hexots)
    const detachedStamped = OpenTimestamps.DetachedTimestampFile.deserialize(ots)

    const info = OpenTimestamps.info(detachedStamped)
    $("#info-output").val(info)

    // autofill
    $("#upgrade-ots").val(hexots)
    $("#upgrade-output").val("Result will be displayed here")
    $("#verify-ots").val(hexots)
    $("#verify-output").val("Result will be displayed here")

    return false
})

$("#btn-upgrade").click(function(event) {
    event.preventDefault()
    $("#upgrade-output").val("Waiting for result...")

    const hexots = $("#upgrade-ots").val()
    const ots = hexToBytes(hexots)
    const detachedStamped = OpenTimestamps.DetachedTimestampFile.deserialize(ots)
    const digest = detachedStamped.fileDigest()
    const hashValue = bytesToHex(digest)
    $("#upgrade-hashValue").val(hashValue)

    const filename = $("#upgrade-filename").val()
    $("#verify-filename").val(filename)

    const upgradeOptions = { whitelist: whitelistedCalendars }
    OpenTimestamps.upgrade(detachedStamped, upgradeOptions).then( (changed)=>{
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

$("#btn-verify").click(function(event) {
    // optional upgrade
    // multiple attestations?
    event.preventDefault()
    $("#verify-output").val("Waiting for result...")

    var hexots = $("#verify-ots").val()
    const ots = hexToBytes(hexots)
    const detachedStamped = OpenTimestamps.DetachedTimestampFile.deserialize(ots)
    const digest = detachedStamped.fileDigest()
    const hashValue = bytesToHex(digest)
    $("#verify-hashValue").val(hashValue)

    const filename = $("#verify-filename").val()
    var outputText = ""

    const upgradeOptions = { whitelist: whitelistedCalendars }
    OpenTimestamps.upgrade(detachedStamped, upgradeOptions).then( (changed)=>{
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
        const verifyOptions = { insight: blockexplorers }
        return OpenTimestamps.verifyTimestamp(detachedStamped.timestamp, verifyOptions)
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
