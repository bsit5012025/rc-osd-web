import "./InfoList.css";

export interface InfoListItem {
    icon: string;
    label: string;
    value: string;
}

interface InfoListProps {
    items: InfoListItem[];
}

export default function InfoList({ items }: InfoListProps) {
    return (
        <div className="info-card">
            {items.map((item) => (
                <div className="info-row" key={item.label}>
                    <i className={`bi ${item.icon} info-row-icon`}></i>
                    <span className="info-row-label">{item.label}</span>
                    <span className="info-row-value">{item.value}</span>
                </div>
            ))}
        </div>
    );
}