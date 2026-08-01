import { useState } from "react";
import axios from "axios";
import ConfirmationModal from "./utils/ConfirmationModal";
import "../styles/Account.css";

export default function Settings() {
    const [projectKey, setProjectKey] = useState("");
    const [statusMsg, setStatusMsg] = useState({ text: "", type: "" });
    const [loading, setLoading] = useState(false);

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: "",
        message: "",
        submitLabel: "",
        isDanger: false,
        onConfirm: () => {}
    });

    const handleReqJoinProject = (e) => {
        e.preventDefault();
        if (!projectKey.trim()) {
            setStatusMsg({ text: "Please enter a valid project key.", type: "error" });
            return;
        }

        setStatusMsg({ text: "", type: "" });

        setConfirmModal({
            isOpen: true,
            title: "Join Project Request",
            message: (
                <>
                    Are you sure you want to request access to project <strong>{projectKey.trim()}</strong>?
                    <br />
                    An email request will be sent to the project owner and will expire in 24 hours.
                </>
            ),
            submitLabel: "Send Request",
            isDanger: false,
            onConfirm: executeJoinRequest
        });
    };

    const executeJoinRequest = async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        setLoading(true);

        const token = localStorage.getItem("token");
        try {
            const response = await axios.post(
                "http://localhost:8000/api/projects/join-request",
                { project_key: projectKey.trim() },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setStatusMsg({ text: response.data.message, type: "success" });
            setProjectKey("");
        } catch (err) {
            const detail = err.response?.data?.detail || "Failed to send join request.";
            setStatusMsg({ text: detail, type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="accountContainer">
            <h2 className="accountTitle">Settings</h2>

            <div className="accountSection">
                <h3 className="sectionTitle">Join a Project</h3>
                <form className="accountForm" onSubmit={handleReqJoinProject}>
                    <div className="formGroup">
                        <label htmlFor="projectKey">Project Key</label>
                        <input
                            type="text"
                            id="projectKey"
                            placeholder="e.g. PRJ-KEY"
                            value={projectKey}
                            onChange={(e) => setProjectKey(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>

                    {statusMsg.text && (
                        <p className={statusMsg.type === "error" ? "msgError" : "msgSuccess"}>
                            {statusMsg.text}
                        </p>
                    )}

                    <button type="submit" className="btnSubmit" disabled={loading}>
                        {loading ? "Sending..." : "Request Access"}
                    </button>
                </form>
            </div>

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                submitLabel={confirmModal.submitLabel}
                isDanger={confirmModal.isDanger}
            />
        </div>
    );
}