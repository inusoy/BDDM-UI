import React, { useState, useEffect, useCallback } from 'react';
import { fetchPendingMatches, fetchMatchDetails, submitDecision } from '../api'; // Check your import path, user had '../api' in prompt but filename is just api.js context usually implies same dir or sibling. Kept user's convention if relative.
import MatchCard from '../components/MatchCard'; // Adjusted path based on typical structure, check if it's ../components/MatchCard

const Dashboard = () => {
    const [matches, setMatches] = useState([]);
    const [currentMatch, setCurrentMatch] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadMatchDetail = useCallback(async (idA, idB) => {
        const details = await fetchMatchDetails(idA, idB);
        if (details) {
            setCurrentMatch({ ...details, id_a: idA, id_b: idB });
        }
    }, []);

    const loadMatches = useCallback(async () => {
        setLoading(true);
        const list = await fetchPendingMatches();
        setMatches(list);
        
        if (list.length > 0) {
            loadMatchDetail(list[0].author_id_a, list[0].author_id_b);
        } else {
            setCurrentMatch(null);
        }
        setLoading(false);
    }, [loadMatchDetail]);

    useEffect(() => {
        loadMatches();
    }, [loadMatches]);

    const handleDecision = async (decision) => {
        if (!currentMatch) return;
        
        await submitDecision(currentMatch.id_a, currentMatch.id_b, decision);
        await loadMatches();
    };

    if (loading && matches.length === 0) return <div>Loading Dashboard...</div>;
    if (matches.length === 0) return <div style={{textAlign:'center', marginTop:'50px'}}>🎉 No pending matches! Great job.</div>;

    return (
        <div style={{ fontFamily: 'Arial, sans-serif' }}>
            <header style={{ background: '#333', color: '#fff', padding: '15px', textAlign: 'center' }}>
                <h2>Admin Disambiguation Dashboard</h2>
                <p>{matches.length} items pending review</p>
            </header>

            <main>
                <MatchCard data={currentMatch} />

                {/* CHANGED: Used Flexbox with gap to match the Card's layout logic */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
                    <button 
                        onClick={() => handleDecision('reject')}
                        style={{ ...btnStyle, backgroundColor: '#dc3545' }}>
                        Reject Match ❌
                    </button>
                    
                    {/* REMOVED: marginLeft: '20px' is no longer needed due to flex gap */}
                    <button 
                        onClick={() => handleDecision('approve')}
                        style={{ ...btnStyle, backgroundColor: '#28a745' }}>
                        Approve Merge ✅
                    </button>
                </div>
            </main>
        </div>
    );
};

const btnStyle = {
    padding: '15px 0', // Changed to 0 horizontal padding since we set fixed width
    width: '200px',    // ADDED: Fixed width ensures the gap is perfectly centered
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: 'bold',
    textAlign: 'center' // Ensures text is centered within the fixed width
};

export default Dashboard;