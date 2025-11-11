const express = require("express");
const router = express.Router();
const { userRegister, userLogin } = require("../controller/userController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", userRegister);
router.post("/login", userLogin);
router.get("/profile", protect, (req, res) => {
  res.json(req.user);
});

module.exports = router;
