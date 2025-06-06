// Simple JavaScript for logout functionality
document.querySelector('.logout-btn').addEventListener('click', function() {
    window.history.back();
});

document.addEventListener('DOMContentLoaded', function() {
    const tableRows = document.querySelectorAll('tbody tr');
    tableRows.forEach(row => {
        row.addEventListener('mouseenter', () => {
            row.style.backgroundColor = 'rgba(26, 58, 143, 0.3)';
        });
        row.addEventListener('mouseleave', () => {
            row.style.backgroundColor = '';
        });
    });
    collegeInfoFetch();
    collegeBranchInfo();
});

async function collegeInfoFetch() {
    try {
        const college_code = id;
        const response = await fetch('/collegePagePCB/collegeInfo', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({college_code})
        });
        
        const result = await response.json();
        const data = result[0];
        document.getElementById('college_name').textContent = data.college_name;

        document.getElementById('college_info_content').innerHTML = `
            <div class="info-item">
                <div class="info-label">College Code</div>
                <div class="info-value">${data.college_id}</div>
            </div>
            <div class="info-item">
                <div class="info-label">University</div>
                <div class="info-value">${data.university}</div>
            </div>
            <div class="info-item">
                <div class="info-label">City</div>
                <div class="info-value">${data.city}</div>
            </div>
        `;

    } catch (error) {
        console.log(error);
    }
}


async function collegeBranchInfo() {
    try {
        const college_code = id;
        const response = await fetch('/collegePagePCB/collegeBranchInfo', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({college_code})
        });

        const data = await response.json();
        const table_body = document.getElementById('table_body');
        data.forEach(element => {
            const table_rows = document.createElement('tr');
            if(element.gender_flag == 'F'){
                table_rows.innerHTML = `
                    <td>${element.branch_name}</td>
                    <td class="cutoff-high">${element.lopen.toFixed(2)}%</td>
                    <td class="cutoff-high">${element.lobc.toFixed(2)}%</td>
                `;
            }else{
                table_rows.innerHTML = `
                    <td>${element.branch_name}</td>
                    <td class="cutoff-high">${element.gopen.toFixed(2)}%</td>
                    <td class="cutoff-high">${element.gobc.toFixed(2)}%</td>
                `;
            }
            
            table_body.appendChild(table_rows);            
        });

    } catch (error) {
        console.log(error);
    }
}
