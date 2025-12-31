/**
 * RepurposeAI Application Logic
 * Handles UI interactions, simulating AI generation, clipboard operations, and Sidebar navigation.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Service Worker Registration for PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker Registered'))
            .catch(err => console.log('Service Worker Failed', err));
    }

    // --- Router & Navigation Logic ---
    function handleHashChange() {
        const hash = window.location.hash.substring(1) || 'home';

        // 1. Update Layout (Sidebar/Header active states)
        if (window.Components) {
            const sidebarHTML = window.Components.renderSidebar(hash);
            const sidebarContainer = document.getElementById('layout-sidebar');
            if (sidebarContainer) {
                sidebarContainer.innerHTML = sidebarHTML;
            }

            // Re-attach sidebar events after re-rendering
            // Header button (hamburger) is NOT re-rendered, so its listener stays.
            // But Overlay IS re-rendered (it's part of renderSidebar).
            const sidebarOverlay = document.getElementById('sidebar-overlay');
            if (sidebarOverlay) {
                sidebarOverlay.addEventListener('click', toggleSidebar);
            }

            lucide.createIcons();

            // Re-check Auth Context after render
            updateAuthUI();
        }

        // 2. Toggle Views
        const views = document.querySelectorAll('.view-section');
        views.forEach(view => view.classList.add('hidden'));

        const activeView = document.getElementById(`view-${hash}`);
        if (activeView) {
            activeView.classList.remove('hidden');
            activeView.classList.add('animate-fade-in');
        }

        // 3. Load specific view data
        if (hash === 'dashboard') {
            loadHistory();
        }

        // Close mobile sidebar if open (using new function)
        const sidebar = document.getElementById('sidebar');
        if (sidebar && !sidebar.classList.contains('-translate-x-full')) {
            toggleSidebar();
        }
    }

    // --- Sidebar Logic ---
    function toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const sidebarOverlay = document.getElementById('sidebar-overlay');
        const body = document.body;

        if (!sidebar) return;

        const isClosed = sidebar.classList.contains('-translate-x-full');
        if (isClosed) {
            sidebar.classList.remove('-translate-x-full'); // Open
            if (sidebarOverlay) {
                sidebarOverlay.classList.remove('hidden');
                setTimeout(() => {
                    sidebarOverlay.classList.remove('opacity-0');
                }, 10);
            }
            if (body) body.classList.add('overflow-hidden');
        } else {
            sidebar.classList.add('-translate-x-full'); // Close
            if (sidebarOverlay) {
                sidebarOverlay.classList.add('opacity-0');
                setTimeout(() => {
                    sidebarOverlay.classList.add('hidden');
                }, 300);
            }
            if (body) body.classList.remove('overflow-hidden');
        }
    }

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);

    // Initial Load - Moved to end to avoid TDZ
    // handleHashChange();

    // --- Global Event Delegation ---
    // Handles clicks for dynamically rendered elements (Header/Sidebar buttons)
    document.addEventListener('click', (e) => {
        // 1. Theme Toggle
        const themeBtn = e.target.closest('#theme-toggle');
        if (themeBtn) {
            if (window.toggleTheme) window.toggleTheme();
            return;
        }

        // 2. Sidebar Toggle (Mobile)
        const sidebarBtn = e.target.closest('#sidebar-toggle');
        if (sidebarBtn) {
            toggleSidebar();
            return;
        }
    });

    // --- Core Application Logic ---

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

    function updateAuthUI() {
        // Elements inside dynamic header need re-selection
        const loginBtn = document.getElementById('login-btn');
        const logoutBtn = document.getElementById('logout-btn');
        const sidebarUserName = document.getElementById('sidebar-user-name');


        if (user) {
            if (loginBtn) loginBtn.classList.add('hidden');
            // if (dashboardBtn) dashboardBtn.classList.remove('hidden'); // Removed
            if (logoutBtn) logoutBtn.classList.remove('hidden');
            if (sidebarUserName) sidebarUserName.textContent = user.name;
        } else {
            if (loginBtn) loginBtn.classList.remove('hidden');
            // if (dashboardBtn) dashboardBtn.classList.add('hidden'); // Removed
            if (logoutBtn) logoutBtn.classList.add('hidden');
            if (sidebarUserName) sidebarUserName.textContent = 'Guest';
        }

        // Logout Handler attachment
        if (logoutBtn) {
            logoutBtn.onclick = () => {
                localStorage.removeItem('rep_user');
                // Go to home and reload
                window.location.hash = 'home';
                window.location.reload();
            };
        }
    }

    // Call once on load
    updateAuthUI();

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


    // --- Dashboard History Logic ---
    function loadHistory() {
        const historyContainer = document.getElementById('history-container');
        const emptyState = document.getElementById('empty-state');

        if (!historyContainer) return; // Should exist now in index.html

        // Auth Redirect for Dashboard
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        const history = JSON.parse(localStorage.getItem('rep_history') || '[]');
        historyContainer.innerHTML = ''; // Clear current

        if (history.length === 0) {
            if (emptyState) emptyState.classList.remove('hidden');
        } else {
            if (emptyState) emptyState.classList.add('hidden');

            history.reverse().forEach(item => {
                const date = new Date(item.timestamp).toLocaleDateString() + ' ' + new Date(item.timestamp).toLocaleTimeString();

                const card = document.createElement('div');
                card.className = 'bg-white dark:bg-dark-card p-6 rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm hover:shadow-md transition-all group';

                let platformIcon = 'file-text';
                let platformColor = 'text-gray-500';
                if (item.platform === 'twitter') { platformIcon = 'twitter'; platformColor = 'text-blue-400'; }
                else if (item.platform === 'linkedin') { platformIcon = 'linkedin'; platformColor = 'text-blue-700'; }
                else if (item.platform === 'instagram') { platformIcon = 'instagram'; platformColor = 'text-pink-500'; }
                else if (item.platform === 'youtube') { platformIcon = 'youtube'; platformColor = 'text-red-500'; }

                card.innerHTML = `
                    <div class="flex justify-between items-start mb-4">
                        <div class="flex items-center gap-3">
                            <div class="p-2 rounded-lg bg-gray-50 dark:bg-gray-800 ${platformColor}">
                                <i data-lucide="${platformIcon}" class="w-5 h-5"></i>
                            </div>
                            <div>
                                <h3 class="text-sm font-bold text-gray-900 dark:text-white capitalize">${item.platform} Post</h3>
                                <p class="text-xs text-gray-400">${date}</p>
                            </div>
                        </div>
                        <button class="copy-item-btn text-gray-400 hover:text-brand transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg" data-content="${encodeURIComponent(item.content)}" title="복사">
                            <i data-lucide="copy" class="w-4 h-4"></i>
                        </button>
                    </div>
                    <div class="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap leading-relaxed line-clamp-3 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">${item.content}</div>
                `;
                historyContainer.appendChild(card);
            });

            // Re-render icons for new elements
            lucide.createIcons();

            // Handle Copy for History Items
            document.querySelectorAll('.copy-item-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const content = decodeURIComponent(e.currentTarget.dataset.content);
                    navigator.clipboard.writeText(content).then(() => {
                        showToast('복사되었습니다');
                    });
                });
            });
        }
    }

    // --- Content Generation (Only if elements exist) ---
    if (inputText && generateBtn) {

        // 1. Character Count Update
        inputText.addEventListener('input', (e) => {
            const length = e.target.value.length;
            if (charCount) charCount.textContent = length.toLocaleString();

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

        // Initial check
        if (inputText.value.length > 0) {
            if (charCount) charCount.textContent = inputText.value.length.toLocaleString();
            generateBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            generateBtn.disabled = false;
        }


        // 2. Generate Action
        let isGenerating = false;
        const SIMULATION_DELAY_MS = 1500;

        generateBtn.addEventListener('click', async () => {
            const text = inputText.value.trim();
            const selectedPlatformInput = document.querySelector('input[name="platform"]:checked');
            const selectedPlatform = selectedPlatformInput ? selectedPlatformInput.value : 'twitter';

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

        function setLoadingState(isLoading) {
            isGenerating = isLoading;

            if (isLoading) {
                generateBtn.disabled = true;
                generateBtn.innerHTML = '<div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> <span>생성 중...</span>';

                if (outputLoader) outputLoader.classList.remove('hidden');
                if (outputPlaceholder) outputPlaceholder.classList.add('hidden');
                if (outputContent) outputContent.classList.add('hidden');
                if (outputCard) outputCard.classList.remove('border-dashed'); // Make it look solid while loading

                if (copyBtn) {
                    copyBtn.style.opacity = '0';
                    copyBtn.classList.add('pointer-events-none');
                    copyBtn.disabled = true;
                }
            } else {
                generateBtn.disabled = false;
                generateBtn.innerHTML = '<i data-lucide="wand-2" class="w-5 h-5"></i> <span>AI 콘텐츠 생성하기</span>';
                lucide.createIcons();

                if (outputLoader) outputLoader.classList.add('hidden');
            }
        }

        function displayResult(content) {
            if (outputContent) outputContent.textContent = content;

            if (outputPlaceholder) outputPlaceholder.classList.add('hidden');
            if (outputContent) outputContent.classList.remove('hidden');
            if (outputContent) outputContent.classList.add('animate-fade-in');

            if (outputCard) {
                outputCard.classList.remove('border-dashed');
                outputCard.classList.add('border-brand/20', 'bg-blue-50/10', 'dark:border-brand-light/20', 'dark:bg-blue-900/10');
            }

            if (copyBtn) {
                copyBtn.style.opacity = '1';
                copyBtn.classList.remove('pointer-events-none');
                copyBtn.disabled = false;
            }
        }
    }


    // 3. Copy Action
    if (copyBtn && outputContent) {
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
                    lucide.createIcons();
                }, 2000);
            }).catch(err => {
                console.error('Copy failed', err);
                showToast('복사에 실패했습니다.');
            });
        });
    }

    // --- Helper Functions ---

    function showToast(message, duration = 3000) {
        if (!toast) return;
        toast.innerHTML = `<i data-lucide="check-circle" class="w-4 h-4 text-green-400"></i> <span>${message}</span>`;
        toast.style.opacity = '1';
        toast.classList.remove('translate-y-4'); // Slide up

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.classList.add('translate-y-4'); // Slide down
        }, duration);
        lucide.createIcons();
    }


    // --- Mock Data Generator ---
    function generateMockContent(sourceText, platform) {
        const context = sourceText.substring(0, 30) + (sourceText.length > 30 ? '...' : '');

        if (platform === 'twitter') {
            return `🧵 1/5\n"${context}"에 대한 새로운 인사이트를 공유합니다.\n\n생각보다 많은 분들이 이 부분을 놓치고 계시더군요. 핵심은 간단합니다. 👇\n\n2/5\n첫 번째로 주목할 점은...\n(AI가 내용을 분석하여 트윗 스레드로 변환한 내용이 들어갑니다)\n\n3/5\n실제 사례를 보면 더욱 명확해집니다.\n- 포인트 1\n- 포인트 2\n- 포인트 3\n\n4/5\n결국 중요한 것은 실행입니다. 오늘 당장 시작해보세요.\n\n5/5\n더 유용한 정보를 원하신다면 팔로우해주세요! 🚀\n#인사이트 #자기계발`;
        } else if (platform === 'linkedin') {
            return `🚀 비즈니스 성장을 위한 핵심 전략: "${context}"\n\n최근 업계에서 주목하고 있는 트렌드에 대해 정리해보았습니다.\n\n💡 핵심 요약:\n1. 주요 포인트 1\n2. 비즈니스 임팩트\n3. 실행 가능한 조언\n\n많은 리더분들이 이 부분에서 고민을 하시는데, 제 경험상 가장 중요한 것은 '꾸준함'과 '전략'의 조화였습니다.\n\n여러분의 생각은 어떠신가요? 댓글로 의견을 나눠주세요! 👇\n\n#비즈니스 #성장전략 #인사이트 #커리어 #RepurposeAI`;
        } else if (platform === 'instagram') {
            return `✨ 오늘의 영감: "${context}"\n\n💡 놓치면 안 되는 3가지 포인트:\n1️⃣ 첫 번째 핵심\n2️⃣ 두 번째 핵심\n3️⃣ 세 번째 핵심\n\n매일 조금씩 성장하는 나를 위해 저장해두세요! 📌\n\n.\n.\n.\n#자기계발 #동기부여 #성장 #인사이트 #꿀팁 #RepurposeAI`;
        } else if (platform === 'youtube') {
            return `[YouTube Shorts 스크립트]\n\n(0:00-0:05)\n🎥 [화면: 호기심을 자극하는 배경 영상 + 큰 텍스트 "이거 알고 계셨나요?"]\n🗣️ 내레이션: "${context}"... 혹시 이렇게 생각해보신 적 있나요?\n\n(0:05-0:15)\n🎥 [화면: 핵심 내용이 3가지 포인트로 빠르게 지나감]\n🗣️ 내레이션: 사실 진짜 비밀은 여기에 있습니다. 첫째, ... 둘째, ...\n\n(0:15-0:30)\n🎥 [화면: 화자가 직접 설명하거나 인상적인 결과 화면]\n🗣️ 내레이션: 지금 바로 적용해보세요. 결과가 달라질 겁니다!\n\n(0:30-0:60)\n🎥 [화면: 구독 버튼을 가리키는 손가락]\n🗣️ 내레이션: 더 많은 꿀팁을 원하신다면 구독과 좋아요 부탁드려요! 👍`;
        }
        return "콘텐츠 생성 오류";
    }

    // Initial Load (Safe after declarations)
    handleHashChange();

});
