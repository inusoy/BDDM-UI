import axios from 'axios';
const API_BASE_URL = 'http://localhost:5000/api';

export const fetchPendingMatches = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/matches/pending`);
        return response.data;
    } catch (error) { console.error(error); return []; }
};

export const fetchMatchDetails = async (idA, idB) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/match/${idA}/${idB}`);
        return response.data;
    } catch (error) { console.error(error); return null; }
};

export const submitDecision = async (idA, idB, decision) => {
    try {
        await axios.post(`${API_BASE_URL}/match/${idA}/${idB}/decide`, { decision });
    } catch (error) { console.error(error); }
};