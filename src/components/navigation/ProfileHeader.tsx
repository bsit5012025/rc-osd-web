import "./ProfileHeader.css";

export interface ProfileHeaderInfoItem {
    label?: string;
    value: string;
}

interface ProfileHeaderProps {
    initials: string;
    name: string;
    infoItems: ProfileHeaderInfoItem[];
}

export default function ProfileHeader({ initials, name, infoItems }: ProfileHeaderProps) {
    return (
        <div className="profile-header">
            <div className="profile-avatar">{initials}</div>

            <div className="text-white">
                <h4 className="fw-bold">{name}</h4>
                <div className="profile-header-details">
                    {infoItems.map((item, idx) => (
                        <span key={item.label ?? `${item.value}-${idx}`}>
                            {idx > 0 && <span className="mx-2">•</span>}
                            {item.label ? (
                                <>
                                    {item.label}: <strong>{item.value}</strong>
                                </>
                            ) : (
                                item.value
                            )}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}