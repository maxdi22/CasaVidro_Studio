import React from 'react';

export const VariationsIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="5" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
        <path d="M5 19V5C5 3.89543 5.89543 3 7 3H19C20.1046 3 21 3.89543 21 5V17C21 18.1046 20.1046 19 19 19H17" stroke="currentColor" strokeWidth="2"/>
    </svg>
);
