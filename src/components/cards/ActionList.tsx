import "./ActionList.css";

interface ActionListProps {
    icon: string;
    label: string;
    href?: string;
    onClick?: () => void;
}

function ActionList({ icon, label, href = "#", onClick }: ActionListProps) {
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (onClick) {
            e.preventDefault();
            onClick();
        }
    };

    return (
        <a href={href} className="action-item" onClick={handleClick}>

            <div className="action-item-left">
                <div className="action-item-icon">
                    <i className={`bi ${icon}`}></i>
                </div>
                <span className="action-item-label">{label}</span>
            </div>

            <i className="bi bi-chevron-right action-item-chevron"></i>

        </a>
    );
}

export default ActionList;