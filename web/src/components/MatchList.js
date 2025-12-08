import React, { useState, useMemo, useEffect, useRef } from 'react';

const MatchList = ({ matches, onSelect, selectedIds, reviewedCount = 0 }) => {
    const [sortBy, setSortBy] = useState('score-desc');
    const [searchQuery, setSearchQuery] = useState('');
    const listRef = useRef(null);

    // Sort and filter matches
    const filteredAndSortedMatches = useMemo(() => {
        let result = [...matches];
        
        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(m => 
                m.name_a.toLowerCase().includes(query) || 
                m.name_b.toLowerCase().includes(query)
            );
        }
        
        // Sort
        switch (sortBy) {
            case 'score-desc':
                result.sort((a, b) => b.score - a.score);
                break;
            case 'score-asc':
                result.sort((a, b) => a.score - b.score);
                break;
            case 'name-asc':
                result.sort((a, b) => a.name_a.localeCompare(b.name_a));
                break;
            default:
                break;
        }
        
        return result;
    }, [matches, sortBy, searchQuery]);

    // Keyboard navigation for the list
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT') return;
            
            const currentIndex = filteredAndSortedMatches.findIndex(
                m => selectedIds && m.author_id_a === selectedIds.id_a && m.author_id_b === selectedIds.id_b
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

    const totalCount = matches.length + reviewedCount;

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
            
            {/* Search & Sort Controls */}
            <div style={styles.controls}>
                <input
                    type="text"
                    placeholder="🔍 Search authors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={styles.searchInput}
                    aria-label="Search authors"
                />
                <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    style={styles.sortSelect}
                    aria-label="Sort matches"
                >
                    <option value="score-desc">Score: High → Low</option>
                    <option value="score-asc">Score: Low → High</option>
                    <option value="name-asc">Name: A → Z</option>
                </select>
            </div>

            <div style={styles.scrollArea}>
                {filteredAndSortedMatches.map((m, index) => {
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
                            role="option"
                            tabIndex={0}
                            aria-selected={isSelected}
                            onKeyDown={(e) => e.key === 'Enter' && onSelect(m.author_id_a, m.author_id_b)}
                        >
                            <div style={styles.topRow}>
                                <div style={styles.scoreBadge}>
                                    <span style={{
                                        ...styles.scoreText,
                                        backgroundColor: getScoreColor(m.score)
                                    }}>
                                        {m.score.toFixed(0)}%
                                    </span>
                                    {m.score >= 80 ? '✓' : m.score >= 60 ? '⚠' : '✗'}
                                </div>
                                <small style={styles.indexLabel}>#{index + 1}</small>
                            </div>
                            <div style={styles.names}>
                                <div style={styles.authorName}>{m.name_a}</div>
                                <span style={styles.vsLabel}>↔</span>
                                <div style={styles.authorName}>{m.name_b}</div>
                            </div>
                            {/* Mini score bar */}
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
                {filteredAndSortedMatches.length === 0 && matches.length > 0 && (
                    <div style={styles.empty}>No matches found for "{searchQuery}"</div>
                )}
                {matches.length === 0 && (
                    <div style={styles.emptySuccess}>
                        <div style={styles.successIcon}>🎉</div>
                        <div style={styles.successTitle}>All Done!</div>
                        <div style={styles.successText}>No pending matches to review.</div>
                    </div>
                )}
            </div>
            
            {/* Keyboard hints */}
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
    searchInput: { width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.9em', boxSizing: 'border-box' },
    sortSelect: { width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.85em', backgroundColor: '#fff', cursor: 'pointer' },
    scrollArea: { overflowY: 'auto', flex: 1 },
    item: { padding: '12px 15px', borderBottom: '1px solid #eee', cursor: 'pointer', transition: 'all 0.2s' },
    topRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' },
    scoreBadge: { display: 'flex', alignItems: 'center', gap: '5px' },
    scoreText: { color: '#fff', padding: '2px 8px', borderRadius: '10px', fontSize: '0.8em', fontWeight: 'bold' },
    indexLabel: { color: '#aaa', fontSize: '0.75em' },
    names: { display: 'flex', flexDirection: 'column', gap: '2px' },
    authorName: { fontSize: '0.9em', color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    vsLabel: { color: '#999', fontSize: '0.75em', alignSelf: 'center' },
    miniScoreBar: { marginTop: '8px', height: '3px', backgroundColor: '#e9ecef', borderRadius: '2px', overflow: 'hidden' },
    empty: { padding: '20px', textAlign: 'center', color: '#999' },
    emptySuccess: { padding: '40px 20px', textAlign: 'center' },
    successIcon: { fontSize: '3em', marginBottom: '10px' },
    successTitle: { fontSize: '1.2em', fontWeight: 'bold', color: '#28a745', marginBottom: '5px' },
    successText: { color: '#666' },
    footer: { padding: '10px 15px', borderTop: '1px solid #eee', backgroundColor: '#fff', textAlign: 'center' },
    footerText: { color: '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' },
    miniKbd: { display: 'inline-block', padding: '2px 5px', fontSize: '0.75em', backgroundColor: '#f0f0f0', border: '1px solid #ccc', borderRadius: '3px' }
};

export default MatchList;