import React, { useState, useEffect } from 'react';
import DiffLabel from './DiffLabel';
import CoAuthorGraph from './CoAuthorGraph';
import axios from 'axios';

const MatchCard = ({ data, onDecision }) => {
    // State for the "Golden Record" name
    const [mergedName, setMergedName] = useState('');
    
    // Initialize mergedName when data loads
    useEffect(() => {
        if (data) {
            // Default to the longer name as it usually has more info
            const nameA = data.author_a.name;
            const nameB = data.author_b.name;
            setMergedName(nameA.length >= nameB.length ? nameA : nameB);
        }
    }, [data]);

    // Keyboard Hotkeys
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Only trigger if not typing in an input field
            if (e.target.tagName === 'INPUT') return;

            switch(e.key.toLowerCase()) {
                case 'a': handleDecide('approve'); break;
                case 'r': handleDecide('reject'); break;
                case 'ArrowRight': onDecision(); break; // Skip
                default: break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [data, mergedName]); // Re-bind if data/name changes

    if (!data) return <div>Loading...</div>;

    const { author_a, author_b, scores, shared_coauthors } = data;

    const handleDecide = async (decision) => {
        try {
            await axios.post(`http://127.0.0.1:5000/api/match/${data.author_a_id}/${data.author_b_id}/decide`, {
                decision,
                custom_name: mergedName // Send the edited name
            });
            onDecision(); // Callback to parent to refresh/load next
        } catch (err) {
            console.error(err);
            alert("Error processing decision");
        }
    };

    return (
        <div style={styles.card}>
            {/* --- HEADER: Scores & Hotkey Hints --- */}
            <div style={styles.header}>
                <div>
                    <h2 style={{ ...styles.scoreTitle, color: scores.total > 0.8 ? 'green' : 'orange' }}>
                        {(scores.total).toFixed(2)}% Match
                    </h2>
                    <small>Name Similarity: {scores.name_sim.toFixed(2)} | Co-Author Boost: {scores.coauthor.toFixed(2)}</small>
                </div>
                <div style={styles.hotkeys}>
                    <span>[A] Approve</span>
                    <span>[R] Reject</span>
                    <span>[→] Skip</span>
                </div>
            </div>
            
            <div style={styles.grid}>
                {/* --- LEFT: Author Comparison --- */}
                <div style={styles.column}>
                    <div style={styles.row}>
                        <div style={styles.cell}>
                            <strong>Author A</strong>
                            <div><DiffLabel textA={author_a.name} textB={author_b.name} /></div>
                            <small>{author_a.affiliation || 'No Affiliation'}</small>
                        </div>
                        <div style={styles.cell}>
                            <strong>Author B</strong>
                            <div><DiffLabel textA={author_b.name} textB={author_a.name} /></div>
                            <small>{author_b.affiliation || 'No Affiliation'}</small>
                        </div>
                    </div>
                    
                    {/* Publication Lists */}
                    <div style={styles.row}>
                        <div style={styles.cell}>
                            <ul style={styles.pubList}>
                                {author_a.publications.map((p, i) => (
                                    <li key={i}>{p.year}: {p.title}</li>
                                ))}
                            </ul>
                        </div>
                        <div style={styles.cell}>
                            <ul style={styles.pubList}>
                                {author_b.publications.map((p, i) => (
                                    <li key={i}>{p.year}: {p.title}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* --- RIGHT: Evidence & Actions --- */}
                <div style={styles.sidebar}>
                    {/* Evidence Graph */}
                    <div style={{marginBottom: '20px'}}>
                        <h4>Shared Co-Authors</h4>
                        <CoAuthorGraph 
                            nameA={author_a.family_name} 
                            nameB={author_b.family_name} 
                            shared={shared_coauthors || []} 
                        />
                    </div>

                    {/* Golden Record Preview */}
                    <div style={styles.actionBox}>
                        <h4>Merge Result Preview</h4>
                        <label style={{display:'block', fontSize:'0.8em', marginBottom:'5px'}}>Primary Name (Editable)</label>
                        <input 
                            style={styles.input}
                            value={mergedName}
                            onChange={(e) => setMergedName(e.target.value)}
                        />
                        <div style={styles.buttonGroup}>
                            <button style={styles.btnReject} onClick={() => handleDecide('reject')}>Reject</button>
                            <button style={styles.btnApprove} onClick={() => handleDecide('approve')}>Approve Merge</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    card: { border: '1px solid #ccc', borderRadius: '8px', padding: '20px', margin: '20px', backgroundColor: '#fff' },
    header: { display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '20px' },
    scoreTitle: { margin: 0 },
    hotkeys: { display: 'flex', gap: '15px', color: '#666', fontSize: '0.9em', alignItems: 'center' },
    grid: { display: 'flex', gap: '30px' },
    column: { flex: 2 },
    sidebar: { flex: 1, borderLeft: '1px solid #eee', paddingLeft: '20px' },
    row: { display: 'flex', gap: '20px', marginBottom: '20px' },
    cell: { flex: 1 },
    pubList: { paddingLeft: '15px', fontSize: '0.85em', color: '#444' },
    actionBox: { background: '#f9f9f9', padding: '15px', borderRadius: '5px' },
    input: { width: '100%', padding: '8px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '4px' },
    buttonGroup: { display: 'flex', gap: '10px' },
    btnApprove: { flex: 1, padding: '10px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    btnReject: { flex: 1, padding: '10px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
};

export default MatchCard;