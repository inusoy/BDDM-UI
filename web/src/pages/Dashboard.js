import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MatchList from '../components/MatchList';
import MatchCard from '../components/MatchCard';

const Dashboard = () => {
    const [pendingMatches, setPendingMatches] = useState([]);
    const [selectedIds, setSelectedIds] = useState(null); // { id_a, id_b }
    const [activeMatchData, setActiveMatchData] = useState(null);
    const [loading, setLoading] = useState(false);

    // 1. Load the List on Mount
    useEffect(() => {
        fetchPendingList();
    }, []);

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

    const fetchPendingList = async () => {
        try {
            const res = await axios.get('http://127.0.0.1:5000/api/matches/pending');
            setPendingMatches(res.data);
            
            // Auto-select the first item if nothing is selected and list is not empty
            if (res.data.length > 0 && !selectedIds) {
                setSelectedIds({ id_a: res.data[0].author_id_a, id_b: res.data[0].author_id_b });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSelection = (id_a, id_b) => {
        setSelectedIds({ id_a, id_b });
    };

    const handleDecisionComplete = () => {
        // 1. Remove the processed item from the local list immediately (Optimistic UI)
        const newList = pendingMatches.filter(m => 
            !(m.author_id_a === selectedIds.id_a && m.author_id_b === selectedIds.id_b)
        );
        setPendingMatches(newList);
        
        // 2. Select the next item in line
        if (newList.length > 0) {
            setSelectedIds({ id_a: newList[0].author_id_a, id_b: newList[0].author_id_b });
        } else {
            setSelectedIds(null);
            setActiveMatchData(null);
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            {/* LEFT: The List */}
            <MatchList 
                matches={pendingMatches} 
                selectedIds={selectedIds} 
                onSelect={handleSelection} 
            />

            {/* RIGHT: The Workspace */}
            <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#f0f2f5', position: 'relative' }}>
                {!selectedIds && (
                    <div style={styles.centerMessage}>Select a match to review</div>
                )}
                
                {loading && selectedIds && (
                    <div style={styles.centerMessage}>Loading Details...</div>
                )}

                {!loading && activeMatchData && (
                    <MatchCard 
                        data={activeMatchData} 
                        onDecision={handleDecisionComplete} 
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
        color: '#888', fontSize: '1.2em'
    }
};

export default Dashboard;