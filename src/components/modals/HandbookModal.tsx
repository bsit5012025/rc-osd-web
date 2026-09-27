import "./HandbookModal.css";

interface HandbookModalProps {
    isOpen: boolean;
    onClose: () => void;
    url: string | null;
    title?: string;
}

function HandbookModal({ isOpen, onClose, url, title = "Student Handbook" }: HandbookModalProps) {

    if (!isOpen) return null;

    return (
        <div className="handbook-modal-overlay" onClick={onClose}>
            <div className="handbook-modal" onClick={(e) => e.stopPropagation()}>

                <div className="handbook-modal-header">
                    <h5>{title}</h5>
                    <button
                        type="button"
                        className="handbook-modal-close-btn"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <div className="handbook-modal-body">
                    {url ? (
                        <iframe
                            src={url}
                            title={title}
                            className="handbook-modal-frame"
                        />
                    ) : (
                        <p className="handbook-modal-empty">
                            We couldn't determine which handbook applies to your account.
                        </p>
                    )}
                </div>

            </div>
        </div>
    );
}

export default HandbookModal;