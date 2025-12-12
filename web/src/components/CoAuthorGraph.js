import React, { useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

const CoAuthorGraph = ({ graphData }) => {
    
    const processedData = useMemo(() => {
        if (!graphData || !graphData.nodes) return { nodes: [], links: [] };

        const nodes = graphData.nodes.map(n => ({
            ...n,
            val: n.group === 'main' ? 8 : 4,
            color: n.group === 'main' 
                   ? (n.id === 'A' ? '#1f77b4' : '#e377c2') 
                   : '#ff7f0e' 
        }));

        const links = graphData.links.map(l => ({
            ...l,
            color: '#ccc',
            width: 1
        }));
        
        return { nodes, links };
    }, [graphData]);

    const isEmpty = !graphData || !graphData.nodes || graphData.nodes.length <= 2;
    if (isEmpty && (!graphData?.links || graphData.links.length === 0)) {
         return <div style={{color: '#999', fontStyle:'italic', padding: '10px'}}>No connections found.</div>;
    }

    return (
        <div style={{ border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
            <ForceGraph2D
                graphData={processedData}
                width={400}
                height={300}
                
                nodeCanvasObject={(node, ctx, globalScale) => {
                    const label = node.name || node.id;
                    const fontSize = 12 / globalScale; 
                    
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, node.val, 0, 2 * Math.PI, false);
                    ctx.fillStyle = node.color;
                    ctx.fill();

                    if (node.group === 'main') {
                        ctx.font = `bold ${10 / globalScale}px Sans-Serif`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillStyle = 'white';
                        ctx.fillText(node.id, node.x, node.y);
                    }

                    ctx.font = `${fontSize}px Sans-Serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = '#333';
                    ctx.fillText(label, node.x, node.y + node.val + (6 / globalScale)); 
                }}
                
                linkCanvasObject={(link, ctx, globalScale) => {
                    const start = link.source;
                    const end = link.target;
                    if (!start || !end || !start.x || !end.x) return; 

                    ctx.beginPath();
                    ctx.moveTo(start.x, start.y);
                    ctx.lineTo(end.x, end.y);
                    ctx.lineWidth = 1.5 / globalScale; 
                    ctx.strokeStyle = '#999';
                    ctx.stroke();
                }}

                enableNodeDrag={true}
                enableZoomPanInteraction={true}
                cooldownTicks={100}
            />
        </div>
    );
};

export default CoAuthorGraph;