import React, { useState, useRef } from 'react';

/**
 * Reusable Tooltip for SVG Charts
 */
const ChartTooltip = ({ active, x, y, content }) => {
  if (!active || !content) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x + 14,
        top: y - 14,
        backgroundColor: '#0a0d18',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '8px',
        padding: '10px 14px',
        color: '#f3f4f6',
        fontSize: '0.75rem',
        pointerEvents: 'none',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
        zIndex: 100,
        whiteSpace: 'nowrap',
        transform: 'translate(-50%, -100%)',
      }}
    >
      {content}
    </div>
  );
};

/**
 * 1. Trend Line Chart (Inflows vs Outflows Cashflow Trend)
 * Expanded left padding to prevent Y-Axis label overlap.
 */
export const SVGLineChart = ({ data = [] }) => {
  const containerRef = useRef(null);
  const [tooltip, setTooltip] = useState({ active: false, x: 0, y: 0, content: null });

  if (!data || data.length === 0) {
    return (
      <div className="empty-state" style={{ height: '220px' }}>
        <p>No trend logs recorded yet</p>
      </div>
    );
  }

  const width = 500;
  const height = 220;
  const paddingLeft = 68; // Increased padding to fit large Rupee values
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxIncome = Math.max(...data.map(d => d.income), 0);
  const maxExpense = Math.max(...data.map(d => d.expense), 0);
  const maxVal = Math.max(maxIncome, maxExpense, 100);

  const points = data.map((d, i) => {
    const x = paddingLeft + (data.length > 1 ? (i / (data.length - 1)) * chartWidth : chartWidth / 2);
    const yIncome = height - paddingBottom - (d.income / maxVal) * chartHeight;
    const yExpense = height - paddingBottom - (d.expense / maxVal) * chartHeight;
    return { x, yIncome, yExpense, ...d };
  });

  const createPath = (key) => {
    if (points.length === 0) return '';
    if (points.length === 1) return ''; // Handled by circles
    return points.reduce((path, p, i) => {
      return i === 0 ? `M ${p.x} ${p[key]}` : `${path} L ${p.x} ${p[key]}`;
    }, '');
  };

  const createAreaPath = (key) => {
    if (points.length === 0) return '';
    const baseLine = height - paddingBottom;
    if (points.length === 1) return '';
    const linePath = points.reduce((path, p, i) => {
      return i === 0 ? `M ${p.x} ${p[key]}` : `${path} L ${p.x} ${p[key]}`;
    }, '');
    return `${linePath} L ${points[points.length - 1].x} ${baseLine} L ${points[0].x} ${baseLine} Z`;
  };

  const incomePath = createPath('yIncome');
  const expensePath = createPath('yExpense');
  const incomeAreaPath = createAreaPath('yIncome');
  const expenseAreaPath = createAreaPath('yExpense');

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    
    const relativeX = (mouseX / rect.width) * width;
    let closestIndex = 0;
    let minDist = Infinity;
    
    points.forEach((p, idx) => {
      const dist = Math.abs(p.x - relativeX);
      if (dist < minDist) {
        minDist = dist;
        closestIndex = idx;
      }
    });

    const closestPoint = points[closestIndex];
    if (closestPoint) {
      const tooltipX = (closestPoint.x / width) * rect.width;
      const avgY = (closestPoint.yIncome + closestPoint.yExpense) / 2;
      const tooltipY = (avgY / height) * rect.height;

      setTooltip({
        active: true,
        x: tooltipX,
        y: tooltipY,
        content: (
          <div>
            <div style={{ fontWeight: 700, marginBottom: '6px' }}>{closestPoint.key}</div>
            <div style={{ color: '#10b981', fontWeight: 600 }}>Inflow: ₹{closestPoint.income}</div>
            <div style={{ color: '#ef4444', fontWeight: 600 }}>Outflow: ₹{closestPoint.expense}</div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '6px', paddingTop: '6px', fontWeight: 700 }}>
              Net: ₹{closestPoint.income - closestPoint.expense}
            </div>
          </div>
        )
      });
    }
  };

  const handleMouseLeave = () => {
    setTooltip({ active: false, x: 0, y: 0, content: null });
  };

  const ticks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div 
      ref={containerRef} 
      className="svg-chart-container"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ position: 'relative' }}
    >
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="income-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="expense-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {ticks.map((t, idx) => {
          const y = height - paddingBottom - t * chartHeight;
          const val = t * maxVal;
          return (
            <g key={idx}>
              <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} className="svg-chart-grid" />
              <text x={paddingLeft - 10} y={y + 4} textAnchor="end" className="svg-chart-label">
                ₹{val >= 1000 ? `${(val/1000).toFixed(0)}k` : val.toFixed(0)}
              </text>
            </g>
          );
        })}

        {/* X labels */}
        {data.map((d, i) => {
          const x = paddingLeft + (data.length > 1 ? (i / (data.length - 1)) * chartWidth : chartWidth / 2);
          return (
            <text key={i} x={x} y={height - paddingBottom + 20} textAnchor="middle" className="svg-chart-label">
              {d.key}
            </text>
          );
        })}

        {/* Areas */}
        {incomeAreaPath && <path d={incomeAreaPath} fill="url(#income-grad)" />}
        {expenseAreaPath && <path d={expenseAreaPath} fill="url(#expense-grad)" />}

        {/* Lines */}
        {incomePath && <path d={incomePath} className="svg-chart-line" style={{ stroke: '#10b981' }} />}
        {expensePath && <path d={expensePath} className="svg-chart-line" style={{ stroke: '#ef4444' }} />}

        {/* Dots (Renders always, adds glow if 1 point) */}
        {points.map((p, idx) => (
          <g key={idx}>
            <circle cx={p.x} cy={p.yIncome} r={data.length === 1 ? 6 : 4} fill="#10b981" stroke="#060913" strokeWidth="2" />
            <circle cx={p.x} cy={p.yExpense} r={data.length === 1 ? 6 : 4} fill="#ef4444" stroke="#060913" strokeWidth="2" />
          </g>
        ))}
      </svg>
      <ChartTooltip active={tooltip.active} x={tooltip.x} y={tooltip.y} content={tooltip.content} />
    </div>
  );
};

