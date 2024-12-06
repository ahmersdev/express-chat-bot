import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      match: [
        /^[a-zA-Z0-9]+$/,
        "Username can only contain alphanumeric characters",
      ],
      validate: {
        validator: function (value) {
          return /^[a-zA-Z0-9]+$/.test(value);
        },
        message: "Username can only contain alphanumeric characters",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      // Removed minlength validation because hashed password is being passed to mongo so this won't work
      // minlength: [6, "Password must be at least 6 characters long"],
    },
    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: {
        values: ["male", "female"],
        message: "Gender must be either 'male' or 'female'",
      },
    },
    profilePic: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
