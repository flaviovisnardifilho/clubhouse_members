const express = require("express");
const router = express.Router();
const { isAuth, isAdmin } = require("../lib/authMiddleware");
const toRule_controller = require("../controllers/toRuleThemAllController");

router.get("/", toRule_controller.index);

// Post some message
router.post("/", isAuth, toRule_controller.send_message_POST);

// Delete a message
router.post("/messages/:id/delete", isAdmin, toRule_controller.delete_message);

// List all users
router.get("/users", toRule_controller.list_users_GET);

// GET Create an account.
router.get("/register", (req, res) =>
  res.render("register-form", { title: "Create your account" })
);

// POST Create an account
router.post("/register", toRule_controller.createAccount);

// GET Login
router.get("/log-in", toRule_controller.logIn_GET);
// POST Login
router.post("/log-in", toRule_controller.logIn);

// Logout
router.get("/log-out", toRule_controller.logOut);

module.exports = router;
