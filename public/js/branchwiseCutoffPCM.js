

async function fetch_university() {
    try {
        const response = await fetch('/branchwiseCutoffPCM/University_fetch');
        const data = await response.json();
        const university = document.getElementById('university');

        data.forEach(element => {
            const option = document.createElement('option');
            option.value = element.university;
            option.innerText = `${element.university}`;
            university.appendChild(option);
        });

    } catch (error) {
        console.log(error);
    }
}

async function fetch_other_branches() {
    try {
        const response = await fetch('/branchwiseCutoffPCM/fetch_other_branches');
        const data = await response.json();

        const other_branch = document.getElementById('other-branch');
        data.forEach(element => {
            const option = document.createElement('option');
            option.value = element.branch_name;
            option.innerText = `${element.branch_name}`;
            other_branch.appendChild(option);
        });
        
    } catch (error) {
        console.log(error);
    }
}

async function fetch_city() {
    try {
        const response = await fetch('/branchwiseCutoffPCM/city_fetch');
        const data = await response.json();

        const city = document.getElementById('city-container');

        data.forEach(element => {
            const city_child = document.createElement('label');
            city_child.className = 'checkbox-label';
            city_child.innerHTML = `
                <input type="checkbox" name="city" value="${element.city}">
                <span>${element.city}</span>
            `;

            city.appendChild(city_child);
        });
        
    } catch (error) {
        console.log(error);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    fetch_university();
    fetch_city();
    fetch_other_branches();
    
    // DOM Elements
    const searchBtn = document.getElementById('search-btn');
    const cityContainer = document.getElementById('city-container');
    const collegeCardsContainer = document.getElementById('collegeCards');
    const backBtn = document.getElementById('back-btn');
    
    // Back button event listener
    backBtn.addEventListener('click', function() {
        window.history.back();
    });

    // Event Listeners for city checkboxes
    cityContainer.addEventListener('change', function(e) {
        if (e.target.name === 'city') {
            if (e.target.value === 'All' && e.target.checked) {
                // If "All" is checked, uncheck all other cities
                document.querySelectorAll('input[name="city"]:not([value="All"])').forEach(checkbox => {
                    checkbox.checked = false;
                });
            } else if (e.target.checked) {
                // If any other city is checked, uncheck "All"
                document.querySelector('input[name="city"][value="All"]').checked = false;
            }
        }
    });
    
    // Search button click handler
    searchBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        const university = document.getElementById('university');
        const branch = document.getElementById('branch');

        if (!university.value) {
            alert('Please select a Home University');
            university.focus();
            return;
        }
        
        if (!branch.value) {
            alert('Please select a Branch Category');
            branch.focus();
            return;
        }

        const formData = {
            university: document.getElementById('university').value,
            branch: document.getElementById('branch').value,
            caste: document.getElementById('caste').value,
            gender: document.querySelector('input[name="gender"]:checked').value,
            specialCategory: document.getElementById('special-category').value,
            cities: Array.from(document.querySelectorAll('input[name="city"]:checked')).map(cb => cb.value),
            other_branches: document.getElementById('other-branch').value
        };

        console.log(formData);
       
            try {
                const response = await fetch('/branchwiseCutoffPCM/branch_wise_cutoff', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();
                // console.log(data);
                displayResults(data, formData);

            } catch (error) {
                console.log(error);
            }
            
       
    });
    
    // Display results function
    function displayResults(data, formData) {
        const resultsContainer = document.getElementById('results-container');
        const collegeCardsContainer = document.getElementById('collegeCards');
        collegeCardsContainer.innerHTML = '';
        
        if (data.length === 0) {
            collegeCardsContainer.innerHTML = '<div style="text-align: center; padding: 20px; color: #b8c2d8;">No colleges found matching your criteria.</div>';
            resultsContainer.style.display = 'block';
            return;
        }
        
        let count = 1;

        data.forEach(college => {
            const card = document.createElement('div');
            card.className = 'college-card selected';
            
            // Create card header with choice code and status
            const cardHeader = document.createElement('div');
            cardHeader.className = 'college-card-header';
            cardHeader.innerHTML = `
                <div class="college-code">${count}</div>
                <div class="college-code">${college.branch_code}</div>
                <div class="status status-home">${college.seat_type}</div>
            `;
            count++;
            
            // Create college name and university
            const collegeInfo = document.createElement('div');
            collegeInfo.innerHTML = `
                <div class="college-name">${college.college_name}</div>
                <div style="color: #b8c2d8; margin-bottom: 10px;">${college.university}</div>
                <div style="color: #4a90e2; font-weight: 600; margin-bottom: 15px;">${college.branch_name}</div>
            `;
            
            // Create cutoffs section
            const cutoffs = document.createElement('div');
            cutoffs.className = 'college-details';
            
            let cutoffItems = [];

            if(college.gopen){
                cutoffItems.push(`<div class="college-detail">
                    <div class="college-detail-label">GOPEN</div>
                    <div>${college.gopen}</div>
                </div>`);
            }

            if(formData.gender == 'Female'){
                if(formData.caste == 'EWS'){
                    cutoffItems.push(`<div class="college-detail">
                        <div class="college-detail-label">LOPEN</div>
                        <div>${college.lopen}</div>
                    </div>`);

                    cutoffItems.push(`<div class="college-detail">
                        <div class="college-detail-label">EWS</div>
                        <div>${college.ews}</div>
                    </div>`);
                }else if(formData.caste !== 'OPEN'){
                    cutoffItems.push(`<div class="college-detail">
                        <div class="college-detail-label">LOPEN</div>
                        <div>${college.lopen}</div>
                    </div>`);

                    let caste_name = `L${formData.caste}`;
                    cutoffItems.push(`<div class="college-detail">
                        <div class="college-detail-label">${caste_name}</div>
                        <div>${college[caste_name.toLowerCase()]}</div>
                    </div>`);
                }else{
                    cutoffItems.push(`<div class="college-detail">
                        <div class="college-detail-label">LOPEN</div>
                        <div>${college.lopen}</div>
                    </div>`);
                }
            }else{
                if(formData.caste == 'EWS'){
                    cutoffItems.push(`<div class="college-detail">
                        <div class="college-detail-label">EWS</div>
                        <div>${college.ews}</div>
                    </div>`);
                }else if(formData.caste !== 'OPEN'){
                    let caste_name = `G${formData.caste}`;
                    cutoffItems.push(`<div class="college-detail">
                        <div class="college-detail-label">${caste_name}</div>
                        <div>${college[caste_name.toLowerCase()]}</div>
                    </div>`);
                }
            }

            if (formData.specialCategory != 'NO') {
                cutoffItems.push(`<div class="college-detail">
                    <div class="college-detail-label">${formData.specialCategory}</div>
                    <div>${college[formData.specialCategory.toLowerCase()]}</div>
                </div>`);
            }
            
            cutoffs.innerHTML = cutoffItems.join('');
            
            // Assemble the card
            card.appendChild(cardHeader);
            card.appendChild(collegeInfo);
            card.appendChild(cutoffs);
            
            collegeCardsContainer.appendChild(card);
        });

        resultsContainer.style.display = 'block';
    }
});

// Branch selection handler
document.getElementById('branch').addEventListener('change', function() {
    const otherBranchContainer = document.getElementById('other-branch-container');
    
    if (this.value === 'OTHER') {
        otherBranchContainer.classList.remove('hidden');
    } else {
        otherBranchContainer.classList.add('hidden');
    }
});