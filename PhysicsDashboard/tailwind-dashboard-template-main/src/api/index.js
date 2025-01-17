import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export const executeQuery = async (queryString, params = []) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/query`, {
      query: queryString,
      params: params
    });
    return response.data;
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
};