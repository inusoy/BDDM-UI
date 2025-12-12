import React, { useState, useEffect, useCallback } from 'react';
import DiffLabel from './DiffLabel';
import CoAuthorGraph from './CoAuthorGraph';
import axios from 'axios';

const MatchCard = ({ data, onDecision, onSkip, showToast }) => {
    const [mergedName, setMergedName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    useEffect(() => {
        if (data) {
            const nameA = data.author_a.name;
            const nameB = data.author_b.name;
            setMergedName(nameA.length >= nameB.length ? nameA : nameB);
        }
    }, [data]);

    const handleDecide = useCallback(async (decision) => {
        if (isSubmitting || !data) return;
        setIsSubmitting(true);
        try {
            await axios.post(`http://127.0.0.1:5000/api/match/${data.author_a_id}/${data.author_b_id}/decide`, {
                decision,
                custom_name: mergedName 
            });
            if (showToast) {
                showToast(
                    decision === 'approve' ? 'success' : 'info',
                    decision === 'approve' ? 'Match Approved!' : 'Match Rejected'
                );
            }
            onDecision(); 
        } catch (err) {
            console.error(err);
            if (showToast) {
                showToast('error', `Failed to ${decision}: ${err.message}`);
            }
        } finally {
            setIsSubmitting(false);
        }
    }, [data, mergedName, showToast, onDecision, isSubmitting]);

    // Keyboard Hotkeys
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT') return;
            switch(e.key) {
                case 'a': case 'A': handleDecide('approve'); break;
                case 'r': case 'R': handleDecide('reject'); break;
                case 'ArrowRight': case 's': case 'S': if (onSkip) onSkip(); break;
                default: break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleDecide, onSkip]);

    if (!data) return <div>Loading...</div>;

    // Destructure new graph_data field
    const { author_a, author_b, scores, graph_data } = data;

    return (
        <div style={styles.card}>
            <div style={styles.header}>
                <div style={styles.scoreSection}>
                    <div style={styles.scoreContainer}>
                        <div style={{
                            ...styles.scoreBar,
                                width: `${Math.min(scores.total, 100)}%`,
                            backgroundColor: scores.total >= 0.8 ? '#28a745' : scores.total >= 0.6 ? '#ffc107' : '#dc3545'
                        }} />
                    </div>
                    <h2 style={{ 
                        ...styles.scoreTitle, 
                        color: scores.total >= 0.8 ? '#28a745' : scores.total >= 0.6 ? '#ffc107' : '#dc3545' 
                    }}>
                            {scores.total.toFixed(0)}% Match
                    </h2>
                    <small style={styles.scoreDetails}>
                            Name Similarity: {scores.name_sim.toFixed(0)}% | Co-Author Boost: +{scores.coauthor.toFixed(0)}%
                    </small>
                </div>
                <div style={styles.hotkeys}>
                    <kbd style={styles.kbd}>A</kbd><span>Approve</span>
                    <kbd style={styles.kbd}>R</kbd><span>Reject</span>
                    <kbd style={styles.kbd}>S</kbd><span>Skip</span>
                </div>
            </div>
            
            <div style={styles.grid}>
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

                <div style={styles.sidebar}>
                    <div style={{marginBottom: '20px'}}>
                        <h4>Connection Graph</h4>
                        {/* UPDATE: Pass graphData instead of name/shared */}
                        <CoAuthorGraph graphData={graph_data} />
                    </div>

                    <div style={styles.actionBox}>
                        <h4>Merge Result Preview</h4>
                        <label style={{display:'block', fontSize:'0.8em', marginBottom:'5px'}}>Primary Name (Editable)</label>
                        <input 
                            style={styles.input}
                            value={mergedName}
                            onChange={(e) => setMergedName(e.target.value)}
                        />
                        <div style={styles.buttonGroup}>
                            <button 
                                style={{...styles.btnReject, opacity: isSubmitting ? 0.6 : 1}} 
                                onClick={() => handleDecide('reject')}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? '...' : '✗ Reject'}
                            </button>
                            <button 
                                style={styles.btnSkip} 
                                onClick={() => onSkip && onSkip()}
                            >
                                ⏭ Skip
                            </button>
                            <button 
                                style={{...styles.btnApprove, opacity: isSubmitting ? 0.6 : 1}} 
                                onClick={() => handleDecide('approve')}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? '...' : '✓ Approve'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    card: { border: '1px solid #ccc', borderRadius: '8px', padding: '20px', margin: '20px', backgroundColor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
    header: { display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '20px', alignItems: 'flex-start' },
    scoreSection: { display: 'flex', flexDirection: 'column', gap: '5px' },
    scoreContainer: { width: '200px', height: '8px', backgroundColor: '#e9ecef', borderRadius: '4px', overflow: 'hidden' },
    scoreBar: { height: '100%', borderRadius: '4px', transition: 'width 0.3s ease' },
    scoreTitle: { margin: 0, fontSize: '1.5em', fontWeight: 'bold' },
    scoreDetails: { color: '#666' },
    hotkeys: { display: 'flex', gap: '8px', color: '#666', fontSize: '0.85em', alignItems: 'center', flexWrap: 'wrap' },
    kbd: { 
        display: 'inline-block', 
        padding: '3px 8px', 
        fontSize: '0.85em', 
        fontFamily: 'monospace',
        backgroundColor: '#f7f7f7', 
        border: '1px solid #ccc', 
        borderRadius: '4px', 
        boxShadow: '0 2px 0 #999',
        marginRight: '4px'
    },
    grid: { display: 'flex', gap: '30px' },
    column: { flex: 2 },
    sidebar: { flex: 1, borderLeft: '1px solid #eee', paddingLeft: '20px' },
    row: { display: 'flex', gap: '20px', marginBottom: '20px' },
    cell: { flex: 1 },
    pubList: { paddingLeft: '15px', fontSize: '0.85em', color: '#444', maxHeight: '200px', overflowY: 'auto' },
    actionBox: { background: '#f9f9f9', padding: '15px', borderRadius: '5px' },
    input: { width: '100%', padding: '10px', marginBottom: '12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1em', boxSizing: 'border-box' },
    buttonGroup: { display: 'flex', gap: '8px' },
    btnApprove: { flex: 1, padding: '12px 10px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95em', transition: 'all 0.2s' },
    btnReject: { flex: 1, padding: '12px 10px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95em', transition: 'all 0.2s' },
    btnSkip: { flex: 1, padding: '12px 10px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95em', transition: 'all 0.2s' },
};

export default MatchCard;