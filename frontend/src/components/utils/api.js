import axios from 'axios';

const API = axios.create({
    baseURL: "http://127.0.0.1:8000/api",
    withCredentials: true,
});


export const authService = {
    register: async(userData) =>{
        const response = await API.post('/auth/register', userData);
        return response.data;
    },

    login: async (loginData) =>{
        const response = await API.post('/auth/login', loginData);
        return response.data;
    }
};


export default API;