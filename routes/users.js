const express = require("express");
const db = require("../db/db");
const router = express.Router();
const productRepository = require("../db/productRepository");
const userRepository = require("../db/userRepository");

router.get("/delete/:id", productRepository.requireAuth, productRepository.requireRole("admin"), (req, res) => {
  const userId = req.params.id;
  const result = userRepository.findById(userId);
  if (result.changes === 0) {
	return res.render("/users/single", {
	  title: "User Details",
	  userDetail: { ...req.body, id: userId },
	  error: "Failed to delete user",
	  user: req.user,
	});
  }
  res.render("users/delete", {
	title: "User Details",
	userDetail: result,
	user: req.user,
  });
});

router.post("/delete/:id", productRepository.requireAuth, productRepository.requireRole("admin"), (req, res) => {
  const userId = req.params.id;
  const result = userRepository.deleteUser(userId);
  if (result.changes === 0) {
	return res.render("users/single", {
	  title: "User Details",
	  userDetail: { ...req.body, id: userId },
	  error: "Failed to delete user",
	  user: req.user,
	});
  }
  res.redirect("/admin?success=1");
});

router.get("/edit/:id", (req, res) => {
  const userId = req.params.id;
  const userDetail = userRepository.findById(userId);
  const editUserId = parseInt(req.params.id);

console.log("userDetail:", userDetail);
console.log("user", req.user);

  res.render("users/single", {
    title: "User Details",
    userDetail,
    user: req.user,
  });
});

router.post("/edit/:id", productRepository.requireAuth, productRepository.requireRole("admin"), (req, res) => {
  const userId = req.params.id;
  const {email, role } = req.body;

  // Validate input
  if (!email || !role) {
	return res.render("users/single", {
      title: "User Details",
      userDetail: { ...req.body, id: userId },
      error: "All fields are required",
      user: req.user,
    });
  }
  if (userRepository.findByEmail(email) && userRepository.findByEmail(email).id !== parseInt(userId)) {
	return res.render("users/single", {
	  title: "User Details",
	  userDetail: { ...req.body, id: userId },
	  error: "Email already in use",
	  user: req.user,
	});
  }
  const result = userRepository.updateUser(userId, email, role);
  if (result.changes === 0) {
	return res.render("users/single", {
	  title: "User Details",
	  userDetail: { ...req.body, id: userId },
	  error: "Failed to update user",
	  user: req.user,
	});
  }
  res.redirect("/admin?success=1");
});

module.exports = router;
