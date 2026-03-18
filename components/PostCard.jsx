'use client';
import { useState, useEffect } from 'react';

export default function PostCard({ post, onMirrorCheck }) {
    const [content, setContent] = useState('');
    const [mediaUrl, setMediaUrl] = useState('');
    const [mirrorStatus, setMirrorStatus] = useState('checking');

    useEffect(() => {
        if (!post) return;
        loadPostContent();
        checkMirrors();
    }, [post]);

    const loadPostContent = async () => {
        try {
            if (!post?.contentCid) return;
            const contentResponse = await fetch(`https://ipfs.io/ipfs/${post.contentCid}`);
            const text = await contentResponse.text();
            setContent(text);

            if (post?.mediaCid) {
                setMediaUrl(`https://ipfs.io/ipfs/${post.mediaCid}`);
            }
        } catch (error) {
            await tryFallbackGateways(post?.contentCid, post?.mediaCid);
        }
    };

    const tryFallbackGateways = async (contentCid, mediaCid) => {
        const gateways = [
            'https://cloudflare-ipfs.com/ipfs/',
            'https://gateway.pinata.cloud/ipfs/',
            'https://crustwebsites.net/ipfs/'
        ];

        for (const gateway of gateways) {
            try {
                const response = await fetch(`${gateway}${contentCid}`);
                if (response.ok) {
                    setContent(await response.text());
                    if (mediaCid) setMediaUrl(`${gateway}${mediaCid}`);
                    break;
                }
            } catch (error) {
                continue;
            }
        }
    };

    const checkMirrors = async () => {
        if (!onMirrorCheck || !post?.id) return;
        try {
            const mirrors = await onMirrorCheck(post.id);
            const activeMirrors = mirrors?.filter(m => m.active) || [];
            setMirrorStatus(activeMirrors.length > 0 ? 'healthy' : 'degraded');
        } catch (error) {
            console.warn('Mirror check failed:', error);
            setMirrorStatus('degraded');
        }
    };

    return (
        <div className={`post-card ${mirrorStatus}`}>
            <div className="post-header">
                <div className="user-info">
                    <span className="wallet-address">
                        {post?.owner
                            ? `${post.owner.slice(0, 10)}...${post.owner.slice(-8)}`
                            : 'Unknown Owner'}
                    </span>
                    <span className="timestamp">
                        {post?.timestamp
                            ? new Date(post.timestamp).toLocaleDateString()
                            : 'No timestamp'}
                    </span>
                </div>
                <div className={`status-indicator ${mirrorStatus}`}>
                    {mirrorStatus === 'healthy' ? '🟢' : '🟡'}
                </div>
            </div>

            <div className="post-content">
                <p>{content || 'Loading content...'}</p>
                {mediaUrl && (
                    <img src={mediaUrl} alt="Post media" className="post-media" />
                )}
            </div>

            <div className="post-footer">
                <span className="mirror-count">
                    Mirrors: {mirrorStatus === 'healthy' ? 'Multiple' : 'Limited'}
                </span>
            </div>
        </div>
    );
}
