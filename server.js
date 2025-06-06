const express = require('express');
require('dotenv').config();
const path = require('path');
const app = express();
const {connectDB, db} = require('./database/db');
const session = require('express-session');
const isLoggedIn = require('./middleware/auth');


const MongoStore = require('connect-mongo');

app.use(session({
  secret: 'secret',
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI}),
  resave: false,
  saveUninitialized: false
}));


app.set('view engine', 'ejs');
app.set('views',path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
connectDB();
const port = process.env.PORT
const {User} = require('./database/schema');

// routes
app.get('/',isLoggedIn, async(req,res)=>{
  res.render('pcm');
});

const registerRoutes = require('./routes/registerroute'); 
app.use('/register',registerRoutes);

const loginRoutes = require('./routes/loginroute'); 
app.use('/login',loginRoutes);

const verificationRoutes = require('./routes/verificationroute'); 
app.use('/verification',verificationRoutes);

const pcmRoutes = require('./routes/pcmroute'); 
app.use('/pcm',pcmRoutes);

const pcbRoutes = require('./routes/pcbroute'); 
app.use('/pcb',pcbRoutes);

const collegePredictorPCMRoutes = require('./routes/collegePredictorPCMroute'); 
app.use('/collegePredictorPCM',collegePredictorPCMRoutes);

const collegePredictorPCBRoutes = require('./routes/collegePredictorPCBroute'); 
app.use('/collegePredictorPCB',collegePredictorPCBRoutes);

const collegePagePCMRoutes = require('./routes/collegePagePCMroute'); 
app.use('/collegePagePCM',collegePagePCMRoutes);

const collegePagePCBRoutes = require('./routes/collegePagePCBroute'); 
app.use('/collegePagePCB',collegePagePCBRoutes);

const branchwiseCutoffPCMRoutes = require('./routes/branchwiseCutoffPCMroute'); 
app.use('/branchwiseCutoffPCM',branchwiseCutoffPCMRoutes);

app.listen(port,()=>{
    console.log('server listing at port 8080');
})