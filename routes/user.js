const express = require('express');
const router = express.Router();
const User = require("../models/User");

// HOME PAGE 
router.get('/', (req, res) => {
    res.render("dashboard");
});

// LOGIN PAGE
router.get('/login', (req, res) => {
    res.render("login");
});

router.post("/login", async (req, res) => {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if(!user){
        return res.send("User not found");
    }

    if(user.password !== password){
        return res.send("Incorrect Password");
    }

    res.send("Login Successful");
});

// REGISTER PAGE
router.get('/register', (req, res) => {
    res.render("register");
});

router.post("/register", async (req, res) => {

    const { username, email, password } = req.body;

    const newUser = new User({
        username,
        email,
        password
    });

    await newUser.save();

    res.send("User Registered");
});

module.exports = router;