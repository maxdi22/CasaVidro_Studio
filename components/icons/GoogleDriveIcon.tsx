
import React from 'react';

export const GoogleDriveIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.227 21.75L12 12.75L16.773 21.75H7.227Z" fill="#34A853"/>
        <path d="M2.25 12.75L7.227 3.75H16.773L21.75 12.75H2.25Z" fill="#4285F4"/>
        <path d="M16.773 3.75L12 12.75L14.486 17.25L21.75 12.75L16.773 3.75Z" fill="#188038"/>
        <path d="M2.25 12.75L7.023 21.75L9.509 17.25L4.736 8.25L2.25 12.75Z" fill="#FBBC04"/>
    </svg>
);
