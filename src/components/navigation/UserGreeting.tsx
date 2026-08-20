import "./UserGreeting.css";

export interface UserInfoItem {
    label: string;
    value: string;
}

interface UserGreetingProps {
    name: string;
    infoItems: UserInfoItem[];
}

export default function UserGreeting({ name, infoItems }: UserGreetingProps) {
    return (
        <div className="user-greeting">
            <div className="user-greeting-title">
                Hello, {name || "User"}!
            </div>

            <div className="user-greeting-info">
                {infoItems.map((item) => (
                    <span className="user-greeting-info-item" key={item.label}>
                        <span className="user-greeting-info-label">{item.label}:</span>{" "}
                        <span className="user-greeting-info-value">{item.value || "—"}</span>
                    </span>
                ))}
            </div>
        </div>
    );
}