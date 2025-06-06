const express = require('express');
const router = express.Router();
const {db, supabase} = require('../database/db');

router.get('/',(req,res)=>{
  res.render('branchwiseCutoffPCM');
});


router.get('/University_fetch', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('college_info')
            .select('university')
            .not('university', 'is', null)
            .order('university', { ascending: true });
        
        if (error) throw error;
        
        // Get distinct universities
        const distinctUniversities = [...new Set(data.map(item => item.university))];
        res.json(distinctUniversities.map(univ => ({ university: univ })));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch universities' });
    }
});

router.get('/fetch_other_branches', async (req, res) => {
    const { data, error } = await supabase
        .from('branch_new')
        .select('branch_name')
        .eq("Branch_category", 'OTHER');

    if (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch data from Supabase' });
    } else {
        res.json(data);
    }
});

router.get('/city_fetch', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('college_info')
            .select('city')
            .not('city', 'is', null)
            .order('city', { ascending: true });
        
        if (error) throw error;
        
        // Trim and get distinct cities
        const distinctCities = [...new Set(data.map(item => item.city.trim()))];
        res.json(distinctCities.map(city => ({ city })));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch cities' });
    }
});






router.post('/branch_wise_cutoff', async(req,res)=>{

    const formData = req.body;
    // console.log(formData);

    formData.homeUniversity = formData.university;
    let caste_column = '';
    let caste_condition = '';

    if (formData.caste == 'EWS') {
        caste_column += `
        r."EWS" || ' (' || COALESCE((SELECT m.percentile FROM merit_list AS m WHERE m."Rank" = r."EWS" LIMIT 1), '0') || ')' AS ews,
        `;
    }else{
        caste_column += `
            NULL::TEXT AS ews,
        `;
    }

    //  TFWS
    if (formData.tfws) {
        caste_column += `
            r."TFWS" || ' (' || COALESCE((SELECT m.percentile FROM merit_list AS m WHERE m."Rank" = r."TFWS" LIMIT 1), '0') || ')' AS def,
        `;
    }else{
        caste_column += `
            NULL::TEXT AS tfws,
        `;
    }

    // LOPEN
    if (formData.gender == 'Female') {
        caste_column += `
            CASE
                WHEN r."LOPENS" <> 0 AND r."LOPENO" = 0 AND r."LOPENH" = 0 THEN r."LOPENS"::TEXT
                WHEN c.university = '${formData.homeUniversity}' THEN r."LOPENH"::TEXT
                ELSE r."LOPENO"::TEXT
            END || ' (' || COALESCE(
                        (SELECT m.percentile 
                         FROM merit_list AS m 
                         WHERE m."Rank" = 
                             CASE
                                 WHEN r."LOPENS" <> 0 AND r."LOPENO" = 0 AND r."LOPENH" = 0 THEN r."LOPENS"
                                 WHEN c.university = '${formData.homeUniversity}' THEN r."LOPENH"
                                 ELSE r."LOPENO"
                             END
                         LIMIT 1), '0'
                    ) || ')' AS lopen,
        `;
    }else{
        caste_column += `
            NULL::TEXT AS lopen,
        `;
    } 

    if (formData.caste == 'OBC' && formData.gender == 'Male') {
        caste_column += `
            CASE
                WHEN r."GOBCS" <> 0 AND r."GOBCO" = 0 AND r."GOBCH" = 0 THEN r."GOBCS"::TEXT
                WHEN c.university = '${formData.homeUniversity}' THEN r."GOBCH"::TEXT
                ELSE r."GOBCO"::TEXT
            END || ' (' || COALESCE(
                        (SELECT m.percentile 
                         FROM merit_list AS m 
                         WHERE m."Rank" = 
                             CASE
                                 WHEN r."GOBCS" <> 0 AND r."GOBCO" = 0 AND r."GOBCH" = 0 THEN r."GOBCS"
                                 WHEN c.university = '${formData.homeUniversity}' THEN r."GOBCH"
                                 ELSE r."GOBCO"
                             END
                         LIMIT 1), '0'
                    ) || ')' AS gobc,
        `;

    }else{
        caste_column += `
            NULL::TEXT AS gobc,
        `;
    } 

    // LOBC
    if (formData.caste == 'OBC' && formData.gender == 'Female') {
        caste_column += `
            CASE
                WHEN r."LOBCS" <> 0 AND r."LOBCO" = 0 AND r."LOBCH" = 0 THEN r."LOBCS"::TEXT
                WHEN c.university = '${formData.homeUniversity}' THEN r."LOBCH"::TEXT
                ELSE r."LOBCO"::TEXT
            END || ' (' || COALESCE(
                        (SELECT m.percentile 
                         FROM merit_list AS m 
                         WHERE m."Rank" = 
                             CASE
                                 WHEN r."LOBCS" <> 0 AND r."LOBCO" = 0 AND r."LOBCH" = 0 THEN r."LOBCS"
                                 WHEN c.university = '${formData.homeUniversity}' THEN r."LOBCH"
                                 ELSE r."LOBCO"
                             END
                         LIMIT 1), '0'
                    ) || ')' AS lobc,
        `;

    }else{
        caste_column += `
            NULL::TEXT AS lobc,
        `;
    } 

    // GSEBC
    if (formData.caste == 'SEBC' && formData.gender == 'Male') {
        caste_column += `
            CASE
                WHEN r."GSEBCS" <> 0 AND r."GSEBCO" = 0 AND r."GSEBCH" = 0 THEN r."GSEBCS"::TEXT
                WHEN c.university = '${formData.homeUniversity}' THEN r."GSEBCH"::TEXT
                ELSE r."GSEBCO"::TEXT
            END || ' (' || COALESCE(
                        (SELECT m.percentile 
                         FROM merit_list AS m 
                         WHERE m."Rank" = 
                             CASE
                                 WHEN r."GSEBCS" <> 0 AND r."GSEBCO" = 0 AND r."GSEBCH" = 0 THEN r."GSEBCS"
                                 WHEN c.university = '${formData.homeUniversity}' THEN r."GSEBCH"
                                 ELSE r."GSEBCO"
                             END
                         LIMIT 1), '0'
                    ) || ')' AS gsebc,
        `;

    }else{
        caste_column += `
            NULL::TEXT AS gsebc,
        `;
    }

    // LSEBC 
    if (formData.caste == 'SEBC' && formData.gender == 'Female') {
        caste_column += `
            CASE
                WHEN r."LSEBCS" <> 0 AND r."LSEBCO" = 0 AND r."LSEBCH" = 0 THEN r."LSEBCS"::TEXT
                WHEN c.university = '${formData.homeUniversity}' THEN r."LSEBCH"::TEXT
                ELSE r."LSEBCO"::TEXT
            END || ' (' || COALESCE(
                        (SELECT m.percentile 
                         FROM merit_list AS m 
                         WHERE m."Rank" = 
                             CASE
                                 WHEN r."LSEBCS" <> 0 AND r."LSEBCO" = 0 AND r."LSEBCH" = 0 THEN r."LSEBCS"
                                 WHEN c.university = '${formData.homeUniversity}' THEN r."LSEBCH"
                                 ELSE r."LSEBCO"
                             END
                         LIMIT 1), '0'
                    ) || ')' AS lsebc,
        `;  
    }else{
        caste_column += `
            NULL::TEXT AS lsebc,
        `;
    }

    // GST
    if (formData.caste == 'ST' && formData.gender == 'Male') {
        caste_column += `
            CASE
                WHEN r."GSTS" <> 0 AND r."GSTO" = 0 AND r."GSTH" = 0 THEN r."GSTS"::TEXT
                WHEN c.university = '${formData.homeUniversity}' THEN r."GSTH"::TEXT
                ELSE r."GSTO"::TEXT
            END || ' (' || COALESCE(
                        (SELECT m.percentile 
                         FROM merit_list AS m 
                         WHERE m."Rank" = 
                             CASE
                                 WHEN r."GSTS" <> 0 AND r."GSTO" = 0 AND r."GSTH" = 0 THEN r."GSTS"
                                 WHEN c.university = '${formData.homeUniversity}' THEN r."GSTH"
                                 ELSE r."GSTO"
                             END
                         LIMIT 1), '0'
                    ) || ')' AS gst,
        `;

    }else{
        caste_column += `
            NULL::TEXT AS gst,
        `;
    }
    
    // LST
    if (formData.caste == 'ST' && formData.gender == 'Female') {
        caste_column += `
            CASE
                WHEN r."LSTS" <> 0 AND r."LSTO" = 0 AND r."LSTH" = 0 THEN r."LSTS"::TEXT
                WHEN c.university = '${formData.homeUniversity}' THEN r."LSTH"::TEXT
                ELSE r."LSTO"::TEXT
            END || ' (' || COALESCE(
                        (SELECT m.percentile 
                         FROM merit_list AS m 
                         WHERE m."Rank" = 
                             CASE
                                 WHEN r."LSTS" <> 0 AND r."LSTO" = 0 AND r."LSTH" = 0 THEN r."LSTS"
                                 WHEN c.university = '${formData.homeUniversity}' THEN r."LSTH"
                                 ELSE r."LSTO"
                             END
                         LIMIT 1), '0'
                    ) || ')' AS lst,
        `;

    }else{
        caste_column += `
            NULL::TEXT AS lst,
        `;
    }

    // GSC
    if (formData.caste == 'SC' && formData.gender == 'Male') {
        caste_column += `
            CASE
                WHEN r."GSCS" <> 0 AND r."GSCO" = 0 AND r."GSCH" = 0 THEN r."GSCS"::TEXT
                WHEN c.university = '${formData.homeUniversity}' THEN r."GSTH"::TEXT
                ELSE r."GSCO"::TEXT
            END || ' (' || COALESCE(
                        (SELECT m.percentile 
                         FROM merit_list AS m 
                         WHERE m."Rank" = 
                             CASE
                                 WHEN r."GSCS" <> 0 AND r."GSCO" = 0 AND r."GSCH" = 0 THEN r."GSCS"
                                 WHEN c.university = '${formData.homeUniversity}' THEN r."GSCH"
                                 ELSE r."GSCO"
                             END
                         LIMIT 1), '0'
                    ) || ')' AS gsc,
        `;

    }else{
        caste_column += `
            NULL::TEXT AS gsc,
        `;
    }

    // LSC
    if (formData.caste == 'SC' && formData.gender == 'Female') {
        caste_column += `
            CASE
                WHEN r."LSCS" <> 0 AND r."LSTO" = 0 AND r."LSCH" = 0 THEN r."LSCS"::TEXT
                WHEN c.university = '${formData.homeUniversity}' THEN r."LSCH"::TEXT
                ELSE r."LSCO"::TEXT
            END || ' (' || COALESCE(
                        (SELECT m.percentile 
                         FROM merit_list AS m 
                         WHERE m."Rank" = 
                             CASE
                                 WHEN r."LSCS" <> 0 AND r."LSCO" = 0 AND r."LSCH" = 0 THEN r."LSCS"
                                 WHEN c.university = '${formData.homeUniversity}' THEN r."LSCH"
                                 ELSE r."LSCO"
                             END
                         LIMIT 1), '0'
                    ) || ')' AS lsc,
        `;

    }else{
        caste_column += `
            NULL::TEXT AS lsc,
        `;
    }

    // GNT1
    if (formData.caste == 'NT1' && formData.gender == 'Male') {
        caste_column += `
            CASE
                WHEN r."GNT1S" <> 0 AND r."GNT1O" = 0 AND r."GNT1H" = 0 THEN r."GNT1S"::TEXT
                WHEN c.university = '${formData.homeUniversity}' THEN r."GNT1H"::TEXT
                ELSE r."GNT1O"::TEXT
            END || ' (' || COALESCE(
                        (SELECT m.percentile 
                         FROM merit_list AS m 
                         WHERE m."Rank" = 
                             CASE
                                 WHEN r."GNT1S" <> 0 AND r."GNT1O" = 0 AND r."GNT1H" = 0 THEN r."GNT1S"
                                 WHEN c.university = '${formData.homeUniversity}' THEN r."GNT1H"
                                 ELSE r."GNT1O"
                             END
                         LIMIT 1), '0'
                    ) || ')' AS gnt1,
        `;

    }else{
        caste_column += `
            NULL::TEXT AS gnt1,
        `;
    }

    // LNT1
    if (formData.caste == 'NT1' && formData.gender == 'Female') {
        caste_column += `
            CASE
                WHEN r."LNT1S" <> 0 AND r."LNT1O" = 0 AND r."LNT1H" = 0 THEN r."LNT1S"::TEXT
                WHEN c.university = '${formData.homeUniversity}' THEN r."LNT1H"::TEXT
                ELSE r."LNT1O"::TEXT
            END || ' (' || COALESCE(
                        (SELECT m.percentile 
                         FROM merit_list AS m 
                         WHERE m."Rank" = 
                             CASE
                                 WHEN r."LNT1S" <> 0 AND r."LNT1O" = 0 AND r."LNT1H" = 0 THEN r."LNT1S"
                                 WHEN c.university = '${formData.homeUniversity}' THEN r."LNT1H"
                                 ELSE r."LNT1O"
                             END
                         LIMIT 1), '0'
                    ) || ')' AS lnt1,
        `;

    }else{
        caste_column += `
            NULL::TEXT AS lnt1,
        `;
    }

    // GNT2
    if (formData.caste == 'NT2' && formData.gender == 'Male') {
        caste_column += `
            CASE
                WHEN r."GNT2S" <> 0 AND r."GNT2O" = 0 AND r."GNT2H" = 0 THEN r."GNT2S"::TEXT
                WHEN c.university = '${formData.homeUniversity}' THEN r."GNT2H"::TEXT
                ELSE r."GNT2O"::TEXT
            END || ' (' || COALESCE(
                        (SELECT m.percentile 
                         FROM merit_list AS m 
                         WHERE m."Rank" = 
                             CASE
                                 WHEN r."GNT2S" <> 0 AND r."GNT2O" = 0 AND r."GNT2H" = 0 THEN r."GNT2S"
                                 WHEN c.university = '${formData.homeUniversity}' THEN r."GNT2H"
                                 ELSE r."GNT2O"
                             END
                         LIMIT 1), '0'
                    ) || ')' AS gnt2,
        `;
    }else{
        caste_column += `
            NULL::TEXT AS gnt2,
        `;
    }

    // LNT2
    if (formData.caste == 'NT2' && formData.gender == 'Female') {
        caste_column += `
            CASE
                WHEN r."LNT2S" <> 0 AND r."LNT2O" = 0 AND r."LNT2H" = 0 THEN r."LNT2S"::TEXT
                WHEN c.university = '${formData.homeUniversity}' THEN r."LNT2H"::TEXT
                ELSE r."LNT2O"::TEXT
            END || ' (' || COALESCE(
                        (SELECT m.percentile 
                         FROM merit_list AS m 
                         WHERE m."Rank" = 
                             CASE
                                 WHEN r."LNT2S" <> 0 AND r."LNT2O" = 0 AND r."LNT2H" = 0 THEN r."LNT2S"
                                 WHEN c.university = '${formData.homeUniversity}' THEN r."LNT2H"
                                 ELSE r."LNT2O"
                             END
                         LIMIT 1), '0'
                    ) || ')' AS lnt2,
        `;
    }else{
        caste_column += `
            NULL::TEXT AS lnt2,
        `;
    }

    // GNT3
    if (formData.caste == 'NT3' && formData.gender == 'Male') {
        caste_column += `
            CASE
                WHEN r."GNT3S" <> 0 AND r."GNT3O" = 0 AND r."GNT3H" = 0 THEN r."GNT3S"::TEXT
                WHEN c.university = '${formData.homeUniversity}' THEN r."GNT3H"::TEXT
                ELSE r."GNT3O"::TEXT
            END || ' (' || COALESCE(
                        (SELECT m.percentile 
                         FROM merit_list AS m 
                         WHERE m."Rank" = 
                             CASE
                                 WHEN r."GNT3S" <> 0 AND r."GNT3O" = 0 AND r."GNT3H" = 0 THEN r."GNT3S"
                                 WHEN c.university = '${formData.homeUniversity}' THEN r."GNT3H"
                                 ELSE r."GNT3O"
                             END
                         LIMIT 1), '0'
                    ) || ')' AS gnt3,
        `;

    }else{
        caste_column += `
            NULL::TEXT AS gnt3,
        `;
    }

    // LNT3
    if (formData.caste == 'NT3' && formData.gender == 'Female') {
        caste_column += `
            CASE
                WHEN r."LNT3S" <> 0 AND r."LNT3O" = 0 AND r."LNT3H" = 0 THEN r."LNT3S"::TEXT
                WHEN c.university = '${formData.homeUniversity}' THEN r."LNT3H"::TEXT
                ELSE r."LNT3O"::TEXT
            END || ' (' || COALESCE(
                        (SELECT m.percentile 
                         FROM merit_list AS m 
                         WHERE m."Rank" = 
                             CASE
                                 WHEN r."LNT3S" <> 0 AND r."LNT3O" = 0 AND r."LNT3H" = 0 THEN r."LNT3S"
                                 WHEN c.university = '${formData.homeUniversity}' THEN r."LNT3H"
                                 ELSE r."LNT3O"
                             END
                         LIMIT 1), '0'
                    ) || ')' AS lnt3,
        `;

    }else{
        caste_column += `
            NULL::TEXT AS lnt3,
        `;
    }

    // GVJ
    if (formData.caste == 'VJ' && formData.gender == 'Male') {
        caste_column += `
            CASE
                WHEN r."GVJS" <> 0 AND r."GVJO" = 0 AND r."GVJH" = 0 THEN r."GVJS"::TEXT
                WHEN c.university = '${formData.homeUniversity}' THEN r."GVJH"::TEXT
                ELSE r."GVJO"::TEXT
            END || ' (' || COALESCE(
                        (SELECT m.percentile 
                         FROM merit_list AS m 
                         WHERE m."Rank" = 
                             CASE
                                 WHEN r."GVJS" <> 0 AND r."GVJO" = 0 AND r."GVJH" = 0 THEN r."GVJS"
                                 WHEN c.university = '${formData.homeUniversity}' THEN r."GVJH"
                                 ELSE r."GVJO"
                             END
                         LIMIT 1), '0'
                    ) || ')' AS gvj,
        `;

    }else{
        caste_column += `
            NULL::TEXT AS gvj,
        `;
    }

    // LVJ
    if (formData.caste == 'VJ' && formData.gender == 'Female') {
        caste_column += `
            CASE
                WHEN r."LVJS" <> 0 AND r."LVJO" = 0 AND r."LVJH" = 0 THEN r."LVJS"::TEXT
                WHEN c.university = '${formData.homeUniversity}' THEN r."LVJH"::TEXT
                ELSE r."LVJO"::TEXT
            END || ' (' || COALESCE(
                        (SELECT m.percentile 
                         FROM merit_list AS m 
                         WHERE m."Rank" = 
                             CASE
                                 WHEN r."LVJS" <> 0 AND r."LVJO" = 0 AND r."LVJH" = 0 THEN r."LVJS"
                                 WHEN c.university = '${formData.homeUniversity}' THEN r."LVJH"
                                 ELSE r."LVJO"
                             END
                         LIMIT 1), '0'
                    ) || ')' AS lvj,
        `;

    }else{
        caste_column += `
            NULL::TEXT AS lvj,
        `;
    }

    // PWD
    if (formData.specialCategory == 'PWD') {
        caste_column += `
            CASE
                WHEN r."PWDOPENS" <> 0 AND r."PWDOPENH" = 0 THEN r."PWDOPENS"::TEXT
                ELSE r."PWDOPENH"::TEXT
            END || ' (' || COALESCE(
                        (SELECT m.percentile 
                         FROM merit_list AS m 
                         WHERE m."Rank" = 
                             CASE
                                 WHEN r."PWDOPENS" <> 0 AND r."PWDOPENH" = 0 THEN r."PWDOPENS"
                                 ELSE r."PWDOPENH"
                             END
                         LIMIT 1), '0'
                    ) || ')' AS pwd,
        `;

    } else{
        caste_column += `
            NULL::TEXT AS pwd,
        `;
    }
    
    // DEF
    if (formData.specialCategory == 'DEF') {
        caste_column += `
            r."DEFOPENS" || ' (' || COALESCE((SELECT m.percentile FROM merit_list AS m WHERE m."Rank" = r."DEFOPENS" LIMIT 1), '0') || ')' AS def,
        `;
    }else{
        caste_column += `
            NULL::TEXT AS def,
        `;
    }

    // ORPHAN
    if (formData.specialCategory == 'ORPHAN') {
        caste_column += `
            r."ORPHAN" || ' (' || COALESCE((SELECT m.percentile FROM merit_list AS m WHERE m."Rank" = r."ORPHAN" LIMIT 1), '0') || ')' AS orphan,
        `;
    }else{
        caste_column += `
            NULL::TEXT AS orphan,
        `;
    }

    if(formData.gender != 'Female'){
        caste_condition = `
            b."Branch_type" != 'F'
        `;
    }else{
        caste_condition = `
            TRUE
        `;
    }
    // console.log(caste_column);
    try {
        const { data, error } = await supabase.rpc('branch_wise_cutoff', {
            homeuniversity: formData.university,
            minrank: 1,
            maxrank: 200000,
            caste_column: caste_column, 
            branch_cat: formData.branch,  
            condition: caste_condition    
        });

        if(error){
            console.log(error);
        }else{
            all_choices = data;
            let colleges = [];

            if (formData.cities[0] !== 'All') {
                colleges = all_choices.filter(element => formData.cities.includes(element.city));
            } else {
                colleges = all_choices;
            }

            let new_list = [];

            if(formData.branch == 'OTHER' && formData.other_branches != 'ALL'){
                colleges.forEach(element => {
                    if(formData.other_branches == element.branch_name){
                        new_list.push(element);
                    }
                });
            }else{
                new_list = colleges;
            }
            new_list.sort((a, b) => b.points - a.points);
            // console.log(new_list);
            return res.json(new_list);
        }

    } catch (error) {
        console.log(error);
    }
});

module.exports = router;