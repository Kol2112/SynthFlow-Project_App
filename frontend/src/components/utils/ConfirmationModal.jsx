import Modal from "../Modal.jsx";
import '../../styles/share.css';

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Action",
    message = "Are you sure you want to proceed?",
    submitLabel = "Confirm",
    isDanger = false,
    formId = "confirmationModalForm"
}) {
    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            formId={formId}
            submitLabel={submitLabel}
            isDanger={isDanger}
        >
            <form id={formId} onSubmit={handleSubmit} className="confirmationForm">
                <p className="confirmationMessage">
                    {message}
                </p>
            </form>
        </Modal>
    );
}