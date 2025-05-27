// Data for percentile calculations
const mathpercentile = {
  hard: {
    100: 92,
    99: 86,
    98: 82,
    97: 78,
    96: 76,
    95: 74,
    94: 72,
    93: 70,
    92: 68,
    91: 66,
    90: 64,
    89: 62,
    88: 60,
    87: 58,
    86: 56,
    85: 54,
    84: 52,
    83: 50,
    82: 48,
    81: 46,
    80: 44,
    79: 42,
    78: 40,
    77: 38,
    76: 36,
    75: 34
  },
  medium: {
    100: 94,
    99: 88,
    98: 84,
    97: 80,
    96: 78,
    95: 76,
    94: 74,
    93: 72,
    92: 70,
    91: 68,
    90: 66,
    89: 64,
    88: 62,
    87: 60,
    86: 58,
    85: 56,
    84: 54,
    83: 52,
    82: 50,
    81: 48,
    80: 46,
    79: 44,
    78: 42,
    77: 40,
    76: 38,
    75: 36
  },
  easy: {
    100: 96,
    99: 92,
    98: 86,
    97: 82,
    96: 78,
    95: 76,
    94: 74,
    93: 72,
    92: 70,
    91: 68,
    90: 66,
    89: 64,
    88: 62,
    87: 60,
    86: 58,
    85: 56,
    84: 54,
    83: 52,
    82: 50,
    81: 48,
    80: 46,
    79: 44,
    78: 42,
    77: 40,
    76: 38,
    75: 36
  }
};

const pcpercentile = {
  hard: {
    100: 44,
    99: 42,
    98: 40,
    97: 38,
    96: 37,
    95: 36,
    94: 35,
    93: 34,
    92: 33,
    91: 32,
    90: 31,
    89: 30,
    88: 29,
    87: 28,
    86: 27,
    85: 26,
    84: 25,
    83: 24,
    82: 23,
    81: 22,
    80: 21,
    79: 20,
    78: 19,
    77: 18,
    76: 17,
    75: 16
  },
  medium: {
    100: 46,
    99: 44,
    98: 42,
    97: 40,
    96: 38,
    95: 37,
    94: 36,
    93: 35,
    92: 34,
    91: 33,
    90: 32,
    89: 31,
    88: 30,
    87: 29,
    86: 28,
    85: 27,
    84: 26,
    83: 25,
    82: 24,
    81: 23,
    80: 22,
    79: 21,
    78: 20,
    77: 19,
    76: 18,
    75: 17
  },
  easy: {
    100: 48,
    99: 46,
    98: 44,
    97: 42,
    96: 40,
    95: 38,
    94: 37,
    93: 36,
    92: 35,
    91: 34,
    90: 33,
    89: 32,
    88: 31,
    87: 30,
    86: 29,
    85: 28,
    84: 27,
    83: 26,
    82: 25,
    81: 24,
    80: 23,
    79: 22,
    78: 21,
    77: 20,
    76: 19,
    75: 18
  }
};

const marksPercentile = {
  hard: {
    100: 170,
    99: 140,
    98: 135,
    97: 128,
    96: 120,
    95: 113,
    94: 106,
    93: 100,
    92: 97,
    91: 97,
    90: 94,
    89: 92,
    88: 90,
    87: 88,
    86: 86,
    85: 84,
    84: 83,
    83: 81,
    82: 80,
    81: 78,
    80: 76,
    79: 75,
    78: 74,
    77: 73,
    76: 72,
    75: 71
  },
  medium: {
    100: 175,
    99: 145,
    98: 141,
    97: 132,
    96: 125,
    95: 120,
    94: 112,
    93: 108,
    92: 102,
    91: 99,
    90: 96,
    89: 94,
    88: 92,
    87: 90,
    86: 87,
    85: 85,
    84: 83,
    83: 81,
    82: 79,
    81: 77,
    80: 76,
    79: 75,
    78: 74,
    77: 73,
    76: 72,
    75: 71
  },
  easy: {
    100: 180,
    99: 150,
    98: 145,
    97: 135,
    96: 130,
    95: 125,
    94: 119,
    93: 115,
    92: 109,
    91: 104,
    90: 100,
    89: 98,
    88: 96,
    87: 94,
    86: 91,
    85: 88,
    84: 85,
    83: 84,
    82: 82,
    81: 80,
    80: 79,
    79: 78,
    78: 76,
    77: 75,
    76: 73,
    75: 71
  }
};

