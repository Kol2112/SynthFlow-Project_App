import { MdNoAccounts } from "react-icons/md";

export default function RenderAvatars({ 
    members = [], 
    maxCount = 6, 
    onRemoveMember = null 
}) {
    if (!Array.isArray(members) || members.length === 0) {
        return (
            <div className="membersAvatarsList">
                <div className="memberAvatar" title="No one is assigned">
                    <MdNoAccounts className="memberAvatarImg" size={22} color="#8b949e" />
                </div>
            </div>
        );
    }

    return (
        <div className="membersAvatarsList">
            {members.slice(0, maxCount).map((m, idx) => (
                <div key={m.id || m.email || idx} className="memberAvatar" title={m.email || m.name || m.username}>
                    {m.avatar_url ? (
                        <img src={m.avatar_url} alt={m.name || m.email} className="memberAvatarImg" />
                    ) : (
                        <div className="userAvatarFallback">
                            {(m.name ? m.name[0] : m.username ? m.username[0] : m.email ? m.email[0] : '?').toUpperCase()}
                        </div>
                    )}
                    
                    {onRemoveMember && (
                        <button 
                            type="button" 
                            className="removeAvatarBtn" 
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemoveMember(m);
                            }}
                            title="Remove member"
                        >
                            ✕
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}