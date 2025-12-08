import React, { useMemo } from 'react';

// Simple character-level diff algorithm
const computeDiff = (textA, textB) => {
    if (!textA || !textB) return [{ text: textA || textB, type: 'equal' }];
    if (textA === textB) return [{ text: textA, type: 'equal' }];
    
    const result = [];
    const wordsA = textA.split(/(\s+)/);
    const wordsB = textB.split(/(\s+)/);
    
    // Simple word-by-word comparison
    for (let i = 0; i < wordsA.length; i++) {
        const wordA = wordsA[i];
        const wordB = wordsB[i] || '';
        
        if (wordA.toLowerCase() === wordB.toLowerCase()) {
            result.push({ text: wordA, type: 'equal' });
        } else if (wordB === '') {
            result.push({ text: wordA, type: 'added' }); // In A but not in B
        } else {
            // Words differ - highlight
            result.push({ text: wordA, type: 'changed' });
        }
    }
    
    return result;
};

const DiffLabel = ({ textA, textB, showMode = 'highlight' }) => {
    const diffParts = useMemo(() => computeDiff(textA, textB), [textA, textB]);
    
    if (!textA && !textB) return <span>—</span>;
    if (!textA) return <span style={styles.missing}>{textB}</span>;
    if (!textB) return <span>{textA}</span>;
    
    const isDifferent = textA.toLowerCase() !== textB.toLowerCase();
    
    if (!isDifferent) {
        return <span style={styles.match}>{textA}</span>;
    }
    
    return (
        <span style={styles.container} title={`Compare: "${textA}" vs "${textB}"`}>
            {diffParts.map((part, idx) => (
                <span 
                    key={idx} 
                    style={
                        part.type === 'equal' ? styles.equal :
                        part.type === 'added' ? styles.added :
                        part.type === 'changed' ? styles.changed :
                        styles.equal
                    }
                >
                    {part.text}
                </span>
            ))}
            <span style={styles.diffIndicator}>≠</span>
        </span>
    );
};

const styles = {
    container: { 
        display: 'inline-flex', 
        alignItems: 'center',
        flexWrap: 'wrap'
    },
    match: {
        backgroundColor: '#d4edda',
        padding: '2px 6px',
        borderRadius: '4px',
        color: '#155724'
    },
    missing: {
        backgroundColor: '#f8d7da',
        padding: '2px 6px',
        borderRadius: '4px',
        color: '#721c24',
        fontStyle: 'italic'
    },
    equal: {
        // No special styling for matching parts
    },
    added: {
        backgroundColor: '#fff3cd',
        padding: '1px 2px',
        borderRadius: '2px',
        fontWeight: 'bold'
    },
    changed: {
        backgroundColor: '#fff3cd',
        padding: '1px 2px',
        borderRadius: '2px',
        borderBottom: '2px solid #ffc107'
    },
    diffIndicator: {
        marginLeft: '6px',
        fontSize: '0.8em',
        color: '#856404',
        fontWeight: 'bold'
    }
};

export default DiffLabel;