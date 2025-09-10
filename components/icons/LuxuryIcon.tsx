
import React from 'react';

export const LuxuryIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18L6 12l6-6 6 6-6 6z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12h12" />
    </svg>
);
