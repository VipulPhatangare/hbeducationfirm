const express = require('express');
const router = express.Router();
const {User} = require('../database/schema');
const bcrypt = require('bcrypt');
const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);


router.get('/',(req,res)=>{
  res.render('login');
});

router.get('/:examtype',(req,res)=>{
  // console.log(req.params);
  res.render('login');
});

router.post('/checkCredentials', async(req,res)=>{
  const {phone, password} = req.body;
  const hashPassword = await bcrypt.hash(password,10);
  // console.log(hashPassword);
  try {
    const user = await User.findOne({phone_number : phone});
    if(!user){
      return res.json({msg: `Invalid phone number.`,login : false});
    }else{
      const isMatch = await bcrypt.compare(password,user.password);
      if(!isMatch){
        return res.json({msg: `Invalid password.`,login : false});
      }
      req.session.user = {phone : phone, password : hashPassword};
      return res.json({msg: `Login successful!`,login : true});
    }
  } catch (error) {
    console.log(error);
  }
});


router.post('/forgotPasswordOtp', async(req,res)=>{
  const {phone, otp} = req.body;
  const phone_number = `+91${phone}`;
  try {

    const user = await User.findOne({phone_number : phone});
    if(!user){
      return res.json({msg : 'Invalid phone number.', issend : false});
    }
    await client.messages.create({
      body: `Your OTP is ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone_number,
    });
    
    return res.json({msg : '', issend : true});
  } catch (error) {
    console.log(error);
  }
});


router.post('/forgotPasswordResendOtp', async(req,res)=>{
  const {phone, otp} = req.body;
  const phone_number = `+91${phone}`;
  try {

    await client.messages.create({
      body: `Your OTP is ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone_number,
    });
    
    return res.json({msg : '', issend : true});
  } catch (error) {
    console.log(error);
  }
});


router.post('/resetPassword', async(req,res)=>{
  const {phone, password} = req.body;
  const hashPassword = await bcrypt.hash(password, 10);
  try {

    const user = await User.findOne({phone_number : phone});
    if(!user){
      return res.json({msg : 'Network issue.', isreset : false});
    }
    await User.findOneAndUpdate(
      { phone_number : phone },
      { password : hashPassword},
      { new: true }
    );
    req.session.user = {phone : phone, password : hashPassword};
    return res.json({msg : 'Password reset successfully!', isreset : true});
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;