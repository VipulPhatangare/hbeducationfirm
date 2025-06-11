const central_object = {
    mainCaste: '',
    casteColumn: '',
    specialReservation: ''
};

let selectedBranches = [];

// DOM elements
const casteSelect = document.getElementById('caste');
const tfwsContainer = document.getElementById('tfwsContainer');
const tfwsCheckbox = document.getElementById('tfws');
const branchCategorySelect = document.getElementById('branchCategory');
const collegeForm = document.getElementById('collegeForm');
const resultsContainer = document.getElementById('resultsContainer');
const collegeCardsContainer = document.getElementById('collegeCards');
const selectedCountElement = document.getElementById('selectedCount');
const regionCheckboxGroup = document.getElementById('regionCheckboxGroup');
const roundSelect = document.getElementById('round');
const homeuniversitySelect = document.getElementById('homeUniversity');
const selectedBranchesContainer = document.getElementById('selectedBranchesContainer');

// Initialize
updateSelectedCount(0);

collegeForm.addEventListener('submit', handleFormSubmit);

regionCheckboxGroup.addEventListener('change', handleRegionCheckboxChange);


function handleFormSubmit(e) {
    e.preventDefault();

    // Get all checked region checkboxes
    const regionCheckboxes = document.querySelectorAll('input[name="region"]:checked');
    const regions = Array.from(regionCheckboxes).map(cb => cb.value);

    // If "All Regions" is selected, ignore other selections
    const finalRegions = regions.includes("All") ? ["All"] : regions;

    const formData = {
        percentile: parseFloat(document.getElementById('percentile').value),
        caste: casteSelect.value,
        gender: document.querySelector('input[name="gender"]:checked').value,
        branchCategory: branchCategorySelect.value,
        city: finalRegions,
    };

    // console.log('Form Data:', formData);
    generateCollegeList(formData);
}

document.getElementById('back_to_neet').addEventListener('click',()=>{
  window.location.href = '/neet';
});

function handleRegionCheckboxChange(e) {
    if (e.target.value === "All" && e.target.checked) {
        // If "All Regions" is checked, uncheck all other regions
        const otherCheckboxes = document.querySelectorAll('input[name="region"]:not([value="All"])');
        otherCheckboxes.forEach(cb => cb.checked = false);
    } else if (e.target.value !== "All" && e.target.checked) {
        // If any other region is checked, uncheck "All Regions"
        const allCheckbox = document.querySelector('input[name="region"][value="All"]');
        allCheckbox.checked = false;
    }
}



// Core Functions
async function generateCollegeList(formData) {
    console.log(formData);
    try {
        const response = await fetch('/collegePredictorNeet/College_list', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        // console.log(data);
        displayColleges(data, formData);

    } catch (error) {
        console.log('Error:', error);
        alert('An error occurred while fetching college data');
    }
}

function displayColleges(colleges, formData) {
    collegeCardsContainer.innerHTML = '';

    if (!colleges || colleges.length === 0) {
        collegeCardsContainer.innerHTML = '<p>No colleges found matching your criteria.</p>';
        resultsContainer.style.display = 'block';
        return;
    }

    colleges.forEach(college => {
        const card = createCollegeCard(college, formData);
        collegeCardsContainer.appendChild(card);
    });

    resultsContainer.style.display = 'block';
    updateSelectedCount(colleges.length);
}

function createCollegeCard(college, formData) {
    const card = document.createElement('div');
    card.className = 'college-card selected';
    card.dataset.code = college.choice_code;

    let card_content = `
        <div class="college-card-header">
            <div class="college-code">${college.college_code}</div>
            <input type="checkbox" checked class="card-checkbox">
        </div>
        <div class="college-name">${college.college_name}</div>
        <div>University: ${college.university}</div>
        <div>${college.branch_name}</div>
        <div class="college-details">
            <div class="college-detail">
                <div class="college-detail-label">OPEN</div>
                <div>${college.lopen}</div>
            </div>
    `;

    if(college.lews){
        card_content += `
            <div class="college-detail">
                <div class="college-detail-label">EWS</div>
                <div>${college.lews}</div>
            </div>
        `;
    }

    if(college.lnt1){
        card_content += `
            <div class="college-detail">
                <div class="college-detail-label">NT1</div>
                <div>${college.lnt1}</div>
            </div>
        `;
    }

    if(college.lnt2){
        card_content += `
            <div class="college-detail">
                <div class="college-detail-label">NT2</div>
                <div>${college.lnt2}</div>
            </div>
        `;
    }

    if(college.lnt3){
        card_content += `
            <div class="college-detail">
                <div class="college-detail-label">NT3</div>
                <div>${college.lnt3}</div>
            </div>
        `;
    }

    if(college.lobc){
        card_content += `
            <div class="college-detail">
                <div class="college-detail-label">OBC</div>
                <div>${college.lobc}</div>
            </div>
        `;
    }

    if(college.lsc){
        card_content += `
            <div class="college-detail">
                <div class="college-detail-label">SC</div>
                <div>${college.lsc}</div>
            </div>
        `;
    }

    if(college.lst){
        card_content += `
            <div class="college-detail">
                <div class="college-detail-label">ST</div>
                <div>${college.lst}</div>
            </div>
        `;
    }

    if(college.lvj){
        card_content += `
            <div class="college-detail">
                <div class="college-detail-label">VJ</div>
                <div>${college.lvj}</div>
            </div>
        `;
    }

    if(college.lsebc){
        card_content += `
            <div class="college-detail">
                <div class="college-detail-label">SEBC</div>
                <div>${college.lsebc}</div>
            </div>
        `;
    }

    card.innerHTML = card_content + `
        </div>
    `;

    card.addEventListener('click', function (e) {
        if (e.target.type !== 'checkbox') {
            const checkbox = this.querySelector('.card-checkbox');
            checkbox.checked = !checkbox.checked;
            this.classList.toggle('selected', checkbox.checked);
            updateSelectedCount();
        }
    });

    const checkbox = card.querySelector('.card-checkbox');
    checkbox.addEventListener('change', function () {
        card.classList.toggle('selected', this.checked);
        updateSelectedCount();
    });

    return card;
}

function updateSelectedCount(count) {
    if (typeof count === 'number') {
        selectedCountElement.textContent = `${count} selected`;
    } else {
        const selectedCount = document.querySelectorAll('.college-card.selected').length;
        selectedCountElement.textContent = `${selectedCount} selected`;
    }
}

// Initialization
document.addEventListener("DOMContentLoaded", initialize());

async function initialize() {
    await fetchCity();
}

// fetching city
async function fetchCity() {
    try {
        const response = await fetch('/neet/fetchcity');
        const data = await response.json();

        const cityholder = document.getElementById('regionCheckboxGroup');
        cityholder.innerHTML = `
            <label class="checkbox-label">
                <input type="checkbox" name="region" value="All" checked>
                <span>All Regions</span>
            </label>
        `;

        data.forEach(element => {
            const child = document.createElement('label');
            child.classList.add('checkbox-label');

            child.innerHTML = `
                <input type="checkbox" name="region" value="${element.city}" >
                <span>${element.city}</span>
            `;

            cityholder.appendChild(child);
        });

    } catch (error) {
        console.log(error);
    }
}
