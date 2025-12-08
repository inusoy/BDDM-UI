import React from 'react';

const MatchList = ({ matches, onSelect, selectedIds }) => {
    return (
        <div style={styles.listContainer}>
            <div style={styles.header}>
                <h3>Pending Reviews ({matches.length})</h3>
            </div>
            <div style={styles.scrollArea}>
                {matches.map((m) => {
                    const isSelected = selectedIds && 
                        selectedIds.id_a === m.author_id_a && 
                        selectedIds.id_b === m.author_id_b;
                    
                    return (
                        <div 
                            key={`${m.author_id_a}-${m.author_id_b}`}
                            onClick={() => onSelect(m.author_id_a, m.author_id_b)}
                            style={{
                                ...styles.item,
                                backgroundColor: isSelected ? '#e3f2fd' : '#fff',
                                borderLeft: isSelected ? '4px solid #007bff' : '4px solid transparent'
                            }}
                        >
                            <div style={styles.topRow}>
                                <span style={{fontWeight: 'bold', color: '#333'}}>
                                    {m.score.toFixed(0)}% Match
                                </span>
                                <small style={{color: '#888'}}>ID: {m.author_id_a}-{m.author_id_b}</small>
                            </div>
                            <div style={styles.names}>
                                {m.name_a}
                                <br/>
                                <span style={{color: '#999', fontSize: '0.8em'}}>vs</span>
                                <br/>
                                {m.name_b}
                            </div>
                        </div>
                    );
                })}
                {matches.length === 0 && <div style={styles.empty}>No pending matches!</div>}
            </div>
        </div>
    );
};

const styles = {
    listContainer: { width: '300px', borderRight: '1px solid #ddd', display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f8f9fa' },
    header: { padding: '15px', borderBottom: '1px solid #ddd', backgroundColor: '#fff' },
    scrollArea: { overflowY: 'auto', flex: 1 },
    item: { padding: '15px', borderBottom: '1px solid #eee', cursor: 'pointer', transition: 'background 0.2s' },
    topRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9em' },
    names: { fontSize: '0.95em', lineHeight: '1.4em' },
    empty: { padding: '20px', textAlign: 'center', color: '#999' }
};

export default MatchList;