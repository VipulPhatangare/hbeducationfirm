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

// routesclear
app.get('/',isLoggedIn, async(req,res)=>{
  res.redirect('/afterLoginPage');
});

const registerRoutes = require('./routes/registerroute'); 
app.use('/register',registerRoutes);

const afterLoginPageRoutes = require('./routes/afterLoginPageroute'); 
app.use('/afterLoginPage',afterLoginPageRoutes);

const loginRoutes = require('./routes/loginroute'); 
app.use('/login',loginRoutes);

const verificationRoutes = require('./routes/verificationroute'); 
app.use('/verification',verificationRoutes);

const pcmRoutes = require('./routes/pcmroute'); 
app.use('/pcm',pcmRoutes);

const pcbRoutes = require('./routes/pcbroute'); 
app.use('/pcb',pcbRoutes);

const bba_bmsRoutes = require('./routes/bba_bmsroute'); 
app.use('/bba_bms',bba_bmsRoutes);

const bcaRoutes = require('./routes/bcaroute');
app.use('/bca',bcaRoutes);

const neetRoutes = require('./routes/neetroute');
app.use('/neet',neetRoutes);

const collegePredictorPCMRoutes = require('./routes/collegePredictorPCMroute'); 
app.use('/collegePredictorPCM',collegePredictorPCMRoutes);

const collegePredictorPCBRoutes = require('./routes/collegePredictorPCBroute'); 
app.use('/collegePredictorPCB',collegePredictorPCBRoutes);

const collegePredictorBBABMSRoutes = require('./routes/collegePredictorBBABMSroute'); 
app.use('/collegePredictorBBABMS',collegePredictorBBABMSRoutes);

const collegePredictorBCARoutes = require('./routes/collegePredictorBCAroute'); 
app.use('/collegePredictorBCA',collegePredictorBCARoutes);

const collegePredictorNeetRoutes = require('./routes/collegePredictorNeetroute'); 
app.use('/collegePredictorNeet',collegePredictorNeetRoutes);

const collegePagePCMRoutes = require('./routes/collegePagePCMroute'); 
app.use('/collegePagePCM',collegePagePCMRoutes);

const collegePagePCBRoutes = require('./routes/collegePagePCBroute'); 
app.use('/collegePagePCB',collegePagePCBRoutes);

const collegePageBBABMSRoutes = require('./routes/collegePageBBABMSroute'); 
app.use('/collegePageBBABMS',collegePageBBABMSRoutes);

const collegePageBCARoutes = require('./routes/collegePageBCAroute'); 
app.use('/collegePageBCA',collegePageBCARoutes);

const collegePageNeetRoutes = require('./routes/collegePageNeetroute'); 
app.use('/collegePageNeet',collegePageNeetRoutes);

const branchwiseCutoffPCMRoutes = require('./routes/branchwiseCutoffPCMroute'); 
app.use('/branchwiseCutoffPCM',branchwiseCutoffPCMRoutes);

app.listen(port,()=>{
    console.log('server listing at port 8080');
})