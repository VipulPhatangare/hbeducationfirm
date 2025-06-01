const express = require('express');
const router = express.Router();
const {db, supabase} = require('../database/db');

router.get('/:id',async(req,res)=>{
  const {id} = req.params;

  if (req.session.user) {
    res.render('collegePagePCM',{id}); 
  }else{
    res.send('Error');
  }
});


router.post('/collegeInfo',async(req,res)=>{
  const {college_code} = req.body;
  // console.log(college_code);
  try {

    let query = supabase
      .from('college_info_with_points')
      .select('college_id, college_name, city, status, university')
      .eq('college_id', college_code);
    
    const { data, error } = await query;

    if(error){
      console.log(error);
    }else{
      res.json(data);
    }
  } catch (error) {
    console.log(error);
  }
});


router.post('/collegeBranchInfo',async(req,res)=>{
  const {college_code} = req.body;
  // console.log(college_code);
  try {
    const { data, error } = await supabase
      .rpc('get_branch_percentiles', { college_code_input: `${college_code}` });

    if (error) {
      console.error('Supabase RPC Error:', error);
      return res.status(500).send('Database error');
    }
    res.json(data);

  } catch (error) {
    console.log(error);
  }
});

module.exports = router;