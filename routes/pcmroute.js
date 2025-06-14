const express = require('express');
const router = express.Router();
const {db, supabase} = require('../database/db');
const {promoCode} = require('../database/schema');

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

router.get('/collegePredictorPCM',(req,res)=>{
  if (req.session.user) {
    res.render('collegePredictorPCM'); 
  }else{
    res.send('Error');
  }
});

router.get('/branchCutoffs',(req,res)=>{
  if (req.session.user) {
    res.render('branchwiseCutoffPCM'); 
  }else{
    res.send('Error');
  }
});

router.get('/topCollegePCM',(req,res)=>{
  if (req.session.user) {
    res.render('topCollegePCM'); 
  }else{
    res.send('Error');
  }
});


function college_filter_by_city(colleges, cityArray) {
  const normalizedCityArray = cityArray.map(c => c.trim().toUpperCase());

  return colleges.filter(college => 
    normalizedCityArray.includes(college.city.trim().toUpperCase())
  );
}

router.post('/topCollegeList', async (req, res) => {
  try {
    const formData = req.body;
    // console.log(formData);

    let query = supabase
      .from('college_info_with_points')
      .select('college_id, college_name, city,college_points,university');

    // Apply university filter if not 'All'
    if (formData.university !== 'All') {
      query = query.eq('university', formData.university);
    }

    // Execute the query
    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    // Apply city filter if not 'All'
    let colleges = data;
    if (formData.cities[0] !== 'All') {
      colleges = college_filter_by_city(data, formData.cities);
    }

    colleges.sort((a, b) => b.college_points - a.college_points);
    // console.log(colleges);
    return res.json(colleges);
    
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});


router.get('/collegeNames', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('college_info_with_points')
      .select('college_id, college_name');

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    return res.json(data);
    
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post('/checkCode', async (req,res)=>{

  try {

    const {promo_code} = req.body;
    console.log(promo_code);
    
    const code = await promoCode.findOne({ code : promo_code});
    if(!code){
      return res.json({msg:'Invalid code.',iserr: true});
    }else if(code && code.count == 0){
      return res.json({msg : 'Code limit is over.', iserr : true})
    }else{
      return res.json({msg:'Sucssesfully updated.',iserr: false})
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;