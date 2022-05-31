"use strict";
exports.__esModule = true;
var t = require("typed-assert");
var firstToSecond_1 = require("./firstToSecond");
var first = {
    contract: { address: '0x5180db8f5c931aae63c74266b211f580155ecac8' },
    id: { tokenId: '1590', tokenMetadata: { tokenType: 'ERC721' } },
    title: 'balsa vault',
    description: 'You are a WITCH with eyes that hold eons. You write poems filled with charms. Your magic spawns from a few hours of sleep. You arch your back into a bridge between the living and the dead. SHINE!',
    tokenUri: {
        raw: 'ipfs://QmZHKZDavkvNfA9gSAg7HALv8jF7BJaKjUc9U2LSuvUySB/1590.json',
        gateway: 'https://ipfs.io/ipfs/QmZHKZDavkvNfA9gSAg7HALv8jF7BJaKjUc9U2LSuvUySB/1590.json'
    },
    metadata: {
        image: 'https://cryptocoven.s3.amazonaws.com/a7875f5758f85544dcaab79a8a1ca406.png',
        external_url: 'https://www.cryptocoven.xyz/witches/1590',
        name: 'balsa vault',
        description: 'You are a WITCH with eyes that hold eons. You write poems filled with charms. Your magic spawns from a few hours of sleep. You arch your back into a bridge between the living and the dead. SHINE!',
        attributes: [
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object], [Object],
            [Object], [Object]
        ]
    }
};
var second = (0, firstToSecond_1["default"])(first);
console.log(second);
t.isNumber(second.contract);
