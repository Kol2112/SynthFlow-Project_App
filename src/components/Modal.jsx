export default function Modal({isOpen, onClose, title, children}){
    if (!isOpen) return null;
    return(
        <div className="modal-overlay">
        <div className="modal-window">
            <header>
            <button onClick={onClose}>Zamknij</button>
            <h2>{title}</h2>
            </header>
            
            {/* Tutaj "wpadnie" Twój formularz lub detale zadania */}
            <div className="modal-body">
            {children}
            </div>
        </div>
        </div>
    )
}
