# javascript-opentimestamp-tools
JS Tools for [javascript-opentimestamps](https://github.com/opentimestamps/javascript-opentimestamps).

Test live tools [here](https://opentimestamps.org/tools/)

## Get `opentimestamps.js`
* download from website [opentimestamps.org](https://opentimestamps.org)
```html
<script src="https://opentimestamps.org/assets/javascripts/vendor/opentimestamps.js"></script>
```
* build sources from [javascript-opentimestamps](https://github.com/opentimestamps/javascript-opentimestamps) 
```bash
git clone https://github.com/opentimestamps/javascript-opentimestamps.git
npm install --dev
npm run dist
```

## Stamp
```js
const hashData = "16193782f1d839a08f9fc9a94cec1675f1729db1abc15cf9b57f31aa1724a0ae"
const op = new OpenTimestamps.Ops.OpSHA256()
const detached = OpenTimestamps.DetachedTimestampFile.fromHash(op, hashData)
OpenTimestamps.stamp(detached).then( ()=>{
    const ots = detached.serializeToBytes()
    const hex = bytesToHex(ots)
    console.log(hex)
})
```

## Info
```js
const hashData = "16193782f1d839a08f9fc9a94cec1675f1729db1abc15cf9b57f31aa1724a0ae"
const op = new OpenTimestamps.Ops.OpSHA256()
const detached = OpenTimestamps.DetachedTimestampFile.fromHash(op, hashData)
const output = OpenTimestamps.info(detached)
console.log(output)
```

## Upgrade
```js
const detachedOts = OpenTimestamps.DetachedTimestampFile.deserialize(ots)
OpenTimestamps.upgrade(detachedOts).then( (changed) =>{
    if(changed){
        console.log("Timestamp upgraded")
        const upgradedOts = detachedOts.serializeToBytes()
        const upgradedHex = bytesToHex(upgradedOts)
        console.log(upgradedHex)
    } else {
        console.log("Timestamp not changed")
    }
})
```

## Verify
```js
const hashData = "16193782f1d839a08f9fc9a94cec1675f1729db1abc15cf9b57f31aa1724a0ae"
const op = new OpenTimestamps.Ops.OpSHA256()
const detached = OpenTimestamps.DetachedTimestampFile.fromHash(op, hashData)
const detachedOts = OpenTimestamps.DetachedTimestampFile.deserialize(ots)
OpenTimestamps.verify(detachedOts, detached).then( (results)=>{
    if(Object.keys(results).length === 0){
        console.log("Pending attestation");
    }else{
        Object.keys(verifyResults).forEach(key => {
            console.log ( key+" attests data existed as of " + (new Date(verifyResults[key] * 1000)) );
        });
    }
}).catch( err => {
    console.log("Bad attestation" + err);
});
```