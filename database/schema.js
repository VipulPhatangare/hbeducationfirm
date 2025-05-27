const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    email : String,
    phone_number : Number,
    first_name : String,
    last_name : String,
    exam_type : String,
    password : String,
    otp : Number,
    gender : String,
    caste : String,
    special_category : String,
    home_university : String,
    isVerified : Boolean,
    examType : String
});

const otpSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true
  },
  otp: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 
  }
});

const User = mongoose.model('User', userSchema);
const OTP = mongoose.model('OTP', otpSchema);
module.exports = {User, OTP};