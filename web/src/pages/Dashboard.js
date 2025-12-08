import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import MatchList from '../components/MatchList';
import MatchCard from '../components/MatchCard';

// Toast Notification Component
const Toast = ({ toasts, removeToast }) => {
    return (
        <div style={toastStyles.container}>
            {toasts.map((toast) => (
                <div 
                    key={toast.id} 
                    style={{
                        ...toastStyles.toast,
                        backgroundColor: toast.type === 'success' ? '#28a745' : 
                                        toast.type === 'error' ? '#dc3545' : '#17a2b8'
                    }}
                    onClick={() => removeToast(toast.id)}
                    role="alert"
                >
                    <span style={toastStyles.icon}>
                        {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✗' : 'ℹ'}
                    </span>
                    {toast.message}
                </div>
            ))}
        </div>
    );
};

const toastStyles = {
    container: { position: 'fixed', top: '20px', right: '20px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '10px' },
    toast: { padding: '12px 20px', borderRadius: '6px', color: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', animation: 'slideIn 0.3s ease', minWidth: '200px' },
    icon: { fontSize: '1.2em' }
};

const Dashboard = () => {
    const [pendingMatches, setPendingMatches] = useState([]);
    const [selectedIds, setSelectedIds] = useState(null); // { id_a, id_b }
    const [activeMatchData, setActiveMatchData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [reviewedCount, setReviewedCount] = useState(0);
    const [toasts, setToasts] = useState([]);

    // Toast notification helper
    const showToast = useCallback((type, message) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, type, message }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const fetchPendingList = useCallback(async () => {
        try {
            const res = await axios.get('http://127.0.0.1:5000/api/matches/pending');
            setPendingMatches(res.data);
            
            // Auto-select the first item if nothing is selected and list is not empty
            if (res.data.length > 0) {
                setSelectedIds(prev => prev || { id_a: res.data[0].author_id_a, id_b: res.data[0].author_id_b });
            }
        } catch (err) {
            console.error(err);
        }
    }, []);

    // 1. Load the List on Mount
    useEffect(() => {
        fetchPendingList();
    }, [fetchPendingList]);

    // 2. When selection changes, fetch the full details for the Card
    useEffect(() => {
        if (selectedIds) {
            setLoading(true);
            axios.get(`http://127.0.0.1:5000/api/match/${selectedIds.id_a}/${selectedIds.id_b}`)
                .then(res => {
                    // Inject IDs into the data so MatchCard can use them for API calls
                    setActiveMatchData({
                        ...res.data,
                        author_a_id: selectedIds.id_a,
                        author_b_id: selectedIds.id_b
                    });
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Failed to load details", err);
                    setLoading(false);
                });
        }
    }, [selectedIds]);

    const handleSelection = (id_a, id_b) => {
        setSelectedIds({ id_a, id_b });
    };

    const handleDecisionComplete = () => {
        // 1. Remove the processed item from the local list immediately (Optimistic UI)
        const newList = pendingMatches.filter(m => 
            !(m.author_id_a === selectedIds.id_a && m.author_id_b === selectedIds.id_b)
        );
        setPendingMatches(newList);
        setReviewedCount(prev => prev + 1);
        
        // 2. Select the next item in line
        if (newList.length > 0) {
            setSelectedIds({ id_a: newList[0].author_id_a, id_b: newList[0].author_id_b });
        } else {
            setSelectedIds(null);
            setActiveMatchData(null);
            showToast('success', '🎉 All matches reviewed!');
        }
    };

    const handleSkip = () => {
        // Move current item to end of list
        if (!selectedIds || pendingMatches.length <= 1) return;
        
        const currentItem = pendingMatches.find(m => 
            m.author_id_a === selectedIds.id_a && m.author_id_b === selectedIds.id_b
        );
        const newList = pendingMatches.filter(m => 
            !(m.author_id_a === selectedIds.id_a && m.author_id_b === selectedIds.id_b)
        );
        newList.push(currentItem); // Add to end
        setPendingMatches(newList);
        
        // Select the next item
        setSelectedIds({ id_a: newList[0].author_id_a, id_b: newList[0].author_id_b });
        showToast('info', 'Skipped - moved to end of queue');
    };

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            {/* Toast Notifications */}
            <Toast toasts={toasts} removeToast={removeToast} />

            {/* LEFT: The List */}
            <MatchList 
                matches={pendingMatches} 
                selectedIds={selectedIds} 
                onSelect={handleSelection}
                reviewedCount={reviewedCount}
            />

            {/* RIGHT: The Workspace */}
            <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#f0f2f5', position: 'relative' }}>
                {!selectedIds && pendingMatches.length === 0 && (
                    <div style={styles.emptyState}>
                        <div style={styles.emptyIcon}>📋</div>
                        <h2 style={styles.emptyTitle}>No Matches to Review</h2>
                        <p style={styles.emptyText}>
                            Great job! There are no pending author matches in the queue.
                            <br />Check back later for new candidates.
                        </p>
                    </div>
                )}

                {!selectedIds && pendingMatches.length > 0 && (
                    <div style={styles.emptyState}>
                        <div style={styles.emptyIcon}>👈</div>
                        <h2 style={styles.emptyTitle}>Select a Match</h2>
                        <p style={styles.emptyText}>
                            Choose an author match from the list to start reviewing.
                            <br />
                            <small>Use <kbd style={styles.kbd}>↑</kbd> <kbd style={styles.kbd}>↓</kbd> arrows to navigate</small>
                        </p>
                    </div>
                )}
                
                {loading && selectedIds && (
                    <div style={styles.centerMessage}>
                        <div style={styles.spinner}></div>
                        Loading Details...
                    </div>
                )}

                {!loading && activeMatchData && (
                    <MatchCard 
                        data={activeMatchData} 
                        onDecision={handleDecisionComplete}
                        onSkip={handleSkip}
                        showToast={showToast}
                    />
                )}
            </div>
        </div>
    );
};

const styles = {
    centerMessage: {
        position: 'absolute', top: '50%', left: '50%', 
        transform: 'translate(-50%, -50%)', 
        color: '#888', fontSize: '1.2em',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px'
    },
    emptyState: {
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center', padding: '40px'
    },
    emptyIcon: { fontSize: '4em', marginBottom: '10px' },
    emptyTitle: { color: '#333', marginBottom: '10px' },
    emptyText: { color: '#666', lineHeight: '1.6' },
    kbd: { 
        display: 'inline-block', 
        padding: '2px 6px', 
        fontSize: '0.8em', 
        backgroundColor: '#f0f0f0', 
        border: '1px solid #ccc', 
        borderRadius: '3px',
        fontFamily: 'monospace'
    },
    spinner: {
        width: '30px', height: '30px',
        border: '3px solid #e9ecef',
        borderTop: '3px solid #007bff',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    }
};

export default Dashboard;