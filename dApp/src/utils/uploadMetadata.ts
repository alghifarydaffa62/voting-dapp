
export async function uploadMetadata(metadata: object) {
    try {
        const JWT = import.meta.env.VITE_PINATA_JWT
        const request = await fetch(
            "https://api.pinata.cloud/pinning/pinJSONToIPFS",
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${JWT}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(metadata)
            }
        )

        const data = await request.json()
        const ipfsHash = data.IpfsHash

        return ipfsHash
    } catch(error) {
        console.error("IPFS Metada error: ", error)
    }
}