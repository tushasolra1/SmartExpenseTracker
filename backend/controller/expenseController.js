const asyncHandler = require("express-async-handler");
const Expense = require("../models/expenseModel");

// Add Expense
const addExpense = asyncHandler(async (req, res) => {
  const { title, amount, category, description } = req.body;

  if (!title || !amount) {
    res.status(400);
    throw new Error("Title and Amount are required");
  }

  const expense = await Expense.create({
    user: req.user.id,  // ✅ correct field name
    title,
    amount,
    category,
    description,
  });

  res.status(201).json(expense);
});

// Get All Expenses for a User
const getExpenses = asyncHandler(async (req, res) => {
  const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 });  // ✅ user not user_id
  res.status(200).json(expenses);
});

// Update Expense
const updateExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  if (!expense) {
    res.status(404);
    throw new Error("Expense not found");
  }

  if (expense.user.toString() !== req.user.id) {  // ✅ user not user_id
    res.status(403);
    throw new Error("Not authorized to update this expense");
  }

  const updatedExpense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.status(200).json(updatedExpense);
});

// Delete Expense
const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  if (!expense) {
    res.status(404);
    throw new Error("Expense not found");
  }

  if (expense.user.toString() !== req.user.id) {  // ✅ user not user_id
    res.status(403);
    throw new Error("Not authorized to delete this expense");
  }

  await Expense.deleteOne({ _id: req.params.id });
  res.status(200).json({ message: "Expense deleted successfully" });
});

// 📊 Get Total Expenses by Category
const getCategoryStats = asyncHandler(async (req, res) => {
  const stats = await Expense.aggregate([
    { $match: { user: req.user._id } }, // ✅ user not user_id
    {
      $group: {
        _id: "$category",
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { totalAmount: -1 } },
  ]);

  res.status(200).json(stats);
});

// 📆 Get Monthly Expense Summary
const getMonthlyStats = asyncHandler(async (req, res) => {
  const stats = await Expense.aggregate([
    { $match: { user: req.user._id } }, // ✅ user not user_id
    {
      $group: {
        _id: { $month: "$createdAt" },
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id": 1 } },
  ]);

  const months = [
    "", "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const formattedStats = stats.map(stat => ({
    month: months[stat._id],
    totalAmount: stat.totalAmount,
    transactions: stat.count,
  }));

  res.status(200).json(formattedStats);
});

module.exports = {
  addExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  getMonthlyStats,
  getCategoryStats,
};
