import React from 'react';
import { AlertIcon, InfoIcon, CheckIcon } from './Icons';

/**
 * Reusable inline notification / alert box
 */
export const Alert = ({ type = 'info', message, children }) => {
  if (!message && !children) return null;

  // Determine icon based on alert severity
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckIcon size={18} />;
      case 'warning':
      case 'danger':
        return <AlertIcon size={18} />;
      case 'info':
      default:
        return <InfoIcon size={18} />;
    }
  };

  return (
    <div className={`alert-box ${type}`}>
      <span style={{ marginTop: '2px', flexShrink: 0 }}>
        {getIcon()}
      </span>
      <div style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.4 }}>
        {message || children}
      </div>
    </div>
  );
};
