/**
 * Settings Logic
 * Handles API key management, provider selection, and validation.
 */

document.addEventListener('DOMContentLoaded', () => {
    initSettingsLogic();
});

function initSettingsLogic() {
    // --- Provider Selection ---
    const providerRadios = document.querySelectorAll('input[name="ai-provider"]');
    const geminiSettings = document.getElementById('gemini-settings');
    const openaiSettings = document.getElementById('openai-settings');

    // Initial Load
    const currentProvider = window.aiService.provider;
    providerRadios.forEach(radio => {
        if (radio.value === currentProvider) {
            radio.checked = true;
        }

        radio.addEventListener('change', (e) => {
            const newProvider = e.target.value;
            window.aiService.setProvider(newProvider);
            toggleProviderSettings(newProvider);
        });
    });

    toggleProviderSettings(currentProvider);

    function toggleProviderSettings(provider) {
        if (!geminiSettings || !openaiSettings) return;

        if (provider === 'gemini') {
            geminiSettings.classList.remove('hidden');
            openaiSettings.classList.add('hidden');
        } else {
            geminiSettings.classList.add('hidden');
            openaiSettings.classList.remove('hidden');
        }
    }

    // --- Gemini Settings ---
    const apiKeyInput = document.getElementById('settings-api-key');
    const saveKeyBtn = document.getElementById('save-api-key-btn');
    const deleteKeyBtn = document.getElementById('delete-api-key-btn');
    const validateBtn = document.getElementById('validate-api-key-btn');
    const statusIndicator = document.getElementById('api-status-indicator');
    const statusText = document.getElementById('api-status-text');
    const validationMsg = document.getElementById('api-validation-msg');

    if (apiKeyInput && saveKeyBtn) {
        // Load Saved Key
        const savedKey = localStorage.getItem('rep_api_key');
        if (savedKey) apiKeyInput.value = savedKey;

        // Validation Function
        const checkKey = async () => {
            const currentKey = apiKeyInput.value.trim();
            if (!currentKey) {
                statusIndicator.className = 'w-2 h-2 rounded-full bg-gray-300';
                statusText.textContent = '상태 미확인';
                return;
            }

            validationMsg.classList.remove('hidden');
            validateBtn.disabled = true;
            const originalKey = window.aiService.apiKey;
            window.aiService.setApiKey(currentKey);

            const isValid = await window.aiService.validateApiKey();

            if (isValid) {
                statusIndicator.className = 'w-2 h-2 rounded-full bg-green-500 shadow-sm shadow-green-500/50';
                statusText.textContent = '유효함';
                statusText.className = 'text-[10px] text-green-500 font-bold uppercase tracking-wider';
                validationMsg.textContent = '✅ API 키가 유효합니다.';
            } else {
                statusIndicator.className = 'w-2 h-2 rounded-full bg-red-500 shadow-sm shadow-red-500/50';
                statusText.textContent = '무효함';
                statusText.className = 'text-[10px] text-red-500 font-bold uppercase tracking-wider';
                validationMsg.textContent = '❌ 유효하지 않은 API 키입니다.';
            }

            // Restore functionality
            window.aiService.setApiKey(originalKey);
            validateBtn.disabled = false;
            setTimeout(() => { validationMsg.classList.add('hidden'); }, 3000);
        };

        validateBtn.onclick = checkKey;

        // Delete Logic
        if (deleteKeyBtn) {
            deleteKeyBtn.onclick = async () => {
                const confirmed = await window.showAppConfirm('API 키 삭제', 'Gemini API 키를 삭제하시겠습니까?');
                if (confirmed) {
                    localStorage.removeItem('rep_api_key');
                    window.aiService.setApiKey('AlzaSyB-arYE785mPj8q1lPusdesE7q9StF_PDA'); // Default
                    apiKeyInput.value = '';
                    statusIndicator.className = 'w-2 h-2 rounded-full bg-gray-300';
                    statusText.textContent = '상태 미확인';
                    showToast('Gemini API 키가 삭제되었습니다.', 'info');
                }
            };
        }

        // Save Logic
        saveKeyBtn.onclick = () => {
            const newKey = apiKeyInput.value.trim();
            if (newKey) {
                localStorage.setItem('rep_api_key', newKey);
                window.aiService.setApiKey(newKey);
                showToast('Gemini API 키가 저장되었습니다.', 'success');
                checkKey();
            } else {
                showToast('API 키를 입력해주세요.');
            }
        };
    }

    // --- OpenAI Settings ---
    const openaiKeyInput = document.getElementById('openai-api-key');
    const saveOpenaiBtn = document.getElementById('save-openai-key-btn');
    const validateOpenaiBtn = document.getElementById('validate-openai-key-btn');
    const deleteOpenaiBtn = document.getElementById('delete-openai-key-btn');
    const openaiStatusIndicator = document.getElementById('openai-status-indicator');
    const openaiStatusText = document.getElementById('openai-status-text');
    const openaiValidationMsg = document.getElementById('openai-validation-msg');

    if (openaiKeyInput && saveOpenaiBtn) {
        const savedOpenaiKey = localStorage.getItem('rep_openai_key');
        if (savedOpenaiKey) openaiKeyInput.value = savedOpenaiKey;

        const checkOpenaiKey = async () => {
            const currentKey = openaiKeyInput.value.trim();
            const errorContainer = document.getElementById('openai-error-container');
            const errorMsg = document.getElementById('openai-error-msg');
            const dashboardLink = document.getElementById('openai-dashboard-link');

            if (!currentKey) {
                openaiStatusIndicator.className = 'w-2 h-2 rounded-full bg-gray-300';
                openaiStatusText.textContent = '상태 미확인';
                if (errorContainer) errorContainer.classList.add('hidden');
                return;
            }

            if (openaiValidationMsg) openaiValidationMsg.classList.remove('hidden');
            validateOpenaiBtn.disabled = true;
            const originalKey = window.aiService.openaiKey;
            window.aiService.setOpenAIKey(currentKey);

            try {
                const isValid = await window.aiService.validateOpenAIKey();
                if (isValid) {
                    openaiStatusIndicator.className = 'w-2 h-2 rounded-full bg-green-500 shadow-sm shadow-green-500/50';
                    openaiStatusText.textContent = '유효함';
                    openaiStatusText.className = 'text-[10px] text-green-500 font-bold uppercase tracking-wider';
                    if (openaiValidationMsg) openaiValidationMsg.textContent = '✅ OpenAI 키를 성공적으로 확인했습니다.';
                    if (errorContainer) errorContainer.classList.add('hidden');
                } else {
                    throw new Error('OPENAI_INVALID_KEY');
                }
            } catch (error) {
                openaiStatusIndicator.className = 'w-2 h-2 rounded-full bg-red-500 shadow-sm shadow-red-500/50';
                openaiStatusText.textContent = '무효함';
                openaiStatusText.className = 'text-[10px] text-red-500 font-bold uppercase tracking-wider';

                if (errorContainer && errorMsg && dashboardLink) {
                    errorContainer.classList.remove('hidden');
                    if (error.message === 'OPENAI_QUOTA_EXCEEDED') {
                        errorMsg.textContent = '❌ 할당량 초과: 계정 잔액이나 할당량을 확인해주세요.';
                        dashboardLink.href = 'https://platform.openai.com/account/billing';
                    } else {
                        errorMsg.textContent = '❌ 유효하지 않은 API 키입니다.';
                        dashboardLink.href = 'https://platform.openai.com/api-keys';
                    }
                }
                if (openaiValidationMsg) openaiValidationMsg.textContent = '❌ 키 확인 중 오류가 발생했습니다.';
            }

            window.aiService.setOpenAIKey(originalKey);
            validateOpenaiBtn.disabled = false;
            setTimeout(() => { if (openaiValidationMsg) openaiValidationMsg.classList.add('hidden'); }, 3000);
        };

        validateOpenaiBtn.onclick = checkOpenaiKey;

        if (deleteOpenaiBtn) {
            deleteOpenaiBtn.onclick = async () => {
                const confirmed = await window.showAppConfirm('API 키 삭제', 'OpenAI API 키를 삭제하시겠습니까?');
                if (confirmed) {
                    localStorage.removeItem('rep_openai_key');
                    window.aiService.setOpenAIKey(null);
                    openaiKeyInput.value = '';
                    openaiStatusIndicator.className = 'w-2 h-2 rounded-full bg-gray-300';
                    openaiStatusText.textContent = '상태 미확인';
                    document.getElementById('openai-error-container')?.classList.add('hidden');
                    showToast('OpenAI 키가 삭제되었습니다.', 'info');
                }
            };
        }

        saveOpenaiBtn.onclick = () => {
            const newKey = openaiKeyInput.value.trim();
            if (newKey) {
                localStorage.setItem('rep_openai_key', newKey);
                window.aiService.setOpenAIKey(newKey);
                showToast('OpenAI 키가 저장되었습니다.', 'success');
                checkOpenaiKey();
            } else {
                showToast('API 키를 입력해주세요.');
            }
        };
    }

    // Reset Onboarding Button
    const resetOnboardingBtn = document.getElementById('reset-onboarding-btn');
    if (resetOnboardingBtn) {
        resetOnboardingBtn.addEventListener('click', () => {
            localStorage.removeItem('rep_onboarding_seen');
            if (window.openOnboardingModal) {
                window.openOnboardingModal();
            } else {
                window.location.reload();
            }
        });
    }

    // Clear History Button
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', async () => {
            const confirmed = await window.showAppConfirm('전체 기록 삭제', '모든 생성 기록을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.');
            if (confirmed) {
                localStorage.removeItem('rep_history');
                showToast('모든 기록이 삭제되었습니다.');
                // Trigger global event or manually reload if needed, 
                // but since history is loaded dynamically on view switch, 
                // we might just need to clear UI if currently viewing it.
                if (window.location.hash === '#dashboard' && window.loadHistory) {
                    window.loadHistory();
                }
            }
        });
    }
}
