import React, { useState, useMemo, useEffect, useRef } from 'react';

const MatchList = ({ matches, onSelect, selectedIds, reviewedCount = 0 }) => {
    const [sortBy, setSortBy] = useState('score-desc');
    const [searchQuery, setSearchQuery] = useState('');
    const [showConnectedOnly, setShowConnectedOnly] = useState(false);
    const listRef = useRef(null);

    const filteredAndSortedMatches = useMemo(() => {
        if (!matches) return [];
        let result = [...matches];
        
        // 1. Search Filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(m => 
                (m.name_a && m.name_a.toLowerCase().includes(query)) || 
                (m.name_b && m.name_b.toLowerCase().includes(query))
            );
        }

        // 2. Filter: Only Connected (Direct OR Chain)
        // Relies on the backend flags, ignoring coauthor_score
        if (showConnectedOnly) {
            result = result.filter(m => m.has_path === true);
        }
        
        // 3. Sorting
        switch (sortBy) {
            case 'score-desc': result.sort((a, b) => b.score - a.score); break;
            case 'score-asc': result.sort((a, b) => a.score - b.score); break;
            case 'name-asc': result.sort((a, b) => a.name_a.localeCompare(b.name_a)); break;
            case 'coauthor-desc': result.sort((a, b) => (b.shared_coauthor_count || 0) - (a.shared_coauthor_count || 0)); break;
            default: break;
        }
        return result;
    }, [matches, sortBy, searchQuery, showConnectedOnly]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT') return;
            if (!selectedIds) return;

            const currentIndex = filteredAndSortedMatches.findIndex(
                m => m.author_id_a === selectedIds.id_a && m.author_id_b === selectedIds.id_b
            );
            
            if (e.key === 'ArrowUp' && currentIndex > 0) {
                e.preventDefault();
                const prev = filteredAndSortedMatches[currentIndex - 1];
                onSelect(prev.author_id_a, prev.author_id_b);
            } else if (e.key === 'ArrowDown' && currentIndex < filteredAndSortedMatches.length - 1) {
                e.preventDefault();
                const next = filteredAndSortedMatches[currentIndex + 1];
                onSelect(next.author_id_a, next.author_id_b);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [filteredAndSortedMatches, selectedIds, onSelect]);

    const getScoreColor = (score) => {
        if (score >= 80) return '#28a745';
        if (score >= 60) return '#ffc107';
        return '#dc3545';
    };

    const totalCount = matches ? matches.length + reviewedCount : 0;

    return (
        <div style={styles.listContainer} ref={listRef}>
            <div style={styles.header}>
                <h3 style={styles.title}>Pending Reviews</h3>
                <div style={styles.progressContainer}>
                    <div style={styles.progressBar}>
                        <div style={{
                            ...styles.progressFill,
                            width: totalCount > 0 ? `${(reviewedCount / totalCount) * 100}%` : '0%'
                        }} />
                    </div>
                    <span style={styles.progressText}>
                        {reviewedCount} of {totalCount} reviewed
                    </span>
                </div>
            </div>
            
            <div style={styles.controls}>
                <input
                    type="text"
                    placeholder="🔍 Search authors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={styles.searchInput}
                />
                
                <div style={styles.filterRow}>
                    <select 
                        value={sortBy} 
                        onChange={(e) => setSortBy(e.target.value)}
                        style={styles.sortSelect}
                    >
                        <option value="score-desc">Score: High → Low</option>
                        <option value="score-asc">Score: Low → High</option>
                        <option value="name-asc">Name: A → Z</option>
                        <option value="coauthor-desc">Most Shared Co-authors</option>
                    </select>

                    <label style={styles.toggleLabel} title="Show only matches with shared connections">
                        <input 
                            type="checkbox" 
                            checked={showConnectedOnly}
                            onChange={(e) => setShowConnectedOnly(e.target.checked)}
                            style={{marginRight: '6px'}}
                        />
                        Graph Available
                    </label>
                </div>
            </div>

            <div style={styles.scrollArea}>
                {filteredAndSortedMatches.map((m, index) => {
                    const isSelected = selectedIds && 
                        selectedIds.id_a === m.author_id_a && 
                        selectedIds.id_b === m.author_id_b;
                    
                    const sharedCount = m.shared_coauthor_count || 0;
                    const hasPath = m.has_path || false;

                    return (
                        <div 
                            key={`${m.author_id_a}-${m.author_id_b}`}
                            onClick={() => {
                                if (m.author_id_a && m.author_id_b) {
                                    onSelect(m.author_id_a, m.author_id_b);
                                }
                            }}
                            style={{
                                ...styles.item,
                                backgroundColor: isSelected ? '#e3f2fd' : '#fff',
                                borderLeft: isSelected ? '4px solid #007bff' : '4px solid transparent'
                            }}
                        >
                            <div style={styles.topRow}>
                                <div style={styles.scoreBadge}>
                                    <span style={{
                                        ...styles.scoreText,
                                        backgroundColor: getScoreColor(m.score)
                                    }}>
                                        {m.score.toFixed(0)}%
                                    </span>
                                    
                                    {/* ICON 1: Direct Co-authors */}
                                    {sharedCount > 0 && (
                                        <span style={styles.sharedBadge} title={`${sharedCount} Direct Shared Co-authors`}>
                                            👥 {sharedCount}
                                        </span>
                                    )}
                                    {/* ICON 2: Indirect Chain (Only if no direct shared) */}
                                    {sharedCount === 0 && hasPath && (
                                        <span style={styles.chainBadge} title="Indirect Chain Connection Found">
                                            🔗 Chain
                                        </span>
                                    )}
                                </div>
                                <small style={styles.indexLabel}>#{index + 1}</small>
                            </div>
                            <div style={styles.names}>
                                <div style={styles.authorName} title={m.name_a}>{m.name_a}</div>
                                <span style={styles.vsLabel}>↔</span>
                                <div style={styles.authorName} title={m.name_b}>{m.name_b}</div>
                            </div>
                            <div style={styles.miniScoreBar}>
                                <div style={{
                                    height: '100%',
                                    width: `${m.score}%`,
                                    backgroundColor: getScoreColor(m.score),
                                    borderRadius: '2px',
                                    transition: 'width 0.3s'
                                }} />
                            </div>
                        </div>
                    );
                })}
                
                {filteredAndSortedMatches.length === 0 && matches && matches.length > 0 && (
                    <div style={styles.empty}>
                        {showConnectedOnly 
                            ? "No matches with graph connections found." 
                            : `No matches found for "${searchQuery}"`}
                    </div>
                )}
                
                {matches && matches.length === 0 && (
                     <div style={styles.emptySuccess}>
                        <div style={styles.successIcon}>🎉</div>
                        <div style={styles.successTitle}>All Done!</div>
                        <div style={styles.successText}>No pending matches to review.</div>
                    </div>
                )}
            </div>
            
            <div style={styles.footer}>
                <small style={styles.footerText}>
                    <kbd style={styles.miniKbd}>↑</kbd><kbd style={styles.miniKbd}>↓</kbd> Navigate
                </small>
            </div>
        </div>
    );
};

