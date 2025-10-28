import React from 'react';

export const ViewColumnsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    {/* This path combines the two vertical divider lines */}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 4.5v15m6-15v15"
    />
    {/* This path creates the outer rectangular frame */}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 6.75A2.25 2.25 0 0 1 6 4.5h12A2.25 2.25 0 0 1 20.25 6.75v10.5A2.25 2.25 0 0 1 18 19.5H6A2.25 2.25 0 0 1 3.75 17.25V6.75Z"
    />
  </svg>
);
