"use strict";
exports.__esModule = true;
var firstToSecond = function (v) {
    return {
        contract: v.contract.address,
        token_id: parseInt(v.id.tokenId),
        title: v.title,
        description: v.description,
        image_url: v.metadata.image,
        external_url: v.metadata.external_url,
        token_uri: v.tokenUri.raw,
        attributes: JSON.stringify(v.metadata.attributes)
    };
};
exports["default"] = firstToSecond;