/**
 * 2. Cumulative Worm Chart (IPL-Style Running Progression)
 * Shows running totals accumulation over time.
 */
export const SVGWormChart = ({ data = [] }) => {
  const containerRef = useRef(null);
  const [tooltip, setTooltip] = useState({ active: false, x: 0, y: 0, content: null });

  if (!data || data.length === 0) {
    return (
      <div className="empty-state" style={{ height: '220px' }}>
        <p>No transactions available to map running progression</p>
      </div>
    );
  }

  const width = 500;
  const height = 220;
  const paddingLeft = 68;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Calculate Running Totals (IPL run-rate style progression)
  let cumulativeIncome = 0;
  let cumulativeExpense = 0;

  const cumulativeData = data.map((d) => {
    cumulativeIncome += d.income;
    cumulativeExpense += d.expense;
    return {
      key: d.key,
      runIncome: cumulativeIncome,
      runExpense: cumulativeExpense
    };
  });

  const maxVal = Math.max(cumulativeIncome, cumulativeExpense, 100);

  const points = cumulativeData.map((d, i) => {
    const x = paddingLeft + (cumulativeData.length > 1 ? (i / (cumulativeData.length - 1)) * chartWidth : chartWidth / 2);
    const yIncome = height - paddingBottom - (d.runIncome / maxVal) * chartHeight;
    const yExpense = height - paddingBottom - (d.runExpense / maxVal) * chartHeight;
    return { x, yIncome, yExpense, ...d };
  });

  const createPath = (key) => {
    if (points.length === 0) return '';
    if (points.length === 1) return '';
    return points.reduce((path, p, i) => {
      return i === 0 ? `M ${p.x} ${p[key]}` : `${path} L ${p.x} ${p[key]}`;
    }, '');
  };

  const incomePath = createPath('yIncome');
  const expensePath = createPath('yExpense');

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    
    const relativeX = (mouseX / rect.width) * width;
    let closestIndex = 0;
    let minDist = Infinity;
    
    points.forEach((p, idx) => {
      const dist = Math.abs(p.x - relativeX);
      if (dist < minDist) {
        minDist = dist;
        closestIndex = idx;
      }
    });

    const closestPoint = points[closestIndex];
    if (closestPoint) {
      const tooltipX = (closestPoint.x / width) * rect.width;
      const avgY = (closestPoint.yIncome + closestPoint.yExpense) / 2;
      const tooltipY = (avgY / height) * rect.height;

      setTooltip({
        active: true,
        x: tooltipX,
        y: tooltipY,
        content: (
          <div>
            <div style={{ fontWeight: 700, marginBottom: '6px' }}>Progression: {closestPoint.key}</div>
            <div style={{ color: '#10b981', fontWeight: 600 }}>Total Inflow: ₹{closestPoint.runIncome}</div>
            <div style={{ color: '#ef4444', fontWeight: 600 }}>Total Outflow: ₹{closestPoint.runExpense}</div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '6px', paddingTop: '6px', fontWeight: 700 }}>
              Net Savings: ₹{closestPoint.runIncome - closestPoint.runExpense}
            </div>
          </div>
        )
      });
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="svg-chart-container"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTooltip({ active: false, x: 0, y: 0, content: null })}
      style={{ position: 'relative' }}
    >
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
        {/* Y Axis grids */}
        {[0, 0.25, 0.5, 0.75, 1].map((t, idx) => {
          const y = height - paddingBottom - t * chartHeight;
          const val = t * maxVal;
          return (
            <g key={idx}>
              <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} className="svg-chart-grid" />
              <text x={paddingLeft - 10} y={y + 4} textAnchor="end" className="svg-chart-label">
                ₹{val >= 1000 ? `${(val/1000).toFixed(0)}k` : val.toFixed(0)}
              </text>
            </g>
          );
        })}

        {/* X Labels */}
        {cumulativeData.map((d, i) => {
          const x = paddingLeft + (cumulativeData.length > 1 ? (i / (cumulativeData.length - 1)) * chartWidth : chartWidth / 2);
          return (
            <text key={i} x={x} y={height - paddingBottom + 20} textAnchor="middle" className="svg-chart-label">
              {d.key}
            </text>
          );
        })}

        {/* Cumulative lines */}
        {incomePath && <path d={incomePath} className="svg-chart-line" style={{ stroke: '#10b981', strokeWidth: 3.5 }} />}
        {expensePath && <path d={expensePath} className="svg-chart-line" style={{ stroke: '#ef4444', strokeWidth: 3.5 }} />}

        {/* Data points */}
        {points.map((p, idx) => (
          <g key={idx}>
            <circle cx={p.x} cy={p.yIncome} r="4" fill="#10b981" stroke="#060913" strokeWidth="2" />
            <circle cx={p.x} cy={p.yExpense} r="4" fill="#ef4444" stroke="#060913" strokeWidth="2" />
          </g>
        ))}
      </svg>
      <ChartTooltip active={tooltip.active} x={tooltip.x} y={tooltip.y} content={tooltip.content} />
    </div>
  );
};

