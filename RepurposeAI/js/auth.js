/**
 * Auth Logic for RepurposeAI
 * Handles simulation of Login, Signup, and Password Reset.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Icons
    if (window.lucide) lucide.createIcons();

    // --- References ---
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const resetForm = document.getElementById('reset-form');

    // --- loading Helper ---
    function setLoading(btn, isLoading, originalText = '확인') {
        if (isLoading) {
            btn.disabled = true;
            btn.originalHTML = btn.innerHTML; // Save original
            btn.innerHTML = `<div class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div> 처리 중...`;
            btn.classList.add('opacity-75', 'cursor-not-allowed');
        } else {
            btn.disabled = false;
            btn.innerHTML = btn.originalHTML || originalText;
            btn.classList.remove('opacity-75', 'cursor-not-allowed');
        }
    }

    // --- Login Logic ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = loginForm.querySelector('button[type="submit"]');
            const username = document.getElementById('username').value;

            setLoading(btn, true);

            // Simulate Network Delay
            await new Promise(r => setTimeout(r, 1000));

            // Create Mock User
            const user = {
                id: 'user_' + Date.now(),
                username: username,
                name: '사용자'
            };
            localStorage.setItem('rep_user', JSON.stringify(user));

            setLoading(btn, false);
            window.location.href = 'dashboard.html';
        });

        // Google Login
        const googleBtn = document.querySelector('button[type="button"]'); // Assuming strictly structure
        if (googleBtn) {
            googleBtn.addEventListener('click', async () => {
                const originalContent = googleBtn.innerHTML;
                googleBtn.innerHTML = '연결 중...';
                googleBtn.disabled = true;

                await new Promise(r => setTimeout(r, 1500));

                const user = {
                    id: 'user_google',
                    email: 'demo@google.com',
                    name: 'Demo User'
                };
                localStorage.setItem('rep_user', JSON.stringify(user));
                window.location.href = 'index.html#home';
            });
        }
    }

    // --- Signup Logic ---
    if (signupForm) {
        // Real-time validation for password match
        const pwConfirmInput = document.getElementById('password_confirm');
        const pwInput = document.getElementById('password');
        const errorMsg = document.getElementById('password-match-error');

        if (pwConfirmInput && pwInput) {
            function checkMatch() {
                if (pwConfirmInput.value && pwInput.value !== pwConfirmInput.value) {
                    errorMsg.classList.remove('hidden');
                    pwConfirmInput.classList.add('border-red-500', 'focus:ring-red-500');
                } else {
                    errorMsg.classList.add('hidden');
                    pwConfirmInput.classList.remove('border-red-500', 'focus:ring-red-500');
                }
            }
            pwConfirmInput.addEventListener('input', checkMatch);
            pwInput.addEventListener('input', () => { if (pwConfirmInput.value) checkMatch(); });
        }

        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = signupForm.querySelector('button[type="submit"]');

            // Final validation check
            if (pwInput.value !== pwConfirmInput.value) {
                pwConfirmInput.focus();
                return;
            }

            setLoading(btn, true);

            await new Promise(r => setTimeout(r, 1000));

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const username = document.getElementById('username').value;

            const user = {
                id: 'user_' + Date.now(),
                username: username,
                name: name,
                email: email
            };
            localStorage.setItem('rep_user', JSON.stringify(user));

            setLoading(btn, false);
            window.location.href = 'dashboard.html';
        });
    }

    // --- Reset Logic ---
    if (resetForm) {
        resetForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = resetForm.querySelector('button[type="submit"]');
            const email = document.getElementById('email').value;

            setLoading(btn, true);

            await new Promise(r => setTimeout(r, 1500));

            await showAppAlert('비밀번호 재설정', `"${email}"로 비밀번호 재설정 링크가 전송되었습니다.\n(데모 기능입니다)`);

            setLoading(btn, false);
            window.location.href = 'login.html';
        });
    }
});
