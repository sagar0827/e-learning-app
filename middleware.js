const Note = require("./models/note");


module.exports.isLoggedIn = (req, res, next) => {

    if(!req.isAuthenticated()) {

        req.flash("error", "You must be logged in first!");

        return res.redirect("/login");
    }

    next();
};


module.exports.isOwner = async(req, res, next) => {

    let { id } = req.params;

    let note = await Note.findById(id);

    if(!note.owner){

        req.flash("error","Owner not found!");
        return res.redirect("/notes");
    }
    
    if(!note.owner.equals(req.user._id)) {

        req.flash("error", "You are not the owner!");

        return res.redirect("/notes");
    }

    next();
};


module.exports.isAdmin = (req,res,next)=>{

    if(
        !req.user ||
        req.user.role !== "admin"
    ){

        req.flash(
            "error",
            "Access Denied"
        );

        return res.redirect("/");
    }

    next();

};