/**
 * 3. Spending Donut Chart
 */
export const SVGDonutChart = ({ data = [] }) => {
  const containerRef = useRef(null);
  const [tooltip, setTooltip] = useState({ active: false, x: 0, y: 0, content: null });
  const [activeIndex, setActiveIndex] = useState(null);

  const cleanData = data.filter(d => d.amount > 0);

  if (cleanData.length === 0) {
    return (
      <div className="empty-state" style={{ height: '220px' }}>
        <p>No distribution logged yet</p>
      </div>
    );
  }

  const size = 180;
  const center = size / 2;
  const radius = 55;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius; // ~345.57

  const totalAmount = cleanData.reduce((sum, d) => sum + d.amount, 0);

  const COLORS = [
    '#6366f1', '#10b981', '#ef4444', '#f59e0b', '#0ea5e9',
    '#ec4899', '#8b5cf6', '#14b8a6', '#f43f5e', '#a855f7'
  ];

  let accumulatedPercentage = 0;

  const handleMouseMove = (e, index, item) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setActiveIndex(index);
    setTooltip({
      active: true,
      x,
      y,
      content: (
        <div>
          <div style={{ fontWeight: 700, color: COLORS[index % COLORS.length] }}>{item.category}</div>
          <div>Total: ₹{item.amount.toFixed(0)}</div>
          <div>Percentage: {item.percentage.toFixed(0)}%</div>
        </div>
      )
    });
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={center} cy={center} r={radius} fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth={strokeWidth} />
        {cleanData.map((item, idx) => {
          const percentage = item.amount / totalAmount;
          const strokeLength = percentage * circumference;
          const strokeOffset = circumference - (accumulatedPercentage * circumference);
          accumulatedPercentage += percentage;
          const color = COLORS[idx % COLORS.length];

          return (
            <circle
              key={idx}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={activeIndex === idx ? strokeWidth + 3 : strokeWidth}
              strokeDasharray={`${strokeLength} ${circumference}`}
              strokeDashoffset={strokeOffset}
              transform={`rotate(-90 ${center} ${center})`}
              style={{ transition: 'stroke-width 0.2s ease', cursor: 'pointer' }}
              onMouseMove={(e) => handleMouseMove(e, idx, item)}
              onMouseLeave={() => { setActiveIndex(null); setTooltip({ active: false, x: 0, y: 0, content: null }); }}
            />
          );
        })}
        <text x={center} y={center - 2} textAnchor="middle" style={{ fill: 'var(--text-secondary)', fontSize: '9px', fontWeight: 600, textTransform: 'uppercase' }}>
          Expenses
        </text>
        <text x={center} y={center + 12} textAnchor="middle" style={{ fill: 'var(--text-primary)', fontSize: '14px', fontWeight: 800 }}>
          ₹{totalAmount.toFixed(0)}
        </text>
      </svg>
      <ChartTooltip active={tooltip.active} x={tooltip.x} y={tooltip.y} content={tooltip.content} />
    </div>
  );
};

