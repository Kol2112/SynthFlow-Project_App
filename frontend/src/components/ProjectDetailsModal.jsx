import { useState } from 'react';
import { FaGithub, FaCopy, FaCheck } from 'react-icons/fa';
import { IoMenuOutline } from 'react-icons/io5';
import '../styles/ProjectDetailsModal.css';

export default function ProjectDetailsModal({ name, members = [], tags = [], description, githubRepo }) {
    const [copied, setCopied] = useState(false);
    const [isMembersMenuOpen, setIsMembersMenuOpen] = useState(false);

    const webhookUrl = "http://localhost:8000/api/webhooks/github";

    const handleCopyWebhook = () => {
        navigator.clipboard.writeText(webhookUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getMemberInfo = (member) => {
        if (typeof member === 'object' && member !== null) {
            const name = member.name || '';
            const surname = member.surname || '';
            const fullName = `${name} ${surname}`.trim() || member.email || 'User';
            const initials = `${name[0] || ''}${surname[0] || ''}`.toUpperCase() || 'U';
            return {
                id: member.id,
                fullName,
                initials,
                avatarUrl: member.avatar_url || member.avatar || null
            };
        }
        
        const nameStr = String(member);
        const parts = nameStr.split(' ');
        const initials = parts.map(p => p[0]).join('').substring(0, 2).toUpperCase();
        return {
            id: member,
            fullName: nameStr,
            initials,
            avatarUrl: null
        };
    };

    const visibleMembers = members.slice(0, 9);

    return (
        <div className="projectDetailsWrapper">
            <div className="projectDetailsContainer">
                <div className="projectDetailsField">
                    <label className="projectDetailsLabel">Project Name</label>
                    <div className="projectDetailsName">{name || "Unnamed Project"}</div>
                </div>

                <div className="projectDetailsField">
                    <label className="projectDetailsLabel">Members</label>
                    <div className="projectDetailsAvatarsRow">
                        {visibleMembers.map((member, index) => {
                            const info = getMemberInfo(member);
                            return (
                                <div key={info.id || index} className="memberAvatar" title={info.fullName}>
                                    {info.avatarUrl ? (
                                        <img src={info.avatarUrl} alt={info.fullName} />
                                    ) : (
                                        <span>{info.initials}</span>
                                    )}
                                </div>
                            );
                        })}

                        <button 
                            type="button" 
                            className={`membersMenuBtn ${isMembersMenuOpen ? 'active' : ''}`}
                            onClick={() => setIsMembersMenuOpen(!isMembersMenuOpen)}
                            title="Show all members"
                        >
                            <IoMenuOutline size={18} />
                        </button>
                    </div>
                </div>

                <div className="projectDetailsField">
                    <label className="projectDetailsLabel">Tags</label>
                    <div className="projectDetailsList">
                        {tags.length > 0 ? (
                            tags.map((tag, index) => (
                                <span key={index} className="projectDetailsTagBadge">
                                    {tag}
                                </span>
                            ))
                        ) : (
                            <span className="projectDetailsEmptyText">No tags assigned</span>
                        )}
                    </div>
                </div>

                <div className="projectDetailsField">
                    <label className="projectDetailsLabel">GitHub Repository</label>
                    {githubRepo ? (
                        <a 
                            href={githubRepo.startsWith('http') ? githubRepo : `https://${githubRepo}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="projectDetailsGithubLink"
                        >
                            <FaGithub size={18} />
                            <span>{githubRepo}</span>
                        </a>
                    ) : (
                        <span className="projectDetailsEmptyText">No repository connected</span>
                    )}
                </div>

                {githubRepo && (
                    <div className="projectDetailsField">
                        <label className="projectDetailsLabel">GitHub Webhook URL</label>
                        <div className="webhookRowContainer">
                            <input type="text" readOnly value={webhookUrl} className="webhookInput" />
                            <button type="button" onClick={handleCopyWebhook} className={`webhookCopyBtn ${copied ? 'copied' : ''}`}>
                                {copied ? <FaCheck /> : <FaCopy />}
                                {copied ? "Copied" : "Copy"}
                            </button>
                        </div>
                    </div>
                )}

                <div className="projectDetailsField">
                    <label className="projectDetailsLabel">Description</label>
                    <div className="projectDetailsDescription">
                        {description || "No description provided."}
                    </div>
                </div>
            </div>

            {isMembersMenuOpen && (
                <div className="allMembersSidePanel">
                    <h4 className="allMembersTitle">All members</h4>
                    <div className="allMembersList">
                        {members.map((member, index) => {
                            const info = getMemberInfo(member);
                            return (
                                <div key={info.id || index} className="allMembersItem">
                                    <div className="memberAvatar small">
                                        {info.avatarUrl ? (
                                            <img src={info.avatarUrl} alt={info.fullName} />
                                        ) : (
                                            <span>{info.initials}</span>
                                        )}
                                    </div>
                                    <span className="memberName">{info.fullName}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}