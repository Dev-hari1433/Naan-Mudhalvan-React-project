import React, { useState, useEffect, useRef } from 'react';
import { 
  calculateFinancialHealthScore, 
  calculateSpendingEfficiencyGrade,
  calculateTotalIncome,
  calculateTotalExpenses,
  calculateSavingsRate,
  aggregateByCategory 
} from '../utils/finance';

export const AIChatbot = ({ isOpen, onClose, transactions = [], budgets = [] }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);

  // Auto-scroll chat to latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Load initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sender: 'ai',
          text: "Hi! I am your Antigravity AI Wealth Assistant. Ask me how to use the dashboard, get tips on saving money, or request an explanation of your current Financial Health Score!",
          timestamp: new Date()
        }
      ]);
    }
  }, []);

  // AI Brain logic - parses text keywords and looks at actual transaction state
  const getAIResponse = (query) => {
    const text = query.toLowerCase();
    const income = calculateTotalIncome(transactions);
    const expenses = calculateTotalExpenses(transactions);
    const savingsRate = calculateSavingsRate(transactions);
    const healthScore = calculateFinancialHealthScore(transactions, budgets);
    const grade = calculateSpendingEfficiencyGrade(transactions, budgets);
    const expenseCategories = aggregateByCategory(transactions, 'expense');

    // 1. Help Guide query
    if (text.includes('use') || text.includes('help') || text.includes('how to start') || text.includes('how do i')) {
      return `Here is a quick guide on how to navigate this platform:
• Transactions tab: Log your daily earnings (Income) and outflows (Expense). You can duplicate entries or select multiple rows to bulk delete them.
• Budgeting tab: Establish monthly limits for categories like Food, Utilities, or Shopping. Alerts trigger when you reach 80% and 100% capacity.
• Analytics tab: Toggle daily, weekly, monthly, or yearly cashflow charts and review proportions.
• Reports tab: Compile printable statements and statements sheets in Indian Rupees (₹).`;
    }

    // 2. Health Score Explanation query
    if (text.includes('health') || text.includes('score') || text.includes('grade') || text.includes('efficiency')) {
      if (transactions.length === 0) {
        return "Your Financial Health Score is currently 0 because there is no recorded transaction history. Start by logging your salary or freelance income to compute your rating!";
      }

      let explanation = `Your Financial Health Score is ${healthScore}/100 (Grade: ${grade}). Here is the breakdown:
• Savings Rate: Your rate is ${savingsRate.toFixed(1)}%. (Deductions apply if savings are under 30%).
• Budget compliance: You have ${budgets.length} budgets set. `;

      const exceededBudgets = budgets.filter(b => {
        const spent = transactions.filter(t => t.type === 'expense' && t.category === b.category).reduce((sum, t) => sum + t.amount, 0);
        return spent > b.amount;
      });

      if (exceededBudgets.length > 0) {
        explanation += `Warning: ${exceededBudgets.length} budgets have been exceeded (${exceededBudgets.map(b => b.category).join(', ')}). This deducted points from your score.`;
      } else {
        explanation += "All active budgets are within safe thresholds.";
      }

      if (expenses > income) {
        explanation += "\n• Warning: Your cash outflow exceeds inflow, which heavily penalizes your rating.";
      }

      return explanation;
    }

    // 3. Savings Tips query
    if (text.includes('save') || text.includes('tips') || text.includes('reduce') || text.includes('lower') || text.includes('expense')) {
      if (transactions.length === 0 || expenses === 0) {
        return "You haven't recorded any expenses yet! To give you personalized advice, please log your transactions. In general, I recommend saving at least 20% to 30% of your salary first (the pay-yourself-first rule).";
      }

      const topCat = expenseCategories[0];
      let tips = `Analyzing your database:
• Your highest spending category is ${topCat.category} at ₹${topCat.amount} (${topCat.percentage.toFixed(0)}% of total outflows).
• Personalized Recommendation: Try creating a budget cap for "${topCat.category}" at ₹${(topCat.amount * 0.85).toFixed(0)} (15% below current). This small shift could save you ₹${(topCat.amount * 0.15).toFixed(0)} this month!
• Rule of Thumb: Follow the 50/30/20 budget framework. 50% for Needs, 30% for Wants, and 20% straight to Savings/Investments.`;

      return tips;
    }

    // 4. Budget limits details query
    if (text.includes('budget') || text.includes('limit') || text.includes('spent') || text.includes('cap')) {
      if (budgets.length === 0) {
        return "You have no budgets set up. I highly recommend clicking 'Create Spending Cap' in the Budgeting tab. Setting limits is proven to decrease impulse buying by up to 22%!";
      }

      let budgetList = "Current active spending caps:\n";
      budgets.forEach(b => {
        const spent = transactions.filter(t => t.type === 'expense' && t.category === b.category).reduce((sum, t) => sum + t.amount, 0);
        const utilization = b.amount > 0 ? (spent / b.amount) * 100 : 0;
        budgetList += `• ${b.category}: Spent ₹${spent} / ₹${b.amount} (${utilization.toFixed(0)}%)\n`;
      });
      return budgetList;
    }

    // Generic fallback
    return "I'm not sure I understand that query. You can ask me 'How do I save money?', 'Explain my Health Score', 'How to use this app?' or 'Show my budgets' for tailored advice.";
  };

  const handleSend = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // Append user message
    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    
    // Simulate Typing
    setIsTyping(true);
    setTimeout(() => {
      const responseText = getAIResponse(trimmed);
      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="chatbot-sidebar"
      style={{
        width: '320px',
        backgroundColor: 'var(--bg-sidebar)',
        backdropFilter: 'var(--backdrop-blur)',
        borderLeft: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'fixed',
        right: 0,
        top: 0,
        zIndex: 60,
        boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.4)',
        animation: 'slideLeft 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
      }}
    >
      {/* Header */}
      <div 
        style={{ 
          height: 'var(--header-height)', 
          padding: '0 20px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-color)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.25rem' }}>🤖</span>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>Antigravity AI</h3>
            <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 600 }}>• Active Wealth Engine</span>
          </div>
        </div>
        <button 
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.1rem' }}
        >
          ✕
        </button>
      </div>

      {/* Messages Log area */}
      <div 
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '20px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '14px' 
        }}
      >
        {messages.map((m) => {
          const isAI = m.sender === 'ai';
          return (
            <div 
              key={m.id}
              style={{
                alignSelf: isAI ? 'flex-start' : 'flex-end',
                maxWidth: '85%',
                backgroundColor: isAI ? 'var(--bg-input)' : 'var(--color-primary-light)',
                border: '1px solid',
                borderColor: isAI ? 'var(--border-color)' : 'rgba(99, 102, 241, 0.2)',
                color: 'var(--text-primary)',
                padding: '10px 14px',
                borderRadius: isAI ? '0px 12px 12px 12px' : '12px 12px 0px 12px',
                fontSize: '0.82rem',
                lineHeight: 1.45,
                whiteSpace: 'pre-wrap',
                animation: 'fadeIn 0.2s ease'
              }}
            >
              {m.text}
            </div>
          );
        })}

        {isTyping && (
          <div 
            style={{ 
              alignSelf: 'flex-start',
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              padding: '10px 14px',
              borderRadius: '0px 12px 12px 12px',
              fontSize: '0.8rem',
              fontStyle: 'italic'
            }}
          >
            Assistant is typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Suggestions */}
      <div 
        style={{ 
          padding: '10px 20px', 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '6px',
          borderTop: '1px solid var(--border-color)',
          backgroundColor: 'rgba(255,255,255,0.01)'
        }}
      >
        {[
          { label: '💡 How to save?', text: 'How to save money?' },
          { label: '📊 Explain Score', text: 'Explain my Health Score' },
          { label: '🛠️ Guide', text: 'How to use this app?' }
        ].map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip.text)}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              backgroundColor: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              fontSize: '0.7rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'var(--transition-smooth)'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-primary-light)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Input container */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-color)' }}>
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(inputText); }}
          style={{ display: 'flex', gap: '8px' }}
        >
          <input
            type="text"
            className="form-control"
            style={{ padding: '10px 12px', fontSize: '0.85rem' }}
            placeholder="Type your query..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '0 16px', fontSize: '0.85rem' }}>
            Send
          </button>
        </form>
      </div>

      <style>{`
        @keyframes slideLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};
