document.addEventListener('DOMContentLoaded', async function() {
    // DOM Elements
    const loginForm = document.getElementById('loginForm');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const otpSection = document.getElementById('otpSection');
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    const statusMessage = document.getElementById('statusMessage');
    const phoneDisplay = document.getElementById('phoneDisplay');
    
    // Buttons
    const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
    const backToLoginBtn = document.getElementById('backToLoginBtn');
    const sendOtpBtn = document.getElementById('sendOtpBtn');
    const verifyOtpBtn = document.getElementById('verifyOtpBtn');
    const resendOtp = document.getElementById('resendOtp');
    const resetPasswordBtn = document.getElementById('resetPasswordBtn');
    
    // Spinners and button texts
    const loginSpinner = document.getElementById('loginSpinner');
    const loginBtnText = document.getElementById('loginBtnText');
    const sendOtpSpinner = document.getElementById('sendOtpSpinner');
    const sendOtpBtnText = document.getElementById('sendOtpBtnText');
    const verifySpinner = document.getElementById('verifySpinner');
    const verifyBtnText = document.getElementById('verifyBtnText');
    const resetSpinner = document.getElementById('resetSpinner');
    const resetBtnText = document.getElementById('resetBtnText');
    
    const otpInputs = document.querySelectorAll('.otp-input');
    let phone = '';

    let generatedOtp = '';
    let userPhone = '';
    let countdownInterval;
    let canResend = false;
    let resendTimeout = 30; // 30 seconds before OTP can be resent

    // Handle OTP input navigation
    otpInputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.value.length === 1) {
                const nextIndex = parseInt(this.dataset.index) + 1;
                const nextInput = document.querySelector(`.otp-input[data-index="${nextIndex}"]`);
                if (nextInput) nextInput.focus();
            }
        });

        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && this.value.length === 0) {
                const prevIndex = parseInt(this.dataset.index) - 1;
                const prevInput = document.querySelector(`.otp-input[data-index="${prevIndex}"]`);
                if (prevInput) prevInput.focus();
            }
        });
    });

    // Toggle between login and forgot password forms
    forgotPasswordBtn.addEventListener('click', function() {
        loginForm.style.display = 'none';
        forgotPasswordForm.style.display = 'flex';
        otpSection.style.display = 'none';
        resetPasswordForm.style.display = 'none';
        clearStatus();
    });

    backToLoginBtn.addEventListener('click', function() {
        forgotPasswordForm.style.display = 'none';
        otpSection.style.display = 'none';
        resetPasswordForm.style.display = 'none';
        loginForm.style.display = 'flex';
        clearStatus();
    });

    // Login form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        phone = document.getElementById('loginPhone').value.trim();
        const password = document.getElementById('loginPassword').value;

        // Simple validation
        if (phone.length !== 10 || !/^\d+$/.test(phone)) {
            showStatus('Please enter a valid 10-digit phone number', 'error');
            return;
        }
        try {
            const response = await fetch('/login/checkCredentials',{
                method : 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({phone,password})
            });

            const result = await response.json();
            if(result.login){
                showStatus(result.msg, 'success');
                window.location.href = '/pcm';
            }else{
                showStatus(result.msg, 'error');
            }
        } catch (error) {
            console.log(error);
        };   
    });

    // Forgot password form submission
    forgotPasswordForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        phone = document.getElementById('forgotPhone').value.trim();

        // Simple validation
        if (phone.length !== 10 || !/^\d+$/.test(phone)) {
            showStatus('Please enter a valid 10-digit phone number', 'error');
            return;
        }

        generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

        try {
            const response = await fetch('/login/forgotPasswordOtp',{
                method : 'POST',
                headers : {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({phone : phone,otp : generatedOtp})
            });

            const data = await response.json();
            if(data.issend){
                phoneDisplay.textContent = `+91 ${phone}`;
                forgotPasswordForm.style.display = 'none';
                otpSection.style.display = 'block';

                startResendCountdown();
                showStatus('OTP sent to your phone number', 'success');
            }else{
                showStatus(data.msg, 'error');
            }

        } catch (error) {
            console.log(error);
        };

        
    });

    // Verify OTP
    verifyOtpBtn.addEventListener('click', function() {
        const enteredOtp = Array.from(otpInputs).map(input => input.value).join('');
        
        if (enteredOtp.length !== 6) {
            showStatus('Please enter the complete 6-digit OTP', 'error');
            return;
        }
        
       
        if (enteredOtp === generatedOtp) {
            // OTP verified - show reset password form
            otpSection.style.display = 'none';
            resetPasswordForm.style.display = 'flex';
            showStatus('OTP verified. Please set your new password', 'success');
        } else {
            showStatus('Invalid OTP. Please try again.', 'error');
        }
           
    });

    // Resend OTP
    resendOtp.addEventListener('click', async function() {
        if (!canResend) return;
        
        generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
        startResendCountdown();
        try {
            const response = await fetch('/login/forgotPasswordResendOtp',{
                method : 'POST',
                headers : {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({phone : phone,otp : generatedOtp})
            });

            const data = await response.json();
            if(data.issend){
                showStatus('New OTP sent to your phone number', 'success');
            }

        } catch (error) {
            console.log(error);
        };
            
       
    });

    // Reset password form submission
    resetPasswordForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;

        if (newPassword.length < 6) {
            showStatus('Password must be at least 6 characters', 'error');
            return;
        }
        if (newPassword !== confirmNewPassword) {
            showStatus('Passwords do not match', 'error');
            return;
        }

        try {
            const response = await fetch('/login/resetPassword',{
                method : 'POST',
                headers : {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({phone : phone,password : newPassword})
            });

            const data = await response.json();
            
            if(data.isreset){
                showStatus(data.msg, 'success');
                window.location.href = '/login';
            }else{
                console.log(data.msg);
                showStatus(data.msg, 'error');
            }
            
        } catch (error) {
            console.log(error);
        };

        
    });

    // Start countdown for resend OTP
    function startResendCountdown() {
        canResend = false;
        resendOtp.style.color = '#6b7280';
        resendOtp.style.cursor = 'not-allowed';
        resendOtp.textContent = `Resend OTP (${resendTimeout}s)`;
        
        let seconds = resendTimeout;
        countdownInterval = setInterval(() => {
            seconds--;
            resendOtp.textContent = `Resend OTP (${seconds}s)`;
            
            if (seconds <= 0) {
                clearInterval(countdownInterval);
                canResend = true;
                resendOtp.style.color = '#4a90e2';
                resendOtp.style.cursor = 'pointer';
                resendOtp.textContent = 'Resend OTP';
            }
        }, 1000);
    }

    // Show status message
    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = `status-message status-${type}`;
        statusMessage.style.display = 'block';
    }

    // Clear status message
    function clearStatus() {
        statusMessage.style.display = 'none';
    }

    // Clean up interval when leaving page
    window.addEventListener('beforeunload', function() {
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }
    });

});

document.getElementById('register_here').addEventListener('click',()=>{
    window.location.href = '/register';
});