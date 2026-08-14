import "./ActionList.css";

interface ActionListProps {
    icon: string;
    label: string;
    href?: string;
}

function ActionList({ icon, label, href = "#" }: ActionListProps) {
    return (
        <a href={href} className="action-item">

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