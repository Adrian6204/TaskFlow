import React from 'react';

export const GanttIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
    <rect x="5" y="5" width="8" height="3" rx="1" fill="currentColor" opacity="0.3" />
    <rect x="8" y="10" width="10" height="3" rx="1" fill="currentColor" opacity="0.3" />
    <rect x="3" y="15" width="6" height="3" rx="1" fill="currentColor" opacity="0.3" />
  </svg>
);
