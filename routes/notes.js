const express = require("express");
const router = express.Router();
const { isLoggedIn, isOwner } = require("../middleware");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
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





//show All Notes with Search and pagination
router.get("/", async(req, res) => {

    const page = parseInt(req.query.page) || 1;
    const limit = 4; // 4 notes per page

    const search = req.query.search || "";
    const subject = req.query.subject || "";
    const sort = req.query.sort || "newest";


    const query = {
        status: "approved",
    };

    if (search) {
        query.title = {
            $regex: search,
            $options: "i"
        };
    }

    if (subject) {
        query.subject = subject;
    }

    let sortOption = {};

    if (sort === "newest") {
        sortOption = { createdAt: -1 };
    } else {
        sortOption = { createdAt: 1 };
    }

    // Total notes
    const totalNotes = await Note.countDocuments(query);


    // Notes
    const notes = await Note.find(query)
        .populate("owner")
        .sort(sortOption)
        .skip((page - 1) * limit)
        .limit(limit);

    res.render("notes", {
        notes,
        search,
        subject,
        sort,
        currentPage: page,
        totalPages: Math.ceil(totalNotes / limit)
    });


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


// My Note Details
router.get("/my-notes/:id", isLoggedIn, async(req, res) => {

    const note = await Note.findById(req.params.id).populate("owner");

    if (!note) {
        req.flash("error", "Note not found");
        return res.redirect("/notes/my-notes");
    }

    if (!note.owner._id.equals(req.user._id)) {
        req.flash("error", "Unauthorized");
        return res.redirect("/notes/my-notes");
    }

    res.render("myNoteDetails", { note });

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




// router.get("/", async(req, res) => {
//     const note =
//         await Note.findById(req.params.id).populate("owner");
//     if (!note) {
//         req.flash("error", "Note not found!");
//         return res.redirect("/notes");
//     }
//     res.render("videos", { note });
// });

// Edit Note Page
router.get("/:id/edit", isLoggedIn, isOwner, async(req, res) => {

    const note = await Note.findById(req.params.id);

    if (!note) {
        req.flash("error", "Note not found!");
        return res.redirect("/notes/my-notes");
    }

    res.render("editNote", { note });

});


// Update Note
router.put(
    "/:id",
    isLoggedIn,
    isOwner,
    upload.single("file"),

    async(req, res) => {

        try {

            const note = await Note.findById(req.params.id);

            if (!note) {

                req.flash("error", "Note not found!");

                return res.redirect("/notes/my-notes");

            }
            // check if anything changed
            let isChanged = false;

            if (note.title !== req.body.title) isChanged = true;
            if (note.subject !== req.body.subject) isChanged = true;
            if (note.description !== req.body.description) isChanged = true;

            //Update fields
            note.title = req.body.title;
            note.subject = req.body.subject;
            note.description = req.body.description;


            // Optional PDF Replace
            if (req.file) {
                isChanged = true;

                //Delete old PDF
                if (note.file && fs.existsSync(note.file)) {

                    fs.unlinkSync(note.file);

                }

                //Save new PDF
                note.file = req.file.path;

            }

            //Send for review only if something changed
            if (isChanged) {

                note.status = "pending";

                await note.save();

                req.flash(
                    "success",
                    "Note updated successfully and sent for admin review."
                );

            } else {
                req.flash("success", "No changes were made.");
            }
            res.redirect("/notes/my-notes");

        } catch (err) {

            console.log(err);

            req.flash(
                "error",
                "Unable to update note."
            );

            res.redirect("/notes/my-notes");

        }

    }
);

// DELETE NOTES
router.delete("/:id", isLoggedIn, isOwner, async(req, res) => {

    const note = await Note.findById(req.params.id);
    if (note.file && fs.existsSync(note.file)) {
        fs.unlinkSync(note.file);
    }

    await Note.findByIdAndDelete(req.params.id);

    req.flash("success", "Note Deleted Successfully!");

    res.redirect("/notes/my-notes");

});

module.exports = router;