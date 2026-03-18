// lib/ipfs.js
import { create } from 'ipfs-http-client';

class IPFSService {
    constructor() {
        this.client = create({
            host: 'ipfs.infura.io',
            port: 5001,
            protocol: 'https',
            headers: {
                authorization: `Basic ${Buffer.from(
                    `${process.env.INFURA_PROJECT_ID}:${process.env.INFURA_PROJECT_SECRET}`
                ).toString('base64')}`
            }
        });

        this.gateways = [
            'https://ipfs.io/ipfs/',
            'https://cloudflare-ipfs.com/ipfs/',
            'https://gateway.pinata.cloud/ipfs/',
            'https://crustwebsites.net/ipfs/'
        ];
    }

    async uploadContent(content, isMedia = false) {
        try {
            const result = await this.client.add(content);

            // Pin to multiple services for redundancy
            await this.pinToCrust(result.cid.toString());
            await this.pinToPinata(result.cid.toString());

            return result.cid.toString();
        } catch (error) {
            console.error('IPFS upload failed:', error);
            throw error;
        }
    }

    async pinToCrust(cid) {
        // Integrate with Crust Network for decentralized pinning
        const response = await fetch('https://pin.crustcode.com/psa', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.CRUST_TOKEN}`
            },
            body: JSON.stringify({
                cid: cid,
                name: `echoverse-${Date.now()}`
            })
        });
        return response.ok;
    }

    async retrieveContent(cid) {
        // Try multiple gateways for redundancy
        for (const gateway of this.gateways) {
            try {
                const response = await fetch(`${gateway}${cid}`);
                if (response.ok) {
                    return await response.text();
                }
            } catch (error) {
                console.warn(`Gateway ${gateway} failed for CID ${cid}`);
                continue;
            }
        }
        throw new Error(`All gateways failed for CID ${cid}`);
    }
}

export const ipfsService = new IPFSService();