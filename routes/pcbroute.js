const express = require('express');
const router = express.Router();
const {db, supabase} = require('../database/db');

router.get('/',(req,res)=>{
  res.render('pcb');
});

router.get('/logout',(req,res)=>{
  req.session.destroy(err => {
    if (err) return res.json({msg : 'error',islogout : false});
    res.json({msg : 'logout succefully.',islogout : true})
  });
});


router.get('/collegePredictorPCB',(req,res)=>{
  if (req.session.user) {
    res.render('collegePredictorPCB'); 
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

router.get('/topCollegePCB',(req,res)=>{
  if (req.session.user) {
    res.render('topCollegePCB'); 
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
      .from('phamacy_college_info')
      .select('college_id, college_name, city,points,university');

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

    colleges.sort((a, b) => b.points - a.points);
    // console.log(colleges);
    return res.json(colleges);
    
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});


router.get('/fetchUniversity', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('phamacy_college_info')
            .select('university')
            .not('university', 'is', null)
            .order('university', { ascending: true });
        
        if (error) throw error;
        
        // Get distinct universities
        const distinctUniversities = [...new Set(data.map(item => item.university))];
        // console.log(distinctUniversities.map(univ => ({ university: univ })))
        res.json(distinctUniversities.map(univ => ({ university: univ })));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch universities' });
    }
});

router.get('/collegeNames', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('phamacy_college_info')
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

router.get('/fetchcity', async (req, res) => {
  try {
    const { data, error } = await supabase
            .from('phamacy_college_info')
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