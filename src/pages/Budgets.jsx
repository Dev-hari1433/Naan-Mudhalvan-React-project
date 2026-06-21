import React, { useState } from 'react';
import { Modal } from '../components/Modal';
import { Alert } from '../components/Alert';
import { PlusIcon, EditIcon, TrashIcon, BudgetsIcon } from '../components/Icons';
import { calculateBudgetUtilization } from '../utils/finance';
import { formatCurrency } from '../utils/formatters';

export const Budgets = ({ 
  budgets = [], 
  transactions = [], 
  onAddBudget, 
  onEditBudget, 
  onDeleteBudget, 
  categories, 
  settings 
}) => {
  // Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  
  const [budgetCategory, setBudgetCategory] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [budgetPeriod, setBudgetPeriod] = useState('monthly');
  const [formErrors, setFormErrors] = useState({});

  const resetForm = () => {
    setBudgetCategory('');
    setBudgetAmount('');
    setBudgetPeriod('monthly');
    setFormErrors({});
    setEditingBudget(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b) => {
    setEditingBudget(b);
    setBudgetCategory(b.category);
    setBudgetAmount(b.amount.toString());
    setBudgetPeriod(b.period);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this budget boundary?')) {
      onDeleteBudget(id);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!budgetCategory) {
      errors.category = 'Please select a category';
    }
    if (!budgetAmount || isNaN(Number(budgetAmount)) || Number(budgetAmount) <= 0) {
      errors.amount = 'Amount is required and must be greater than 0';
    }
    if (!budgetPeriod) {
      errors.period = 'Please select a period';
    }

    if (!editingBudget) {
      const isDuplicate = budgets.some(b => b.category === budgetCategory && b.period === budgetPeriod);
      if (isDuplicate) {
        errors.category = `A ${budgetPeriod} budget for "${budgetCategory}" already exists.`;
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const data = {
      category: budgetCategory,
      amount: Number(budgetAmount),
      period: budgetPeriod
    };

    if (editingBudget) {
      onEditBudget(editingBudget.id, data);
    } else {
      onAddBudget(data);
    }

    setIsModalOpen(false);
    resetForm();
  };

  const expenseCategories = categories.expense;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Active limits heading */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Category Boundaries</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Establish alerts for expense limits. Alerts trigger at 80% utilization and when limits are exceeded.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <PlusIcon size={16} /> Create Spending Cap
        </button>
      </div>

      {/* Budgets layout grid */}
      {budgets.length === 0 ? (
        <div className="card empty-state">
          <BudgetsIcon className="empty-state-icon" />
          <h3>No Category Budgets Configured</h3>
          <p>Define spending limits for expense categories like Food, Utilities, or Shopping to receive warnings.</p>
          <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
            <PlusIcon size={14} /> Establish First Budget
          </button>
        </div>
      ) : (
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
            gap: '24px' 
          }}
        >
          {budgets.map((b) => {
            const util = calculateBudgetUtilization(b, transactions);
            const percent = Math.min(util.utilization, 100);

            // Health color classes
            let progressClass = 'success';
            let cardStyleClass = '';

            if (util.isExceeded) {
              progressClass = 'danger';
              cardStyleClass = 'budget-card-exceeded';
            } else if (util.isWarning) {
              progressClass = 'warning';
              cardStyleClass = 'budget-card-warning';
            }

            return (
              <div key={b.id} className={`card ${cardStyleClass}`} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Header info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{b.category}</h3>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {b.period} Spending Cap
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="btn btn-secondary btn-sm" 
                      style={{ padding: '6px 10px' }}
                      title="Edit"
                      onClick={() => handleOpenEdit(b)}
                    >
                      <EditIcon size={12} />
                    </button>
                    <button 
                      className="btn btn-secondary btn-sm" 
                      style={{ padding: '6px 10px', color: 'var(--color-danger)' }}
                      title="Delete"
                      onClick={() => handleDelete(b.id)}
                    >
                      <TrashIcon size={12} />
                    </button>
                  </div>
                </div>

                {/* Utilization gauge */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    <span>Progress Meter</span>
                    <span style={{ 
                      color: util.isExceeded ? 'var(--color-danger)' : util.isWarning ? 'var(--color-warning)' : 'var(--color-success)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span style={{ 
                        width: '6px', 
                        height: '6px', 
                        borderRadius: '50%', 
                        backgroundColor: 'currentColor',
                        boxShadow: '0 0 6px currentColor'
                      }} />
                      {util.utilization.toFixed(0)}%
                    </span>
                  </div>
                  <div className="progress-bar-container">
                    <div 
                      className={`progress-bar ${progressClass}`} 
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Grid analytics */}
                <div 
                  style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '12px', 
                    backgroundColor: 'var(--bg-input)', 
                    padding: '12px', 
                    borderRadius: '10px',
                    fontSize: '0.8rem' 
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '2px' }}>Spent</span>
                    <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                      {formatCurrency(util.spent)}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '2px' }}>Limit</span>
                    <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                      {formatCurrency(util.allocated)}
                    </span>
                  </div>
                </div>

                {/* Status bottom warnings */}
                <div style={{ marginTop: '4px' }}>
                  {util.isExceeded ? (
                    <Alert type="danger" message={`${b.category} budget exceeded.`} />
                  ) : util.isWarning ? (
                    <Alert type="warning" message={`${b.category} budget is ${util.utilization.toFixed(0)}% utilized.`} />
                  ) : (
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 600 }}>
                      Remaining Balance: {formatCurrency(util.remaining)}
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT BUDGET MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBudget ? 'Edit Spending Cap' : 'Define Spending Cap'}
      >
        <form onSubmit={handleSubmit}>
          {/* Category Dropdown */}
          <div className="form-group">
            <label htmlFor="budget-cat">Category Selection</label>
            <select
              id="budget-cat"
              className={`form-control ${formErrors.category ? 'error' : ''}`}
              value={budgetCategory}
              onChange={(e) => setBudgetCategory(e.target.value)}
              disabled={editingBudget !== null}
            >
              <option value="">-- Choose Category --</option>
              {expenseCategories.map((c, idx) => (
                <option key={idx} value={c}>{c}</option>
              ))}
            </select>
            {formErrors.category && <div className="form-error">{formErrors.category}</div>}
          </div>

          {/* Amount input */}
          <div className="form-group">
            <label htmlFor="budget-amt">Spent Cap Limit (₹)</label>
            <input
              id="budget-amt"
              type="number"
              step="any"
              placeholder="e.g. 10000"
              className={`form-control ${formErrors.amount ? 'error' : ''}`}
              value={budgetAmount}
              onChange={(e) => setBudgetAmount(e.target.value)}
            />
            {formErrors.amount && <div className="form-error">{formErrors.amount}</div>}
          </div>

          {/* Period */}
          <div className="form-group">
            <label htmlFor="budget-period">Period Interval</label>
            <select
              id="budget-period"
              className={`form-control ${formErrors.period ? 'error' : ''}`}
              value={budgetPeriod}
              onChange={(e) => setBudgetPeriod(e.target.value)}
              disabled={editingBudget !== null}
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
            {formErrors.period && <div className="form-error">{formErrors.period}</div>}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingBudget ? 'Save Changes' : 'Define Cap'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
