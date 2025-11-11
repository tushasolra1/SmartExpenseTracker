const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDb = require("./config/db");

const userRoutes = require("./routes/userRoutes");
const expenseRoutes = require("./routes/expenseRoutes");

dotenv.config({ path: "./backend/.env" });

PORT = 4000;

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());


dotenv.config();
connectDb();  // ✅ Connect to MongoDB

app.use("/api/users", userRoutes);
app.use("/api/expenses", expenseRoutes);

app.get("/", (req, res) => {
  res.send("Smart Expense Tracker API Running...");
});

app.listen(PORT, () => console.log(`Server Started at ${PORT}`));