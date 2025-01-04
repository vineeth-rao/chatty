import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    //check if user already exists
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: "User already exists" });
    }
    //if not create user
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ name, email, password: hashPassword });
    if (newUser) {
      await newUser.save();
      generateToken(newUser._id, res);
      return res.status(201).json({
        success: true,
        message: "User created successfully!!!",
        user: {
          ...newUser._doc,
          password: "",
        },
      });
    }
    return res.status(400).json({ message: "Invalid user data" });
  } catch (error) {
    console.log("Error in signup controller", error.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Incorrect Credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect Credentials" });
    }
    generateToken(user._id, res);
    return res.status(200).json({
      success: true,
      message: "User logged in successfully!!!",
      user: {
        ...user._doc,
        password: "",
      },
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    return res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;
    if (!profilePic) {
      return res.status(400).json({ message: "Please upload profile pic" });
    }

    const uploadResult = await cloudinary.uploader
      .upload(profilePic)
      .catch((error) => {
        console.log(error);
      });
    const updateUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResult.secure_url },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully!!!",
      user: {
        ...updateUser._doc,
        password: "",
      },
    });
  } catch (error) {
    console.log("Error in updateProfile controller", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    return res
      .status(200)
      .json({ success: true, message: "Authorized", user: req.user });
  } catch (error) {
    console.log("Error in checkauth controller", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
