import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import generateTokenAndSetCookie from "../utils/generate-token.js";

export const signup = async (req, res) => {
  try {
    const { fullName, username, password, confirmPassword, gender } = req.body;

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
        status: 400,
        success: false,
      });
    }

    // Check password length
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
        status: 400,
        success: false,
      });
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        message: "Username is already taken",
        status: 400,
        success: false,
      });
    }

    // Generate a hashed password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Set profile picture based on gender
    const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`;
    const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`;
    const profilePic = gender === "male" ? boyProfilePic : girlProfilePic;

    // Create a new user instance
    const newUser = new User({
      fullName,
      username,
      password: hashedPassword,
      gender,
      profilePic,
    });

    await newUser.save();

    // Respond with success
    generateTokenAndSetCookie(newUser._id, res);
    res.status(201).json({
      user: {
        _id: newUser._id,
        fullName: newUser.fullName,
        username: newUser.username,
        gender: newUser.gender,
        profilePic: newUser.profilePic,
      },
      message: "User registered successfully",
      status: 201,
      success: true,
    });
  } catch (error) {
    console.log("Error in signup controller", error.message);
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        message: errors.join(", "),
        status: 400,
        success: false,
      });
    }

    res.status(500).json({
      message: "Something went wrong",
      status: 500,
      success: false,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({
        message: "User Doesn't Exist",
        status: 400,
        success: false,
      });
    }
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    );
    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Password is Incorrect",
        status: 400,
        success: false,
      });
    }

    generateTokenAndSetCookie(user._id, res);

    res.status(200).json({
      user: {
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        gender: user.gender,
        profilePic: user.profilePic,
      },
      message: "User logged in successfully",
      status: 200,
      success: true,
    });
  } catch (error) {
    console.log("Error in signin controller", error.message);

    res.status(500).json({
      message: "Something went wrong",
      status: 500,
      success: false,
    });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("chatBotJwtToken", "", { maxAge: 0 });
    res.status(200).json({
      message: "Logged out successfully",
      status: 200,
      success: true,
    });
  } catch (error) {
    console.log("Error in logout controller", error.message);

    res.status(500).json({
      message: "Something went wrong",
      status: 500,
      success: false,
    });
  }
};
