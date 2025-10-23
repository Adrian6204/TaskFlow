import React from 'react';

export const FlagIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M3 3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-3.334L12 18.333l-1.667-4.333H4a1 1 0 0 1-1-1V3zm1 1v8h3.333L9 16.333 10.667 12H16V4H4z"
      clipRule="evenodd"
    />
  </svg>
);
