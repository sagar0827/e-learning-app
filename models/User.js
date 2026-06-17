// const {Schema} = require('mongoose');
// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//   username: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   password: {
//     type: String,
//     required: true
//   }
// });

// module.exports = mongoose.model('User', userSchema);

const mongoose = require("mongoose");

const passportLocalMongoose = require("passport-local-mongoose").default;

const userSchema = new mongoose.Schema({

    email: {
        type: String,
        required: true,
        unique: true
    },
     
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    }

});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);