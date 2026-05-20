const express = require("express");
const router = express.Router();
const {isLoggedIn , isOwner } = require("../middleware");
const multer = require("multer");
const Note = require("../models/Note");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage: storage });

router.get("/upload", (req, res) => {
    res.render("upload");
});

router.post(
    "/upload",isLoggedIn,
    upload.single("file"),

    async (req, res) => {

        const { title, subject, description } = req.body;

        const newNote = new Note({

            title,
            subject,
            description,

            file: req.file.path,
          owner : req.user._id

        });

        await newNote.save();

        res.redirect("/notes");

    }
);

// SHOW NOTES
router.get("/notes",isLoggedIn, async (req, res) => {

    const notes = await Note.find({});

    res.render("notes", { notes });

});


// DELETE NOTES
router.delete("/notes/:id", isLoggedIn, isOwner, async(req, res) => {

    let { id } = req.params;

    await Note.findByIdAndDelete(id);

    req.flash("success", "Note Deleted Successfully!");

    res.redirect("/notes");

});






module.exports = router;