const express = require("express");
const router = express.Router();
const { isLoggedIn, isOwner } = require("../middleware");
const path = require("path");
const multer = require("multer");

const Note = require("../models/Note");


// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });




//show All Notes with Search
router.get("/", async(req, res) => {

    let search = req.query.search || "";

    const notes = await Note.find({
        title: {
            $regex: search,
            $options: "i"
        },
        status: "approved"
    });

    res.render(
        "notes", { notes, search }
    );
});

//my-notes route
router.get("/my-notes", isLoggedIn, async(req, res) => {
    const notes = await Note.find({ owner: req.user._id });

    const totalNotes = notes.length;
    const approvedNotes = notes.filter(n => n.status === "approved").length;
    const pendingNotes = notes.filter(n => n.status === "pending").length;
    const rejectedNotes = notes.filter(n => n.status === "rejected").length;

    res.render("myNotes", {
        notes,
        totalNotes,
        approvedNotes,
        pendingNotes,
        rejectedNotes
    });
});

// Upload page 
router.get("/upload", isLoggedIn, (req, res) => {
    res.render("upload");
});

//Save  Uploaded Note
router.post(
    "/", isLoggedIn,
    upload.single("file"),

    async(req, res) => {
        try {
            const { title, subject, description } = req.body;
            const newNote = new Note({

                title,
                subject,
                description,

                file: req.file ? req.file.path : null,
                owner: req.user._id,
                status: "pending"


            });
            await newNote.save();
            req.flash("success", "Note Uploaded Successfully!");
            res.redirect("/notes");
        } catch (err) {
            console.log(err);
            req.flash("error", "Upload Failed !");
            res.redirect("/notes");
        }
    }
);

// View Single Note

router.get("/:id", async(req, res) => {
    const note =
        await Note.findById(req.params.id).populate("owner");
    if (!note) {
        req.flash("error", "Note not found!");
        return res.redirect("/notes");
    }
    res.render("videos", { note });
});


// DELETE NOTES
router.delete("/:id", isLoggedIn, isOwner, async(req, res) => {

    let { id } = req.params;

    await Note.findByIdAndDelete(id);

    req.flash("success", "Note Deleted Successfully!");

    res.redirect("/notes");

});

module.exports = router;