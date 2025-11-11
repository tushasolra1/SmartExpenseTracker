const express = require("express");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


//TOKEN GENERATION 
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",                                           // Token valid for 30 days
  });
};



// USER REGISTRATION
const userRegister = asyncHandler(async(req, res) => {
  const  { firstName, lastName, email, password} = req.body;
  if(!firstName || !email || !password){
    res.status(400);
    throw new Error("Some Fields are Mandatory!");
  }
  const userAvailable = await User.findOne({email});
  if(userAvailable){
    res.status(400);
    throw new Error("Email Alredy Registered!");
  }
  

// Hash password
const hashedPassword = await bcrypt.hash(password, 10);

// Create new user
const user = await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
  });


if (user) {
 res.status(201).json({
 _id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      token: generateToken(user.id),
    });
console.log("✅ User Registered Successfully!");
 } else {
    res.status(400);
    throw new Error("Invalid user data");
}
});


// USER LOGIN
const userLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please enter both email and password!");
  }

  // Find user by email
  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    // Password matched → generate token
    res.status(200).json({
      _id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      token: generateToken(user.id),
      message: "User Logged In Successfully!",
    });

    console.log("✅ User Logged In Successfully!");
  } else {
    res.status(401);
    throw new Error("Invalid email or password!");
  }
});

module.exports = {userLogin, userRegister};