const express = require('express');
const router = express.Router();
const {db, supabase} = require('../database/db');

router.get('/',(req,res)=>{
  res.render('collegePredictorNeet');
});



function customRound(value) {
    if (value >= 99.6) return 100;
    const intPart = Math.floor(value);
    const decimal = value - intPart;

    if (decimal > 0 && decimal <= 0.4) {
        return intPart + 0.5;
    } else if (decimal > 0.4) {
        return intPart + 1;
    } else {
        return value; // already a whole number
    }
}


async function getRankFromPercentile(percentile) {
    const roundedPercentile = customRound(percentile);

    try {
        const { data, error } = await supabase
            .from('bba_bms_percentile_to_rank')
            .select('rank')
            .eq('percentile', roundedPercentile)
            .single();
        
        if (error) throw error;
        return data?.rank || null;
    } catch (error) {
        console.error('Error fetching rank:', error);
        throw error;
    }
}




function calculateRankRange(rank) {
    let minRank = rank - 30000;
    let maxRank = rank + 300000;

    if (rank < 30000) {
        minRank = 0;
    }

    new_data_of_student.minRank = minRank;
    new_data_of_student.maxRank = maxRank;
}

function clear_new_data_function() {
    new_data_of_student.caste_name = '';
    new_data_of_student.caste_Column_H = '';
    new_data_of_student.caste_Column_S = '';
    new_data_of_student.caste_Column_O = '';
    new_data_of_student.specialReservation = '';
}



const new_data_of_student = {
    caste_name : '',
    caste_Column_S: '',
    caste_Column_O: '',
    caste_Column_H: '',
    specialReservation: '',
    minRank : 0,
    maxRank : 0
};




async function getColleges(formData) {

    calculateRankRange(formData.percentile);
    let condition = '';
    let columns = '';
    if(formData.caste === 'EWS'){
        columns += `r."LEWS",`;
        condition += `(r."LEWS" BETWEEN ${new_data_of_student.minRank} AND ${new_data_of_student.maxRank}) AND`;
    }else{
        columns += `NULL::bigint AS LEWS,`;
    }

    if(formData.caste === 'SEBC'){
        columns += `r."LSEBC",`;
        condition += `(r."LSEBC" BETWEEN ${new_data_of_student.minRank} AND ${new_data_of_student.maxRank}) AND`;
    }else{
        columns += `NULL::bigint AS LSEBC,`;
    }

    if(formData.caste === 'OBC'){
         columns += `r."LOBC",`;
        condition += `(r."LOBC" BETWEEN ${new_data_of_student.minRank} AND ${new_data_of_student.maxRank}) AND`;
    }else{
        columns += `NULL::bigint AS LOBC,`;
    }

    if(formData.caste === 'NT1'){
         columns += `r."LNT1",`;
        condition += `(r."LNT1" BETWEEN ${new_data_of_student.minRank} AND ${new_data_of_student.maxRank}) AND`;
    }else{
        columns += `NULL::bigint AS LNT1,`;
    }

    if(formData.caste === 'NT2'){
         columns += `r."LNT2",`;
        condition += `(r."LNT2" BETWEEN ${new_data_of_student.minRank} AND ${new_data_of_student.maxRank}) AND`;
    }else{
        columns += `NULL::bigint AS LNT2,`;
    }

    if(formData.caste === 'NT3'){
         columns += `r."LNT3",`;
        condition += `(r."LNT3" BETWEEN ${new_data_of_student.minRank} AND ${new_data_of_student.maxRank}) AND`;
    }else{
        columns += `NULL::bigint AS LNT3,`;
    }

    if(formData.caste === 'VJ'){
         columns += `r."LVJ",`;
        condition += `(r."LVJ" BETWEEN ${new_data_of_student.minRank} AND ${new_data_of_student.maxRank}) AND`;
    }else{
        columns += `NULL::bigint AS LVJ,`;
    }

    if(formData.caste === 'ST'){
         columns += `r."LST",`;
        condition += `(r."LST" BETWEEN ${new_data_of_student.minRank} AND ${new_data_of_student.maxRank}) AND`;
    }else{
        columns += `NULL::bigint AS LST,`;
    }

    if(formData.caste === 'SC'){
         columns += `r."LSC",`;
        condition += `(r."LVJ" BETWEEN ${new_data_of_student.minRank} AND ${new_data_of_student.maxRank}) AND`;
    }else{
        columns += `NULL::bigint AS LSC,`;
    }

    condition += `(r."LOPEN" BETWEEN ${new_data_of_student.minRank} AND ${new_data_of_student.maxRank}) `;
     columns += `r."LOPEN"`;
    // console.log(condition);
    try {
        const { data, error } = await supabase.rpc('get_branch_choices_neet', {
                columns : columns,
                condition: condition
            });
        
        if(error){
            console.log(error);
        }else{
            
            // console.log(data);
            const colleges =  college_filter(data, formData);
            colleges.sort((a, b) => a.rank - b.rank);
            // console.log(colleges);
            return colleges;
        }
               
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ 
            error: 'Internal server error',
            message: err.message 
        });
    }

}



function college_filter_by_city(colleges, city){
    return colleges.filter(element =>  city.includes(element.city));
}




function college_filter(colleges, formData){

    if(formData.city[0] != 'All'){
        colleges = college_filter_by_city(colleges, formData.city);
    }

    let college_list = [];

    if(formData.branchCategory !== 'All'){
        colleges.forEach(element => {
            if(element.branch_code == formData.branchCategory){
                college_list.push(element);
            }
        });
    }else{
        college_list = colleges;
    }

    return college_list;
};


router.post('/College_list', async(req,res)=>{

    const formData = req.body;
    // console.log(formData);
    clear_new_data_function();

    try {
        const colleges = await getColleges(formData);
        // console.log(colleges);
        res.json(colleges);

    } catch (error) {
        console.log(error);
    }
});




module.exports = router;