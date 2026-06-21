import React, { useState } from 'react';
import { PlusIcon, TrashIcon, InfoIcon } from '../components/Icons';
import { Alert } from '../components/Alert';
import { DEFAULT_INCOME_CATEGORIES, DEFAULT_EXPENSE_CATEGORIES } from '../utils/storage';

export const Categories = ({ type, categories, onAddCategory, onDeleteCategory }) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const list = type === 'income' ? categories.income : categories.expense;
  const defaultList = type === 'income' ? DEFAULT_INCOME_CATEGORIES : DEFAULT_EXPENSE_CATEGORIES;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      setErrorMsg('Category name cannot be empty');
      return;
    }

    // Duplicate check
    const isDuplicate = list.some(c => c.toLowerCase() === trimmed.toLowerCase());
    if (isDuplicate) {
      setErrorMsg(`"${trimmed}" category already exists`);
      return;
    }

    onAddCategory(type, trimmed);
    setSuccessMsg(`Successfully created category "${trimmed}"`);
    setNewCategoryName('');
  };

  const handleDelete = (catName) => {
    // If it's a predefined category, warn/block
    if (defaultList.includes(catName)) {
      setErrorMsg('Predefined system categories cannot be deleted.');
      return;
    }

    if (window.confirm(`Are you sure you want to delete the category "${catName}"? This will not affect existing transactions but it will remove it from future drop-down options.`)) {
      onDeleteCategory(type, catName);
      setSuccessMsg(`Successfully removed category "${catName}"`);
      setErrorMsg('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Alert display */}
      {errorMsg && <Alert type="danger" message={errorMsg} />}
      {successMsg && <Alert type="success" message={successMsg} />}

      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1.5fr', 
          gap: '24px' 
        }}
        className="categories-layout-grid"
      >
        {/* Add Category Form Card */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '1.05rem' }}>Create Custom Category</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="cat-name">Category Name</label>
              <input
                id="cat-name"
                type="text"
                className="form-control"
                placeholder="e.g. Subscriptions"
                value={newCategoryName}
                onChange={(e) => { setNewCategoryName(e.target.value); setErrorMsg(''); }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '6px' }}>
              <PlusIcon size={16} /> Save Category
            </button>
          </form>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px', padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>
            <span style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
              <InfoIcon size={16} />
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Custom categories will instantly appear in the transaction forms and filters. Standard system categories are protected.
            </span>
          </div>
        </div>

        {/* Categories List Card */}
        <div className="card">
          <h3 style={{ marginBottom: '18px', fontSize: '1.05rem' }}>
            Current {type === 'income' ? 'Income' : 'Expense'} Categories
          </h3>

          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
              gap: '12px',
              maxHeight: '400px',
              overflowY: 'auto',
              paddingRight: '6px'
            }}
          >
            {list.map((cat, idx) => {
              const isDefault = defaultList.includes(cat);
              return (
                <div 
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    backgroundColor: isDefault ? 'var(--bg-input)' : 'rgba(99, 102, 241, 0.04)',
                    border: '1px solid',
                    borderColor: isDefault ? 'var(--border-color)' : 'rgba(99, 102, 241, 0.15)'
                  }}
                >
                  <span style={{ 
                    fontSize: '0.9rem', 
                    fontWeight: 600, 
                    color: isDefault ? 'var(--text-primary)' : 'var(--color-primary)' 
                  }}>
                    {cat}
                  </span>
                  {!isDefault && (
                    <button
                      className="btn-secondary"
                      title="Delete category"
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        padding: '2px', 
                        cursor: 'pointer',
                        color: 'var(--text-muted)' 
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-danger)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                      onClick={() => handleDelete(cat)}
                    >
                      <TrashIcon size={14} />
                    </button>
                  )}
                  {isDefault && (
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase' }}>
                      System
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .categories-layout-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