const styles = {
    listContainer: { width: '320px', borderRight: '1px solid #ddd', display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f8f9fa' },
    header: { padding: '15px', borderBottom: '1px solid #ddd', backgroundColor: '#fff' },
    title: { margin: '0 0 10px 0', color: '#333' },
    progressContainer: { display: 'flex', flexDirection: 'column', gap: '5px' },
    progressBar: { width: '100%', height: '6px', backgroundColor: '#e9ecef', borderRadius: '3px', overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: '#28a745', borderRadius: '3px', transition: 'width 0.3s' },
    progressText: { fontSize: '0.8em', color: '#666' },
    
    controls: { padding: '10px 15px', borderBottom: '1px solid #eee', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', gap: '8px' },
    filterRow: { display: 'flex', gap: '10px', alignItems: 'center' },
    searchInput: { width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.9em', boxSizing: 'border-box' },
    sortSelect: { flex: 1, padding: '6px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.85em', backgroundColor: '#fff', cursor: 'pointer' },
    toggleLabel: { fontSize: '0.8em', color: '#555', display: 'flex', alignItems: 'center', cursor: 'pointer', whiteSpace: 'nowrap' },

    scrollArea: { overflowY: 'auto', flex: 1 },
    item: { padding: '12px 15px', borderBottom: '1px solid #eee', cursor: 'pointer', transition: 'all 0.2s' },
    topRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' },
    scoreBadge: { display: 'flex', alignItems: 'center', gap: '5px' },
    scoreText: { color: '#fff', padding: '2px 8px', borderRadius: '10px', fontSize: '0.8em', fontWeight: 'bold' },
    
    sharedBadge: { fontSize: '0.75em', color: '#28a745', backgroundColor: '#e6ffe6', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', border: '1px solid #c3e6cb' },
    chainBadge: { fontSize: '0.75em', color: '#fd7e14', backgroundColor: '#fff4e6', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', border: '1px solid #ffe8cc' }, 

    indexLabel: { color: '#aaa', fontSize: '0.75em' },
    names: { display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '5px', width: '100%' },
    authorName: { fontSize: '0.9em', color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, textAlign: 'center', minWidth: 0 },
    vsLabel: { color: '#999', fontSize: '0.75em', flexShrink: 0, padding: '0 2px' },
    miniScoreBar: { marginTop: '8px', height: '3px', backgroundColor: '#e9ecef', borderRadius: '2px', overflow: 'hidden' },
    empty: { padding: '20px', textAlign: 'center', color: '#999', fontSize: '0.9em' },
    emptySuccess: { padding: '40px 20px', textAlign: 'center' },
    successIcon: { fontSize: '3em', marginBottom: '10px' },
    successTitle: { fontSize: '1.2em', fontWeight: 'bold', color: '#28a745', marginBottom: '5px' },
    successText: { color: '#666' },
    footer: { padding: '10px 15px', borderTop: '1px solid #eee', backgroundColor: '#fff', textAlign: 'center' },
    footerText: { color: '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' },
    miniKbd: { display: 'inline-block', padding: '2px 5px', fontSize: '0.75em', backgroundColor: '#f0f0f0', border: '1px solid #ccc', borderRadius: '3px' }
};

export default MatchList;