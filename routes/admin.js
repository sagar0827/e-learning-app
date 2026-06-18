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
        const pendingNotes = await Note.countDocuments({ isApproved: false });
        const approvedNotes = await Note.countDocuments({ isApproved: true });
        res.render("admin/dashboard", { users, notes, admins, pendingNotes, approvedNotes });

    } catch (error) {
        console.log(error);
        req.flash("error", "Unable to fetch admin users");
        res.redirect("/admin/dashboard");
    }
});

// Pending Notes route
router.get("/pending-notes", isAdmin, async(req, res) => {
    const notes = await Note.find({
        isApproved: false
    }).populate("owner");

    res.render("admin/pendingNotes", {
        notes
    });
});

// Approve Note Route
router.put("/notes/:id/approve", isAdmin, async(req, res) => {
    try {
        await Note.findByIdAndUpdate(req.params.id, { isApproved: true });
        req.flash("success", "Note approved successfully");
        res.redirect("/admin/pending-notes");
    } catch (error) {
        console.log(error);
        req.flash("error", "Unable to approve note");
        res.redirect("/admin/pending-notes");
    }
});




// Manage Notes Page
router.get("/notes", isAdmin, async(req, res) => {
    try {
        const notes = await Note.find({})
            .populate("owner");

        res.render("admin/notes", {
            notes
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
    res.render("admin/users", { users });
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
router.post("/users/:id/delete", isAdmin, async(req, res) => {
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