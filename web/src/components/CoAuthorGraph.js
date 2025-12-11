import React, { useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

const CoAuthorGraph = ({ nameA, nameB, shared }) => {
    const data = useMemo(() => {
        // 1. Define Nodes
        const nodes = [
            { id: 'A', name: nameA, val: 6, color: '#1f77b4', isMain: true },
            { id: 'B', name: nameB, val: 6, color: '#e377c2', isMain: true },
        ];
        const links = [];

        if (shared && Array.isArray(shared)) {
            shared.forEach((person, idx) => {
                const id = `shared_${idx}`;
                
                // Scale node size by total overlap
                const nodeSize = 3 + (person.total_overlap || 1);

                nodes.push({ 
                    id, 
                    name: person.name, 
                    val: nodeSize, 
                    color: '#2ca02c',
                    isShared: true 
                });

                // Link to A (Label = count_a)
                links.push({ 
                    source: 'A', 
                    target: id, 
                    width: person.count_a || 1,
                    color: '#aaddaa',
                    label: String(person.count_a) // The text to show on line
                });

                // Link to B (Label = count_b)
                links.push({ 
                    source: 'B', 
                    target: id, 
                    width: person.count_b || 1, 
                    color: '#ffaadd',
                    label: String(person.count_b) // The text to show on line
                });
            });
        }

        // Direct link between A and B (Visual anchor)
        links.push({ source: 'A', target: 'B', color: '#eee', width: 1, label: '' });

        return { nodes, links };
    }, [nameA, nameB, shared]);

    if (!shared || shared.length === 0) return <div style={{color: '#999', fontStyle:'italic', padding: '10px'}}>No shared co-authors found.</div>;

    return (
        <div style={{ border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
            <ForceGraph2D
                graphData={data}
                width={400}
                height={300} // Increased height slightly for labels
                
                // 1. DRAW NODES + LABELS PERMANENTLY
                nodeCanvasObject={(node, ctx, globalScale) => {
                    const label = node.name;
                    const fontSize = 12 / globalScale; // Scale font so it stays readable on zoom
                    
                    // Draw Circle
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, node.val, 0, 2 * Math.PI, false);
                    ctx.fillStyle = node.color;
                    ctx.fill();

                    // Draw Text Label
                    ctx.font = `${fontSize}px Sans-Serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = node.isMain ? '#000' : '#666'; // Darker text for main authors
                    
                    // Position text below the node
                    ctx.fillText(label, node.x, node.y + node.val + (4 / globalScale)); 
                }}

                // 2. DRAW LINKS + NUMBERS ON LINES
                linkCanvasObject={(link, ctx, globalScale) => {
                    const start = link.source;
                    const end = link.target;

                    if (!start || !end || !start.x || !end.x) return; // Safety check

                    // Draw Line
                    ctx.beginPath();
                    ctx.moveTo(start.x, start.y);
                    ctx.lineTo(end.x, end.y);
                    ctx.lineWidth = link.width / globalScale; // Scale line width
                    ctx.strokeStyle = link.color;
                    ctx.stroke();

                    // Draw Label (Number) on the line
                    if (link.label) {
                        const midX = start.x + (end.x - start.x) / 2;
                        const midY = start.y + (end.y - start.y) / 2;
                        const fontSize = 10 / globalScale;

                        // Small white background for the number so line doesn't cut through
                        ctx.font = `bold ${fontSize}px Sans-Serif`;
                        const textWidth = ctx.measureText(link.label).width;
                        
                        ctx.fillStyle = 'rgba(255,255,255,0.8)';
                        ctx.fillRect(midX - textWidth / 2 - 1, midY - fontSize / 2 - 1, textWidth + 2, fontSize + 2);

                        // The Number
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