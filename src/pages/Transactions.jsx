import React, { useState } from 'react';
import { Modal } from '../components/Modal';
import { Alert } from '../components/Alert';
import { 
  PlusIcon, 
  EditIcon, 
  TrashIcon, 
  SearchIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  CheckIcon,
  InfoIcon
} from '../components/Icons';
import { formatCurrency, formatDate } from '../utils/formatters';

// Simple Copy Icon for Duplication
const DuplicateIcon = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

export const Transactions = ({ 
  transactions = [], 
  onAddTransaction, 
  onEditTransaction, 
  onDeleteTransaction, 
  onDeleteTransactions, 
  categories, 
  settings 
}) => {
  const dateFormat = settings.dateFormat;

  // Search, Filter & Date/Amount States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Bulk operation states
  const [selectedIds, setSelectedIds] = useState([]);

  // Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [viewingTransaction, setViewingTransaction] = useState(null);

  // Form Field States
  const [txType, setTxType] = useState('expense');
  const [txAmount, setTxAmount] = useState('');
  const [txCategory, setTxCategory] = useState('');
  const [txDate, setTxDate] = useState('');
  const [txDescription, setTxDescription] = useState('');
  const [txNotes, setTxNotes] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const resetForm = () => {
    setTxType('expense');
    setTxAmount('');
    setTxCategory('');
    setTxDate(new Date().toISOString().substring(0, 10)); // Default to today
    setTxDescription('');
    setTxNotes('');
    setFormErrors({});
    setEditingTransaction(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tx) => {
    setEditingTransaction(tx);
    setTxType(tx.type);
    setTxAmount(tx.amount.toString());
    setTxCategory(tx.category);
    setTxDate(tx.date);
    setTxDescription(tx.description);
    setTxNotes(tx.notes || '');
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleDuplicate = (tx) => {
    // Open modal with identical values, reset id
    setEditingTransaction(null); // Create new
    setTxType(tx.type);
    setTxAmount(tx.amount.toString());
    setTxCategory(tx.category);
    setTxDate(tx.date);
    setTxDescription(`${tx.description} (Copy)`);
    setTxNotes(tx.notes || '');
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenViewDetails = (tx) => {
    setViewingTransaction(tx);
    setIsDetailModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!txAmount || isNaN(Number(txAmount)) || Number(txAmount) <= 0) {
      errors.amount = 'Amount is required and must be greater than 0';
    }
    if (!txCategory) {
      errors.category = 'Please select a category';
    }
    if (!txDate) {
      errors.date = 'Date is required';
    }
    if (!txType) {
      errors.type = 'Transaction type is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const data = {
      type: txType,
      amount: Number(txAmount),
      category: txCategory,
      date: txDate,
      description: txDescription || 'No description',
      notes: txNotes || ''
    };

    if (editingTransaction) {
      onEditTransaction(editingTransaction.id, data);
    } else {
      onAddTransaction(data);
    }
    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this transaction record?')) {
      onDeleteTransaction(id);
      setSelectedIds(prev => prev.filter(x => x !== id));
    }
  };

  // Bulk Actions
  const handleSelectRow = (e, id) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(x => x !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const pageIds = paginatedTransactions.map(t => t.id);
      setSelectedIds(prev => Array.from(new Set([...prev, ...pageIds])));
    } else {
      const pageIds = paginatedTransactions.map(t => t.id);
      setSelectedIds(prev => prev.filter(x => !pageIds.includes(x)));
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Are you sure you want to delete the ${selectedIds.length} selected transaction records?`)) {
      onDeleteTransactions(selectedIds);
      setSelectedIds([]);
      setCurrentPage(1);
    }
  };

  // 1. Filter logic
  const filteredTransactions = transactions.filter(t => {
    // Search filter
    const matchesSearch = 
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.amount.toString().includes(searchQuery);

    // Type filter
    const matchesType = filterType === 'all' || t.type === filterType;

    // Category filter
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;

    // Date range filter
    let matchesDate = true;
    if (startDate) matchesDate = matchesDate && t.date >= startDate;
    if (endDate) matchesDate = matchesDate && t.date <= endDate;

    // Amount range filter
    let matchesAmount = true;
    if (minAmount) matchesAmount = matchesAmount && t.amount >= Number(minAmount);
    if (maxAmount) matchesAmount = matchesAmount && t.amount <= Number(maxAmount);

    return matchesSearch && matchesType && matchesCategory && matchesDate && matchesAmount;
  });

  // 2. Sorting logic
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return a.date.localeCompare(b.date) || a.id.localeCompare(b.id);
      case 'highest':
        return b.amount - a.amount;
      case 'lowest':
        return a.amount - b.amount;
      case 'category-az':
        return a.category.localeCompare(b.category);
      case 'newest':
      default:
        return b.date.localeCompare(a.date) || b.id.localeCompare(a.id);
    }
  });

  // 3. Pagination logic
  const totalItems = sortedTransactions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const activePage = Math.min(currentPage, totalPages);
  const startIndex = (activePage - 1) * itemsPerPage;
  const paginatedTransactions = sortedTransactions.slice(startIndex, startIndex + itemsPerPage);

  const availableFormCategories = txType === 'income' ? categories.income : categories.expense;
  const allAvailableCategories = [...categories.income, ...categories.expense];

  // Check if all rows on current page are selected
  const isAllPageRowsSelected = paginatedTransactions.length > 0 && 
    paginatedTransactions.every(t => selectedIds.includes(t.id));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Search and Filters Panel */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '320px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <SearchIcon size={16} />
              </span>
              <input
                type="text"
                placeholder="Search description, category, amount..."
                className="form-control"
                style={{ paddingLeft: '40px' }}
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <button className="btn btn-primary" onClick={handleOpenAdd}>
              <PlusIcon size={16} /> Add Transaction
            </button>
          </div>
        </div>

        {/* Filters grid */}
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', 
            gap: '14px' 
          }}
        >
          {/* Type */}
          <div className="form-group" style={{ margin: 0 }}>
            <label>Type</label>
            <select className="form-control" value={filterType} onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}>
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          {/* Category */}
          <div className="form-group" style={{ margin: 0 }}>
            <label>Category</label>
            <select className="form-control" value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}>
              <option value="all">All Categories</option>
              {allAvailableCategories.map((c, idx) => (
                <option key={idx} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Date from */}
          <div className="form-group" style={{ margin: 0 }}>
            <label>From Date</label>
            <input type="date" className="form-control" value={startDate} onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }} />
          </div>

          {/* Date to */}
          <div className="form-group" style={{ margin: 0 }}>
            <label>To Date</label>
            <input type="date" className="form-control" value={endDate} onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }} />
          </div>

          {/* Min Amount */}
          <div className="form-group" style={{ margin: 0 }}>
            <label>Min Amount</label>
            <input type="number" className="form-control" placeholder="Min" value={minAmount} onChange={(e) => { setMinAmount(e.target.value); setCurrentPage(1); }} />
          </div>

          {/* Max Amount */}
          <div className="form-group" style={{ margin: 0 }}>
            <label>Max Amount</label>
            <input type="number" className="form-control" placeholder="Max" value={maxAmount} onChange={(e) => { setMaxAmount(e.target.value); setCurrentPage(1); }} />
          </div>

          {/* Sort By */}
          <div className="form-group" style={{ margin: 0 }}>
            <label>Sort By</label>
            <select className="form-control" value={sortBy} onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
              <option value="category-az">Category A-Z</option>
            </select>
          </div>
        </div>

        {/* Floating Bulk Operations Toolbar */}
        {selectedIds.length > 0 && (
          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '8px', 
              padding: '12px 18px',
              animation: 'fadeIn 0.2s ease'
            }}
          >
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-danger)' }}>
              {selectedIds.length} transaction records selected
            </span>
            <button className="btn btn-danger btn-sm" onClick={handleBulkDelete}>
              <TrashIcon size={14} /> Bulk Delete Selected
            </button>
          </div>
        )}
      </div>

      {/* Transaction Records Table */}
      <div className="card" style={{ padding: 0 }}>
        {paginatedTransactions.length === 0 ? (
          <div className="empty-state">
            <SearchIcon className="empty-state-icon" />
            <h3>No Transactions Added Yet</h3>
            <p>Start by recording your first transaction using the button above.</p>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px', paddingRight: 0 }}>
                      <input 
                        type="checkbox" 
                        checked={isAllPageRowsSelected} 
                        onChange={handleSelectAll} 
                        style={{ cursor: 'pointer' }}
                      />
                    </th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTransactions.map((tx) => (
                    <tr 
                      key={tx.id} 
                      onClick={() => handleOpenViewDetails(tx)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ paddingRight: 0 }} onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(tx.id)} 
                          onChange={(e) => handleSelectRow(e, tx.id)}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>
                      <td>
                        <span className={`badge ${tx.type === 'income' ? 'badge-income' : 'badge-expense'}`}>
                          {tx.type}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{tx.category}</td>
                      <td>{formatDate(tx.date, dateFormat)}</td>
                      <td>
                        <span style={{ 
                          display: 'block', 
                          maxWidth: '200px', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap' 
                        }}>
                          {tx.description}
                        </span>
                      </td>
                      <td style={{ 
                        fontWeight: 700, 
                        color: tx.type === 'income' ? 'var(--color-success)' : 'var(--text-primary)' 
                      }}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>
                      <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button className="btn btn-secondary btn-sm" style={{ padding: '6px' }} title="Duplicate" onClick={() => handleDuplicate(tx)}>
                            <DuplicateIcon size={13} />
                          </button>
                          <button className="btn btn-secondary btn-sm" style={{ padding: '6px' }} title="Edit" onClick={() => handleOpenEdit(tx)}>
                            <EditIcon size={13} />
                          </button>
                          <button className="btn btn-secondary btn-sm" style={{ padding: '6px', color: 'var(--color-danger)' }} title="Delete" onClick={() => handleDelete(tx.id)}>
                            <TrashIcon size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="pagination-controls">
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} entries
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="btn btn-secondary btn-sm"
                  disabled={activePage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                >
                  <ChevronLeftIcon size={14} /> Prev
                </button>
                <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.85rem', fontWeight: 600, padding: '0 8px' }}>
                  Page {activePage} of {totalPages}
                </span>
                <button 
                  className="btn btn-secondary btn-sm"
                  disabled={activePage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                >
                  Next <ChevronRightIcon size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* RECORD MODAL FORM (ADD / EDIT) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTransaction ? 'Edit Transaction Details' : 'Record New Transaction'}
      >
        <form onSubmit={handleSubmit}>
          {/* Transaction Type */}
          <div className="form-group">
            <label>Type</label>
            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button
                type="button"
                className={`btn ${txType === 'expense' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1 }}
                onClick={() => { setTxType('expense'); setTxCategory(''); }}
              >
                Expense
              </button>
              <button
                type="button"
                className={`btn ${txType === 'income' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1 }}
                onClick={() => { setTxType('income'); setTxCategory(''); }}
              >
                Income
              </button>
            </div>
          </div>

          {/* Amount input */}
          <div className="form-group">
            <label htmlFor="tx-amount">Amount (₹)</label>
            <input
              id="tx-amount"
              type="number"
              step="any"
              placeholder="e.g. 5000"
              className={`form-control ${formErrors.amount ? 'error' : ''}`}
              value={txAmount}
              onChange={(e) => setTxAmount(e.target.value)}
            />
            {formErrors.amount && <div className="form-error">{formErrors.amount}</div>}
          </div>

          {/* Category Dropdown */}
          <div className="form-group">
            <label htmlFor="tx-category">Category</label>
            <select
              id="tx-category"
              className={`form-control ${formErrors.category ? 'error' : ''}`}
              value={txCategory}
              onChange={(e) => setTxCategory(e.target.value)}
            >
              <option value="">-- Choose Category --</option>
              {availableFormCategories.map((c, idx) => (
                <option key={idx} value={c}>{c}</option>
              ))}
            </select>
            {formErrors.category && <div className="form-error">{formErrors.category}</div>}
          </div>

          {/* Transaction Date */}
          <div className="form-group">
            <label htmlFor="tx-date">Date</label>
            <input
              id="tx-date"
              type="date"
              className={`form-control ${formErrors.date ? 'error' : ''}`}
              value={txDate}
              onChange={(e) => setTxDate(e.target.value)}
            />
            {formErrors.date && <div className="form-error">{formErrors.date}</div>}
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="tx-desc">Description</label>
            <input
              id="tx-desc"
              type="text"
              placeholder="e.g. Office desk organizer"
              className="form-control"
              value={txDescription}
              onChange={(e) => setTxDescription(e.target.value)}
            />
          </div>

          {/* Extra field: Notes */}
          <div className="form-group">
            <label htmlFor="tx-notes">Private Notes</label>
            <textarea
              id="tx-notes"
              rows="3"
              placeholder="Record payment details, reference numbers, etc."
              className="form-control"
              value={txNotes}
              onChange={(e) => setTxNotes(e.target.value)}
              style={{ resize: 'none' }}
            />
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingTransaction ? 'Save Changes' : 'Record'}
            </button>
          </div>
        </form>
      </Modal>

      {/* DETAIL DRAWER / MODAL */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Transaction Summary Sheet"
      >
        {viewingTransaction && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className={`badge ${viewingTransaction.type === 'income' ? 'badge-income' : 'badge-expense'}`} style={{ fontSize: '0.8rem', padding: '4px 12px' }}>
                {viewingTransaction.type}
              </span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: viewingTransaction.type === 'income' ? 'var(--color-success)' : 'var(--text-primary)' }}>
                {viewingTransaction.type === 'income' ? '+' : '-'}{formatCurrency(viewingTransaction.amount)}
              </span>
            </div>
            
            <hr style={{ border: 0, borderTop: '1px solid var(--border-color)' }} />
            
            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '2px' }}>
                Category
              </span>
              <p style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                {viewingTransaction.category}
              </p>
            </div>

            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '2px' }}>
                Recorded Date
              </span>
              <p style={{ fontSize: '0.95rem', fontWeight: 500 }}>
                {formatDate(viewingTransaction.date, dateFormat)}
              </p>
            </div>

            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '2px' }}>
                Description
              </span>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                {viewingTransaction.description}
              </p>
            </div>

            {viewingTransaction.notes && (
              <div>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '2px' }}>
                  Private Notes
                </span>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-input)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', whiteSpace: 'pre-wrap' }}>
                  {viewingTransaction.notes}
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleOpenEdit(viewingTransaction);
                }}
              >
                Edit
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={() => setIsDetailModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};
