# javascript-opentimestamp-tools
JS Tools for [javascript-opentimestamps](https://github.com/opentimestamps/javascript-opentimestamps)
Test live tools [here](https://opentimestamps.org/tools/)

## Tools
* Generate hash (sha1, sha256, ripemd160) from hex or file
* stamp the hash & print the ots-proof
* print info of ots
* upgrade ots
* verify ots

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