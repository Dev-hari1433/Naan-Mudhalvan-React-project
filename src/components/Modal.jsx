import React, { useEffect } from 'react';
import { CloseIcon } from './Icons';

/**
 * Reusable modal overlay component
 */
export const Modal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ padding: '24px' }}
      >
        <div 
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '20px',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '12px'
          }}
        >
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>{title}</h3>
          <button 
            onClick={onClose} 
            className="btn-secondary" 
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              padding: '4px',
              color: 'var(--text-secondary)'
            }}
          >
            <CloseIcon size={20} />
          </button>
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
};
