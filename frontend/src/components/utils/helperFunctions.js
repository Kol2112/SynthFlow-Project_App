import { useNavigate } from 'react-router-dom';
import { deleteProjectApi, taskService, projectService } from './api.js';

// --- Walidacja Hasła ---
export function validatePassword(password) {
    if (!password) {
        return { isValid: false, message: "Password is required." };
    }

    const minLength = password.length >= 12;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasSpecialChar = /[^a-zA-Z0-9\s]/.test(password);

    if (!minLength) {
        return { isValid: false, message: "Password must be at least 12 characters long." };
    }
    if (!hasUpperCase) {
        return { isValid: false, message: "Password must contain at least one uppercase letter." };
    }
    if (!hasSpecialChar) {
        return { isValid: false, message: "Password must contain at least one special character." };
    }

    return { isValid: true, message: "" };
}

// --- Walidacja Imienia / Nazwiska ---
export function validateNameOrSurname(value, fieldName = "Field") {
    if (!value) return { isValid: true, message: "" };

    if (value.trim().length < 2) {
        return { 
            isValid: false, 
            message: `${fieldName} must be at least 2 characters long.` 
        };
    }

    return { isValid: true, message: "" };
}

// --- Walidacja Wieku ---
export function validateAge(birthDateString, minAge = 13) {
    if (!birthDateString) return { isValid: true, message: "" };

    const birthDateObj = new Date(birthDateString);
    const today = new Date();
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
        age--;
    }

    if (age < minAge) {
        return { 
            isValid: false, 
            message: `You must be at least ${minAge} years old to create an account!` 
        };
    }

    return { isValid: true, message: "" };
}

// --- Generyczna obsługa błędów API ---
export function extractErrorMessage(error, fallbackMessage = "An error occurred") {
    if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (Array.isArray(detail)) {
            return detail[0]?.msg || fallbackMessage;
        }
        return detail;
    }
    if (error.message === "Network Error") {
        return "Connection with server timeout";
    }
    return fallbackMessage;
}

// --- Usuwanie Projektu ---
export async function executeDeleteProject({ projectId, onDeleteSuccess, redirectTo, navigate }) {
    if (!projectId) return;

    try {
        await deleteProjectApi(projectId);
        
        if (onDeleteSuccess) {
            onDeleteSuccess(projectId);
        }
        if (redirectTo && navigate) {
            navigate(redirectTo);
        }
    } catch (error) {
        console.error("Error deleting project:", error);
        throw error;
    }
}

export function useDeleteProject() {
    const navigate = useNavigate();

    const deleteProject = async (params) => {
        return await executeDeleteProject({ ...params, navigate });
    };

    return deleteProject;
}

// --- Usuwanie Zadania ---
export async function executeDeleteTask({ projectId, columnId, taskId }) {
    if (!projectId || !columnId || !taskId) return;

    try {
        await taskService.deleteTask(projectId, columnId, taskId);
        return true;
    } catch (error) {
        console.error("Failed to delete task:", error);
        throw new Error("Failed to delete task");
    }
}

export function useDeleteTask() {
    const deleteTask = async (params) => {
        return await executeDeleteTask(params);
    };

    return deleteTask;
}

// --- Usuwanie Kolumny / Listy ---
export async function executeDeleteColumn({ projectId, columnId }) {
    if (!projectId || !columnId) return;

    try {
        await projectService.deleteColumn(projectId, columnId);
        return true;
    } catch (error) {
        console.error("Failed to delete column:", error);
        throw new Error("Failed to delete column");
    }
}

export function useDeleteColumn() {
    const deleteColumn = async (params) => {
        return await executeDeleteColumn(params);
    };

    return deleteColumn;
}

export const isOverdue = (dateStr) => {
    if (!dateStr || dateStr === "No deadline") return false;

    let taskDeadline;

    if (typeof dateStr === 'string' && dateStr.includes('.')) {
        const parts = dateStr.split('.');
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const year = parseInt(parts[2], 10);
            taskDeadline = new Date(year, month, day);
        }
    } else if (typeof dateStr === 'string' && dateStr.includes('-')) {
        const parts = dateStr.split('T')[0].split('-');
        if (parts.length === 3) {
            if (parts[0].length === 4) {
                taskDeadline = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
            } else {
                taskDeadline = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
            }
        }
    }

    if (!taskDeadline || isNaN(taskDeadline.getTime())) {
        taskDeadline = new Date(dateStr);
    }

    if (isNaN(taskDeadline.getTime())) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    taskDeadline.setHours(0, 0, 0, 0);

    return taskDeadline < today;
};