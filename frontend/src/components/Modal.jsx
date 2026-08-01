import { createPortal } from 'react-dom';
import '../styles/Modal.css';

export default function Modal({
    isOpen, 
    onClose, 
    title, 
    children, 
    formId = "universalForm", 
    submitLabel = "Create",
    isDanger = false // Add missing prop with default value
}) {
    if (!isOpen) return null;

    return createPortal(
        <div className="modalOverlay" onClick={onClose}>
            <div className="modalWindow" onClick={(e) => e.stopPropagation()}>
                <header>
                    <h2 className='modalTitle'>{title}</h2>
                </header>
                <div className="modalBody">
                    {children}
                    <div className='controlButton'>
                        <button type="button" className='closeButton' onClick={onClose}>
                            Cancel
                        </button>
                        <button 
                            className={`createButton ${isDanger ? 'dangerButton' : ''}`} 
                            type="submit" 
                            form={formId}
                        >
                            {submitLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.getElementById('modal')
    );
}