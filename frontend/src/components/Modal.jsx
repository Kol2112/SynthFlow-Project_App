import {createPortal} from 'react-dom';

import '../styles/Modal.css'
export default function Modal({isOpen, onClose, title, children, formId = "createProjectForm"}){
    if (!isOpen) return null;
    return createPortal(
        <div className="modalOverlay">
            <div className="modalWindow">
                <header>
                    <h2 className='modalTitle'>{title}</h2>
                </header>
                <div className="modalBody">
                    {children}
                    <div className='controlButton'>
                        <button className='closeButton' onClick={onClose}>Cancel</button>
                        <button className='createButton' type="submit" form={formId}>Create</button>
                    </div>
                </div>
            </div>
        </div>,
        document.getElementById('modal')
    )
}
