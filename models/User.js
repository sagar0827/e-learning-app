
const mongoose = require("mongoose");

const passportLocalMongoose = require("passport-local-mongoose").default;

const userSchema = new mongoose.Schema({
     
    username: {
     type: String,
     required: true,
    unique: true
      },
    email: {
        type: String,
        required: true,
        unique: true
    },

    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    isOnline: {
        type: Boolean,
        default: false
    }
},
    { timestamps: true 

});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);