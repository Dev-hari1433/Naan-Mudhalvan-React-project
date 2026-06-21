import React from 'react';

/**
 * Reusable Metric Summary Card
 */
export const MetricCard = ({ title, value, icon, subtitle, type = 'balance' }) => {
  return (
    <div className="card summary-indicator">
      <div className={`indicator-icon-wrapper ${type}`}>
        {icon}
      </div>
      <div>
        <span 
          style={{ 
            display: 'block', 
            fontSize: '0.8rem', 
            fontWeight: 600, 
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '4px'
          }}
        >
          {title}
        </span>
        <h2 style={{ fontSize: '1.65rem', fontWeight: 800, margin: 0, lineHeight: 1.1 }}>
          {value}
        </h2>
        {subtitle && (
          <span 
            style={{ 
              display: 'block', 
              fontSize: '0.75rem', 
              color: 'var(--text-muted)',
              marginTop: '4px',
              fontWeight: 500
            }}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};
