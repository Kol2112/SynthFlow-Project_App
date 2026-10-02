import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
    withCredentials: true,
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authService = {
    register: async (userData) => {
        const response = await API.post('/auth/register', userData);
        return response.data;
    },
    login: async (loginData) => {
        const response = await API.post('/auth/login', loginData);
        return response.data;
    },
    confirmChange: async (token) => {
        const response = await API.post(`/auth/confirm-change?token=${token}`);
        return response.data;
    },
    activateAccount: async (token) => {
        const response = await API.post(`/auth/activate?token=${token}`);
        return response.data;
    },
    forgotPassword: async (email) => {
        const response = await API.post('/auth/forgot-password', { email });
        return response.data;
    },
    resetPassword: async (token, newPassword) => {
        const response = await API.post('/auth/reset-password', { token, new_password: newPassword });
        return response.data;
    }
};

export const userService = {
    searchUsers: async (emailQuery) => {
        const response = await API.get(`/users/search?email=${encodeURIComponent(emailQuery)}`);
        return response.data;
    },
    getMe: async () => {
        const response = await API.get('/users/me');
        return response.data;
    },
    updateAvatar: async (base64Image) => {
        const response = await API.put('/users/me/avatar', { avatar_url: base64Image });
        return response.data;
    },
    deleteAvatar: async () => {
        const response = await API.delete('/users/me/avatar');
        return response.data;
    },
    requestEmailChange: async (data) => {
        const response = await API.put('/users/me/request-email-change', data);
        return response.data;
    },
    requestPasswordChange: async (data) => {
        const response = await API.put('/users/me/request-password-change', data);
        return response.data;
    },
    deleteAccount: async () => {
        const response = await API.delete('/users/me');
        return response.data;
    }
};

export const projectService = {
    deleteProject: async (projectId) => {
        const response = await API.delete(`/projects/${projectId}`);
        return response.data;
    },
    deleteColumn: async (projectId, columnId) => {
        const response = await API.delete(`/projects/${projectId}/columns/${columnId}`);
        return response.data;
    },
    getRecentProjects: async () => {
        const response = await API.get('/projects/recent');
        return response.data;
    },
    createProject: async (payload) => {
        const response = await API.post('/projects', payload);
        return response.data;
    },
    updateProject: async (projectId, payload) => {
        const response = await API.put(`/projects/${projectId}`, payload);
        return response.data;
    },
    sendInvitation: async (projectId, email) => {
        const response = await API.post(`/projects/${projectId}/invitations`, { email });
        return response.data;
    },
    removeMember: async (projectId, userId) => {
        const response = await API.delete(`/projects/${projectId}/members/${userId}`);
        return response.data;
    },
    getProjects: async () => {
        const response = await API.get('/projects');
        return response.data;
    },
    respondJoinRequest: async (requestId, accept) => {
        const response = await API.post(`/projects/join-requests/${requestId}/respond`, { accept });
        return response.data;
    },
    getProjectByKey: async (projectKey) => {
        const response = await API.get(`/projects/by-key/${projectKey}`);
        return response.data;
    },
    reorderColumns: async (projectId, columnIds) => {
        const response = await API.put(`/projects/${projectId}/columns/reorder`, { column_ids: columnIds });
        return response.data;
    },
    requestJoinProject: async (projectKey) => {
        const response = await API.post('/projects/join-request', { project_key: projectKey });
        return response.data;
    }
};

export const columnService = {
    createColumn: async (projectId, name) => {
        const response = await API.post(`/projects/${projectId}/columns`, { name });
        return response.data;
    },
    renameColumn: async (projectId, columnId, name) => {
        const response = await API.put(`/projects/${projectId}/columns/${columnId}`, { name });
        return response.data;
    },
    deleteColumn: async (projectId, columnId) => {
        const response = await API.delete(`/projects/${projectId}/columns/${columnId}`);
        return response.data;
    },
    reorderTasks: async (projectId, columnId, taskIds) => {
        const response = await API.put(`/projects/${projectId}/columns/${columnId}/tasks/reorder`, { task_ids: taskIds });
        return response.data;
    }
};


export const notificationService = {
    getNotifications: async () => {
        const response = await API.get('/notifications');
        return response.data;
    },
    markAsRead: async (notificationId) => {
        const response = await API.patch(`/notifications/${notificationId}/read`);
        return response.data;
    },
    markAllAsRead: async () => {
        const response = await API.patch('/notifications/read-all');
        return response.data;
    }
};

export const taskService = {
    createTask: async (projectId, columnId, payload) => {
        const response = await API.post(`/projects/${projectId}/columns/${columnId}/tasks`, payload);
        return response.data;
    },
    updateTask: async (projectId, columnId, taskId, payload) => {
        const response = await API.put(`/projects/${projectId}/columns/${columnId}/tasks/${taskId}`, payload);
        return response.data;
    },
    deleteTask: async (projectId, columnId, taskId) => {
        const response = await API.delete(`/projects/${projectId}/columns/${columnId}/tasks/${taskId}`);
        return response.data;
    },
    moveTask: async (taskId, columnId) => {
        const response = await API.put(`/tasks/${taskId}/move?column_id=${columnId}`);
        return response.data;
    },
    toggleTaskComplete: async (taskId, isDone) => {
        const response = await API.put(`/tasks/${taskId}/toggle-complete`, { is_done: isDone });
        return response.data;
    }
};
export const subtaskService = {
    toggleSubtaskComplete: async (subtaskId, isDone) => {
        const response = await API.put(`/subtasks/${subtaskId}/toggle-complete`, { is_done: isDone });
        return response.data;
    }
};


export const deleteProjectApi = projectService.deleteProject;

export default API;