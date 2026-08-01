import Modal from "../Modal.jsx";

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
            <form id={formId} onSubmit={handleSubmit} style={{ width: '100%', padding: '0 1.5rem' }}>
                <p style={{
                    color: '#C9D1D9',
                    fontSize: '1rem',
                    textAlign: 'center',
                    margin: '0 0 1.5rem 0',
                    lineHeight: '1.5',
                    fontFamily: 'JetBrains Mono, monospace'
                }}>
                    {message}
                </p>
            </form>
        </Modal>
    );
}