const examDifficulty = {
  "19-04-2025": {
    shift_1: "Medium",
    shift_2: "Medium"
  },
  "20-04-2025": {
    shift_1: "Medium",
    shift_2: "Medium"
  },
  "21-04-2025": {
    shift_1: "Hard",
    shift_2: "Hard"
  },
  "22-04-2025": {
    shift_1: "Medium",
    shift_2: "Medium"
  },
  "23-04-2025": {
    shift_1: "Hard",
    shift_2: "Medium"
  },
  "25-04-2025": {
    shift_1: "Medium",
    shift_2: "Medium"
  },
  "26-04-2025": {
    shift_1: "Easy",
    shift_2: "Medium"
  },
  "27-04-2025": {
    shift_1: "Easy",
    shift_2: "Hard"
  },
  "05-05-2025": {
    shift_1: "Medium",
    shift_2: "Medium"
  }
};

document.getElementById('back_to_pcm').addEventListener('click',()=>{
  window.location.href = '/pcm';
});


// Percentile calculation functions
function mathfindUpperLowerPercentiles(shift, marks) {
  const difficulty = shift.toLowerCase();
  const data = mathpercentile[difficulty];
  
  if (!data) {
    console.error(`No data found for difficulty level: ${difficulty}`);
    return 0;
  }

  const percentiles = Object.entries(data)
    .map(([percentile, mark]) => ({ percentile: Number(percentile), mark }))
    .sort((a, b) => b.percentile - a.percentile);

  let upper = null;
  let lower = null;
  let upperMarks = null;
  let lowerMarks = null;

  for (let i = 0; i < percentiles.length; i++) {
    const { percentile, mark } = percentiles[i];

    if (mark >= marks) {
      upper = percentile;
      upperMarks = mark;
    } else {
      lower = percentile;
      lowerMarks = mark;
      break;
    }
  }

  if (upper === null && lower !== null) {
    upper = lower;
    upperMarks = lowerMarks;
  }
  if (lower === null) {
    return convertpercentile({ 
      upper: 0, 
      lower: 0,
      upperMarks: 0,
      lowerMarks: 0
    }, marks);
  }

  return convertpercentile({ 
    upper, 
    lower,
    upperMarks,
    lowerMarks
  }, marks);
}

function pcfindUpperLowerPercentiles(shift, marks) {
  const difficulty = shift.toLowerCase();
  const data = pcpercentile[difficulty];
  
  if (!data) {
    console.error(`No data found for difficulty level: ${difficulty}`);
    return 0;
  }

  const percentiles = Object.entries(data)
    .map(([percentile, mark]) => ({ percentile: Number(percentile), mark }))
    .sort((a, b) => b.percentile - a.percentile);

  let upper = null;
  let lower = null;
  let upperMarks = null;
  let lowerMarks = null;

  for (let i = 0; i < percentiles.length; i++) {
    const { percentile, mark } = percentiles[i];

    if (mark >= marks) {
      upper = percentile;
      upperMarks = mark;
    } else {
      lower = percentile;
      lowerMarks = mark;
      break;
    }
  }

  if (upper === null && lower !== null) {
    upper = lower;
    upperMarks = lowerMarks;
  }
  if (lower === null) {
    return convertpercentile({ 
      upper: 0, 
      lower: 0,
      upperMarks: 0,
      lowerMarks: 0
    }, marks);
  }

  return convertpercentile({ 
    upper, 
    lower,
    upperMarks,
    lowerMarks
  }, marks);
}

