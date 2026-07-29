import React, { useState } from 'react';
import { FaGithub, FaCopy, FaCheck } from 'react-icons/fa';
import '../styles/ProjectDetailsModal.css';

export default function ProjectDetailsModal({ name, members = ["only you"], tags = [], description, githubRepo }) {
    const [copied, setCopied] = useState(false);

    const webhookUrl = "http://localhost:8000/api/webhooks/github";

    const handleCopyWebhook = () => {
        navigator.clipboard.writeText(webhookUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="projectDetailsContainer">
            <div className="projectDetailsField">
                <label className="projectDetailsLabel">Project Name</label>
                <div className="projectDetailsName">{name || "Unnamed Project"}</div>
            </div>

            <div className="projectDetailsField">
                <label className="projectDetailsLabel">Members</label>
                <div className="projectDetailsList">
                    {members.map((member, index) => (
                        <span key={index} className="projectDetailsMemberBadge">
                            {member}
                        </span>
                    ))}
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

            {/* GitHub Repository Link */}
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

            {/* GitHub Webhook Info */}
            {githubRepo && (
                <div className="projectDetailsField">
                    <label className="projectDetailsLabel">GitHub Webhook URL</label>
                    <div className="webhookRowContainer">
                        <input 
                            type="text" 
                            readOnly 
                            value={webhookUrl} 
                            className="webhookInput"
                        />
                        <button 
                            type="button" 
                            onClick={handleCopyWebhook}
                            className={`webhookCopyBtn ${copied ? 'copied' : ''}`}
                        >
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
    );
}