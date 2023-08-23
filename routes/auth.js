const express = require("express");
const { body, validationResult } = require("express-validator");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const db = require("../app");
const router = express.Router();

const User = require("../models/user");

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username: username });
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        // passwords do not match
        return done(null, false, { message: "Incorrect password" });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(async function (id, done) {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

router.get("/sign-up", function (req, res, next) {
  res.render("sign-up", { title: "Sign Up" });
});

router.post(
  "/sign-up",
  body("password")
    .isLength({ min: 5 })
    .withMessage("Password must be at least 5 characters."),
  body("password-confirm")
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .withMessage("Passwords do not match."),
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/sign-up",
  }),
  function (req, res, next) {
    bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
      try {
        const user = new User({
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          username: req.body.username,
          password: hashedPassword,
        });
        const result = await user.save();
        req.login(user, function (err) {
          if (err) return next(err);
        });
        // res.redirect("/");
      } catch (err) {
        return next(err);
      }
    });
  }
);

router.get("/log-in", function (req, res, next) {
  res.render("log-in", { title: "Log In" });
});

router.post(
  "/log-in",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/log-in",
  })
);

router.get("/log-out", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

module.exports = router;