/**
 * 4. Comparative Column Bar Chart
 */
export const SVGBarChart = ({ data = [] }) => {
  const containerRef = useRef(null);
  const [tooltip, setTooltip] = useState({ active: false, x: 0, y: 0, content: null });

  if (!data || data.length === 0) {
    return (
      <div className="empty-state" style={{ height: '220px' }}>
        <p>No comparative logs</p>
      </div>
    );
  }

  const width = 500;
  const height = 220;
  const paddingLeft = 68;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxVal = Math.max(...data.map(d => d.amount), 10);
  const barSpacing = 16;
  const totalBarSpacing = barSpacing * (data.length - 1 || 1);
  const barWidth = Math.max((chartWidth - totalBarSpacing) / data.length, 6);

  return (
    <div ref={containerRef} style={{ position: 'relative' }} onMouseLeave={() => setTooltip({ active: false, x: 0, y: 0, content: null })}>
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
        {[0, 0.25, 0.5, 0.75, 1].map((t, idx) => {
          const y = height - paddingBottom - t * chartHeight;
          const val = t * maxVal;
          return (
            <g key={idx}>
              <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} className="svg-chart-grid" />
              <text x={paddingLeft - 10} y={y + 4} textAnchor="end" className="svg-chart-label">
                ₹{val >= 1000 ? `${(val/1000).toFixed(0)}k` : val.toFixed(0)}
              </text>
            </g>
          );
        })}

        {data.map((d, i) => {
          const x = paddingLeft + i * (barWidth + barSpacing);
          const barHeight = (d.amount / maxVal) * chartHeight;
          const y = height - paddingBottom - barHeight;

          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 2)}
                fill="var(--color-primary)"
                rx="2"
                style={{ cursor: 'pointer', transition: 'fill 0.2s ease' }}
                onMouseMove={(e) => {
                  const rect = containerRef.current.getBoundingClientRect();
                  setTooltip({
                    active: true,
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                    content: (
                      <div>
                        <strong>{d.label}</strong>
                        <div>₹{d.amount.toFixed(0)}</div>
                      </div>
                    )
                  });
                }}
              />
              <text x={x + barWidth / 2} y={height - paddingBottom + 18} textAnchor="middle" className="svg-chart-label" style={{ fontSize: '9px' }}>
                {d.label.length > 7 ? `${d.label.substring(0, 5)}..` : d.label}
              </text>
            </g>
          );
        })}
      </svg>
      <ChartTooltip active={tooltip.active} x={tooltip.x} y={tooltip.y} content={tooltip.content} />
    </div>
  );
};

/**
 * 5. Category Budget vs Actual Spent Chart (Double-Bar comparative)
 * Plots comparative double columns.
 */
