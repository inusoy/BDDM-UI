import React, { useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

const CoAuthorGraph = ({ nameA, nameB, shared }) => {
    const data = useMemo(() => {
        const nodes = [
            { id: 'A', name: nameA, val: 2, color: '#1f77b4' }, // Blue
            { id: 'B', name: nameB, val: 2, color: '#e377c2' }, // Pink
        ];
        const links = [];

        shared.forEach((person, idx) => {
            const id = `shared_${idx}`;
            nodes.push({ id, name: person, val: 1, color: '#2ca02c' }); // Green for shared
            links.push({ source: 'A', target: id });
            links.push({ source: 'B', target: id });
        });

        // Direct link if they co-authored together (implied by this being a match candidate)
        links.push({ source: 'A', target: 'B', color: '#ccc' });

        return { nodes, links };
    }, [nameA, nameB, shared]);

    if (!shared || shared.length === 0) return <div style={{color: '#999', fontStyle:'italic'}}>No shared co-authors found in dataset.</div>;

    return (
        <div style={{ border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
            <ForceGraph2D
                graphData={data}
                width={400}
                height={200}
                nodeLabel="name"
                nodeColor="color"
                linkColor={() => '#ccc'}
                enableNodeDrag={false}
                enableZoomPanInteraction={false} // Keep it static for the card
            />
        </div>
    );
};

export default CoAuthorGraph;