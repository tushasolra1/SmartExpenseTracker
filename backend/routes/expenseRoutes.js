const express = require('express');
const router = express.Router();
const Expense = require('../models/expenseModel');
const { protect } = require('../middleware/authMiddleware'); // Add this import

// Get all expenses
router.get('/', protect, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create expense
router.post('/', protect, async (req, res) => {
  try {
    const expense = new Expense({
      ...req.body,
      user: req.user._id,
    });
    const createdExpense = await expense.save();
    res.status(201).json(createdExpense);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update expense
router.put('/:id', protect, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    const updatedExpense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedExpense);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete expense
router.delete('/:id', protect, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: 'Expense removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single expense
router.get('/:id', protect, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/category-stats', protect, async (req, res) => {
  console.log('Category stats route hit');
  try {
    console.log('User ID from token:', req.user._id);
    const expenses = await Expense.find({ user: req.user._id });
    console.log('Expenses found:', expenses.length);
    console.log('First expense:', expenses[0]);
    if (expenses.length === 0) {
      return res.json([]);
    }
    const stats = {};
    expenses.forEach(exp => {
      console.log('Processing expense:', exp);
      if (!stats[exp.category]) stats[exp.category] = { totalAmount: 0, count: 0 };
      stats[exp.category].totalAmount += exp.amount;
      stats[exp.category].count += 1;
    });
    const result = Object.keys(stats).map(cat => ({ _id: cat, totalAmount: stats[cat].totalAmount, count: stats[cat].count }));
    console.log('Stats result:', result);
    res.json(result);
  } catch (error) {
    console.error('Category stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


router.get('/monthly-stats', protect, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id });
    const stats = {};
    expenses.forEach(exp => {
      const month = exp.createdAt.toISOString().slice(0, 7); // YYYY-MM
      if (!stats[month]) stats[month] = { totalAmount: 0, transactions: 0 };
      stats[month].totalAmount += exp.amount;
      stats[month].transactions += 1;
    });
    const result = Object.keys(stats).map(month => ({ _id: month, totalAmount: stats[month].totalAmount, transactions: stats[month].transactions }));
    res.json(result);
  } catch (error) {
    console.error('Monthly stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


module.exports = router;