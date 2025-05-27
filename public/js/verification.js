document.addEventListener('DOMContentLoaded', function() {
    const phoneDisplay = document.getElementById('phoneDisplay');
    const verifyOtpBtn = document.getElementById('verifyOtpBtn');
    const resendOtp = document.getElementById('resendOtp');
    const statusMessage = document.getElementById('statusMessage');
    const verifySpinner = document.getElementById('verifySpinner');
    const verifyBtnText = document.getElementById('verifyBtnText');
    const otpInputs = document.querySelectorAll('.otp-input');

    const phone = PHONE_PLACEHOLDER;
    phoneDisplay.textContent = `+91 ${phone}`;
    let verification_otp = otp;

    let countdownInterval;
    let canResend = false;
    let resendTimeout = 30;

    startResendCountdown();

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

    verifyOtpBtn.addEventListener('click', async function() {
        try {
            const enteredOtp = Array.from(otpInputs).map(input => input.value).join('');
        
            if (enteredOtp.length !== 6) {
                showStatus('Please enter the complete 6-digit OTP', 'error');
                return;
            }
            
            if (enteredOtp === verification_otp) {
                showStatus('Verification successful! Redirecting to dashboard...', 'success');
                
                const response = await fetch('/verification/verificationComfirmation',{
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({phone : phone})
                });
                
                const result = await response.json();
                if(result.verified){
                    window.location.href = '/pcm';
                }
                
            } else {
                showStatus('Invalid OTP. Please try again.', 'error');
                verifyBtnText.textContent = 'Verify & Complete Registration';
                verifySpinner.style.display = 'none';
                verifyOtpBtn.disabled = false;
            }
        } catch (error) {
            console.log(error);
        }
    });

    // Resend OTP
    resendOtp.addEventListener('click', async function() {
        if (!canResend) return;
        try {
            verification_otp = Math.floor(100000 + Math.random() * 900000).toString();
            startResendCountdown();
            
            await fetch('/verification/resendOTP', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({otp : verification_otp, phone : phone})
            });

                
            showStatus('New OTP sent to your phone number', 'success');
        } catch (error) {
            console.log(error);
        }
        
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
        
        setTimeout(() => {
            statusMessage.style.display = 'none';
        }, 5000);
    }

    // Clean up interval when leaving page
    window.addEventListener('beforeunload', function() {
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }
    });
});


