const express = require('express');
const router = express.Router();
const {User, OTP} = require('../database/schema');
require('dotenv').config();
const bcrypt = require('bcrypt');


router.get('/',(req,res)=>{
  res.render('register');
});


router.post('/Registration', async(req,res)=>{
  
  const userData = req.body;

  // console.log(userData);
  const hashPassword = await bcrypt.hash(userData.password, 10);
  try {

    const user = await User.findOne({ phone_number : userData.phone});
    const newUserData = {
        first_name : userData.firstName,
        last_name : userData.lastName,
        email : userData.email,
        phone_number : userData.phone,
        examType : userData.examType,
        password : hashPassword,
        isVerified : false
    };

    if(user && user.isVerified == true){
      return res.json({msg : `Already register using phone number ${userData.phone}.`,verification : false});
    }else if(user){
      await User.findOneAndUpdate(
        { phone_number: userData.phone },
        newUserData,
        { new: true }
      );
    }else{
      const newUser = new User(newUserData);
      await newUser.save();
    }
    
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.deleteMany({ phone : userData.phone });
    const newOtp = new OTP({
      phone: userData.phone,
      otp: otpCode
    });
    await newOtp.save();

    return res.json({msg : 'Verification done.',verification : true});
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: 'Internal Server Error' });
  }
});

module.exports = router;