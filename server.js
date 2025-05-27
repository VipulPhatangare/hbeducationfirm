const express = require('express');
require('dotenv').config();
const path = require('path');
const app = express();
const connectDB = require('./database/db');
const session = require('express-session');
const isLoggedIn = require('./middleware/auth');


app.use(session({
  secret: process.env.SESSION_SECRET,        
  resave: false,                     
  saveUninitialized: false,         
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }       
}));


app.set('view engine', 'ejs');
app.set('views',path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
connectDB();
const port = process.env.PORT


// routes
const registerRoutes = require('./routes/registerroute'); 
app.use('/register',registerRoutes);

const loginRoutes = require('./routes/loginroute'); 
app.use('/login',loginRoutes);

const verificationRoutes = require('./routes/verificationroute'); 
app.use('/verification',verificationRoutes);

const pcmRoutes = require('./routes/pcmroute'); 
app.use('/pcm',pcmRoutes);

app.get('/',isLoggedIn,(req,res)=>{
  res.render('pcm');
});

app.listen(port,()=>{
    console.log('server listing at port 8080');
})