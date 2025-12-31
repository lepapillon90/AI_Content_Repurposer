/**
 * RepurposeAI Application Logic
 * Handles UI interactions, simulating AI generation, and clipboard operations.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Service Worker Registration for PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker Registered'))
            .catch(err => console.log('Service Worker Failed', err));
    }

    // DOM Elements
    const inputText = document.getElementById('input-text');
    const charCount = document.getElementById('char-count');
    const generateBtn = document.getElementById('generate-btn');
    const platformInputs = document.querySelectorAll('input[name="platform"]');
    const outputCard = document.getElementById('output-card');
    const outputContent = document.getElementById('output-content');
    const outputPlaceholder = document.getElementById('output-placeholder');
    const outputLoader = document.getElementById('output-loader');
    const copyBtn = document.getElementById('copy-btn');
    const toast = document.getElementById('toast');

    // Auth Simulation Logic
    const user = JSON.parse(localStorage.getItem('rep_user'));
    const loginBtn = document.getElementById('login-btn');
    const dashboardBtn = document.getElementById('dashboard-btn');

    if (user) {
        if (loginBtn) loginBtn.classList.add('hidden');
        if (dashboardBtn) dashboardBtn.classList.remove('hidden');
    }

    // Helper: Save to History
    function saveToHistory(content, platform) {
        if (!user) return; // Only save if logged in

        const history = JSON.parse(localStorage.getItem('rep_history') || '[]');
        const newItem = {
            id: Date.now(),
            content: content,
            platform: platform,
            timestamp: new Date().toISOString()
        };
        history.push(newItem);
        localStorage.setItem('rep_history', JSON.stringify(history));
    }
    // --- Theme Logic ---
    // Handled by js/theme.js
    const themeToggleBtn = document.getElementById('theme-toggle');

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            if (window.toggleTheme) {
                window.toggleTheme();
            }
        });
    }


    // --- Event Listeners ---

    // 1. Character Count Update
    inputText.addEventListener('input', (e) => {
        const length = e.target.value.length;
        charCount.textContent = length.toLocaleString();

        // Simple visual feedback if text is empty vs filled
        if (length > 0) {
            generateBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            generateBtn.disabled = false;
        } else {
            generateBtn.classList.add('opacity-50', 'cursor-not-allowed');
            generateBtn.disabled = true;
        }
    });

    // Initialize button state
    generateBtn.disabled = true;
    generateBtn.classList.add('opacity-50', 'cursor-not-allowed');


    // 2. Platform Selection Visuals (Additional logic if needed in future)
    platformInputs.forEach(input => {
        input.addEventListener('change', () => {
            // Optional: Update button text based on selection
            // const platformName = input.nextElementSibling.querySelector('span').innerText;
            // generateBtn.querySelector('span').innerText = `AI ${platformName} 생성하기`;
        });
    });


    // 3. Generate Action
    generateBtn.addEventListener('click', async () => {
        const text = inputText.value.trim();
        const selectedPlatform = document.querySelector('input[name="platform"]:checked').value;

        if (!text) {
            showToast('콘텐츠를 먼저 입력해주세요!');
            inputText.focus();
            return;
        }

        if (isGenerating) return;

        // UI: Start Loading
        setLoadingState(true);

        try {
            // Simulate AI Delay
            await new Promise(resolve => setTimeout(resolve, SIMULATION_DELAY_MS));

            // Mock Generation
            const generatedContent = generateMockContent(text, selectedPlatform);

            // UI: Show Result
            displayResult(generatedContent);
            showToast('콘텐츠가 생성되었습니다!', 2000);

            // Save to History
            saveToHistory(generatedContent, selectedPlatform);

        } catch (error) {
            console.error('Generation failed:', error);
            showToast('오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
            // UI: Stop Loading
            setLoadingState(false);
        }
    });


    // 4. Copy Action
    copyBtn.addEventListener('click', () => {
        const content = outputContent.innerText;
        if (!content) return;

        navigator.clipboard.writeText(content).then(() => {
            showToast('클립보드에 복사되었습니다! 🎉');

            // Visual feedback on button
            const originalHTML = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i> 복사 완료';
            copyBtn.classList.add('text-green-600', 'dark:text-green-400');

            setTimeout(() => {
                copyBtn.innerHTML = originalHTML;
                copyBtn.classList.remove('text-green-600', 'dark:text-green-400');
                lucide.createIcons(); // Re-render icons
            }, 2000);
        }).catch(err => {
            console.error('Copy failed', err);
            showToast('복사에 실패했습니다.');
        });
    });


    // --- Helper Functions ---

    function setLoadingState(isLoading) {
        isGenerating = isLoading;

        if (isLoading) {
            generateBtn.disabled = true;
            generateBtn.innerHTML = '<div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> <span>생성 중...</span>';

            outputLoader.classList.remove('hidden');
            outputPlaceholder.classList.add('hidden');
            outputContent.classList.add('hidden');
            outputCard.classList.remove('border-dashed'); // Make it look solid while loading

            copyBtn.style.opacity = '0';
            copyBtn.classList.add('pointer-events-none');
            copyBtn.disabled = true;
        } else {
            generateBtn.disabled = false;
            generateBtn.innerHTML = '<i data-lucide="wand-2" class="w-5 h-5"></i> <span>AI 콘텐츠 생성하기</span>';
            lucide.createIcons();

            outputLoader.classList.add('hidden');
        }
    }

    function displayResult(content) {
        outputContent.textContent = content;

        outputPlaceholder.classList.add('hidden');
        outputContent.classList.remove('hidden');
        outputContent.classList.add('animate-fade-in');

        outputCard.classList.remove('border-dashed');
        outputCard.classList.add('border-brand/20', 'bg-blue-50/10', 'dark:border-brand-light/20', 'dark:bg-blue-900/10'); // Subtle highlight with Dark mode support

        copyBtn.style.opacity = '1';
        copyBtn.classList.remove('pointer-events-none');
        copyBtn.disabled = false;
    }

    function showToast(message, duration = 3000) {
        toast.textContent = message;
        toast.style.opacity = '1';
        toast.classList.remove('translate-y-4'); // Slide up

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.classList.add('translate-y-4'); // Slide down
        }, duration);
    }

    // --- Mock Data Generator ---
    function generateMockContent(sourceText, platform) {
        // Truncate source for context in mock
        const context = sourceText.substring(0, 30) + (sourceText.length > 30 ? '...' : '');

        if (platform === 'twitter') {
            return `🧵 1/5
"${context}"에 대한 새로운 인사이트를 공유합니다.

생각보다 많은 분들이 이 부분을 놓치고 계시더군요. 핵심은 간단합니다. 👇

2/5
첫 번째로 주목할 점은...
(AI가 내용을 분석하여 트윗 스레드로 변환한 내용이 들어갑니다)

3/5
실제 사례를 보면 더욱 명확해집니다.
- 포인트 1
- 포인트 2
- 포인트 3

4/5
결국 중요한 것은 실행입니다. 오늘 당장 시작해보세요.

5/5
더 유용한 정보를 원하신다면 팔로우해주세요! 🚀
#인사이트 #자기계발`;
        }

        else if (platform === 'linkedin') {
            return `🚀 비즈니스 성장을 위한 핵심 전략: "${context}"

최근 업계에서 주목하고 있는 트렌드에 대해 정리해보았습니다.

💡 핵심 요약:
1. 주요 포인트 1
2. 비즈니스 임팩트
3. 실행 가능한 조언

많은 리더분들이 이 부분에서 고민을 하시는데, 제 경험상 가장 중요한 것은 '꾸준함'과 '전략'의 조화였습니다.

여러분의 생각은 어떠신가요? 댓글로 의견을 나눠주세요! 👇

#비즈니스 #성장전략 #인사이트 #커리어 #RepurposeAI`;
        }

        else if (platform === 'instagram') {
            return `✨ 오늘의 영감: "${context}"

💡 놓치면 안 되는 3가지 포인트:
1️⃣ 첫 번째 핵심
2️⃣ 두 번째 핵심
3️⃣ 세 번째 핵심

매일 조금씩 성장하는 나를 위해 저장해두세요! 📌

.
.
.
#자기계발 #동기부여 #성장 #인사이트 #꿀팁 #RepurposeAI`;
        }

        else if (platform === 'youtube') {
            return `[YouTube Shorts 스크립트]

(0:00-0:05)
🎥 [화면: 호기심을 자극하는 배경 영상 + 큰 텍스트 "이거 알고 계셨나요?"]
🗣️ 내레이션: "${context}"... 혹시 이렇게 생각해보신 적 있나요?

(0:05-0:15)
🎥 [화면: 핵심 내용이 3가지 포인트로 빠르게 지나감]
🗣️ 내레이션: 사실 진짜 비밀은 여기에 있습니다. 첫째, ... 둘째, ...

(0:15-0:30)
🎥 [화면: 화자가 직접 설명하거나 인상적인 결과 화면]
🗣️ 내레이션: 지금 바로 적용해보세요. 결과가 달라질 겁니다!

(0:30-0:60)
🎥 [화면: 구독 버튼을 가리키는 손가락]
🗣️ 내레이션: 더 많은 꿀팁을 원하신다면 구독과 좋아요 부탁드려요! 👍`;
        }

        return "콘텐츠 생성 오류";
    }

    // Initial check
    if (inputText.value.length > 0) {
        charCount.textContent = inputText.value.length.toLocaleString();
        generateBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        generateBtn.disabled = false;
    }
});
