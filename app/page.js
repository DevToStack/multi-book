// app/page.js
'use client';
import { useState, useEffect } from 'react';
import WalletConnect from '../components/WalletConnect';
import PostCard from '../components/PostCard';
import ResilienceDemo from '../components/ResilienceDemo';
import { fetchPostsFromContract } from '@/lib/posts';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      // Fetch posts from contract
      const postsData = await fetchPostsFromContract();
      setPosts(postsData);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkMirrors = async (postId) => {
    // Check mirror status across nodes
    return await checkPostMirrors(postId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-800">
      <header className="border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">EchoVerse</h1>
            <WalletConnect />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Global Feed</h2>

              {isLoading ? (
                <div className="text-center text-white/60">Loading posts...</div>
              ) : (
                <div className="space-y-4">
                  {posts.map(post => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onMirrorCheck={checkMirrors}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <ResilienceDemo />
          </div>
        </div>
      </main>
    </div>
  );
}