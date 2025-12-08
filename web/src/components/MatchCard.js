import React from 'react';

const MatchCard = ({ data }) => {
    if (!data) return <div>Loading...</div>;
    const { author_a, author_b, scores } = data;

    return (
        <div style={{ border: '1px solid #ccc', padding: '20px', margin: '20px', borderRadius: '8px' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: '0 0 5px 0', color: scores.total > 0.8 ? 'green' : 'orange' }}>
                    Match Confidence: {(scores.total).toFixed(2)}%
                </h2>
                <small>Name Similarity: {scores.name_sim.toFixed(2)} | Co-Author Boost: {scores.coauthor.toFixed(2)}</small>
            </div>
            
            <div style={{ display: 'flex', gap: '20px' }}>
                {/* Author A Column */}
                <div style={{ flex: 1, background: '#f0f8ff', padding: '15px', borderRadius: '5px' }}>
                    <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>Author A</h3>
                    <p><strong>Name:</strong> {author_a.name}</p>
                    <p><strong>ORCID:</strong> {author_a.orcid}</p>
                    <p><strong>Affiliation:</strong> {author_a.affiliation || 'N/A'}</p>
                    
                    <h4>Recent Publications</h4>
                    <ul style={{ paddingLeft: '20px', fontSize: '0.9em' }}>
                        {author_a.publications.map((p, i) => (
                            <li key={i} style={{ marginBottom: '5px' }}>
                                <strong>{p.year}:</strong> {p.title} <em>({p.venue})</em>
                            </li>
                        ))}
                        {author_a.publications.length === 0 && <li>No publications listed</li>}
                    </ul>
                </div>

                {/* Author B Column */}
                <div style={{ flex: 1, background: '#fff0f5', padding: '15px', borderRadius: '5px' }}>
                    <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>Author B</h3>
                    <p><strong>Name:</strong> {author_b.name}</p>
                    <p><strong>ORCID:</strong> {author_b.orcid}</p>
                    <p><strong>Affiliation:</strong> {author_b.affiliation || 'N/A'}</p>
                    
                    <h4>Recent Publications</h4>
                    <ul style={{ paddingLeft: '20px', fontSize: '0.9em' }}>
                        {author_b.publications.map((p, i) => (
                            <li key={i} style={{ marginBottom: '5px' }}>
                                <strong>{p.year}:</strong> {p.title} <em>({p.venue})</em>
                            </li>
                        ))}
                        {author_b.publications.length === 0 && <li>No publications listed</li>}
                    </ul>
                </div>
            </div>
        </div>
    );
};
export default MatchCard;