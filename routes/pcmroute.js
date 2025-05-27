const express = require('express');
const router = express.Router();

router.get('/',(req,res)=>{
  res.render('pcm');
});

router.get('/logout',(req,res)=>{
  req.session.destroy(err => {
    if (err) return res.json({msg : 'error',islogout : false});
    res.json({msg : 'logout succefully.',islogout : true})
  });
});

router.get('/percentilePredictor',(req,res)=>{
  if (req.session.user) {
    res.render('percentilepredictor'); 
  }else{
    res.send('Error');
  }
});

module.exports = router;