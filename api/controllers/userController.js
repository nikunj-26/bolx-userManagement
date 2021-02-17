"use strict";

var mongoose = require("mongoose"),
  User = mongoose.model("User");
const { query } = require("express");
var jwt = require("jsonwebtoken");

const bcrypt = require("bcryptjs");
const JWT_SECRET =
  "sdjkfh8923yhjdksbfma@#*(&@*!^#&@bhjb2qiuhesdbhjdsfg839ujkdhfjk";

exports.createUser = async function (req, res) {
  try {
    var userparams = req.body;
    console.log(userparams)

    userparams['password'] = await bcrypt.hash(userparams['password'], 10);

    const new_user = new User(userparams);
    await new_user.save();
    console.log("User created successfully: ", new_user);
  }   catch(error){
  
    if(error.code === 11000){
      
      if (error.keyPattern['email'] == 1) {
      return res.json({status:"ERROR",error:'Email Id already in Use'})
      }
    }
    throw error;
  }
  res.json({ status: "SUCCESS" });
};

exports.loginUser = async function (req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).lean();

  if (!user) {
    return res.json({ status: "ERROR", error: "Invalid email/password" });
  }

  if (await bcrypt.compare(password, user.password)) {
    const token = jwt.sign(
      {
        email: user.email,
      },
      JWT_SECRET
    );

    const userDetails = {
      status: "SUCCESS",
      accesstoken: token,
      email: user.email
    };
    return res.send(JSON.stringify(userDetails));
  }

  res.json({ status: "ERROR", error: "Invalid email/password" });
};

exports.validateToken = async function (req, res) {
  //const bearerHeader = req.headers['authorization'].split(" ")[1];
   // console.log(bearerHeader);
    jwt.verify(req.body['token'], JWT_SECRET, (err, verifiedJwt) => {
        if (err) {
          return res.json({status:"ERROR",error:'Invalid Token'})
        } else {
          return res.json({status:"SUCCESS"})
        } 

    })
  };

  exports.editFavorite= async function (req , res){
    const { email, product_id, action } = req.body;
    console.log(email)
    console.log(product_id)
    try {
     if (action == "ADD") {
      await User.updateOne( { email },{ $addToSet: { favorites: product_id } });
     } else if (action == "REMOVE") {
      await User.updateOne( { email },{ $pull: { favorites: product_id } });
     }
    } catch (error) {
      return res.json({status:"ERROR", error : error})
    }
    return res.json({status:"SUCCESS"})
  };

  exports.getUsers= async function (req , res){
    const users = await User.find({ });
    return res.json(users)

  };