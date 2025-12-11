import React, { useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

const CoAuthorGraph = ({ nameA, nameB, shared }) => {
    const data = useMemo(() => {
        // 1. Define Nodes
        const nodes = [
            // INCREASED val to 8 to make room for the letter inside
            { id: 'A', name: nameA, val: 8, color: '#1f77b4', isMain: true },
            { id: 'B', name: nameB, val: 8, color: '#e377c2', isMain: true },
        ];
        const links = [];

        if (shared && Array.isArray(shared)) {
            shared.forEach((person, idx) => {
                const id = `shared_${idx}`;
                
                // Scale node size by total overlap (min 3, max cap reasonable)
                const nodeSize = 3 + (person.total_overlap || 1);

                nodes.push({ 
                    id, 
                    name: person.name, 
                    val: nodeSize, 
                    color: '#2ca02c',
                    isShared: true 
                });

                // Link to A
                links.push({ 
                    source: 'A', 
                    target: id, 
                    width: person.count_a || 1,
                    color: '#aaddaa',
                    label: String(person.count_a) 
                });

                // Link to B
                links.push({ 
                    source: 'B', 
                    target: id, 
                    width: person.count_b || 1, 
                    color: '#ffaadd',
                    label: String(person.count_b)
                });
            });
        }

        // Direct link between A and B
        links.push({ source: 'A', target: 'B', color: '#eee', width: 1, label: '' });

        return { nodes, links };
    }, [nameA, nameB, shared]);

    if (!shared || shared.length === 0) return <div style={{color: '#999', fontStyle:'italic', padding: '10px'}}>No shared co-authors found.</div>;

    return (
        <div style={{ border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
            <ForceGraph2D
                graphData={data}
                width={400}
                height={300}
                
                nodeCanvasObject={(node, ctx, globalScale) => {
                    const label = node.name;
                    const fontSize = 12 / globalScale; 
                    
                    // 1. Draw Circle
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, node.val, 0, 2 * Math.PI, false);
                    ctx.fillStyle = node.color;
                    ctx.fill();

                    // 2. Draw "A" or "B" INSIDE the circle (if it's a main node)
                    if (node.isMain) {
                        ctx.font = `bold ${10 / globalScale}px Sans-Serif`; // Slightly smaller font for inside
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillStyle = 'white'; // White text contrasts with Blue/Pink
                        ctx.fillText(node.id, node.x, node.y);
                    }

                    // 3. Draw Full Name BELOW the circle
                    ctx.font = `${fontSize}px Sans-Serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = node.isMain ? '#000' : '#666'; 
                    
                    // Position text below the node
                    ctx.fillText(label, node.x, node.y + node.val + (6 / globalScale)); 
                }}

                linkCanvasObject={(link, ctx, globalScale) => {
                    const start = link.source;
                    const end = link.target;

                    if (!start || !end || !start.x || !end.x) return; 

                    // Draw Line
                    ctx.beginPath();
                    ctx.moveTo(start.x, start.y);
                    ctx.lineTo(end.x, end.y);
                    ctx.lineWidth = link.width / globalScale; 
                    ctx.strokeStyle = link.color;
                    ctx.stroke();

                    // Draw Label (Number) on the line
                    if (link.label) {
                        const midX = start.x + (end.x - start.x) / 2;
                        const midY = start.y + (end.y - start.y) / 2;
                        const fontSize = 10 / globalScale;

                        ctx.font = `bold ${fontSize}px Sans-Serif`;
                        const textWidth = ctx.measureText(link.label).width;
                        
                        ctx.fillStyle = 'rgba(255,255,255,0.8)';
                        ctx.fillRect(midX - textWidth / 2 - 1, midY - fontSize / 2 - 1, textWidth + 2, fontSize + 2);

                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillStyle = '#555';
                        ctx.fillText(link.label, midX, midY);
                    }
                }}
                
                enableNodeDrag={true}
                enableZoomPanInteraction={true}
            />
        </div>
    );
};

export default CoAuthorGraph;