const mongoose = require('mongoose');
require('dotenv').config();
const mysql = require("mysql2");
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);



const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

const db = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,  
    multipleStatements: true
});

db.connect((err)=>{
    if(err){
        console.log("Mysql connection failed."+err.stack);
        return;
    }else{
        console.log("Mysql connection estabilish sucssefully.."+db.threadId);
    }
});

module.exports = {connectDB, db, supabase};