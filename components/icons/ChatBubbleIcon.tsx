import React from 'react';

export const ChatBubbleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 20 20" 
    fill="currentColor" 
    {...props}>
     <path d="M18 5a3 3 0 00-3-3H5a3 3 0 00-3 3v6a3 3 0 003 3h1.586l1.707 1.707A1 1 0 009 18h2a1 1 0 00.707-.293L13.414 16H15a3 3 0 003-3V5z" />
  </svg>
);
