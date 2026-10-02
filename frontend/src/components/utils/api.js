import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
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

export const deleteProjectApi = async (projectId) => {
    const token = localStorage.getItem("token") || sessionStorage.getItem('token');
    const response = await fetch(`https://synthflow-backend.onrender.com/api/projects/${projectId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
    });

    if (!response.ok) {
        throw new Error("Failed to delete the project");
    }
    return await response.json();
};

export default API;
