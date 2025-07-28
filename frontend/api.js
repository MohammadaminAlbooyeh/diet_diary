import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

// Fetch all calorie records
export const fetchCalorieRecords = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/records`);
        return response.data;
    } catch (error) {
        console.error('Error fetching calorie records:', error);
        throw error;
    }
};

// Add a new calorie record
export const addCalorieRecord = async (record) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/records`, record);
        return response.data;
    } catch (error) {
        console.error('Error adding calorie record:', error);
        throw error;
    }
};
