require('dotenv').config();

const express = require('express');
const app = express();
const ejs = require('ejs');
const mongoose = require('mongoose');
const path = require("path");
const ejsMate = require('ejs-mate');
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport")
const LocalStrategy = require("passport-local");
const Note = require("./models/Note");
const User = require("./models/User");
const methodOverride = require("method-override");


//multer for file uploads
const multer = require("multer");

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, "uploads/");
    },
    filename: function(req, file, cb){
        cb(null, Date.now() + "-" + file.originalname);
    }
});
const upload = multer({ storage });

app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, 'public')));
app.use("/uploads", express.static("uploads"));
// Middleware
app.use(express.json());


const sessionOption = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};
app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize()); 
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// Connect to MongoDB
 mongoose.connect(process.env.MONGO_URL).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Error connecting to MongoDB', err);
});

//Flass Message Middleware
app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// Routes
const userRoutes = require("./routes/user");
const noteRoutes = require("./routes/notes");

app.use("/", userRoutes);
app.use("/", noteRoutes);
 app.get('/videos', (req, res) => {
  res.render("videos.ejs");
});

// Start the server

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});