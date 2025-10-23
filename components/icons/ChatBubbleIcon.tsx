import React from 'react';

export const ChatBubbleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 20 20" 
    fill="currentColor" 
    {...props}>
    <path 
        fillRule="evenodd" 
        d="M10 2a8 8 0 100 16 8 8 0 000-16zM2 10a8 8 0 1116 0 8 8 0 01-16 0zm5.5-2.5a.5.5 0 01.5.5v1a.5.5 0 01-1 0V8a.5.5 0 01.5-.5zM10 7a.5.5 0 01.5.5v5a.5.5 0 01-1 0V7.5A.5.5 0 0110 7zm2.5-1.5a.5.5 0 01.5.5v3a.5.5 0 01-1 0V6a.5.5 0 01.5-.5z"
        clipRule="evenodd" 
    />
     <path d="M18 5a3 3 0 00-3-3H5a3 3 0 00-3 3v6a3 3 0 003 3h1.586l1.707 1.707A1 1 0 009 18h2a1 1 0 00.707-.293L13.414 16H15a3 3 0 003-3V5z" />
  </svg>
);