
import React from 'react';

export const FashionIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 8h2m-6-16l-1.5 8h11L16 4" />
        <path d="M9 4a3 3 0 013-3h0a3 3 0 013 3v0" />
    </svg>
);
