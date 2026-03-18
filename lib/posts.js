// lib/posts.js
import { ipfsService } from './ipfs';
import { ApiPromise, WsProvider } from '@polkadot/api';

const WS_RPC_URL = process.env.NEXT_PUBLIC_POLKADOT_RPC || 'wss://rpc.polkadot.io';

export async function fetchPostsFromContract() {
    try {
        // 1. Connect to Polkadot node (or your custom chain)
        const provider = new WsProvider(WS_RPC_URL);
        const api = await ApiPromise.create({ provider });

        // 2. Example: read CIDs from storage (adjust for your contract logic)
        // Suppose your smart contract or pallet stores post CIDs like this:
        //   storage Posts: Vec<Text>
        const cids = (await api.query.echoverse?.posts?.())?.toHuman() || [];

        // Fallback for testing if no on-chain data yet
        if (!Array.isArray(cids) || cids.length === 0) {
            console.warn('No on-chain posts found, returning demo data');
            return [
                { id: 1, content: 'Welcome to EchoVerse! (demo post)' },
                { id: 2, content: 'Polkadot Cloud is awesome 🔗' },
            ];
        }

        // 3. Fetch actual post content from IPFS for each CID
        const posts = await Promise.all(
            cids.map(async (cid, index) => {
                try {
                    const content = await ipfsService.retrieveContent(cid);
                    return { id: index + 1, cid, content };
                } catch {
                    return { id: index + 1, cid, content: '[Failed to load post]' };
                }
            })
        );

        await provider.disconnect();
        return posts;
    } catch (err) {
        console.error('fetchPostsFromContract error:', err);
        return [];
    }
}
