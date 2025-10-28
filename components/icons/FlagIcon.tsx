import React from 'react';

export const FlagIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    {...props}
  >
    <path d="M4 3a1 1 0 011-1h6a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
    <path d="M4 3v14a1 1 0 01-2 0V3a1 1 0 012 0z" />
  </svg>
);
