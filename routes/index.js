const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

const User = require("../models/user");
const passport = require("passport");

router.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("home", { title: "Home", user: req.user });
});

router.get("/sign-up", function (req, res, next) {
  res.render("sign-up", { title: "Sign Up" });
});

router.post("/sign-up", function (req, res, next) {
  bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
    if (err) {
      return next(err);
    } else {
      const user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
        password: hashedPassword,
      });
      const result = await user.save();
      res.redirect("/");
    }
  });
});

router.get("/log-in", function (req, res, next) {
  res.render("log-in", { title: "Log In" });
});

router.post(
  "/log-in",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/",
  })
);

module.exports = router;
