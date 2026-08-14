import "./StatCard.css";

interface StatCardProps {
    icon?: string;
    iconColor?: string;
    iconBg?: string;
    value: number | string;
    valueColor?: string;
    label: string;
}

function StatCard({ icon, iconColor, iconBg, value, valueColor, label }: StatCardProps) {
    return (
        <div className="stat-card">

            {icon && (
                <div
                    className="stat-icon"
                    style={{ backgroundColor: iconBg, color: iconColor }}
                >
                    <i className={`bi ${icon}`}></i>
                </div>
            )}

            <div className="stat-value" style={valueColor ? { color: valueColor } : undefined}>
                {value}
            </div>
            <div className="stat-label">{label}</div>

        </div>
    );
}

export default StatCard;