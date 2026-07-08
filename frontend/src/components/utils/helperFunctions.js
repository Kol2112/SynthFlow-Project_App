import { useNavigate } from 'react-router-dom';
import { deleteProjectApi } from './api.js';

export function useDeleteProject() {
    const navigate = useNavigate();

    const deleteProject = async ({ projectId, onDeleteSuccess, redirectTo }) => {
        if (!projectId) return;

        try {
            await deleteProjectApi(projectId);
            
            if (onDeleteSuccess) {
                onDeleteSuccess(projectId);
            }
            if (redirectTo) {
                navigate(redirectTo);
            }
        } catch (error) {
            console.error("Error deleting project via hook:", error);
        }
    };

    return deleteProject;
}