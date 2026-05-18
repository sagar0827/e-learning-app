const express = require("express");
const router = express.Router();

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
    "/upload",
    upload.single("file"),

    async (req, res) => {

        const { title, subject, description } = req.body;

        const newNote = new Note({

            title,
            subject,
            description,

            file: req.file.path

        });

        await newNote.save();

        res.redirect("/notes");

    }
);

// SHOW NOTES
router.get("/notes", async (req, res) => {

    const notes = await Note.find();

    res.render("notes", { notes });

});


module.exports = router;