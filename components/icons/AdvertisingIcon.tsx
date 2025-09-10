
import React from 'react';

export const AdvertisingIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.136A1.76 1.76 0 015.882 11H11m0-5.118a1.76 1.76 0 00-1.583-1.858l-3.468-.347a1.76 1.76 0 00-1.858 1.583V11m6.498 4.908l2.162-2.162a1.76 1.76 0 00-2.49-2.49L11 13.882m5.249 2.023l3.363-3.363a1.76 1.76 0 00-2.49-2.49l-3.363 3.363" />
    </svg>
);
