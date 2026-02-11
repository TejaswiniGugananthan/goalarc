import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Target, CreditCard, Plus, Edit, DollarSign, Trash2,
  User, Settings, LogOut, Home, BarChart3, FileText, Brain, CheckCircle, X,
  ArrowUpCircle, ArrowDownCircle, Calendar
} from 'lucide-react';

// Styles object for the dashboard
const styles = {
  // Layout
  container: {
    minHeight: '100vh',
    display: 'flex',
    background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    position: 'relative'
  },
  
  // Sidebar
  sidebar: {
    width: '280px',
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(20px)',
    borderRight: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    height: '100vh',
    zIndex: 100
  },
  logoWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '32px'
  },
  logoIcon: {
    width: '44px',
    height: '44px',
    background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 20px rgba(139, 92, 246, 0.3)'
  },
  logoText: {
    fontSize: '24px',
    fontWeight: '800',
    color: 'white',
    letterSpacing: '0.5px'
  },
  userCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    padding: '16px',
    marginBottom: '32px',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  userAvatar: {
    width: '48px',
    height: '48px',
    background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  userName: {
    color: 'white',
    fontWeight: '600',
    fontSize: '15px',
    margin: 0
  },
  userEmail: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '13px',
    margin: '4px 0 0 0'
  },
  navItem: (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    borderRadius: '12px',
    cursor: 'pointer',
    marginBottom: '8px',
    transition: 'all 0.3s ease',
    background: active ? 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' : 'transparent',
    boxShadow: active ? '0 8px 20px rgba(139, 92, 246, 0.3)' : 'none',
    border: 'none',
    width: '100%',
    textAlign: 'left'
  }),
  navIcon: {
    width: '20px',
    height: '20px',
    color: 'white'
  },
  navLabel: (active) => ({
    color: active ? 'white' : 'rgba(255, 255, 255, 0.7)',
    fontWeight: active ? '600' : '500',
    fontSize: '15px'
  }),
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    borderRadius: '12px',
    cursor: 'pointer',
    background: 'transparent',
    border: 'none',
    width: '100%',
    marginTop: 'auto'
  },

  // Main content area
  mainContent: {
    flex: 1,
    marginLeft: '280px',
    padding: '32px 40px',
    overflowY: 'auto'
  },
  
  // Top action bar
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px'
  },
  welcomeTitle: {
    fontSize: '32px',
    fontWeight: '800',
    color: 'white',
    margin: 0
  },
  welcomeSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '16px',
    margin: '8px 0 0 0'
  },
  actionButtons: {
    display: 'flex',
    gap: '16px'
  },
  actionBtn: (primary) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'all 0.3s ease',
    border: primary ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
    background: primary ? 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' : 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    boxShadow: primary ? '0 4px 15px rgba(139, 92, 246, 0.3)' : 'none'
  }),
  
  // Stats cards
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
    marginBottom: '32px'
  },
  statCard: {
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    padding: '24px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
  },
  statHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  statIcon: (color) => ({
    width: '52px',
    height: '52px',
    background: color,
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }),
  statChange: (positive) => ({
    color: positive ? '#22c55e' : '#ef4444',
    fontSize: '14px',
    fontWeight: '600'
  }),
  statValue: {
    fontSize: '28px',
    fontWeight: '800',
    color: 'white',
    margin: '0 0 4px 0'
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '14px',
    margin: 0
  },
  
  // Goals section
  sectionTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: 'white',
    margin: '0 0 24px 0'
  },
  goalsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '24px'
  },
  goalCard: (completed) => ({
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    padding: '24px',
    border: completed ? '2px solid #22c55e' : '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'transform 0.3s ease'
  }),
  goalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  goalName: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'white',
    margin: 0
  },
  goalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  goalLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '14px'
  },
  goalValue: (color) => ({
    color: color || 'white',
    fontWeight: '600',
    fontSize: '15px'
  }),
  progressBar: {
    width: '100%',
    height: '10px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    overflow: 'hidden',
    marginTop: '16px'
  },
  progressFill: (percent, completed) => ({
    width: `${Math.min(percent, 100)}%`,
    height: '100%',
    background: completed ? '#22c55e' : 'linear-gradient(90deg, #8B5CF6 0%, #7C3AED 100%)',
    borderRadius: '10px',
    transition: 'width 0.5s ease'
  }),
  aiBox: {
    background: 'rgba(139, 92, 246, 0.15)',
    borderRadius: '12px',
    padding: '16px',
    marginTop: '20px',
    border: '1px solid rgba(139, 92, 246, 0.3)'
  },
  aiHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px'
  },
  aiTitle: {
    color: '#a78bfa',
    fontSize: '13px',
    fontWeight: '600',
    margin: 0
  },
  aiText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: '13px',
    lineHeight: '1.5',
    margin: 0
  },
  
  // Transactions list
  transactionsList: {
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    padding: '24px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    marginTop: '32px'
  },
  transactionItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    marginBottom: '12px',
    border: '1px solid rgba(255, 255, 255, 0.08)'
  },
  transactionLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  transactionIcon: (isIncome) => ({
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: isIncome ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'
  }),
  transactionDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  transactionDesc: {
    color: 'white',
    fontWeight: '600',
    fontSize: '15px',
    margin: 0
  },
  transactionDate: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '13px',
    margin: 0
  },
  transactionAmount: (isIncome) => ({
    color: isIncome ? '#22c55e' : '#ef4444',
    fontWeight: '700',
    fontSize: '16px'
  }),
  deleteBtn: {
    background: 'rgba(239, 68, 68, 0.2)',
    border: 'none',
    borderRadius: '8px',
    padding: '8px',
    cursor: 'pointer',
    marginLeft: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  // Analysis chart
  chartContainer: {
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    padding: '32px',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  chartTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'white',
    margin: '0 0 24px 0'
  },
  chartArea: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: '250px',
    padding: '20px 0'
  },
  chartBar: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px'
  },
  barGroup: {
    display: 'flex',
    gap: '6px',
    alignItems: 'flex-end',
    height: '200px'
  },
  bar: (height, color) => ({
    width: '32px',
    height: `${Math.max(height, 2)}%`,
    background: color,
    borderRadius: '6px 6px 0 0',
    transition: 'height 0.5s ease'
  }),
  chartLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '13px',
    fontWeight: '500'
  },
  legend: {
    display: 'flex',
    justifyContent: 'center',
    gap: '32px',
    marginTop: '24px'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  legendDot: (color) => ({
    width: '14px',
    height: '14px',
    background: color,
    borderRadius: '4px'
  }),
  legendText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '14px'
  },
  
  // Modal
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modalContent: {
    background: 'linear-gradient(135deg, #312e81 0%, #4c1d95 100%)',
    borderRadius: '24px',
    padding: '32px',
    width: '100%',
    maxWidth: '440px',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  modalTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: 'white',
    margin: 0
  },
  modalClose: {
    background: 'rgba(255, 255, 255, 0.1)',
    border: 'none',
    borderRadius: '10px',
    padding: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  input: {
    width: '100%',
    padding: '16px',
    background: 'rgba(255, 255, 255, 0.08)',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: 'white',
    fontSize: '15px',
    marginBottom: '16px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.3s ease'
  },
  select: {
    width: '100%',
    padding: '16px',
    background: 'rgba(255, 255, 255, 0.08)',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: 'white',
    fontSize: '15px',
    marginBottom: '16px',
    outline: 'none',
    boxSizing: 'border-box',
    cursor: 'pointer'
  },
  modalButtons: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px'
  },
  modalBtn: (primary) => ({
    flex: 1,
    padding: '14px',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
    background: primary ? 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' : 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    transition: 'all 0.3s ease'
  }),

  // Empty state
  emptyState: {
    textAlign: 'center',
    padding: '60px 40px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '16px',
    margin: 0
  }
};

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showEditTransaction, setShowEditTransaction] = useState(false);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);
  const [expandedTransactionId, setExpandedTransactionId] = useState(null);
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [fundAmount, setFundAmount] = useState('');
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' });
  
  // Form states
  const [goalForm, setGoalForm] = useState({ name: '', target: '', timeLeft: '' });
  const [transactionForm, setTransactionForm] = useState({ type: '', description: '', amount: '', category: '' });
  
  // Data states - Start with empty arrays (zero data for new users)
  const [goals, setGoals] = useState([]);
  const [transactions, setTransactions] = useState([]);
  
  const navigate = useNavigate();

  // Load user and their data from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/auth');
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    // Load notification preferences from user data
    setNotificationsEnabled(parsedUser.notificationsEnabled !== false);
    setEmailNotificationsEnabled(parsedUser.emailNotificationsEnabled !== false);
    
    // Load user-specific data
    const userDataKey = `goalArc_${parsedUser.email}`;
    const savedData = localStorage.getItem(userDataKey);
    if (savedData) {
      const { goals: savedGoals, transactions: savedTransactions } = JSON.parse(savedData);
      setGoals(savedGoals || []);
      setTransactions(savedTransactions || []);
    }
  }, [navigate]);

  // Save data whenever goals or transactions change
  useEffect(() => {
    if (user) {
      const userDataKey = `goalArc_${user.email}`;
      localStorage.setItem(userDataKey, JSON.stringify({ goals, transactions }));
    }
  }, [goals, transactions, user]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  };

  // Calculate totals from transactions
  const calculateTotals = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
    });
    
    const monthlyIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const monthlyExpense = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const balance = totalIncome - totalExpense;
    
    return { monthlyIncome, monthlyExpense, totalIncome, totalExpense, balance };
  };

  // Calculate goal progress
  const calculateGoalProgress = () => {
    if (goals.length === 0) return 0;
    const totalProgress = goals.reduce((sum, g) => sum + Math.min((g.current / g.target) * 100, 100), 0);
    return Math.round(totalProgress / goals.length);
  };

  // Add transaction
  const handleAddTransaction = () => {
    if (!transactionForm.type || !transactionForm.description || !transactionForm.amount) return;
    
    const newTransaction = {
      id: Date.now(),
      type: transactionForm.type,
      description: transactionForm.description,
      amount: parseFloat(transactionForm.amount),
      category: transactionForm.category || 'General',
      date: new Date().toISOString()
    };
    
    setTransactions([newTransaction, ...transactions]);
    setTransactionForm({ type: '', description: '', amount: '', category: '' });
    setShowAddTransaction(false);
  };

  // Delete transaction
  const handleDeleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  // Edit transaction
  const handleEditClick = (transaction) => {
    setEditingTransaction(transaction);
    setTransactionForm({
      type: transaction.type,
      description: transaction.description,
      amount: transaction.amount.toString(),
      category: transaction.category
    });
    setShowEditTransaction(true);
  };

  const handleUpdateTransaction = () => {
    if (!transactionForm.type || !transactionForm.description || !transactionForm.amount) return;
    
    setTransactions(transactions.map(t => 
      t.id === editingTransaction.id 
        ? { ...t, ...transactionForm, amount: parseFloat(transactionForm.amount) }
        : t
    ));
    setTransactionForm({ type: '', description: '', amount: '', category: '' });
    setShowEditTransaction(false);
    setEditingTransaction(null);
  };

  // Add goal
  const handleAddGoal = () => {
    if (!goalForm.name || !goalForm.target || !goalForm.timeLeft) return;
    
    // Store as "X months" format for display
    const months = parseInt(goalForm.timeLeft);
    const timeLeftFormatted = months === 1 ? '1 month' : `${months} months`;
    
    const newGoal = {
      id: Date.now(),
      name: goalForm.name,
      target: parseFloat(goalForm.target),
      current: 0,
      timeLeft: timeLeftFormatted,
      completed: false
    };
    
    setGoals([...goals, newGoal]);
    setGoalForm({ name: '', target: '', timeLeft: '' });
    setShowAddGoal(false);
  };

  // Add to goal
  const handleAddToGoal = (goalId, amount) => {
    setGoals(goals.map(g => {
      if (g.id === goalId) {
        const newCurrent = g.current + amount;
        return {
          ...g,
          current: newCurrent,
          completed: newCurrent >= g.target,
          timeLeft: newCurrent >= g.target ? 'Completed' : g.timeLeft
        };
      }
      return g;
    }));
  };

  // Delete goal
  const handleDeleteGoal = (goalId) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      setGoals(goals.filter(g => g.id !== goalId));
    }
  };

  // Get chart data from transactions
  const getChartData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const chartMonths = [];
    
    for (let i = 4; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      chartMonths.push(months[monthIndex]);
    }
    
    return chartMonths.map((month, idx) => {
      const monthIndex = (currentMonth - (4 - idx) + 12) % 12;
      const year = new Date().getFullYear();
      
      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === monthIndex && tDate.getFullYear() === year;
      });
      
      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      const expense = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      return { month, income, expense };
    });
  };

  // Parse time period from string like "3 months", "6 weeks", "1 year", or just "6" (assumed months)
  const parseTimePeriod = (timeStr) => {
    if (!timeStr || timeStr === 'Completed') return 0;
    
    // If it's just a number, assume months
    const justNumber = timeStr.toString().trim().match(/^(\d+)$/);
    if (justNumber) {
      return parseInt(justNumber[1]);
    }
    
    // Try to parse format like "3 months", "6 weeks", "1 year"
    const match = timeStr.toLowerCase().match(/(\d+)\s*(month|week|year|day)/i);
    if (!match) {
      // Try extracting just the number from any string
      const numMatch = timeStr.match(/(\d+)/);
      return numMatch ? parseInt(numMatch[1]) : 0;
    }
    
    const num = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    if (unit.startsWith('year')) return num * 12;
    if (unit.startsWith('week')) return Math.ceil(num / 4);
    if (unit.startsWith('day')) return Math.ceil(num / 30);
    return num; // months
  };

  // Get spending analysis by category
  const getSpendingAnalysis = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Current month expenses by category
    const currentMonthExpenses = transactions.filter(t => {
      const date = new Date(t.date);
      return t.type === 'expense' && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    // Last month expenses by category
    const lastMonthExpenses = transactions.filter(t => {
      const date = new Date(t.date);
      return t.type === 'expense' && date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
    });

    // Group by category
    const groupByCategory = (txns) => {
      return txns.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + parseFloat(t.amount);
        return acc;
      }, {});
    };

    const currentByCategory = groupByCategory(currentMonthExpenses);
    const lastByCategory = groupByCategory(lastMonthExpenses);

    // Find categories with increased spending
    const increasedSpending = [];
    Object.keys(currentByCategory).forEach(category => {
      const current = currentByCategory[category] || 0;
      const last = lastByCategory[category] || 0;
      if (current > last && last > 0) {
        increasedSpending.push({
          category,
          current,
          last,
          increase: current - last,
          percentIncrease: Math.round(((current - last) / last) * 100)
        });
      }
    });

    // Sort by increase amount
    increasedSpending.sort((a, b) => b.increase - a.increase);

    // Get top spending categories
    const topCategories = Object.entries(currentByCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    // Calculate monthly income
    const currentMonthIncome = transactions.filter(t => {
      const date = new Date(t.date);
      return t.type === 'income' && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    }).reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const totalCurrentExpense = Object.values(currentByCategory).reduce((a, b) => a + b, 0);
    const savingsRate = currentMonthIncome > 0 ? Math.round(((currentMonthIncome - totalCurrentExpense) / currentMonthIncome) * 100) : 0;

    return {
      increasedSpending,
      topCategories,
      currentMonthIncome,
      totalCurrentExpense,
      savingsRate,
      currentByCategory,
      lastByCategory
    };
  };

  const getAISuggestion = (goal) => {
    const progress = (goal.current / goal.target) * 100;
    const remaining = goal.target - goal.current;
    const months = parseTimePeriod(goal.timeLeft);
    const analysis = getSpendingAnalysis();
    
    if (goal.completed) return '🎉 Goal completed! Consider setting a new financial target.';
    if (months === 0) return '🎯 Set a time period to get personalized savings advice.';
    
    const monthlyNeeded = Math.round(remaining / months);
    const weeklyNeeded = Math.round(remaining / (months * 4));
    const dailyNeeded = Math.round(remaining / (months * 30));

    // Check if there's increased spending to reduce
    if (analysis.increasedSpending.length > 0) {
      const topIncrease = analysis.increasedSpending[0];
      const potentialSavings = topIncrease.increase;
      
      if (potentialSavings >= monthlyNeeded * 0.3) {
        return `💡 You spent ₹${topIncrease.increase.toLocaleString()} more on ${topIncrease.category} this month (${topIncrease.percentIncrease}% increase). Reducing this to last month's level could help you reach "${goal.name}" ${Math.ceil(potentialSavings / monthlyNeeded)} months faster!`;
      }
    }

    // Check savings rate
    if (analysis.savingsRate < 20 && analysis.currentMonthIncome > 0) {
      return `⚠️ Your savings rate is ${analysis.savingsRate}%. Try the 50/30/20 rule - save ₹${Math.round(analysis.currentMonthIncome * 0.2).toLocaleString()}/month to reach your goal of ₹₹{goal.target.toLocaleString()} in ${months} months.`;
    }

    // Top spending category advice
    if (analysis.topCategories.length > 0) {
      const topCategory = analysis.topCategories[0];
      const topAmount = topCategory[1];
      const cutPercent = 20;
      const potentialMonthlySavings = Math.round(topAmount * (cutPercent / 100));
      const totalSavings = potentialMonthlySavings * months;
      
      if (progress < 30 && potentialMonthlySavings > 0) {
        return `📊 Your top expense is ${topCategory[0]} at ₹${topAmount.toLocaleString()}/month. Cut ${cutPercent}% to save ₹${potentialMonthlySavings.toLocaleString()}/month × ${months} months = ₹${totalSavings.toLocaleString()} towards "${goal.name}"!`;
      }
    }

    // Check if goal is achievable with current income
    if (analysis.currentMonthIncome > 0 && monthlyNeeded > analysis.currentMonthIncome * 0.5) {
      const achievableMonths = Math.ceil(remaining / (analysis.currentMonthIncome * 0.3));
      return `🤔 Saving ₹${monthlyNeeded.toLocaleString()}/month is ${Math.round((monthlyNeeded / analysis.currentMonthIncome) * 100)}% of your income. Consider extending to ${achievableMonths} months for a more comfortable ₹${Math.round(remaining / achievableMonths).toLocaleString()}/month target.`;
    }

    // Daily challenge suggestion
    if (dailyNeeded <= 500) {
      return `☕ Skip one small expense daily! Just ₹${dailyNeeded.toLocaleString()}/day = ₹${monthlyNeeded.toLocaleString()}/month. You'll reach ₹₹{goal.target.toLocaleString()} in ${months} months. Small habits, big wins!`;
    }

    // Progress-based suggestions
    if (progress > 80) {
      const weeksLeft = Math.ceil((months * 4) * (1 - progress / 100));
      return `🔥 Almost there! Just ₹${weeklyNeeded.toLocaleString()} weekly for ${weeksLeft} more weeks. You're ${Math.round(progress)}% done with "${goal.name}"!`;
    }
    
    if (progress > 50) {
      return `💪 Great momentum! Save ₹${monthlyNeeded.toLocaleString()}/month to finish in ${months} months. You've already saved ₹₹{goal.current.toLocaleString()} - keep going!`;
    }

    // Default with motivation
    const weeklyTarget = Math.round(monthlyNeeded / 4);
    return `🎯 Break it down: ₹${weeklyTarget.toLocaleString()}/week or ₹${monthlyNeeded.toLocaleString()}/month for ${months} months to reach ₹₹{goal.target.toLocaleString()}. Start today!`;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (!user) return null;

  const { monthlyIncome, monthlyExpense, balance } = calculateTotals();
  const chartData = getChartData();
  const maxChartValue = Math.max(...chartData.map(d => Math.max(d.income, d.expense)), 1);

  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'goals', icon: Target, label: 'Goal Setter' },
    { id: 'analytics', icon: BarChart3, label: 'Analysis' },
    { id: 'reports', icon: FileText, label: 'Reports' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <div style={styles.container}>
      {/* CSS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        input::placeholder { color: rgba(255, 255, 255, 0.4); }
        input:focus, select:focus { border-color: #8B5CF6 !important; }
        select option { background: #312e81; color: white; }
      `}</style>

      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.logoWrapper}>
          <div style={styles.logoIcon}>
            <Target style={{ width: '24px', height: '24px', color: 'white' }} />
          </div>
          <span style={styles.logoText}>GoalArc</span>
        </div>

        <div style={styles.userCard}>
          <div style={styles.userInfo}>
            <div style={styles.userAvatar}>
              <User style={{ width: '24px', height: '24px', color: 'white' }} />
            </div>
            <div>
              <p style={styles.userName}>{user.name}</p>
              <p style={styles.userEmail}>{user.email}</p>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1 }}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={styles.navItem(activeTab === item.id)}
              onMouseEnter={(e) => {
                if (activeTab !== item.id) e.target.style.background = 'rgba(255,255,255,0.08)';
              }}
              onMouseLeave={(e) => {
                if (activeTab !== item.id) e.target.style.background = 'transparent';
              }}
            >
              <item.icon style={styles.navIcon} />
              <span style={styles.navLabel(activeTab === item.id)}>{item.label}</span>
            </button>
          ))}
        </nav>

        <button onClick={handleLogout} style={styles.logoutBtn}>
          <LogOut style={{ width: '20px', height: '20px', color: '#ef4444' }} />
          <span style={{ color: '#ef4444', fontWeight: '500', fontSize: '15px' }}>Sign Out</span>
        </button>
      </aside>

      {/* Main Content */}
      <main style={styles.mainContent}>
        {/* Dashboard View */}
        {activeTab === 'dashboard' && (
          <>
            <div style={styles.topBar}>
              <div>
                <h1 style={styles.welcomeTitle}>Welcome back, {user.name.split(' ')[0]}!</h1>
                <p style={styles.welcomeSubtitle}>Manage your finances and achieve your goals</p>
              </div>
              <div style={styles.actionButtons}>
                <button onClick={() => setShowAddTransaction(true)} style={styles.actionBtn(true)}>
                  <Plus style={{ width: '18px', height: '18px' }} /> Add Transaction
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statHeader}>
                  <div style={styles.statIcon('linear-gradient(135deg, #22c55e 0%, #16a34a 100%)')}>
                    <DollarSign style={{ width: '26px', height: '26px', color: 'white' }} />
                  </div>
                  <span style={{ color: '#22c55e', fontSize: '14px', fontWeight: '600' }}>Income</span>
                </div>
                <h2 style={styles.statValue}>₹{monthlyIncome.toLocaleString()}</h2>
                <p style={styles.statLabel}>Monthly Income</p>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statHeader}>
                  <div style={styles.statIcon('linear-gradient(135deg, #ef4444 0%, #dc2626 100%)')}>
                    <CreditCard style={{ width: '26px', height: '26px', color: 'white' }} />
                  </div>
                  <span style={{ color: '#ef4444', fontSize: '14px', fontWeight: '600' }}>Expense</span>
                </div>
                <h2 style={styles.statValue}>₹{monthlyExpense.toLocaleString()}</h2>
                <p style={styles.statLabel}>Monthly Expenses</p>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statHeader}>
                  <div style={styles.statIcon('linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)')}>
                    <Target style={{ width: '26px', height: '26px', color: 'white' }} />
                  </div>
                  <span style={{ color: '#a78bfa', fontSize: '14px', fontWeight: '600' }}>{goals.length} Goals</span>
                </div>
                <h2 style={styles.statValue}>{calculateGoalProgress()}%</h2>
                <p style={styles.statLabel}>Average Goal Progress</p>
              </div>
            </div>

            {/* Balance Card */}
            <div style={{ ...styles.statCard, marginBottom: '32px', background: balance >= 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={styles.statLabel}>Current Balance</p>
                  <h2 style={{ ...styles.statValue, color: balance >= 0 ? '#22c55e' : '#ef4444' }}>
                    ₹{Math.abs(balance).toLocaleString()}
                  </h2>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', margin: 0 }}>
                    {balance >= 0 ? 'You\'re saving well! 🎉' : 'Spending more than earning ⚠️'}
                  </p>
                </div>
              </div>
            </div>

            {/* Goals Section */}
            <h3 style={styles.sectionTitle}>Your Goals</h3>
            {goals.length === 0 ? (
              <div style={styles.emptyState}>
                <Target style={{ width: '48px', height: '48px', color: 'rgba(255,255,255,0.3)', margin: '0 auto 16px', display: 'block' }} />
                <p style={styles.emptyText}>No goals yet. Create your first goal to start tracking!</p>
                <button onClick={() => setShowAddGoal(true)} style={{ ...styles.actionBtn(true), marginTop: '20px' }}>
                  <Plus style={{ width: '18px', height: '18px' }} /> Create Goal
                </button>
              </div>
            ) : (
              <div style={styles.goalsGrid}>
                {goals.map((goal) => {
                  const progress = (goal.current / goal.target) * 100;
                  return (
                    <div key={goal.id} style={styles.goalCard(goal.completed)}>
                      <div style={styles.goalHeader}>
                        <h4 style={styles.goalName}>{goal.name}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {goal.completed && <CheckCircle style={{ width: '24px', height: '24px', color: '#22c55e' }} />}
                          <button 
                            onClick={() => handleDeleteGoal(goal.id)} 
                            style={{ background: 'rgba(239, 68, 68, 0.2)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Trash2 style={{ width: '16px', height: '16px', color: '#ef4444' }} />
                          </button>
                        </div>
                      </div>
                      <div style={styles.goalRow}>
                        <span style={styles.goalLabel}>Target</span>
                        <span style={styles.goalValue()}>₹{goal.target.toLocaleString()}</span>
                      </div>
                      <div style={styles.goalRow}>
                        <span style={styles.goalLabel}>Saved</span>
                        <span style={styles.goalValue('#a78bfa')}>₹{goal.current.toLocaleString()}</span>
                      </div>
                      <div style={styles.goalRow}>
                        <span style={styles.goalLabel}>Time Left</span>
                        <span style={styles.goalValue(goal.completed ? '#22c55e' : 'white')}>{goal.timeLeft}</span>
                      </div>
                      <div style={{ ...styles.goalRow, marginTop: '8px' }}>
                        <span style={styles.goalLabel}>Progress</span>
                        <span style={styles.goalValue()}>{Math.round(progress)}%</span>
                      </div>
                      <div style={styles.progressBar}>
                        <div style={styles.progressFill(progress, goal.completed)}></div>
                      </div>
                      {!goal.completed && (
                        <button 
                          onClick={() => {
                            setSelectedGoalId(goal.id);
                            setFundAmount('');
                            setShowAddFunds(true);
                          }}
                          style={{ ...styles.actionBtn(true), width: '100%', marginTop: '16px', justifyContent: 'center' }}
                        >
                          <Plus style={{ width: '16px', height: '16px' }} /> Add Funds
                        </button>
                      )}
                      <div style={styles.aiBox}>
                        <div style={styles.aiHeader}>
                          <Brain style={{ width: '16px', height: '16px', color: '#a78bfa' }} />
                          <p style={styles.aiTitle}>AI Suggestion</p>
                        </div>
                        <p style={styles.aiText}>{getAISuggestion(goal)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Recent Transactions */}
            <div style={styles.transactionsList}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ ...styles.sectionTitle, margin: 0 }}>Recent Transactions</h3>
              </div>
              {transactions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <Calendar style={{ width: '40px', height: '40px', color: 'rgba(255,255,255,0.3)', margin: '0 auto 12px', display: 'block' }} />
                  <p style={styles.emptyText}>No transactions yet. Add your first transaction!</p>
                </div>
              ) : (
                transactions.slice(0, 10).map((transaction) => (
                  <div 
                    key={transaction.id} 
                    style={{ 
                      ...styles.transactionItem, 
                      cursor: 'pointer',
                      flexDirection: 'column',
                      alignItems: 'stretch'
                    }}
                    onClick={() => setExpandedTransactionId(expandedTransactionId === transaction.id ? null : transaction.id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={styles.transactionLeft}>
                        <div style={styles.transactionIcon(transaction.type === 'income')}>
                          {transaction.type === 'income' ? (
                            <ArrowUpCircle style={{ width: '24px', height: '24px', color: '#22c55e' }} />
                          ) : (
                            <ArrowDownCircle style={{ width: '24px', height: '24px', color: '#ef4444' }} />
                          )}
                        </div>
                        <div style={styles.transactionDetails}>
                          <p style={styles.transactionDesc}>
                            {transaction.description.length > 30 && expandedTransactionId !== transaction.id
                              ? transaction.description.substring(0, 30) + '...'
                              : transaction.description}
                          </p>
                          <p style={styles.transactionDate}>
                            {transaction.category} • {formatDate(transaction.date)}
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={styles.transactionAmount(transaction.type === 'income')}>
                          {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                        </span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleEditClick(transaction); }} 
                          style={{ ...styles.deleteBtn, background: 'rgba(139, 92, 246, 0.2)', marginLeft: '8px' }}
                        >
                          <Edit style={{ width: '16px', height: '16px', color: '#a78bfa' }} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteTransaction(transaction.id); }} 
                          style={styles.deleteBtn}
                        >
                          <Trash2 style={{ width: '16px', height: '16px', color: '#ef4444' }} />
                        </button>
                      </div>
                    </div>
                    {/* Expanded Details */}
                    {expandedTransactionId === transaction.id && (
                      <div style={{ 
                        marginTop: '16px', 
                        padding: '16px', 
                        background: 'rgba(139, 92, 246, 0.1)', 
                        borderRadius: '12px',
                        borderLeft: `3px solid ${transaction.type === 'income' ? '#22c55e' : '#ef4444'}`
                      }}>
                        <div style={{ marginBottom: '12px' }}>
                          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: '0 0 4px 0' }}>Description</p>
                          <p style={{ color: 'white', fontSize: '14px', margin: 0, lineHeight: '1.5' }}>{transaction.description}</p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                          <div>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: '0 0 4px 0' }}>Amount</p>
                            <p style={{ color: transaction.type === 'income' ? '#22c55e' : '#ef4444', fontSize: '16px', fontWeight: '600', margin: 0 }}>
                              {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: '0 0 4px 0' }}>Category</p>
                            <p style={{ color: 'white', fontSize: '14px', margin: 0 }}>{transaction.category}</p>
                          </div>
                          <div>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: '0 0 4px 0' }}>Date</p>
                            <p style={{ color: 'white', fontSize: '14px', margin: 0 }}>{formatDate(transaction.date)}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Goals View */}
        {activeTab === 'goals' && (
          <>
            <div style={styles.topBar}>
              <div>
                <h1 style={styles.welcomeTitle}>Goal Setter</h1>
                <p style={styles.welcomeSubtitle}>Create and manage your financial goals</p>
              </div>
              <button onClick={() => setShowAddGoal(true)} style={styles.actionBtn(true)}>
                <Plus style={{ width: '18px', height: '18px' }} /> Create New Goal
              </button>
            </div>
            {goals.length === 0 ? (
              <div style={styles.emptyState}>
                <Target style={{ width: '48px', height: '48px', color: 'rgba(255,255,255,0.3)', margin: '0 auto 16px', display: 'block' }} />
                <p style={styles.emptyText}>No goals yet. Create your first financial goal!</p>
              </div>
            ) : (
              <div style={styles.goalsGrid}>
                {goals.map((goal) => {
                  const progress = (goal.current / goal.target) * 100;
                  return (
                    <div key={goal.id} style={styles.goalCard(goal.completed)}>
                      <div style={styles.goalHeader}>
                        <h4 style={styles.goalName}>{goal.name}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {goal.completed && <CheckCircle style={{ width: '24px', height: '24px', color: '#22c55e' }} />}
                          <button 
                            onClick={() => handleDeleteGoal(goal.id)} 
                            style={{ background: 'rgba(239, 68, 68, 0.2)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Trash2 style={{ width: '16px', height: '16px', color: '#ef4444' }} />
                          </button>
                        </div>
                      </div>
                      <div style={styles.goalRow}>
                        <span style={styles.goalLabel}>Target</span>
                        <span style={styles.goalValue()}>₹{goal.target.toLocaleString()}</span>
                      </div>
                      <div style={styles.goalRow}>
                        <span style={styles.goalLabel}>Saved</span>
                        <span style={styles.goalValue('#a78bfa')}>₹{goal.current.toLocaleString()}</span>
                      </div>
                      <div style={styles.goalRow}>
                        <span style={styles.goalLabel}>Time Left</span>
                        <span style={styles.goalValue(goal.completed ? '#22c55e' : 'white')}>{goal.timeLeft}</span>
                      </div>
                      <div style={{ ...styles.goalRow, marginTop: '8px' }}>
                        <span style={styles.goalLabel}>Progress</span>
                        <span style={styles.goalValue()}>{Math.round(progress)}%</span>
                      </div>
                      <div style={styles.progressBar}>
                        <div style={styles.progressFill(progress, goal.completed)}></div>
                      </div>
                      {!goal.completed && (
                        <button 
                          onClick={() => {
                            setSelectedGoalId(goal.id);
                            setFundAmount('');
                            setShowAddFunds(true);
                          }}
                          style={{ ...styles.actionBtn(true), width: '100%', marginTop: '16px', justifyContent: 'center' }}
                        >
                          <Plus style={{ width: '16px', height: '16px' }} /> Add Funds
                        </button>
                      )}
                      <div style={styles.aiBox}>
                        <div style={styles.aiHeader}>
                          <Brain style={{ width: '16px', height: '16px', color: '#a78bfa' }} />
                          <p style={styles.aiTitle}>AI Suggestion</p>
                        </div>
                        <p style={styles.aiText}>{getAISuggestion(goal)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Analytics View */}
        {activeTab === 'analytics' && (
          <>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={styles.welcomeTitle}>Analysis</h1>
              <p style={styles.welcomeSubtitle}>Track your financial trends over time</p>
            </div>
            <div style={styles.chartContainer}>
              <h3 style={styles.chartTitle}>Income vs Expenses (Last 5 Months)</h3>
              {transactions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px' }}>
                  <BarChart3 style={{ width: '48px', height: '48px', color: 'rgba(255,255,255,0.3)', margin: '0 auto 16px', display: 'block' }} />
                  <p style={styles.emptyText}>Add transactions to see your financial trends</p>
                </div>
              ) : (
                <>
                  <div style={styles.chartArea}>
                    {chartData.map((data, i) => (
                      <div key={i} style={styles.chartBar}>
                        <div style={styles.barGroup}>
                          <div style={styles.bar((data.income / maxChartValue) * 100, '#22c55e')}></div>
                          <div style={styles.bar((data.expense / maxChartValue) * 100, '#ef4444')}></div>
                        </div>
                        <span style={styles.chartLabel}>{data.month}</span>
                      </div>
                    ))}
                  </div>
                  <div style={styles.legend}>
                    <div style={styles.legendItem}>
                      <div style={styles.legendDot('#22c55e')}></div>
                      <span style={styles.legendText}>Income</span>
                    </div>
                    <div style={styles.legendItem}>
                      <div style={styles.legendDot('#ef4444')}></div>
                      <span style={styles.legendText}>Expenses</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Transaction Summary */}
            <div style={{ ...styles.chartContainer, marginTop: '24px' }}>
              <h3 style={styles.chartTitle}>Transaction Summary</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                <div style={{ padding: '20px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '16px' }}>
                  <p style={{ color: 'rgba(255,255,255,0.6)', margin: '0 0 8px 0', fontSize: '14px' }}>Total Income</p>
                  <h3 style={{ color: '#22c55e', margin: 0, fontSize: '28px', fontWeight: '700' }}>
                    ₹{calculateTotals().totalIncome.toLocaleString()}
                  </h3>
                </div>
                <div style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '16px' }}>
                  <p style={{ color: 'rgba(255,255,255,0.6)', margin: '0 0 8px 0', fontSize: '14px' }}>Total Expenses</p>
                  <h3 style={{ color: '#ef4444', margin: 0, fontSize: '28px', fontWeight: '700' }}>
                    ₹{calculateTotals().totalExpense.toLocaleString()}
                  </h3>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Reports View */}
        {activeTab === 'reports' && (
          <>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={styles.welcomeTitle}>Reports</h1>
              <p style={styles.welcomeSubtitle}>View detailed financial reports</p>
            </div>
            <div style={styles.chartContainer}>
              <h3 style={styles.chartTitle}>All Transactions</h3>
              {transactions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <FileText style={{ width: '48px', height: '48px', color: 'rgba(255,255,255,0.3)', margin: '0 auto 16px', display: 'block' }} />
                  <p style={styles.emptyText}>No transactions to report</p>
                </div>
              ) : (
                transactions.map((transaction) => (
                  <div 
                    key={transaction.id} 
                    style={{ 
                      ...styles.transactionItem, 
                      cursor: 'pointer',
                      flexDirection: 'column',
                      alignItems: 'stretch'
                    }}
                    onClick={() => setExpandedTransactionId(expandedTransactionId === transaction.id ? null : transaction.id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={styles.transactionLeft}>
                        <div style={styles.transactionIcon(transaction.type === 'income')}>
                          {transaction.type === 'income' ? (
                            <ArrowUpCircle style={{ width: '24px', height: '24px', color: '#22c55e' }} />
                          ) : (
                            <ArrowDownCircle style={{ width: '24px', height: '24px', color: '#ef4444' }} />
                          )}
                        </div>
                        <div style={styles.transactionDetails}>
                          <p style={styles.transactionDesc}>
                            {transaction.description.length > 30 && expandedTransactionId !== transaction.id
                              ? transaction.description.substring(0, 30) + '...'
                              : transaction.description}
                          </p>
                          <p style={styles.transactionDate}>
                            {transaction.category} • {formatDate(transaction.date)}
                          </p>
                        </div>
                      </div>
                      <span style={styles.transactionAmount(transaction.type === 'income')}>
                        {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                      </span>
                    </div>
                    {/* Expanded Details */}
                    {expandedTransactionId === transaction.id && (
                      <div style={{ 
                        marginTop: '16px', 
                        padding: '16px', 
                        background: 'rgba(139, 92, 246, 0.1)', 
                        borderRadius: '12px',
                        borderLeft: `3px solid ${transaction.type === 'income' ? '#22c55e' : '#ef4444'}`
                      }}>
                        <div style={{ marginBottom: '12px' }}>
                          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: '0 0 4px 0' }}>Description</p>
                          <p style={{ color: 'white', fontSize: '14px', margin: 0, lineHeight: '1.5' }}>{transaction.description}</p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                          <div>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: '0 0 4px 0' }}>Amount</p>
                            <p style={{ color: transaction.type === 'income' ? '#22c55e' : '#ef4444', fontSize: '16px', fontWeight: '600', margin: 0 }}>
                              {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: '0 0 4px 0' }}>Category</p>
                            <p style={{ color: 'white', fontSize: '14px', margin: 0 }}>{transaction.category}</p>
                          </div>
                          <div>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: '0 0 4px 0' }}>Date</p>
                            <p style={{ color: 'white', fontSize: '14px', margin: 0 }}>{formatDate(transaction.date)}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Settings View */}
        {activeTab === 'settings' && (
          <>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={styles.welcomeTitle}>Settings</h1>
              <p style={styles.welcomeSubtitle}>Manage your account preferences</p>
            </div>
            
            {/* Account Information */}
            <div style={styles.chartContainer}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ ...styles.chartTitle, margin: 0 }}>Account Information</h3>
                <button 
                  onClick={() => {
                    setProfileForm({ name: user.name, phone: user.phone || '' });
                    setShowEditProfile(true);
                  }}
                  style={styles.actionBtn(true)}
                >
                  <Edit style={{ width: '16px', height: '16px' }} /> Edit Profile
                </button>
              </div>
              <div style={{ padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '16px' }}>
                <p style={{ color: 'rgba(255,255,255,0.6)', margin: '0 0 4px 0', fontSize: '13px' }}>Name</p>
                <p style={{ color: 'white', margin: 0, fontSize: '16px', fontWeight: '600' }}>{user.name}</p>
              </div>
              <div style={{ padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '16px' }}>
                <p style={{ color: 'rgba(255,255,255,0.6)', margin: '0 0 4px 0', fontSize: '13px' }}>Email (Login ID - Cannot be changed)</p>
                <p style={{ color: 'white', margin: 0, fontSize: '16px', fontWeight: '600' }}>{user.email}</p>
              </div>
              <div style={{ padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '16px' }}>
                <p style={{ color: 'rgba(255,255,255,0.6)', margin: '0 0 4px 0', fontSize: '13px' }}>Phone Number (for Notifications)</p>
                <p style={{ color: user.phone ? 'white' : 'rgba(255,255,255,0.4)', margin: 0, fontSize: '16px', fontWeight: '600' }}>
                  {user.phone || 'Not set - Click Edit Profile to add'}
                </p>
              </div>
            </div>

            {/* Notification Settings */}
            <div style={{ ...styles.chartContainer, marginTop: '24px' }}>
              <h3 style={styles.chartTitle}>Notification Settings</h3>
              <div style={{ padding: '20px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '20px' }}>📱</span>
                    </div>
                    <div>
                      <p style={{ color: 'white', margin: 0, fontWeight: '600', fontSize: '15px' }}>SMS Notifications</p>
                      <p style={{ color: 'rgba(255,255,255,0.6)', margin: '4px 0 0 0', fontSize: '13px' }}>
                        {!user.phone 
                          ? 'Add phone number to enable notifications' 
                          : notificationsEnabled 
                            ? 'You will receive goal reminders' 
                            : 'Notifications are turned off'}
                      </p>
                    </div>
                  </div>
                  {/* Toggle Switch */}
                  <button
                    onClick={() => {
                      if (user.phone) {
                        const newValue = !notificationsEnabled;
                        setNotificationsEnabled(newValue);
                        const updatedUser = { ...user, notificationsEnabled: newValue };
                        setUser(updatedUser);
                        localStorage.setItem('user', JSON.stringify(updatedUser));
                      }
                    }}
                    style={{
                      width: '52px',
                      height: '28px',
                      borderRadius: '14px',
                      border: 'none',
                      padding: '2px',
                      cursor: user.phone ? 'pointer' : 'not-allowed',
                      background: !user.phone 
                        ? 'rgba(255,255,255,0.1)' 
                        : notificationsEnabled 
                          ? 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' 
                          : 'rgba(255,255,255,0.2)',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: notificationsEnabled ? 'flex-end' : 'flex-start',
                      opacity: user.phone ? 1 : 0.5
                    }}
                    title={!user.phone ? 'Add phone number first' : (notificationsEnabled ? 'Turn off notifications' : 'Turn on notifications')}
                  >
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'white',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      transition: 'all 0.3s ease'
                    }} />
                  </button>
                </div>
              </div>
              
              {/* Email Notifications */}
              <div style={{ padding: '20px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.3)', marginTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '20px' }}>✉️</span>
                    </div>
                    <div>
                      <p style={{ color: 'white', margin: 0, fontWeight: '600', fontSize: '15px' }}>Email Notifications</p>
                      <p style={{ color: 'rgba(255,255,255,0.6)', margin: '4px 0 0 0', fontSize: '13px' }}>
                        {emailNotificationsEnabled 
                          ? `Weekly summary and goal updates to ${user.email}` 
                          : 'Email notifications are turned off'}
                      </p>
                    </div>
                  </div>
                  {/* Toggle Switch for Email */}
                  <button
                    onClick={() => {
                      const newValue = !emailNotificationsEnabled;
                      setEmailNotificationsEnabled(newValue);
                      const updatedUser = { ...user, emailNotificationsEnabled: newValue };
                      setUser(updatedUser);
                      localStorage.setItem('user', JSON.stringify(updatedUser));
                    }}
                    style={{
                      width: '52px',
                      height: '28px',
                      borderRadius: '14px',
                      border: 'none',
                      padding: '2px',
                      cursor: 'pointer',
                      background: emailNotificationsEnabled 
                        ? 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' 
                        : 'rgba(255,255,255,0.2)',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: emailNotificationsEnabled ? 'flex-end' : 'flex-start'
                    }}
                    title={emailNotificationsEnabled ? 'Turn off email notifications' : 'Turn on email notifications'}
                  >
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'white',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      transition: 'all 0.3s ease'
                    }} />
                  </button>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div style={{ ...styles.chartContainer, marginTop: '24px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <h3 style={{ ...styles.chartTitle, color: '#ef4444' }}>Danger Zone</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '20px', fontSize: '14px' }}>
                These actions are irreversible. Please proceed with caution.
              </p>
              <button 
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all your data? This will delete all your goals and transactions.')) {
                    setGoals([]);
                    setTransactions([]);
                  }
                }}
                style={{ ...styles.actionBtn(false), background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
              >
                <Trash2 style={{ width: '18px', height: '18px' }} /> Clear All Data
              </button>
            </div>
          </>
        )}
      </main>

      {/* Add Goal Modal */}
      {showAddGoal && (
        <div style={styles.modalOverlay} onClick={() => setShowAddGoal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Create New Goal</h3>
              <button style={styles.modalClose} onClick={() => setShowAddGoal(false)}>
                <X style={{ width: '20px', height: '20px', color: 'white' }} />
              </button>
            </div>
            <input 
              style={styles.input} 
              type="text" 
              placeholder="Goal Name (e.g., New Phone)"
              value={goalForm.name}
              onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })}
            />
            <input 
              style={styles.input} 
              type="number" 
              placeholder="Target Amount ($)"
              value={goalForm.target}
              onChange={(e) => setGoalForm({ ...goalForm, target: e.target.value })}
            />
            <input 
              style={styles.input} 
              type="number" 
              placeholder="Time Period in Months (e.g., 6)"
              value={goalForm.timeLeft}
              onChange={(e) => setGoalForm({ ...goalForm, timeLeft: e.target.value })}
            />
            <div style={styles.modalButtons}>
              <button style={styles.modalBtn(false)} onClick={() => setShowAddGoal(false)}>Cancel</button>
              <button style={styles.modalBtn(true)} onClick={handleAddGoal}>Create Goal</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {showAddTransaction && (
        <div style={styles.modalOverlay} onClick={() => setShowAddTransaction(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Add Transaction</h3>
              <button style={styles.modalClose} onClick={() => setShowAddTransaction(false)}>
                <X style={{ width: '20px', height: '20px', color: 'white' }} />
              </button>
            </div>
            <select 
              style={styles.select}
              value={transactionForm.type}
              onChange={(e) => setTransactionForm({ ...transactionForm, type: e.target.value })}
            >
              <option value="">Select Type</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <input 
              style={styles.input} 
              type="text" 
              placeholder="Description (e.g., Salary, Food, Rent)"
              value={transactionForm.description}
              onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
            />
            <input 
              style={styles.input} 
              type="text" 
              placeholder="Category (e.g., Food, Transport, Bills)"
              value={transactionForm.category}
              onChange={(e) => setTransactionForm({ ...transactionForm, category: e.target.value })}
            />
            <input 
              style={styles.input} 
              type="number" 
              placeholder="Amount ($)"
              value={transactionForm.amount}
              onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
            />
            <div style={styles.modalButtons}>
              <button style={styles.modalBtn(false)} onClick={() => setShowAddTransaction(false)}>Cancel</button>
              <button style={styles.modalBtn(true)} onClick={handleAddTransaction}>Add Transaction</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {showEditTransaction && (
        <div style={styles.modalOverlay} onClick={() => setShowEditTransaction(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Edit Transaction</h3>
              <button style={styles.modalClose} onClick={() => setShowEditTransaction(false)}>
                <X style={{ width: '20px', height: '20px', color: 'white' }} />
              </button>
            </div>
            <select 
              style={styles.select}
              value={transactionForm.type}
              onChange={(e) => setTransactionForm({ ...transactionForm, type: e.target.value })}
            >
              <option value="">Select Type</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <input 
              style={styles.input} 
              type="text" 
              placeholder="Description"
              value={transactionForm.description}
              onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
            />
            <input 
              style={styles.input} 
              type="text" 
              placeholder="Category"
              value={transactionForm.category}
              onChange={(e) => setTransactionForm({ ...transactionForm, category: e.target.value })}
            />
            <input 
              style={styles.input} 
              type="number" 
              placeholder="Amount ($)"
              value={transactionForm.amount}
              onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
            />
            <div style={styles.modalButtons}>
              <button style={styles.modalBtn(false)} onClick={() => setShowEditTransaction(false)}>Cancel</button>
              <button style={styles.modalBtn(true)} onClick={handleUpdateTransaction}>Update</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Funds Modal */}
      {showAddFunds && (
        <div style={styles.modalOverlay} onClick={() => setShowAddFunds(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Add Funds to Goal</h3>
              <button style={styles.modalClose} onClick={() => setShowAddFunds(false)}>
                <X style={{ width: '20px', height: '20px', color: 'white' }} />
              </button>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '20px', fontSize: '15px' }}>
              Goal: <span style={{ color: '#a78bfa', fontWeight: '600' }}>
                {goals.find(g => g.id === selectedGoalId)?.name}
              </span>
            </p>
            <input 
              style={styles.input} 
              type="number" 
              placeholder="Enter amount to add ($)"
              value={fundAmount}
              onChange={(e) => setFundAmount(e.target.value)}
              autoFocus
            />
            <div style={styles.modalButtons}>
              <button style={styles.modalBtn(false)} onClick={() => setShowAddFunds(false)}>Cancel</button>
              <button 
                style={styles.modalBtn(true)} 
                onClick={() => {
                  if (fundAmount && !isNaN(fundAmount) && parseFloat(fundAmount) > 0) {
                    handleAddToGoal(selectedGoalId, parseFloat(fundAmount));
                    setShowAddFunds(false);
                    setFundAmount('');
                    setSelectedGoalId(null);
                  }
                }}
              >
                Add Funds
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div style={styles.modalOverlay} onClick={() => setShowEditProfile(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Edit Profile</h3>
              <button style={styles.modalClose} onClick={() => setShowEditProfile(false)}>
                <X style={{ width: '20px', height: '20px', color: 'white' }} />
              </button>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', marginBottom: '8px', fontSize: '14px' }}>
                Display Name
              </label>
              <input 
                style={styles.input} 
                type="text" 
                placeholder="Enter your name"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', marginBottom: '8px', fontSize: '14px' }}>
                Email (Cannot be changed)
              </label>
              <input 
                style={{ ...styles.input, opacity: 0.5, cursor: 'not-allowed' }} 
                type="email" 
                value={user.email}
                disabled
              />
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', marginBottom: '8px', fontSize: '14px' }}>
                Phone Number (for Notifications)
              </label>
              <input 
                style={styles.input} 
                type="tel" 
                placeholder="Enter your phone number (e.g., +1 555-123-4567)"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              />
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginTop: '8px' }}>
                📱 We'll use this to send you goal reminders and savings tips
              </p>
            </div>
            
            <div style={styles.modalButtons}>
              <button style={styles.modalBtn(false)} onClick={() => setShowEditProfile(false)}>Cancel</button>
              <button 
                style={styles.modalBtn(true)} 
                onClick={() => {
                  if (profileForm.name.trim()) {
                    const updatedUser = { ...user, name: profileForm.name.trim(), phone: profileForm.phone.trim() };
                    setUser(updatedUser);
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    setShowEditProfile(false);
                  }
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