function findUpperLowerPercentiles(shift, marks) {
  const difficulty = shift.toLowerCase();
  const data = marksPercentile[difficulty];
  
  if (!data) {
    console.error(`No data found for difficulty level: ${difficulty}`);
    return 0;
  }

  const percentiles = Object.entries(data)
    .map(([percentile, mark]) => ({ percentile: Number(percentile), mark }))
    .sort((a, b) => b.percentile - a.percentile);

  let upper = null;
  let lower = null;
  let upperMarks = null;
  let lowerMarks = null;

  for (let i = 0; i < percentiles.length; i++) {
    const { percentile, mark } = percentiles[i];

    if (mark >= marks) {
      upper = percentile;
      upperMarks = mark;
    } else {
      lower = percentile;
      lowerMarks = mark;
      break;
    }
  }

  if (upper === null && lower !== null) {
    upper = lower;
    upperMarks = lowerMarks;
  }
  if (lower === null) {
    return convertpercentile({ 
      upper: 0, 
      lower: 0,
      upperMarks: 0,
      lowerMarks: 0
    }, marks);
  }

  return convertpercentile({ 
    upper, 
    lower,
    upperMarks,
    lowerMarks
  }, marks);
}

function convertpercentile(result, marks){
    let percentile = 0; 
    let crandint = (Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000) / 100000;

    if(result.upper == result.lower && result.upper > 75 && result.lower > 75){
        percentile = result.lower;
    }else if (result.upper == result.lower && result.upper < 75 && result.lower < 75){
        percentile = 0;
    }else{
        percentile = ((marks - result.lowerMarks) / (result.upperMarks - result.lowerMarks)) + result.lower;
    }

    if((percentile + crandint) < 100){
        percentile += crandint;
    }

    return percentile;
};

// Mobile menu functionality
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const closeMenuBtn = document.querySelector('.close-menu-btn');
const mobileMenu = document.querySelector('.mobile-menu');
const overlay = document.querySelector('.overlay');

// mobileMenuBtn.addEventListener('click', () => {
//     mobileMenu.classList.add('active');
//     overlay.classList.add('active');
// });

// closeMenuBtn.addEventListener('click', () => {
//     mobileMenu.classList.remove('active');
//     overlay.classList.remove('active');
// });

// overlay.addEventListener('click', () => {
//     mobileMenu.classList.remove('active');
//     overlay.classList.remove('active');
// });

// Form submission handler
document.getElementById('percentileForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const mathMarks = parseInt(document.getElementById('mathMarks').value);
    const physicsMarks = parseInt(document.getElementById('physicsMarks').value);
    const chemistryMarks = parseInt(document.getElementById('chemistryMarks').value);
    const examDate = document.getElementById('examDate').value;
    const shift = document.getElementById('shift').value;
    const totalmarks = physicsMarks + mathMarks + chemistryMarks;
    
    // Get difficulty level
    const difficulty = examDifficulty[examDate][shift.toLowerCase()];
    
    // Find percentiles and marks
    const mathresult = mathfindUpperLowerPercentiles(difficulty, mathMarks);
    const physicsresult = pcfindUpperLowerPercentiles(difficulty, physicsMarks);
    const chemistryresult = pcfindUpperLowerPercentiles(difficulty, chemistryMarks);
    const totalresult = findUpperLowerPercentiles(difficulty, totalmarks);

    if(totalresult.toFixed(5) < 75){
        document.getElementById('percentileValue').textContent = 'Percentile below 75.00';
    }else{
        document.getElementById('percentileValue').textContent = totalresult.toFixed(5);
    }

    if(mathresult.toFixed(5) < 75){
        document.getElementById('displayMath').textContent = 'Percentile below 75.00';
    }else{
        document.getElementById('displayMath').textContent = mathresult.toFixed(5);
    }

    if(chemistryresult.toFixed(5) < 75){
        document.getElementById('displayChemistry').textContent = 'Percentile below 75.00';
    }else{
        document.getElementById('displayChemistry').textContent = chemistryresult.toFixed(5);
    }

    if(physicsresult.toFixed(5) < 75){
        document.getElementById('displayPhysics').textContent = 'Percentile below 75.00';
    }else{
        document.getElementById('displayPhysics').textContent = physicsresult.toFixed(5);
    }

    document.getElementById('displayMarks').textContent = totalmarks + "/200";
    document.getElementById('displayDate').textContent = examDate;
    document.getElementById('displayShift').textContent = shift === "shift_1" ? "Shift 1 (Morning)" : "Shift 2 (Afternoon)";
    document.getElementById('result').style.display = 'block';
    document.getElementById('result').scrollIntoView({ behavior: 'smooth' });
});



