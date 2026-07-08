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

export const deleteProjectApi = async (projectId) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`http://localhost:8000/api/projects/${projectId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
    });

    if (!response.ok) {
        throw new Error("Failed to delete the project");
    }
    return await response.json();
};

export default API;