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
        const response = await fetch('/collegePageNeet/collegeInfo', {
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
                <div class="info-value">${data.college_code}</div>
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
        const response = await fetch('/collegePageNeet/collegeBranchInfo', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({college_code})
        });

        const result = await response.json();
        const data = await result[0];
        document.getElementById('branch_title').textContent = data.branch_name;
        document.getElementById('table_body').innerHTML = `
            <tr>
                <td>OPEN</td>
                <td class="cutoff-high">${data.fopen}</td>        
                <td class="cutoff-high">${data.lopen}</td>  
            </tr>
            <tr>
                <td>OBC</td>
                <td class="cutoff-high">${data.fobc}</td>        
                <td class="cutoff-high">${data.lobc}</td>  
            </tr>
            <tr>
                <td>SEBC</td>
                <td class="cutoff-high">${data.fsebc}</td>        
                <td class="cutoff-high">${data.lsebc}</td>  
            </tr>
            <tr>
                <td>SC</td>
                <td class="cutoff-high">${data.fsc}</td>        
                <td class="cutoff-high">${data.lsc}</td>  
            </tr>
            <tr>
                <td>ST</td>
                <td class="cutoff-high">${data.fst}</td>        
                <td class="cutoff-high">${data.lst}</td>  
            </tr>
            <tr>
                <td>NT1</td>
                <td class="cutoff-high">${data.fnt1}</td>        
                <td class="cutoff-high">${data.lnt1}</td>  
            </tr>
            <tr>
                <td>NT2</td>
                <td class="cutoff-high">${data.fnt2}</td>        
                <td class="cutoff-high">${data.lnt2}</td>  
            </tr>
            <tr>
                <td>NT3</td>
                <td class="cutoff-high">${data.fnt3}</td>        
                <td class="cutoff-high">${data.lnt3}</td>  
            </tr>
            <tr>
                <td>EWS</td>
                <td class="cutoff-high">${data.fews}</td>        
                <td class="cutoff-high">${data.lews}</td>  
            </tr>
        `;
    } catch (error) {
        console.log(error);
    }
}
