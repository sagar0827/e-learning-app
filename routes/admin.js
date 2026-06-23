const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Note = require("../models/Note");
const { isAdmin } = require("../middleware");

//admin Dashboard
router.get("/dashboard", isAdmin, async(req, res) => {
    try {
        const admins = await User.find({ role: "admin" });
        const users = await User.countDocuments({ role: "user" });
        const notes = await Note.countDocuments();
        const pendingNotes = await Note.countDocuments({ status:"pending" });
        const approvedNotes = await Note.countDocuments({ status : "approved" });
        const rejectedNotes = await Note.countDocuments({ status:"rejected" });
        const recentNotes = await Note.find().sort({ createdAt: -1 }).limit(5).populate("owner");
        const contributors = await User.find().sort({ createdAt: -1 }).limit(5);
        const latestUsers = await User.find().sort({ createdAt: -1 }).limit(5);
        const approvalRate = notes > 0 ? Math.round((approvedNotes / notes) * 100) : 0;
        res.render("admin/dashboard", { users, notes, admins, pendingNotes, approvedNotes,rejectedNotes, recentNotes, contributors, latestUsers, approvalRate, currentPage: "dashboard" });

    } catch (error) {
        console.log(error);
        req.flash("error", "Unable to fetch admin users");
        res.redirect("/admin/dashboard");
    }
});

// Pending Notes
router.get("/notes/pending", isAdmin, async(req, res) => {
    const notes = await Note.find({
        status: "pending"
    }).populate("owner");

    res.render("admin/pendingNotes", {
        notes,
        currentPage: "pending"
    });
});


//Approved Notes
router.get("/notes/approved", isAdmin, async (req, res) => {

    const notes = await Note.find({
        status: "approved"
    }).populate("owner");

    res.render("admin/approvedNotes", {
        notes,
        currentPage: "approved"
    });

});

//Rejected Notes
router.get("/notes/rejected", isAdmin, async (req, res) => {

    const notes = await Note.find({
        status: "rejected"
    }).populate("owner");

    res.render("admin/rejectedNotes", {
        notes,
        currentPage: "rejected"
    });

});



// pending/notesdetail/view note
router.get("/notes/:id", isAdmin, async(req, res) => {
    const note = await Note.findById(req.params.id)
        .populate("owner");

    res.render("admin/noteDetails", {
        note,
        currentPage: "pending-notes"



    });
});

// Approve Pending-Note 
router.put("/notes/:id/approve", isAdmin, async(req, res) => {
    try {
        await Note.findByIdAndUpdate(req.params.id, { status: "approved" });
        req.flash("success", "Note approved successfully");
        res.redirect("/admin/notes/pending");
    } catch (error) {
        console.log(error);
        req.flash("error", "Unable to approve note");
        res.redirect("/admin/notes/pending");
    }
});

//rejected Pending-Notes
router.put("/notes/:id/reject", isAdmin, async(req, res) => {

    await Note.findByIdAndUpdate(req.params.id, {
        status: "rejected"
    });

    req.flash("success", "Note Rejected");
    res.redirect("/admin/notes/pending");
});




// Manage Notes Page
router.get("/notes", isAdmin, async(req, res) => {
    try {
        const notes = await Note.find({})
            .populate("owner");

        const subjectsCount = new Set(notes.map(note => note.subject)).size;

        res.render("admin/notes", {
            notes,
            currentPage: "notes",
            subjectsCount
        });

    } catch (error) {

        console.log(error);

        req.flash(
            "error",
            "Unable to fetch notes"
        );

        res.redirect("/admin/dashboard");
    }
});
//Delete Note Route
router.delete("/notes/:id", isAdmin, async(req, res) => {

    try {
        await Note.findByIdAndDelete(req.params.id);
        req.flash(
            "success",
            "Note deleted successfully"
        );

        res.redirect("/admin/notes");
    } catch (error) {
        console.log(error);
        req.flash("error", "Unable to delete note");
        res.redirect("/admin/notes");
    }
});


// all  Users
router.get("/users", isAdmin, async(req, res) => {
    const users = await User.find({ role: "user" });
    res.render("admin/users", {
        users,
        currentPage: "users"
    });
});


// Make User Admin
router.post("/users/:id/make-admin", isAdmin, async(req, res) => {

    await User.findByIdAndUpdate(req.params.id, { role: "admin" });
    req.flash("success", "User promoted to Admin");
    res.redirect("/admin/users");
});
// Remove Admin Rights
router.post("/users/:id/remove-admin", isAdmin, async(req, res) => {
    if (req.user._id.equals(req.params.id)) {
        req.flash("error", "You cannot remove your own admin rights");
        return res.redirect("/admin/users");
    }
    await User.findByIdAndUpdate(
        req.params.id, { role: "user" }
    );
    req.flash("success", "Admin rights removed");
    res.redirect("/admin/users");
});

// Delete User
router.post("/users/:id", isAdmin, async(req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        console.log(user);
        req.flash("success", "User deleted successfully");
        res.redirect("/admin/users");
    } catch (error) {
        console.log(error);
        req.flash("error", "Unable to delete user");
        res.redirect("/admin/users");
    }
});


module.exports = router;
