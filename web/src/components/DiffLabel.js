import React from 'react';
import { diffChars } from 'diff-match-patch';

const DiffLabel = ({ textA, textB }) => {
    if (!textA || !textB) return <span>{textA || textB}</span>;

    // diffChars returns an array of changes: [0, "Common"], [-1, "Removed"], [1, "Added"]
    // We only want to visualize the difference relative to Text A (or B), but a simple way 
    // is to just show where they deviate.
    // For a cleaner UI, let's just render Text A, highlighting parts that miss in B.
    
    // Simpler approach for React without heavy logic:
    // Just display them with a subtle highlight if they differ
    const isDifferent = textA.toLowerCase() !== textB.toLowerCase();
    
    return (
        <span style={{ 
            backgroundColor: isDifferent ? '#fff3cd' : 'transparent', // Yellow highlight if different
            padding: '2px 4px',
            borderRadius: '4px'
        }}>
            {textA}
        </span>
    );
};

export default DiffLabel;