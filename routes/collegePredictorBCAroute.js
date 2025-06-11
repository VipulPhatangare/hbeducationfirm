const express = require('express');
const router = express.Router();
const {db, supabase} = require('../database/db');

router.get('/',(req,res)=>{
  res.render('collegePredictorBCA');
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
    let minRank = rank - 3000;
    let maxRank = rank + 10000;

    if (rank < 3000) {
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

function getCasteColumns(caste, gender) {

    const prefix = gender === 'Female' ? 'L' : 'G';

    new_data_of_student.caste_Column_H = `r.${prefix}${caste}H`;
    new_data_of_student.caste_Column_O = `r.${prefix}${caste}O`;
    new_data_of_student.caste_Column_S = `r.${prefix}${caste}S`;
    new_data_of_student.caste_name = `${prefix}${caste}`;

    if(caste === 'EWS'){
        new_data_of_student.caste_Column_H = `r.${caste}`;
        new_data_of_student.caste_Column_H = `r.${caste}`;
        new_data_of_student.caste_Column_H = `r.${caste}`;
        new_data_of_student.caste_name = `${caste}`;

    }
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
    formData.homeUniversity = formData.homeuniversity;
    let caste_column = '';
    let caste_condition = '';

    // EWS
    if (formData.caste == 'EWS') {
        caste_column += `
            r."EWS" || ' (' || COALESCE((SELECT m.percentile FROM pharmacy_merit_list AS m WHERE m."Rank" = r."EWS" LIMIT 1), '0') || ')' AS ews,
        `;
        caste_condition += `
            (r."EWS" BETWEEN ${new_data_of_student.minRank} AND ${new_data_of_student.maxRank} OR r."EWS" = 0)
            AND
        `;
    }else{
        caste_column += `
            NULL::TEXT AS ews,
        `;
        caste_condition += `
            TRUE AND
        `;
    }

    //  TFWS
    if (formData.tfws) {
        caste_column += `
            r."TFWS" || ' (' || COALESCE((SELECT m.percentile FROM pharmacy_merit_list AS m WHERE m."Rank" = r."TFWS" LIMIT 1), '0') || ')' AS def,
        `;
        caste_condition += `
            (r."TFWS" BETWEEN ${new_data_of_student.minRank} AND ${new_data_of_student.maxRank} OR r."TFWS" = 0)
            AND
        `;
    }else{
        caste_column += `
            NULL::TEXT AS tfws,
        `;
        caste_condition += `
            TRUE AND
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
                         FROM pharmacy_merit_list AS m 
                         WHERE m."Rank" = 
                             CASE
                                 WHEN r."LOPENS" <> 0 AND r."LOPENO" = 0 AND r."LOPENH" = 0 THEN r."LOPENS"
                                 WHEN c.university = '${formData.homeUniversity}' THEN r."LOPENH"
                                 ELSE r."LOPENO"
                             END
                         LIMIT 1), '0'
                    ) || ')' AS lopen,
        `;

        caste_condition += `
            (
                CASE 
                    WHEN r."LOPENS" <> 0 AND r."LOPENO" = 0 AND r."LOPENH" = 0 THEN r."LOPENS"
                    WHEN c.university = '${formData.homeUniversity}' THEN r."LOPENH"
                    ELSE r."LOPENO"
                END BETWEEN ${new_data_of_student.minRank} AND ${new_data_of_student.maxRank}
                OR 
                CASE 
                    WHEN r."LOPENS" <> 0 AND r."LOPENO" = 0 AND r."LOPENH" = 0 THEN r."LOPENS"
                    WHEN c.university = '${formData.homeUniversity}' THEN r."LOPENH"
                    ELSE r."LOPENO"
                END = 0
            ) AND
        `;
    }else{
        caste_column += `
            NULL::TEXT AS lopen,
        `;
        caste_condition += `
            TRUE AND
        `;
    } 

    // GOBC
    if (formData.caste == 'OBC' && formData.gender == 'Male') {
        caste_column += `
            CASE
                WHEN r."GOBCS" <> 0 AND r."GOBCO" = 0 AND r."GOBCH" = 0 THEN r."GOBCS"::TEXT
                WHEN c.university = '${formData.homeUniversity}' THEN r."GOBCH"::TEXT
                ELSE r."GOBCO"::TEXT
            END || ' (' || COALESCE(
                        (SELECT m.percentile 
                         FROM pharmacy_merit_list AS m 
                         WHERE m."Rank" = 
                             CASE
                                 WHEN r."GOBCS" <> 0 AND r."GOBCO" = 0 AND r."GOBCH" = 0 THEN r."GOBCS"
                                 WHEN c.university = '${formData.homeUniversity}' THEN r."GOBCH"
                                 ELSE r."GOBCO"
                             END
                         LIMIT 1), '0'
                    ) || ')' AS gobc,
        `;

        caste_condition += `
            (
                CASE 
                    WHEN r."GOBCS" <> 0 AND r."GOBCO" = 0 AND r."GOBCH" = 0 THEN r."GOBCS"
                    WHEN c.university = '${formData.homeUniversity}' THEN r."GOBCH"
                    ELSE r."GOBCO"
                END BETWEEN ${new_data_of_student.minRank} AND ${new_data_of_student.maxRank}
                OR 
                CASE 
                    WHEN r."GOBCS" <> 0 AND r."GOBCO" = 0 AND r."GOBCH" = 0 THEN r."GOBCS"
                    WHEN c.university = '${formData.homeUniversity}' THEN r."GOBCH"
                    ELSE r."GOBCO"
                END = 0
            ) AND
        `;
    }else{
        caste_column += `
            NULL::TEXT AS gobc,
        `;
        caste_condition += `
            TRUE AND
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
                         FROM pharmacy_merit_list AS m 
                         WHERE m."Rank" = 
                             CASE
                                 WHEN r."LOBCS" <> 0 AND r."LOBCO" = 0 AND r."LOBCH" = 0 THEN r."LOBCS"
                                 WHEN c.university = '${formData.homeUniversity}' THEN r."LOBCH"
                                 ELSE r."LOBCO"
                             END
                         LIMIT 1), '0'
                    ) || ')' AS lobc,
        `;

        caste_condition += `
            (
                CASE 
                    WHEN r."LOBCS" <> 0 AND r."LOBCO" = 0 AND r."LOBCH" = 0 THEN r."LOBCS"
                    WHEN c.university = '${formData.homeUniversity}' THEN r."LOBCH"
                    ELSE r."LOBCO"
                END BETWEEN ${new_data_of_student.minRank} AND ${new_data_of_student.maxRank}
                OR 
                CASE 
                    WHEN r."LOBCS" <> 0 AND r."LOBCO" = 0 AND r."LOBCH" = 0 THEN r."LOBCS"
                    WHEN c.university = '${formData.homeUniversity}' THEN r."LOBCH"
                    ELSE r."LOBCO"
                END = 0
            ) AND
        `;
    }else{
        caste_column += `
            NULL::TEXT AS lobc,
        `;
        caste_condition += `
            TRUE AND
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
                         FROM pharmacy_merit_list AS m 
                         WHERE m."Rank" = 
                             CASE
                                 WHEN r."GSEBCS" <> 0 AND r."GSEBCO" = 0 AND r."GSEBCH" = 0 THEN r."GSEBCS"
                                 WHEN c.university = '${formData.homeUniversity}' THEN r."GSEBCH"
                                 ELSE r."GSEBCO"
                             END
                         LIMIT 1), '0'
                    ) || ')' AS gsebc,
        `;

        caste_condition += `
            (
                CASE 
                    WHEN r."GSEBCS" <> 0 AND r."GSEBCO" = 0 AND r."GSEBCH" = 0 THEN r."GSEBCS"
                    WHEN c.university = '${formData.homeUniversity}' THEN r."GSEBCH"
                    ELSE r."GSEBCO"
                END BETWEEN ${new_data_of_student.minRank} AND ${new_data_of_student.maxRank}
                OR 
                CASE 
                    WHEN r."GSEBCS" <> 0 AND r."GSEBCO" = 0 AND r."GSEBCH" = 0 THEN r."GSEBCS"
                    WHEN c.university = '${formData.homeUniversity}' THEN r."GSEBCH"
                    ELSE r."GSEBCO"
                END = 0
            ) AND
        `;
    }else{
        caste_column += `
            NULL::TEXT AS gsebc,
        `;
        caste_condition += `
            TRUE AND
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
                         FROM pharmacy_merit_list AS m 
                         WHERE m."Rank" = 
                             CASE
                                 WHEN r."LSEBCS" <> 0 AND r."LSEBCO" = 0 AND r."LSEBCH" = 0 THEN r."LSEBCS"
                                 WHEN c.university = '${formData.homeUniversity}' THEN r."LSEBCH"
                                 ELSE r."LSEBCO"
                             END
                         LIMIT 1), '0'
                    ) || ')' AS lsebc,
        `;

        caste_condition += `
            (
                CASE 
                    WHEN r."LSEBCS" <> 0 AND r."LSEBCO" = 0 AND r."LSEBCH" = 0 THEN r."LSEBCS"
                    WHEN c.university = '${formData.homeUniversity}' THEN r."LSEBCH"
                    ELSE r."LSEBCO"
                END BETWEEN ${new_data_of_student.minRank} AND ${new_data_of_student.maxRank}
                OR 
                CASE 
                    WHEN r."LSEBCS" <> 0 AND r."LSEBCO" = 0 AND r."LSEBCH" = 0 THEN r."LSEBCS"
                    WHEN c.university = '${formData.homeUniversity}' THEN r."LSEBCH"
                    ELSE r."LSEBCO"
                END = 0
            ) AND
        `;
    }else{
        caste_column += `
            NULL::TEXT AS lsebc,
        `;
        caste_condition += `
            TRUE AND
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
                         FROM pharmacy_merit_list AS m 
                         WHERE m."Rank" = 
                             CASE
                                 WHEN r."GSTS" <> 0 AND r."GSTO" = 0 AND r."GSTH" = 0 THEN r."GSTS"
                                 WHEN c.university = '${formData.homeUniversity}' THEN r."GSTH"
                                 ELSE r."GSTO"
                             END
                         LIMIT 1), '0'
                    ) || ')' AS gst,
        `;

        caste_condition += `
            (
                CASE 
                    WHEN r."GSTS" <> 0 AND r."GSTO" = 0 AND r."GSTH" = 0 THEN r."GSTS"
                    WHEN c.university = '${formData.homeUniversity}' THEN r."GSTH"
                    ELSE r."GSTO"
                END BETWEEN ${new_data_of_student.minRank} AND ${new_data_of_student.maxRank}
                OR 
                CASE 
                    WHEN r."GSTS" <> 0 AND r."GSTO" = 0 AND r."GSTH" = 0 THEN r."GSTS"
                    WHEN c.university = '${formData.homeUniversity}' THEN r."GSTH"
                    ELSE r."GSTO"
                END = 0
            ) AND
        `;
    }else{
        caste_column += `
            NULL::TEXT AS gst,
        `;
        caste_condition += `
            TRUE AND
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
                         FROM pharmacy_merit_list AS m 
                         WHERE m."Rank" = 
                             CASE
                                 WHEN r."LSTS" <> 0 AND r."LSTO" = 0 AND r."LSTH" = 0 THEN r."LSTS"
                                 WHEN c.university = '${formData.homeUniversity}' THEN r."LSTH"
                                 ELSE r."LSTO"
                             END
                         LIMIT 1), '0'
                    ) || ')' AS lst,
        `;

        caste_condition += `
            (
                CASE 
                    WHEN r."LSTS" <> 0 AND r."LSTO" = 0 AND r."LSTH" = 0 THEN r."LSTS"
                    WHEN c.university = '${formData.homeUniversity}' THEN r."LSTH"
                    ELSE r."LSTO"
                END BETWEEN ${new_data_of_student.minRank} AND ${new_data_of_student.maxRank}
                OR 
                CASE 
                    WHEN r."LSTS" <> 0 AND r."LSTO" = 0 AND r."LSTH" = 0 THEN r."LSTS"
                    WHEN c.university = '${formData.homeUniversity}' THEN r."LSTH"
                    ELSE r."LSTO"
                END = 0
            ) AND
        `;
    }else{
        caste_column += `
            NULL::TEXT AS lst,
        `;
        caste_condition += `
            TRUE AND
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
                         FROM pharmacy_merit_list AS m 
                         WHERE m."Rank" = 
                             CASE
                                 WHEN r."GSCS" <> 0 AND r."GSCO" = 0 AND r."GSCH" = 0 THEN r."GSCS"
                                 WHEN c.university = '${formData.homeUniversity}' THEN r."GSCH"
                                 ELSE r."GSCO"
                             END
                         LIMIT 1), '0'
                    ) || ')' AS gsc,
        `;

        caste_condition += `
            (
                CASE 
                    WHEN r."GSCS" <> 0 AND r."GSCO" = 0 AND r."GSCH" = 0 THEN r."GSCS"
                    WHEN c.university = '${formData.homeUniversity}' THEN r."GSCH"
                    ELSE r."GSCO"
                END BETWEEN ${new_data_of_student.minRank} AND ${new_data_of_student.maxRank}
                OR 
                CASE 
                    WHEN r."GSCS" <> 0 AND r."GSCO" = 0 AND r."GSCH" = 0 THEN r."GSCS"
                    WHEN c.university = '${formData.homeUniversity}' THEN r."GSCH"
                    ELSE r."GSCO"
                END = 0
            ) AND
        `;
    }else{
        caste_column += `
            NULL::TEXT AS gsc,
        `;
        caste_condition += `
            TRUE AND
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
                         FROM pharmacy_merit_list AS m 
                         WHERE m."Rank" = 
                             CASE
                                 WHEN r."LSCS" <> 0 AND r."LSCO" = 0 AND r."LSCH" = 0 THEN r."LSCS"
                                 WHEN c.university = '${formData.homeUniversity}' THEN r."LSCH"
                                 ELSE r."LSCO"
                             END
                         LIMIT 1), '0'
                    ) || ')' AS lsc,
        `;

        caste_condition += `
            (
                CASE 
                    WHEN r."LSCS" <> 0 AND r."LSCO" = 0 AND r."LSCH" = 0 THEN r."LSCS"
                    WHEN c.university = '${formData.homeUniversity}' THEN r."LSCH"
                    ELSE r."LSCO"
                END BETWEEN ${new_data_of_student.minRank} AND ${new_data_of_student.maxRank}
                OR 
                CASE 
                    WHEN r."LSCS" <> 0 AND r."LSCO" = 0 AND r."LSCH" = 0 THEN r."LSCS"
                    WHEN c.university = '${formData.homeUniversity}' THEN r."LSCH"
                    ELSE r."LSCO"
                END = 0
            ) AND
        `;
    }else{
        caste_column += `
            NULL::TEXT AS lsc,
        `;
        caste_condition += `
            TRUE AND
        `;
    }

    // GNT1
    if (formData.caste == 'NTB' && formData.gender == 'Male') {
        caste_column += `
            CASE
                WHEN r."GNTBS" <> 0 AND r."GNTBO" = 0 AND r."GNTBH" = 0 THEN r."GNTBS"::TEXT
                WHEN c.university = '${formData.homeUniversity}' THEN r."GNTBH"::TEXT
                ELSE r."GNTBO"::TEXT
            END || ' (' || COALESCE(
                        (SELECT m.percentile 
                         FROM pharmacy_merit_list AS m 
                         WHERE m."Rank" = 
                             CASE
                                 WHEN r."GNTBS" <> 0 AND r."GNTBO" = 0 AND r."GNTBH" = 0 THEN r."GNTBS"
                                 WHEN c.university = '${formData.homeUniversity}' THEN r."GNTBH"
                                 ELSE r."GNTBO"
                             END
                         LIMIT 1), '0'
                    ) || ')' AS gntb,
        `;

        caste_condition += `
            (
                CASE 
                    WHEN r."GNTBS" <> 0 AND r."GNTBO" = 0 AND r."GNTBH" = 0 THEN r."GNTBS"
                    WHEN c.university = '${formData.homeUniversity}' THEN r."GNTBH"
                    ELSE r."GNTBO"
                END BETWEEN ${new_data_of_student.minRank} AND ${new_data_of_student.maxRank}
                OR 
                CASE 
                    WHEN r."GNTBS" <> 0 AND r."GNTBO" = 0 AND r."GNTBH" = 0 THEN r."GNTBS"
                    WHEN c.university = '${formData.homeUniversity}' THEN r."GNTBH"
                    ELSE r."GNTBO"
                END = 0
            ) AND
        `;
    }else{
        caste_column += `
            NULL::TEXT AS gntb,
        `;
        caste_condition += `
            TRUE AND
        `;
    }

    // LNT1
    if (formData.caste == 'NTB' && formData.gender == 'Female') {
        caste_column += `
            CASE
                WHEN r."LNTBS" <> 0 AND r."LNTBO" = 0 AND r."LNTBH" = 0 THEN r."LNTBS"::TEXT
                WHEN c.university = '${formData.homeUniversity}' THEN r."LNTBH"::TEXT
                ELSE r."LNTBO"::TEXT
            END || ' (' || COALESCE(
                        (SELECT m.percentile 
                         FROM pharmacy_merit_list AS m 
                         WHERE m."Rank" = 
                             CASE
                                 WHEN r."LNTBS" <> 0 AND r."LNTBO" = 0 AND r."LNTBH" = 0 THEN r."LNTBS"
                                 WHEN c.university = '${formData.homeUniversity}' THEN r."LNTBH"
                                 ELSE r."LNTBO"
                             END
                         LIMIT 1), '0'
                    ) || ')' AS lntb,
        `;

        caste_condition += `
            (
                CASE 
                    WHEN r."LNTBS" <> 0 AND r."LNTBO" = 0 AND r."LNTBH" = 0 THEN r."LNTBS"
                    WHEN c.university = '${formData.homeUniversity}' THEN r."LNTBH"
                    ELSE r."LNTBO"
                END BETWEEN ${new_data_of_student.minRank} AND ${new_data_of_student.maxRank}
                OR 
                CASE 
                    WHEN r."LNTBS" <> 0 AND r."LNTBO" = 0 AND r."LNTBH" = 0 THEN r."LNTBS"
                    WHEN c.university = '${formData.homeUniversity}' THEN r."LNTBH"
                    ELSE r."LNTBO"
                END = 0
            ) AND
        `;
    }else{
        caste_column += `
            NULL::TEXT AS lntb,
        `;
        caste_condition += `
            TRUE AND
        `;
    }

    // GNT2
    if (formData.caste == 'NTC' && formData.gender == 'Male') {
        caste_column += `
            CASE
                WHEN r."GNTCS" <> 0 AND r."GNTCO" = 0 AND r."GNTCH" = 0 THEN r."GNTCS"::TEXT
                WHEN c.university = '${formData.homeUniversity}' THEN r."GNTCH"::TEXT
                ELSE r."GNTCO"::TEXT
            END || ' (' || COALESCE(
                        (SELECT m.percentile 
                         FROM pharmacy_merit_list AS m 
                         WHERE m."Rank" = 
                             CASE
                                 WHEN r."GNTCS" <> 0 AND r."GNTCO" = 0 AND r."GNTCH" = 0 THEN r."GNTCS"
                                 WHEN c.university = '${formData.homeUniversity}' THEN r."GNTCH"
                                 ELSE r."GNTCO"
                             END
                         LIMIT 1), '0'
                    ) || ')' AS gntc,
        `;

        caste_condition += `
            (
                CASE 
                    WHEN r."GNTCS" <> 0 AND r."GNTCO" = 0 AND r."GNTCH" = 0 THEN r."GNTCS"
                    WHEN c.university = '${formData.homeUniversity}' THEN r."GNTCH"
                    ELSE r."GNTCO"
                END BETWEEN ${new_data_of_student.minRank} AND ${new_data_of_student.maxRank}
                OR 
                CASE 
                    WHEN r."GNTCS" <> 0 AND r."GNTCO" = 0 AND r."GNTCH" = 0 THEN r."GNTCS"
                    WHEN c.university = '${formData.homeUniversity}' THEN r."GNTCH"
                    ELSE r."GNTCO"
                END = 0
            ) AND
        `;
    }else{
        caste_column += `
            NULL::TEXT AS gntc,
        `;
        caste_condition += `
            TRUE AND
        `;
    }

    // LNT2
    if (formData.caste == 'NTC' && formData.gender == 'Female') {
        caste_column += `
            CASE
                WHEN r."LNTCS" <> 0 AND r."LNTCO" = 0 AND r."LNTCH" = 0 THEN r."LNTCS"::TEXT
                WHEN c.university = '${formData.homeUniversity}' THEN r."LNTCH"::TEXT
                ELSE r."LNTCO"::TEXT
            END || ' (' || COALESCE(
                        (SELECT m.percentile 
                         FROM pharmacy_merit_list AS m 
                         WHERE m."Rank" = 
                             CASE
                                 WHEN r."LNTCS" <> 0 AND r."LNTCO" = 0 AND r."LNTCH" = 0 THEN r."LNTCS"
                                 WHEN c.university = '${formData.homeUniversity}' THEN r."LNTCH"
                                 ELSE r."LNTCO"
                             END
                         LIMIT 1), '0'
                    ) || ')' AS lntc,
        `;

        caste_condition += `
            (
                CASE 
                    WHEN r."LNTCS" <> 0 AND r."LNTCO" = 0 AND r."LNTCH" = 0 THEN r."LNTCS"
                    WHEN c.university = '${formData.homeUniversity}' THEN r."LNTCH"
                    ELSE r."LNTCO"
                END BETWEEN ${new_data_of_student.minRank} AND ${new_data_of_student.maxRank}
                OR 
                CASE 
                    WHEN r."LNTCS" <> 0 AND r."LNTCO" = 0 AND r."LNTCH" = 0 THEN r."LNTCS"
                    WHEN c.university = '${formData.homeUniversity}' THEN r."LNTCH"
                    ELSE r."LNTCO"
                END = 0
            ) AND
        `;
    }else{
        caste_column += `
            NULL::TEXT AS lntc,
        `;
        caste_condition += `
            TRUE AND
        `;
    }

    // GNT3
    if (formData.caste == 'NTD' && formData.gender == 'Male') {
        caste_column += `
            CASE
                WHEN r."GNTDS" <> 0 AND r."GNTDO" = 0 AND r."GNTDH" = 0 THEN r."GNTDS"::TEXT
                WHEN c.university = '${formData.homeUniversity}' THEN r."GNTDH"::TEXT
                ELSE r."GNTDO"::TEXT
            END || ' (' || COALESCE(
                        (SELECT m.percentile 
                         FROM pharmacy_merit_list AS m 
                         WHERE m."Rank" = 
                             CASE
                                 WHEN r."GNTDS" <> 0 AND r."GNTDO" = 0 AND r."GNTDH" = 0 THEN r."GNTDS"
                                 WHEN c.university = '${formData.homeUniversity}' THEN r."GNTDH"
                                 ELSE r."GNTDO"
                             END
                         LIMIT 1), '0'
                    ) || ')' AS gntd,
        `;

        caste_condition += `
            (
                CASE 
                    WHEN r."GNTDS" <> 0 AND r."GNTDO" = 0 AND r."GNTDH" = 0 THEN r."GNTDS"
                    WHEN c.university = '${formData.homeUniversity}' THEN r."GNTDH"
                    ELSE r."GNTDO"
                END BETWEEN ${new_data_of_student.minRank} AND ${new_data_of_student.maxRank}
                OR 
                CASE 
                    WHEN r."GNTDS" <> 0 AND r."GNTDO" = 0 AND r."GNTDH" = 0 THEN r."GNTDS"
                    WHEN c.university = '${formData.homeUniversity}' THEN r."GNTDH"
                    ELSE r."GNTDO"
                END = 0
            ) AND
        `;
    }else{
        caste_column += `
            NULL::TEXT AS gntd,
        `;
        caste_condition += `
            TRUE AND
        `;
    }

    // LNT3
    if (formData.caste == 'NTD' && formData.gender == 'Female') {
        caste_column += `
            CASE
                WHEN r."LNTDS" <> 0 AND r."LNTDO" = 0 AND r."LNTDH" = 0 THEN r."LNTDS"::TEXT
                WHEN c.university = '${formData.homeUniversity}' THEN r."LNTDH"::TEXT
                ELSE r."LNTDO"::TEXT
            END || ' (' || COALESCE(
                        (SELECT m.percentile 
                         FROM pharmacy_merit_list AS m 
                         WHERE m."Rank" = 
                             CASE
                                 WHEN r."LNTDS" <> 0 AND r."LNTDO" = 0 AND r."LNTDH" = 0 THEN r."LNTDS"
                                 WHEN c.university = '${formData.homeUniversity}' THEN r."LNTDH"
                                 ELSE r."LNTDO"
                             END
                         LIMIT 1), '0'
                    ) || ')' AS lntd,
        `;

        caste_condition += `
            (
                CASE 
                    WHEN r."LNTDS" <> 0 AND r."LNTDO" = 0 AND r."LNTDH" = 0 THEN r."LNTDS"
                    WHEN c.university = '${formData.homeUniversity}' THEN r."LNTDH"
                    ELSE r."LNTDO"
                END BETWEEN ${new_data_of_student.minRank} AND ${new_data_of_student.maxRank}
                OR 
                CASE 
                    WHEN r."LNTDS" <> 0 AND r."LNTDO" = 0 AND r."LNTDH" = 0 THEN r."LNTDS"
                    WHEN c.university = '${formData.homeUniversity}' THEN r."LNTDH"
                    ELSE r."LNTDO"
                END = 0
            ) AND
        `;
    }else{
        caste_column += `
            NULL::TEXT AS lntd,
        `;
        caste_condition += `
            TRUE AND
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
                         FROM pharmacy_merit_list AS m 
                         WHERE m."Rank" = 
                             CASE
                                 WHEN r."GVJS" <> 0 AND r."GVJO" = 0 AND r."GVJH" = 0 THEN r."GVJS"
                                 WHEN c.university = '${formData.homeUniversity}' THEN r."GVJH"
                                 ELSE r."GVJO"
                             END
                         LIMIT 1), '0'
                    ) || ')' AS gvj,
        `;

        caste_condition += `
            (
                CASE 
                    WHEN r."GVJS" <> 0 AND r."GVJO" = 0 AND r."GVJH" = 0 THEN r."GVJS"
                    WHEN c.university = '${formData.homeUniversity}' THEN r."GVJH"
                    ELSE r."GVJO"
                END BETWEEN ${new_data_of_student.minRank} AND ${new_data_of_student.maxRank}
                OR 
                CASE 
                    WHEN r."GVJS" <> 0 AND r."GVJO" = 0 AND r."GVJH" = 0 THEN r."GVJS"
                    WHEN c.university = '${formData.homeUniversity}' THEN r."GVJH"
                    ELSE r."GVJO"
                END = 0
            ) AND
        `;
    }else{
        caste_column += `
            NULL::TEXT AS gvj,
        `;
        caste_condition += `
            TRUE AND
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
                         FROM pharmacy_merit_list AS m 
                         WHERE m."Rank" = 
                             CASE
                                 WHEN r."LVJS" <> 0 AND r."LVJO" = 0 AND r."LVJH" = 0 THEN r."LVJS"
                                 WHEN c.university = '${formData.homeUniversity}' THEN r."LVJH"
                                 ELSE r."LVJO"
                             END
                         LIMIT 1), '0'
                    ) || ')' AS lvj,
        `;

        caste_condition += `
            (
                CASE 
                    WHEN r."LVJS" <> 0 AND r."LVJO" = 0 AND r."LVJH" = 0 THEN r."LVJS"
                    WHEN c.university = '${formData.homeUniversity}' THEN r."LVJH"
                    ELSE r."LVJO"
                END BETWEEN ${new_data_of_student.minRank} AND ${new_data_of_student.maxRank}
                OR 
                CASE 
                    WHEN r."LVJS" <> 0 AND r."LVJO" = 0 AND r."LVJH" = 0 THEN r."LVJS"
                    WHEN c.university = '${formData.homeUniversity}' THEN r."LVJH"
                    ELSE r."LVJO"
                END = 0
            ) AND
        `;
    }else{
        caste_column += `
            NULL::TEXT AS lvj,
        `;
        caste_condition += `
            TRUE AND
        `;
    }


    // PWD
    if (formData.specialReservation == 'PWD') {
        caste_column += `
            CASE
                WHEN r."PWDOPENS" <> 0 AND r."PWDOPENH" = 0 THEN r."PWDOPENS"::TEXT
                ELSE r."PWDOPENH"::TEXT
            END || ' (' || COALESCE(
                        (SELECT m.percentile 
                         FROM pharmacy_merit_list AS m 
                         WHERE m."Rank" = 
                             CASE
                                 WHEN r."PWDOPENS" <> 0 AND r."PWDOPENH" = 0 THEN r."PWDOPENS"
                                 ELSE r."PWDOPENH"
                             END
                         LIMIT 1), '0'
                    ) || ')' AS pwd,
        `;

        caste_condition += `
            (
                (r."PWDOPENS" BETWEEN ${new_data_of_student.minRank} AND ${new_data_of_student.maxRank} OR r."PWDOPENS" = 0)
                OR (r."PWDOPENH" BETWEEN ${new_data_of_student.minRank} AND ${new_data_of_student.maxRank} OR r."PWDOPENH" = 0)  
            )
            AND 
        `;
    } else{
        caste_column += `
            NULL::TEXT AS pwd,
        `;
        caste_condition += `
            TRUE AND
        `;
    }
    
    // DEF
    if (formData.specialReservation == 'DEF') {
        caste_column += `
            r."DEFOPENS" || ' (' || COALESCE((SELECT m.percentile FROM pharmacy_merit_list AS m WHERE m."Rank" = r."DEFOPENS" LIMIT 1), '0') || ')' AS def,
        `;

        caste_condition += `
            (r."DEFOPENS" BETWEEN ${new_data_of_student.minRank} AND ${new_data_of_student.maxRank} OR r."DEFOPENS" = 0)
            AND
        `;
    }else{
        caste_column += `
            NULL::TEXT AS def,
        `;
        caste_condition += `
            TRUE AND
        `;
    }

    // ORPHAN
    if (formData.specialReservation == 'ORPHAN') {
        caste_column += `
            r."ORPHAN" || ' (' || COALESCE((SELECT m.percentile FROM pharmacy_merit_list AS m WHERE m."Rank" = r."ORPHAN" LIMIT 1), '0') || ')' AS orphan,
        `;
        caste_condition += `
            (r."ORPHAN" BETWEEN ${new_data_of_student.minRank} AND ${new_data_of_student.maxRank} OR r."ORPHAN" = 0)
            AND
        `;
    }else{
        caste_column += `
            NULL::TEXT AS orphan,
        `;
        caste_condition += `
            TRUE AND
        `;
    }

    // let table_name = `cap_${formData.round}`;

    // console.log("Generated SQL:", caste_column);
    // console.log("caste condition", caste_condition);

    try {
        const { data, error } = await supabase.rpc('get_branch_choices_bca', {
            homeuniversity: formData.homeuniversity,
            minrank: new_data_of_student.minRank,
            maxrank: new_data_of_student.maxRank,
            caste_column: caste_column,
            caste_condition: caste_condition
            });
        
        if(error){
            console.log(error);
        }else{
            
            // console.log(data);
            const colleges =  college_filter(data, formData);
            colleges.sort((a, b) => b.points - a.points);
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

    colleges.forEach(element => {
        if(formData.gender == 'Female'){
            if(element.gopen !== '0 (0)' || element.lopen !== '0 (0)'){
            
                college_list.push(element);
            }
        }else{
            if(element.gopen !== '0 (0)'){
                if(element.Branch_type != 'F'){
                    college_list.push(element);
                }
            }
        }
    });

    return college_list;
};


router.post('/College_list', async(req,res)=>{

    const formData = req.body;
    // console.log(formData);
    clear_new_data_function();

    try {
        
        const rank = await getRankFromPercentile(formData.percentile);
        // console.log(rank);
        calculateRankRange(rank);
        
        getCasteColumns(formData.caste, formData.gender);
        if(formData.specialReservation != 'No'){
            new_data_of_student.specialReservation = formData.specialReservation;
        }

        // console.log(new_data_of_student);
        const colleges = await getColleges(formData);
        // console.log(colleges);
        res.json(colleges);

    } catch (error) {
        console.log(error);
    }
});




module.exports = router;