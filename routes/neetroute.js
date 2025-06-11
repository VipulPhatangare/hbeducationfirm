const express = require('express');
const router = express.Router();
const {db, supabase} = require('../database/db');

router.get('/',(req,res)=>{
  res.render('neet');
});

router.get('/logout',(req,res)=>{
  req.session.destroy(err => {
    if (err) return res.json({msg : 'error',islogout : false});
    res.json({msg : 'logout succefully.',islogout : true})
  });
});


router.get('/collegePredictorNeet',(req,res)=>{
  if (req.session.user) {
    res.render('collegePredictorNeet'); 
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

router.get('/topCollegeNeet',(req,res)=>{
  if (req.session.user) {
    res.render('topCollegeNeet'); 
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
      .from('neet_cutoff')
      .select('college_code, college_name, city,rank, college_type, branch_code');

    if (formData.college_type !== 'All' && formData.branch === "All") {
      query = query.eq('college_type', formData.college_type);
    }

    if (formData.college_type === 'All' && formData.branch !== "All") {
      query = query.eq('branch_code', formData.branch);
    }

    if (formData.college_type !== 'All' && formData.branch !== "All") {
      query = query
                .eq('branch_code', formData.branch)
                .eq('college_type', formData.college_type);
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

    colleges.sort((a, b) => a.rank - b.rank);
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
      .from('neet_cutoff')
      .select('college_code, college_name');

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

router.get('/fetchcity', async (req, res) => {
  try {
    const { data, error } = await supabase
            .from('neet_cutoff')
            .select('city')
            .not('city', 'is', null)
            .order('city', { ascending: true });
        
        if (error) throw error;

    const distinctCities = [...new Set(data.map(item => item.city.trim()))];
    // console.log(distinctCities.map(city => ({ city })));
    res.json(distinctCities.map(city => ({ city })));
    
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;