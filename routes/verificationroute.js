const express = require('express');
const router = express.Router();
const {User, OTP} = require('../database/schema');
require('dotenv').config();
const twilio = require("twilio");
const bcrypt = require('bcrypt');


const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

router.get('/:phone', async(req,res)=>{

    const phone = req.params.phone;

    try {
        const otpDocument = await OTP.findOne({phone});
        let phone_number = `+91${phone}`;
        let otp;
        if(otpDocument){
            otp = otpDocument.otp;
        }else{
            otp = Math.floor(100000 + Math.random() * 900000).toString();
            const newOtp = new OTP({
                phone: phone,
                otp: otp
            });
            await newOtp.save();
        }


        await client.messages.create({
            body: `Your OTP is ${otp}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phone_number,
        });

        res.render('verification',{phone : phone, otp : otp});
    } catch (error) {
        console.log(error);
    };
});

router.post('/resendOTP', async(req, res)=>{
    const {otp, phone} = req.body;

    try {
        
        let phone_number = `+91${phone}`;
        await OTP.deleteMany({ phone : phone });
        const newOtp = new OTP({
            phone: phone,
            otp: otp
        });
        await newOtp.save();
        await client.messages.create({
            body: `Your OTP is ${otp}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phone_number,
        });

    } catch (error) {
        console.log(error);
    };
});

router.post('/verificationComfirmation',async(req,res)=>{
    const {phone} = req.body;
    // console.log(phone);
    try {
        const user = await User.findOne({phone_number : phone});
        if(user){
            await User.findOneAndUpdate(
                { phone_number:phone },
                { isVerified: true },
                { new: true }
            );
            return res.json({verified : true});
        }

        return res.json({verified : false});
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;