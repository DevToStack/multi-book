// components/ResilienceDemo.jsx
'use client';
import { useState } from 'react';

export default function ResilienceDemo() {
    const [nodes, setNodes] = useState([
        { id: 1, name: 'Primary Node', status: 'active', region: 'US-East' },
        { id: 2, name: 'Backup Node 1', status: 'active', region: 'EU-Central' },
        { id: 3, name: 'Backup Node 2', status: 'active', region: 'Asia-Pacific' },
    ]);

    const simulateNodeFailure = (nodeId) => {
        setNodes(nodes.map(node =>
            node.id === nodeId
                ? { ...node, status: 'failed' }
                : node
        ));

        // Auto-recovery simulation
        setTimeout(() => {
            setNodes(nodes.map(node =>
                node.id === nodeId
                    ? { ...node, status: 'recovering' }
                    : node
            ));

            setTimeout(() => {
                setNodes(nodes.map(node =>
                    node.id === nodeId
                        ? { ...node, status: 'active' }
                        : node
                ));
            }, 2000);
        }, 1500);
    };

    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Network Resilience Demo</h3>

            <div className="space-y-3">
                {nodes.map(node => (
                    <div key={node.id} className={`p-3 rounded-lg border ${node.status === 'active' ? 'border-green-500 bg-green-500/10' :
                            node.status === 'failed' ? 'border-red-500 bg-red-500/10' :
                                'border-yellow-500 bg-yellow-500/10'
                        }`}>
                        <div className="flex justify-between items-center">
                            <div>
                                <div className="font-medium text-white">{node.name}</div>
                                <div className="text-sm text-white/60">{node.region}</div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${node.status === 'active' ? 'bg-green-500' :
                                        node.status === 'failed' ? 'bg-red-500' :
                                            'bg-yellow-500 animate-pulse'
                                    }`}></div>
                                <span className="text-sm text-white capitalize">{node.status}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={() => simulateNodeFailure(1)}
                className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors"
            >
                Simulate Node Failure
            </button>

            <div className="mt-4 text-sm text-white/60">
                <p>Watch how content remains accessible even when nodes fail!</p>
            </div>
        </div>
    );
}