export const SVGBudgetVsActualChart = ({ budgets = [], transactions = [] }) => {
  const containerRef = useRef(null);
  const [tooltip, setTooltip] = useState({ active: false, x: 0, y: 0, content: null });

  // Calculate spent for each budget category
  const comparisonData = budgets.map(b => {
    const spent = transactions
      .filter(t => t.type === 'expense' && t.category === b.category)
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      category: b.category,
      allocated: b.amount,
      spent
    };
  });

  if (comparisonData.length === 0) {
    return (
      <div className="empty-state" style={{ height: '220px' }}>
        <p>No active category budgets defined</p>
      </div>
    );
  }

  const width = 500;
  const height = 220;
  const paddingLeft = 68;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxVal = Math.max(
    ...comparisonData.map(d => Math.max(d.allocated, d.spent)), 
    100
  );

  const groupSpacing = 24;
  const barSpacing = 2; // Spacing between the double columns
  const totalGroupSpacing = groupSpacing * (comparisonData.length - 1 || 1);
  const groupWidth = Math.max((chartWidth - totalGroupSpacing) / comparisonData.length, 14);
  const barWidth = Math.max((groupWidth - barSpacing) / 2, 6);

  return (
    <div 
      ref={containerRef} 
      style={{ position: 'relative' }} 
      onMouseLeave={() => setTooltip({ active: false, x: 0, y: 0, content: null })}
    >
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
        {/* Grids */}
        {[0, 0.25, 0.5, 0.75, 1].map((t, idx) => {
          const y = height - paddingBottom - t * chartHeight;
          const val = t * maxVal;
          return (
            <g key={idx}>
              <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} className="svg-chart-grid" />
              <text x={paddingLeft - 10} y={y + 4} textAnchor="end" className="svg-chart-label">
                ₹{val >= 1000 ? `${(val/1000).toFixed(0)}k` : val.toFixed(0)}
              </text>
            </g>
          );
        })}

        {/* Double Columns */}
        {comparisonData.map((d, i) => {
          const xGroup = paddingLeft + i * (groupWidth + groupSpacing);
          const xAllocated = xGroup;
          const xSpent = xGroup + barWidth + barSpacing;

          const hAllocated = (d.allocated / maxVal) * chartHeight;
          const yAllocated = height - paddingBottom - hAllocated;

          const hSpent = (d.spent / maxVal) * chartHeight;
          const ySpent = height - paddingBottom - hSpent;

          // Color coded spent column based on exceeded thresholds
          const spentColor = d.spent > d.allocated 
            ? 'var(--color-danger)' 
            : d.spent >= d.allocated * 0.8 
              ? 'var(--color-warning)' 
              : 'var(--color-success)';

          return (
            <g key={i}>
              {/* Limit Bar */}
              <rect
                x={xAllocated}
                y={yAllocated}
                width={barWidth}
                height={Math.max(hAllocated, 2)}
                fill="rgba(99, 102, 241, 0.25)"
                stroke="var(--color-primary)"
                strokeWidth="1"
                rx="2"
                style={{ cursor: 'pointer' }}
                onMouseMove={(e) => {
                  const rect = containerRef.current.getBoundingClientRect();
                  setTooltip({
                    active: true,
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                    content: (
                      <div>
                        <strong>{d.category} (Limit)</strong>
                        <div style={{ color: 'var(--color-primary)' }}>Cap limit: ₹{d.allocated}</div>
                      </div>
                    )
                  });
                }}
              />

              {/* Spent Bar */}
              <rect
                x={xSpent}
                y={ySpent}
                width={barWidth}
                height={Math.max(hSpent, 2)}
                fill={spentColor}
                rx="2"
                style={{ cursor: 'pointer' }}
                onMouseMove={(e) => {
                  const rect = containerRef.current.getBoundingClientRect();
                  setTooltip({
                    active: true,
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                    content: (
                      <div>
                        <strong>{d.category} (Spent)</strong>
                        <div style={{ color: spentColor }}>Spent: ₹{d.spent} ({((d.spent/d.allocated)*100).toFixed(0)}%)</div>
                      </div>
                    )
                  });
                }}
              />

              {/* X label */}
              <text x={xGroup + groupWidth / 2} y={height - paddingBottom + 18} textAnchor="middle" className="svg-chart-label" style={{ fontSize: '9px' }}>
                {d.category.length > 7 ? `${d.category.substring(0, 5)}..` : d.category}
              </text>
            </g>
          );
        })}
      </svg>
      <ChartTooltip active={tooltip.active} x={tooltip.x} y={tooltip.y} content={tooltip.content} />
    </div>
  );
};
