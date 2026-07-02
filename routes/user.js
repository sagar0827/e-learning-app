const express = require('express');
const router = express.Router();
const passport = require("passport");
const User = require("../models/User");

// HOME PAGE 
router.get('/', (req, res) => {
    res.render("dashboard");
});





//  Register page
router.get('/register', (req, res) => {
    res.render("register");
});


//Register User
router.post("/register", async(req, res) => {
    try {
        const { username, email, password } = req.body;

        const newUser = new User({
            username,
            email
        });
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Registered Successfully!");
            res.redirect("/dashboard");
        });
    } catch (err) {

        req.flash("error", err.message);
        res.redirect("/register");
    }

});

//Login Page
router.get('/login', (req, res) => {
    res.render("login");
});

// Login User
router.post(
    "/login",
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: "Invalid Username or Password",
        successRedirect: "/dashboard",
        successFlash: "Welcome back!"
    }), async(req, res) => {
        await User.findByIdAndUpdate(req.user._id, { isOnline: true });
    });

// Dashboard
router.get("/dashboard", (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash("error", "You must be logged in to access the dashboard");
        return res.redirect("/login");
    }

    res.render("dashboard");
});

// Logout User
router.get("/logout", async(req, res, next) => {

    await User.findByIdAndUpdate(req.user._id, { isOnline: false });

    req.logout(function(err) {

        if (err) {
            return next(err);
        }

        req.flash("success", "Logged Out Successfully!");

        res.redirect("/login");
    });

});

//Profile Page
router.get("/profile", (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash("error", "You must be logged in to access the profile");
        return res.redirect("/login");
    }
    res.render("profile");

});

module.exports = router;