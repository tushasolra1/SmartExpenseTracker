const express = require("express");
const router = express.Router();
const {
  addExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  getCategoryStats,
  getMonthlyStats
} = require("../controller/expenseController");

const validateToken = require("../middleware/validateTokenHandler");

// Protect all routes
router.use(validateToken);

router.post("/", addExpense);
router.get("/", getExpenses);
router.put("/:id", updateExpense);
router.delete("/:id", deleteExpense);

router.get("/stats/category", getCategoryStats);
router.get("/stats/monthly", getMonthlyStats);


module.exports = router;
