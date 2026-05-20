const express = require('express');
const router = express.Router();
const passport = require("passport");
const User = require("../models/User");

// HOME PAGE 
router.get('/', (req, res) => {
    res.render("dashboard");
});

router.get('/login', (req, res) => {
     res.render("login");
});

// LOGIN PAGE
router.post(
    "/login",

    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true,
    }),

    async (req, res) => {

        req.flash("success", "Welcome back!");
        res.redirect("/");
    }
);

// router.post("/login", async (req, res) => {

//     const { email, password } = req.body;

//     const user = await User.findOne({ email });

//     if(!user){
//         return res.send("User not found");
//     }

//     if(user.password !== password){
//         return res.send("Incorrect Password");
//     }

//     res.send("Login Successful");
// });

router.get("/logout", (req, res, next) => {

    req.logout((err) => {

        if (err) {
            return next(err);
        }

        req.flash("success", "Logged Out");

        res.redirect("/");
    });

});


// REGISTER Route
router.get('/register', (req, res) => {
    res.render("register");
});

router.post("/register", async (req, res) => {
try{
    const { username, email, password } = req.body;

    const newUser = new User({
        username,
        email
    });
    const registeredUser = await User.register(newUser, password);
    req.login(registeredUser,(err)=>{
        if(err){
            return next(err);
        }
        req.flash("success", "Registered Successfully!");
        res.redirect("/");
    });
}catch(err){

    req.flash("error",err.message);
    res.redirect("/register");
}
    // await newUser.save();

    //res.send("User Registered");
});

module.exports = router;