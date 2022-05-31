export type First = {
    contract: { address: string },
    id: {
        tokenId: string,
        tokenMetadata: {
            tokenType: string
        }
    },
    title: string,
    description: string,
    tokenUri: {
        raw: string,
        gateway: string
    },
    metadata: {
        image: string,
        external_url: string,
        name: string,
        description: string,
        attributes: any,
    }
}

export type Second = {
    token_id: number,
    contract: string,
    title: string,
    description: string,
    image_url: string,
    external_url: string,
    token_uri: string,
    attributes: string
}

const firstToSecond = (v: First): Second => {
    return {
        contract: v.contract.address,
        token_id: parseInt(v.id.tokenId),
        title: v.title,
        description: v.description,
        image_url: v.metadata.image,
        external_url: v.metadata.external_url,
        token_uri: v.tokenUri.raw,
        attributes: JSON.stringify(v.metadata.attributes)
    }
};

export default firstToSecond;