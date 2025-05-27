document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const statusMessage = document.getElementById('statusMessage');
    const spinner = document.getElementById('spinner');
    const btnText = document.getElementById('btnText');
    statusMessage.style.display = 'none';

    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        statusMessage.style.display = 'none';
        const userData = {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            examType: document.querySelector('input[name="examType"]:checked')?.value,
            password: document.getElementById('password').value,
            confirmPassword: document.getElementById('confirmPassword').value
        };

        // Validation
        if (!userData.examType) {
            showStatus('Please select your exam type', 'error');
            return;
        }

        if (userData.password !== userData.confirmPassword) {
            showStatus('Passwords do not match', 'error');
            return;
        }

        if (userData.phone.length !== 10 || !/^\d+$/.test(userData.phone)) {
            showStatus('Please enter a valid 10-digit phone number', 'error');
            return;
        }

        // Show loading state
        btnText.textContent = 'Registering...';
        spinner.style.display = 'block';
        registerBtn.disabled = true;

        try {
            // Send data to server
            const response = await fetch('/register/Registration', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const result = await response.json();
            if(result.verification == true){
                let phone = userData.phone;
                window.location.href = `/verification/${phone}`;
            }else{
                showStatus(result.msg, 'error');
            }

        } catch (error) {
            showStatus('Network error. Please try again.', 'error');
            console.error('Registration error:', error);
        } finally {
            btnText.textContent = 'Register Now';
            spinner.style.display = 'none';
            registerBtn.disabled = false;
        }
    });

    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = `status-message status-${type}`;
        statusMessage.style.display = 'block';
    }
});


document.getElementById('login_here').addEventListener('click',()=>{
    window.location.href = '/login';
});
