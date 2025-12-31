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

    // --- Global Modal Service ---
    window.showAppModal = function ({ title, message, type = 'alert', confirmText = '확인', cancelText = '취소' }) {
        return new Promise((resolve) => {
            const modal = document.getElementById('app-modal');
            const modalContent = document.getElementById('app-modal-content');
            const modalTitle = document.getElementById('modal-title');
            const modalMessage = document.getElementById('modal-message');
            const modalCancelBtn = document.getElementById('modal-cancel-btn');
            const modalConfirmBtn = document.getElementById('modal-confirm-btn');
            const modalIcon = document.getElementById('modal-icon');
            const modalIconContainer = document.getElementById('modal-icon-container');

            if (!modal) return resolve(false);

            modalTitle.innerText = title;
            modalMessage.innerText = message;
            modalConfirmBtn.innerText = confirmText;
            modalCancelBtn.innerText = cancelText;

            // Type handling
            if (type === 'confirm') {
                modalCancelBtn.classList.remove('hidden');
                modalIconContainer.className = 'w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 bg-red-50 text-red-500 dark:bg-red-900/20';
                modalIcon.setAttribute('data-lucide', 'alert-triangle');
            } else {
                modalCancelBtn.classList.add('hidden');
                modalIconContainer.className = 'w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 bg-brand/10 text-brand dark:bg-brand/20';
                modalIcon.setAttribute('data-lucide', 'info');
            }
            if (window.lucide) lucide.createIcons();

            // Show animation
            modal.classList.remove('hidden');
            setTimeout(() => {
                modal.classList.remove('opacity-0');
                if (modalContent) modalContent.classList.remove('scale-95');
            }, 10);

            const handleConfirm = () => {
                cleanup();
                resolve(true);
            };

            const handleCancel = () => {
                cleanup();
                resolve(false);
            };

            const cleanup = () => {
                modal.classList.add('opacity-0');
                if (modalContent) modalContent.classList.add('scale-95');
                setTimeout(() => {
                    modal.classList.add('hidden');
                    modalConfirmBtn.removeEventListener('click', handleConfirm);
                    modalCancelBtn.removeEventListener('click', handleCancel);
                }, 300);
            };

            modalConfirmBtn.addEventListener('click', handleConfirm, { once: true });
            modalCancelBtn.addEventListener('click', handleCancel, { once: true });
        });
    };

    window.showAppConfirm = function (title, message, confirmText = '확인') {
        return window.showAppModal({ title, message, type: 'confirm', confirmText });
    };

    window.showAppAlert = function (title, message) {
        return window.showAppModal({ title, message, type: 'alert' });
    };

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
        // 3. Load specific view data
        if (hash === 'dashboard') {
            loadHistory();
        } else if (hash === 'brands') {
            // Init Brands Logic
            if (typeof initBrands === 'function') initBrands();
        }

        // Close mobile sidebar if open (using new function)
        const sidebar = document.getElementById('sidebar');
        if (sidebar && !sidebar.classList.contains('-translate-x-full')) {
            toggleSidebar();
        } else {
            // Safety: Ensure scrolling is enabled
            document.body.classList.remove('overflow-hidden');
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
            logoutBtn.onclick = async () => {
                const confirmed = await showAppConfirm('로그아웃', '정말 로그아웃 하시겠습니까?');
                if (confirmed) {
                    localStorage.removeItem('rep_user');
                    window.location.href = 'login.html';
                }
            };
        }
    }

    // Call once on load
    updateAuthUI();

    // Helper: Save to History
    function saveToHistory(content, platform, originalInput) {
        if (!user) return; // Only save if logged in

        const history = JSON.parse(localStorage.getItem('rep_history') || '[]');
        const newItem = {
            id: Date.now(),
            content: content,
            originalInput: originalInput || '',
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
                        <div class="flex items-center gap-1">
                            <button class="copy-item-btn text-gray-400 hover:text-brand transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg" data-content="${encodeURIComponent(item.content)}" title="복사">
                                <i data-lucide="copy" class="w-4 h-4"></i>
                            </button>
                            <button onclick="deleteHistoryItem(${item.id})" class="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="삭제">
                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                            </button>
                        </div>
                    </div>

                    ${item.originalInput ? `
                    <div class="mb-3">
                         <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">원본 내용:</p>
                         <div class="text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-dark-bg p-3 rounded-lg italic border border-gray-200 dark:border-dark-border">
                            "${item.originalInput}"
                         </div>
                    </div>
                    ` : ''}

                    <div class="relative">
                        <div id="content-${item.id}" class="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap leading-relaxed line-clamp-3 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-inner transition-all duration-300">
                            ${marked.parse(item.content)}
                        </div>
                        <button onclick="toggleContent('${item.id}')" id="btn-${item.id}" class="mt-2 text-xs font-medium text-brand hover:text-brand-dark dark:text-brand-light dark:hover:text-white flex items-center gap-1 transition-colors">
                            <span>전체내용 보기</span>
                            <i data-lucide="chevron-down" class="w-3 h-3"></i>
                        </button>
                    </div>
                `;
                historyContainer.appendChild(card);
            });

            // Re-initialize icons for new elements
            lucide.createIcons();
        }

        // Global function to toggle content
        window.toggleContent = function (id) {
            const contentDiv = document.getElementById(`content-${id}`);
            const btn = document.getElementById(`btn-${id}`);
            const isCollapsed = contentDiv.classList.contains('line-clamp-3');

            if (isCollapsed) {
                contentDiv.classList.remove('line-clamp-3');
                btn.innerHTML = `<span>접기</span><i data-lucide="chevron-up" class="w-3 h-3"></i>`;
            } else {
                contentDiv.classList.add('line-clamp-3');
                btn.innerHTML = `<span>전체내용 보기</span><i data-lucide="chevron-down" class="w-3 h-3"></i>`;
            }
            lucide.createIcons();
        };

        // Global function to delete item
        window.deleteHistoryItem = async function (id) {
            const confirmed = await showAppConfirm('기록 삭제', '이 기록을 정말 삭제하시겠습니까?');
            if (confirmed) {
                const history = JSON.parse(localStorage.getItem('rep_history') || '[]');
                const newHistory = history.filter(item => item.id !== id);
                localStorage.setItem('rep_history', JSON.stringify(newHistory));
                loadHistory(); // Reload UI
                showToast('삭제되었습니다.', 2000);
            }
        };

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

            // Collect all selected platforms
            const selectedPlatforms = Array.from(document.querySelectorAll('input[name="platform"]:checked')).map(cb => cb.value);

            if (selectedPlatforms.length === 0) {
                // Default to Twitter if nothing selected, or show error
                // For now, let's default to Twitter if none checked to match old behavior, or error.
                // Better to error.
                showToast('플랫폼을 최소 하나 이상 선택해주세요!');
                return;
            }

            if (!text) {
                showToast('콘텐츠를 먼저 입력해주세요!');
                inputText.focus();
                return;
            }

            if (isGenerating) return;

            // UI: Start Loading
            setLoadingState(true);

            try {
                // Pre-check: Verify API Key exists for the selected provider
                const provider = window.aiService.provider;
                const apiKey = provider === 'openai' ? window.aiService.openaiKey : window.aiService.apiKey;

                if (!apiKey && provider === 'openai') {
                    throw new Error('API 키를 입력해주세요. 설정 > API 키 등록');
                }
                // Call AI Service
                // Call AI Service with new signature
                // Use key from input if provided
                const languageSelect = document.getElementById('language-select');
                const selectedLanguage = languageSelect ? languageSelect.value : 'Korean';

                // Get Selected Brand
                let brandId = null;
                if (window.brandService) {
                    brandId = window.brandService.getCurrentBrandId();
                }

                // API Key is handled globally via Settings/localStorage now.

                const generatedContent = await window.aiService.generateContent(text, selectedPlatforms, selectedLanguage, brandId);

                // Display Result with Markdown
                outputContent.innerHTML = marked.parse(generatedContent);
                outputContent.classList.remove('hidden');

                // Show Translation Controls
                translateSection.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-1');
                copyBtn.classList.remove('opacity-0', 'pointer-events-none');
                copyBtn.disabled = false;

                showToast('콘텐츠가 생성되었습니다!', 2000);

                // Save to History (Save RAW text for editing/re-use, but display can be MD)
                // For multi-platform, we save the combined result labeled as 'Multi-Platform' or the specific list
                const platformLabel = selectedPlatforms.length > 1 ? 'Multi-Platform' : selectedPlatforms[0];
                saveToHistory(generatedContent, platformLabel, text);

            } catch (error) {
                console.error('Generation failed:', error);
                const errorMessage = error.message;

                if (errorMessage === 'OPENAI_INVALID_KEY') {
                    outputContent.innerHTML = `
                        <div class="flex flex-col items-center justify-center py-10 text-center space-y-4">
                            <div class="w-12 h-12 bg-red-50 dark:bg-red-900/10 rounded-full flex items-center justify-center text-red-500">
                                <i data-lucide="key" class="w-6 h-6"></i>
                            </div>
                            <div>
                                <h3 class="text-base font-bold text-gray-900 dark:text-white">API 키 오류 (OpenAI)</h3>
                                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs">등록된 OpenAI API 키가 유효하지 않습니다.</p>
                            </div>
                            <div class="flex flex-col gap-2">
                                <button onclick="window.location.hash = 'settings';" class="px-5 py-2 bg-brand text-white rounded-xl text-xs font-bold shadow-lg shadow-brand/20 flex items-center gap-2">
                                    설정에서 키 다시 입력 <i data-lucide="arrow-right" class="w-3 h-3"></i>
                                </button>
                                <a href="https://platform.openai.com/api-keys" target="_blank" class="text-xs text-brand hover:underline font-bold">
                                    OpenAI 대시보드에서 키 확인하기
                                </a>
                            </div>
                        </div>
                    `;
                } else if (errorMessage === 'OPENAI_QUOTA_EXCEEDED') {
                    outputContent.innerHTML = `
                        <div class="flex flex-col items-center justify-center py-10 text-center space-y-4">
                            <div class="w-12 h-12 bg-orange-50 dark:bg-orange-900/10 rounded-full flex items-center justify-center text-orange-500">
                                <i data-lucide="zap-off" class="w-6 h-6"></i>
                            </div>
                            <div>
                                <h3 class="text-base font-bold text-gray-900 dark:text-white">생성 할당량 초과 (OpenAI)</h3>
                                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs">OpenAI 계정의 사용 가능 금액이 부족하거나 할당량을 모두 사용했습니다.</p>
                            </div>
                            <div class="flex flex-col gap-2">
                                <a href="https://platform.openai.com/account/billing" target="_blank" class="px-5 py-2 bg-brand !text-white rounded-xl text-xs font-bold shadow-lg shadow-brand/20 flex items-center gap-2 hover:brightness-110 transition-all">
                                    OpenAI 결제 및 사용량 확인 <i data-lucide="external-link" class="w-3 h-3"></i>
                                </a>
                            </div>
                        </div>
                    `;
                } else if (errorMessage.toLowerCase().includes('api key') || errorMessage.toLowerCase().includes('not valid')) {
                    outputContent.innerHTML = `
                        <div class="flex flex-col items-center justify-center py-10 text-center space-y-4">
                            <div class="w-12 h-12 bg-red-50 dark:bg-red-900/10 rounded-full flex items-center justify-center text-red-500">
                                <i data-lucide="key" class="w-6 h-6"></i>
                            </div>
                            <div>
                                <h3 class="text-base font-bold text-gray-900 dark:text-white">API 키 오류</h3>
                                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs">${errorMessage === 'API 키를 입력해주세요. 설정 > API 키 등록' ? errorMessage : '등록된 API 키가 유효하지 않습니다. 설정 페이지에서 다시 확인해주세요.'}</p>
                            </div>
                            <button onclick="window.location.hash = 'settings';" class="px-5 py-2 bg-brand text-white rounded-xl text-xs font-bold shadow-lg shadow-brand/20 flex items-center gap-2">
                                설정 페이지로 이동 <i data-lucide="arrow-right" class="w-3 h-3"></i>
                            </button>
                        </div>
                    `;
                } else if (errorMessage.toLowerCase().includes('quota') || errorMessage.toLowerCase().includes('rate limit')) {
                    outputContent.innerHTML = `
                        <div class="flex flex-col items-center justify-center py-10 text-center space-y-4">
                            <div class="w-12 h-12 bg-orange-50 dark:bg-orange-900/10 rounded-full flex items-center justify-center text-orange-500">
                                <i data-lucide="zap-off" class="w-6 h-6"></i>
                            </div>
                            <div>
                                <h3 class="text-base font-bold text-gray-900 dark:text-white">생성 할당량 초과</h3>
                                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs">AI 서비스 할당량을 모두 사용했습니다. 잠시 후 시도하거나 키 상태를 확인하세요.</p>
                            </div>
                            <button onclick="window.location.hash = 'settings';" class="px-5 py-2 border border-brand text-brand rounded-xl text-xs font-bold hover:bg-brand hover:text-white transition-all flex items-center gap-2">
                                API 키 설정 확인하기 <i data-lucide="key" class="w-3 h-3"></i>
                            </button>
                        </div>
                    `;
                } else {
                    outputContent.innerHTML = `
                        <div class="flex flex-col items-center justify-center py-10 text-center space-y-4">
                            <div class="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400">
                                <i data-lucide="alert-triangle" class="w-6 h-6"></i>
                            </div>
                            <p class="text-xs text-red-500 font-medium max-w-xs">생성 실패: ${errorMessage}</p>
                        </div>
                    `;
                }
                outputContent.classList.remove('hidden');
                lucide.createIcons();
                showToast('생성에 실패했습니다.', 'error');
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

    }

    // 2a. Translation Action
    const translateBtn = document.getElementById('translate-btn');
    const translateLang = document.getElementById('translate-lang');
    const translateSection = document.getElementById('translate-section');

    if (translateBtn && translateLang) {
        translateBtn.addEventListener('click', async () => {
            const currentContent = outputContent.textContent;
            const targetLang = translateLang.value;

            if (!currentContent || currentContent === '아직 생성된 콘텐츠가 없습니다.') {
                showToast('번역할 콘텐츠가 없습니다.');
                return;
            }
            if (!targetLang) {
                showToast('언어를 선택해주세요.');
                return;
            }

            // UI: Start Loading (Partial)
            translateBtn.disabled = true;
            translateBtn.innerHTML = '<div class="w-3 h-3 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>';

            // Show main loader overlay as well for better UX
            if (outputLoader) outputLoader.classList.remove('hidden');

            try {
                const translatedText = await window.aiService.translateContent(currentContent, targetLang);

                // Note: We don't necessarily overwrite the history item here, 
                outputContent.classList.remove('opacity-50', 'animate-pulse');

                // Update content with Markdown support
                outputContent.innerHTML = marked.parse(translatedText);

                showToast('번역 완료!', 2000);

            } catch (error) {
                console.error('Translation failed:', error);
                showToast(`번역 오류: ${error.message}`, 3000);
                outputContent.classList.remove('opacity-50', 'animate-pulse');
            } finally {
                // UI: Reset Button
                translateBtn.disabled = false;
                translateBtn.innerHTML = '<i data-lucide="languages" class="w-3.5 h-3.5"></i> <span class="hidden sm:inline">번역</span>';
                lucide.createIcons();

                if (outputLoader) outputLoader.classList.add('hidden');
            }
        });
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

        // Show Translate Controls when content exists
        if (translateSection) {
            translateSection.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-1');
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

    function showToast(message, type = 'info', duration = 3000) {
        if (!toast) return;

        let icon = 'info';
        let colorClass = 'text-brand';

        if (type === 'success') {
            icon = 'check-circle';
            colorClass = 'text-green-500';
        } else if (type === 'error') {
            icon = 'alert-circle';
            colorClass = 'text-red-500';
        }

        toast.innerHTML = `<i data-lucide="${icon}" class="w-4 h-4 ${colorClass}"></i> <span>${message}</span>`;
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
            return `[YouTube Shorts 스크립트]\n\n(0:00-0:05)\n🎥 [화면: 호기심을 자극하는 배경 영상 + 큰 텍스트 "이거 알고 계셨나요?"]\n🗣️ 내레이션: "${context}"... 혹시 이렇게 생각해본 적 있나요?\n\n(0:05-0:15)\n🎥 [화면: 핵심 내용이 3가지 포인트로 빠르게 지나감]\n🗣️ 내레이션: 사실 진짜 비밀은 여기에 있습니다. 첫째, ... 둘째, ...\n\n(0:15-0:30)\n🎥 [화면: 화자가 직접 설명하거나 인상적인 결과 화면]\n🗣️ 내레이션: 지금 바로 적용해보세요. 결과가 달라질 겁니다!\n\n(0:30-0:60)\n🎥 [화면: 구독 버튼을 가리키는 손가락]\n🗣️ 내레이션: 더 많은 꿀팁을 원하신다면 구독과 좋아요 부탁드려요! 👍`;
        }
        return "콘텐츠 생성 오류";
    }

    // --- Settings View Logic ---
    function initSettings() {
        // Provider Selection Logic
        const providerRadios = document.querySelectorAll('input[name="ai-provider"]');
        const geminiSettings = document.getElementById('gemini-settings');
        const openaiSettings = document.getElementById('openai-settings');

        const savedProvider = localStorage.getItem('rep_ai_provider') || 'gemini';
        providerRadios.forEach(radio => {
            if (radio.value === savedProvider) radio.checked = true;
            radio.addEventListener('change', (e) => {
                const selected = e.target.value;
                window.aiService.setProvider(selected);
                toggleProviderUI(selected);
                showToast(`${selected.charAt(0).toUpperCase() + selected.slice(1)} 공급자가 선택되었습니다.`, 'info');
            });
        });

        function toggleProviderUI(provider) {
            if (provider === 'gemini') {
                geminiSettings.classList.remove('hidden');
                openaiSettings.classList.add('hidden');
            } else {
                geminiSettings.classList.add('hidden');
                openaiSettings.classList.remove('hidden');
            }
        }
        toggleProviderUI(savedProvider);

        // --- Gemini Settings ---
        const settingsApiKeyInput = document.getElementById('settings-api-key');
        const saveApiKeyBtn = document.getElementById('save-api-key-btn');
        const validateBtn = document.getElementById('validate-api-key-btn');
        const apiStatusIndicator = document.getElementById('api-status-indicator');
        const apiStatusText = document.getElementById('api-status-text');
        const apiValidationMsg = document.getElementById('api-validation-msg');

        if (settingsApiKeyInput && saveApiKeyBtn) {
            const savedKey = localStorage.getItem('rep_api_key');
            if (savedKey) settingsApiKeyInput.value = savedKey;

            const checkKey = async () => {
                const currentKey = settingsApiKeyInput.value.trim();
                if (!currentKey) {
                    apiStatusIndicator.className = 'w-2 h-2 rounded-full bg-gray-300';
                    apiStatusText.textContent = '상태 미확인';
                    return;
                }
                if (apiValidationMsg) apiValidationMsg.classList.remove('hidden');
                validateBtn.disabled = true;
                const originalKey = window.aiService.apiKey;
                window.aiService.setApiKey(currentKey);
                const isValid = await window.aiService.validateApiKey();
                if (isValid) {
                    apiStatusIndicator.className = 'w-2 h-2 rounded-full bg-green-500 shadow-sm shadow-green-500/50';
                    apiStatusText.textContent = '유효함';
                    apiStatusText.className = 'text-[10px] text-green-500 font-bold uppercase tracking-wider';
                    if (apiValidationMsg) apiValidationMsg.textContent = '✅ API 키를 성공적으로 확인했습니다.';
                } else {
                    apiStatusIndicator.className = 'w-2 h-2 rounded-full bg-red-500 shadow-sm shadow-red-500/50';
                    apiStatusText.textContent = '무효함';
                    apiStatusText.className = 'text-[10px] text-red-500 font-bold uppercase tracking-wider';
                    if (apiValidationMsg) apiValidationMsg.textContent = '❌ 유효하지 않은 API 키입니다. 다시 확인해주세요.';
                }
                window.aiService.setApiKey(originalKey);
                validateBtn.disabled = false;
                setTimeout(() => { if (apiValidationMsg) apiValidationMsg.classList.add('hidden'); }, 3000);
            };

            validateBtn.onclick = checkKey;

            const deleteBtn = document.getElementById('delete-api-key-btn');
            if (deleteBtn) {
                deleteBtn.onclick = async () => {
                    const confirmed = await showAppConfirm('API 키 삭제', 'Gemini API 키를 삭제하시겠습니까?');
                    if (confirmed) {
                        localStorage.removeItem('rep_api_key');
                        window.aiService.setApiKey(null);
                        settingsApiKeyInput.value = '';
                        apiStatusIndicator.className = 'w-2 h-2 rounded-full bg-gray-300';
                        apiStatusText.textContent = '상태 미확인';
                        showToast('Gemini API 키가 삭제되었습니다.', 'info');
                    }
                };
            }

            saveApiKeyBtn.onclick = () => {
                const newKey = settingsApiKeyInput.value.trim();
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

            const deleteOpenaiBtn = document.getElementById('delete-openai-key-btn');
            if (deleteOpenaiBtn) {
                deleteOpenaiBtn.onclick = async () => {
                    const confirmed = await showAppConfirm('API 키 삭제', 'OpenAI API 키를 삭제하시겠습니까?');
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

        const clearHistoryBtn = document.getElementById('clear-history-btn');

        if (clearHistoryBtn) {
            clearHistoryBtn.addEventListener('click', async () => {
                const confirmed = await showAppConfirm('전체 기록 삭제', '모든 생성 기록을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.');
                if (confirmed) {
                    localStorage.removeItem('rep_history');
                    showToast('모든 기록이 삭제되었습니다.');
                    // Refresh view if on dashboard
                    if (window.location.hash === '#dashboard') {
                        loadHistory();
                    }
                }
            });
        }

        // Reset Onboarding Button
        const resetOnboardingBtn = document.getElementById('reset-onboarding-btn');
        if (resetOnboardingBtn) {
            resetOnboardingBtn.addEventListener('click', () => {
                localStorage.removeItem('rep_onboarding_seen');
                // Trigger modal show logic immediately
                const onboardingModal = document.getElementById('onboarding-modal');
                if (onboardingModal) {
                    onboardingModal.classList.remove('hidden');
                    setTimeout(() => {
                        onboardingModal.classList.remove('opacity-0');
                        const content = onboardingModal.querySelector('#onboarding-content');
                        if (content) content.classList.remove('scale-95');
                    }, 100);
                }
            });
        }
    }

    // --- Onboarding Logic (Moved to Main Scope) ---
    // Check if user has seen onboarding
    // Called once on load (handled by logic below)

    // Call initSettings on load and hash change to ensure elements are bound
    const savedGlobalKey = localStorage.getItem('rep_api_key');
    if (savedGlobalKey) {
        window.aiService.setApiKey(savedGlobalKey);
    }
    const savedOpenaiKey = localStorage.getItem('rep_openai_key');
    if (savedOpenaiKey) {
        window.aiService.setOpenAIKey(savedOpenaiKey);
    }
    const savedProvider = localStorage.getItem('rep_ai_provider');
    if (savedProvider) {
        window.aiService.setProvider(savedProvider);
    }
    initSettings();

    // Initial Onboarding Check (Run once)
    const onboardingModal = document.getElementById('onboarding-modal');
    const closeOnboardingBtn = document.getElementById('close-onboarding');
    const hasSeenOnboarding = localStorage.getItem('rep_onboarding_seen');

    if (!hasSeenOnboarding && onboardingModal) {
        // Show modal with animation
        onboardingModal.classList.remove('hidden');
        // Slight delay for fade-in effect
        setTimeout(() => {
            onboardingModal.classList.remove('opacity-0');
            const content = onboardingModal.querySelector('#onboarding-content');
            if (content) content.classList.remove('scale-95');
        }, 500); // Increased delay slightly to avoid conflict with load
    }

    if (closeOnboardingBtn && onboardingModal) {
        closeOnboardingBtn.addEventListener('click', () => {
            // Animate out
            onboardingModal.classList.add('opacity-0');
            const content = onboardingModal.querySelector('#onboarding-content');
            if (content) content.classList.add('scale-95');

            setTimeout(() => {
                onboardingModal.classList.add('hidden');
                // Save state
                localStorage.setItem('rep_onboarding_seen', 'true');
            }, 300);
        });
    }

    // Initial Load - Moved to end of file to ensure all functions are defined
    // handleHashChange();
    // populateBrandDropdown();

    // --- Brand System Logic ---
    function populateBrandDropdown() {
        if (!window.brandService) return;
        const select = document.getElementById('brand-select');
        if (!select) return;

        const brands = window.brandService.getAll();
        const currentId = window.brandService.getCurrentBrandId();

        let html = '<option value="">브랜드 선택 안함 (기본 스타일)</option>';
        brands.forEach(brand => {
            html += `<option value="${brand.id}" ${brand.id === currentId ? 'selected' : ''}>${brand.name}</option>`;
        });
        select.innerHTML = html;

        select.onchange = (e) => {
            window.brandService.setCurrentBrandId(e.target.value);
        };
    }

    function initBrands() {
        const createBtn = document.getElementById('create-brand-btn');
        if (createBtn) createBtn.onclick = () => openBrandEditor();

        const cancelBtn = document.getElementById('cancel-brand-btn');
        const saveBtn = document.getElementById('save-brand-btn');

        if (cancelBtn) cancelBtn.onclick = closeBrandEditor;
        if (saveBtn) saveBtn.onclick = saveBrandProfile;

        renderBrandList();
    }

    function renderBrandList() {
        const container = document.getElementById('brands-container');
        if (!container) return;

        const brands = window.brandService.getAll();

        const emptyState = document.getElementById('brands-empty-state');

        if (brands.length === 0) {
            if (emptyState) {
                container.classList.add('hidden');
                emptyState.classList.remove('hidden');
                container.innerHTML = '';
            } else {
                container.innerHTML = `
                    <div class="col-span-full py-12 text-center border-2 border-dashed border-gray-200 dark:border-dark-border rounded-xl">
                        <div class="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <i data-lucide="briefcase" class="w-8 h-8"></i>
                        </div>
                        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-1">등록된 브랜드가 없습니다</h3>
                        <p class="text-gray-500 dark:text-gray-400 mb-4">브랜드 스타일을 등록하여 일관된 톤앤매너를 유지하세요.</p>
                        <button onclick="openBrandEditor()" class="text-brand font-medium hover:underline">
                            첫 브랜드 등록하기
                        </button>
                    </div>
                `;
            }
        } else {
            if (emptyState) {
                emptyState.classList.add('hidden');
                container.classList.remove('hidden');
            }
            container.innerHTML = brands.map(brand => `
                <div class="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-xl p-5 hover:border-brand/30 transition-all shadow-sm group relative">
                    <div class="flex justify-between items-start mb-3">
                        <h3 class="font-bold text-gray-900 dark:text-white text-lg">${brand.name}</h3>
                        <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onclick="editBrand('${brand.id}')" class="p-1.5 text-gray-400 hover:text-brand hover:bg-brand/5 rounded-lg transition-colors">
                                <i data-lucide="edit-2" class="w-4 h-4"></i>
                            </button>
                             <button onclick="deleteBrand('${brand.id}')" class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                            </button>
                        </div>
                    </div>
                    <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <div class="flex items-start gap-2">
                            <span class="font-medium shrink-0 text-gray-500">톤앤매너:</span>
                            <span class="line-clamp-1">${brand.tone}</span>
                        </div>
                        <div class="flex items-start gap-2">
                             <span class="font-medium shrink-0 text-gray-500">스타일:</span>
                            <span class="line-clamp-1">${brand.style}</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }
        lucide.createIcons();
    }

    // Global Helpers for Brand
    window.openBrandEditor = function (id = null) {
        const modal = document.getElementById('brand-editor-modal');
        if (modal) modal.classList.remove('hidden');

        // Reset Test Area
        const testResultArea = document.getElementById('brand-test-result');
        const testContent = document.getElementById('brand-test-content');
        if (testResultArea) testResultArea.classList.add('hidden');
        if (testContent) testContent.innerHTML = '';

        const title = document.getElementById('brand-editor-title');
        const nameInput = document.getElementById('brand-name');
        const toneInput = document.getElementById('brand-tone');
        const styleInput = document.getElementById('brand-style');
        const keywordsInput = document.getElementById('brand-keywords');
        const forbiddenInput = document.getElementById('brand-forbidden');
        const examplesInput = document.getElementById('brand-examples');

        if (id) {
            const brand = window.brandService.getById(id);
            if (title) title.textContent = '브랜드 수정';
            if (nameInput) nameInput.value = brand.name || '';
            if (toneInput) toneInput.value = brand.tone || '';
            if (styleInput) styleInput.value = brand.style || '';
            if (keywordsInput) keywordsInput.value = brand.keywords || '';
            if (forbiddenInput) forbiddenInput.value = brand.forbidden || '';
            if (examplesInput) examplesInput.value = brand.examples || '';
            window.editingBrandId = id;
        } else {
            if (title) title.textContent = '새 브랜드 추가';
            if (nameInput) nameInput.value = '';
            if (toneInput) toneInput.value = '';
            if (styleInput) styleInput.value = '';
            if (keywordsInput) keywordsInput.value = '';
            if (forbiddenInput) forbiddenInput.value = '';
            if (examplesInput) examplesInput.value = '';
            window.editingBrandId = null;
        }
    };

    window.closeBrandEditor = function () {
        const modal = document.getElementById('brand-editor-modal');
        if (modal) modal.classList.add('hidden');
    };

    window.saveBrandProfile = function () {
        const name = document.getElementById('brand-name')?.value;
        const tone = document.getElementById('brand-tone')?.value;
        const style = document.getElementById('brand-style')?.value;
        const keywords = document.getElementById('brand-keywords')?.value;
        const forbidden = document.getElementById('brand-forbidden')?.value;
        const examples = document.getElementById('brand-examples')?.value;

        if (!name || !tone) {
            showToast('브랜드 이름과 톤앤매너는 필수입니다.');
            return;
        }

        const data = { name, tone, style, keywords, forbidden, examples };
        if (window.editingBrandId) data.id = window.editingBrandId;

        window.brandService.save(data);
        window.closeBrandEditor();
        renderBrandList();
        populateBrandDropdown(); // Update dropdown immediately
        showToast('브랜드 프로필이 저장되었습니다.', 'success');
    };

    window.testBrandVoice = async function () {
        const name = document.getElementById('brand-name')?.value || 'Test Brand';
        const tone = document.getElementById('brand-tone')?.value;
        const style = document.getElementById('brand-style')?.value;
        const keywords = document.getElementById('brand-keywords')?.value;
        const forbidden = document.getElementById('brand-forbidden')?.value;
        const examples = document.getElementById('brand-examples')?.value;

        if (!tone) {
            showToast('테스트를 위해 최소한 톤앤매너는 입력해주세요.');
            return;
        }

        const resultArea = document.getElementById('brand-test-result');
        const resultContent = document.getElementById('brand-test-content');

        if (resultArea) resultArea.classList.remove('hidden');
        if (resultContent) resultContent.innerHTML = '<div class="flex items-center gap-2 text-brand animate-pulse"><i data-lucide="loader-2" class="w-3 h-3 animate-spin"></i> 생성 중...</div>';
        lucide.createIcons();

        try {
            const tempBrand = { name, tone, style, keywords, forbidden, examples };
            const testText = "AI 기술이 우리의 일상과 비즈니스를 어떻게 변화시킬까요? 미래를 준비하는 자세에 대해 이야기해주세요.";

            // Generate for Twitter as a quick test
            const output = await window.aiService.generateContent(testText, ['twitter'], 'Korean', tempBrand);

            if (resultContent) {
                resultContent.innerHTML = marked.parse(output);
            }
        } catch (error) {
            console.error('Test Gen Error:', error);
            if (resultContent) {
                let errorMessage = error.message;
                if (errorMessage.toLowerCase().includes('api key') || errorMessage.toLowerCase().includes('not valid')) {
                    resultContent.innerHTML = `
                        <div class="space-y-2">
                            <p class="text-red-500 font-medium font-bold">⚠️ API 키 오류</p>
                            <p class="text-gray-500 text-[10px]">API 키가 유효하지 않거나 설정되지 않았습니다. [설정]에서 확인해주세요.</p>
                            <button onclick="window.closeBrandEditor(); window.location.hash = 'settings';" class="text-brand font-bold hover:underline text-[10px] flex items-center gap-1">
                                설정 페이지로 이동하기 <i data-lucide="external-link" class="w-3 h-3"></i>
                            </button>
                        </div>
                    `;
                } else if (errorMessage.toLowerCase().includes('quota') || errorMessage.toLowerCase().includes('rate limit')) {
                    resultContent.innerHTML = `
                        <div class="space-y-2">
                            <p class="text-orange-500 font-medium font-bold">⚠️ 생성 할당량 초과</p>
                            <p class="text-gray-500 text-[10px]">무료 티어 할당량을 모두 사용했습니다. 잠시 후 다시 시도하거나, 별도의 API 키를 설정해주세요.</p>
                            <button onclick="window.closeBrandEditor(); window.location.hash = 'settings';" class="text-brand font-bold hover:underline text-[10px] flex items-center gap-1">
                                나만의 API 키 등록하러 가기 <i data-lucide="key" class="w-3 h-3"></i>
                            </button>
                        </div>
                    `;
                } else {
                    resultContent.innerHTML = '<span class="text-red-500 text-[10px]">테스트 생성 실패: ' + errorMessage + '</span>';
                }
                lucide.createIcons();
            }
        }
    };

    window.editBrand = function (id) {
        openBrandEditor(id);
    };

    window.deleteBrand = async function (id) {
        const confirmed = await showAppConfirm('브랜드 삭제', '정말 이 브랜드 프로필을 삭제하시겠습니까?');
        if (confirmed) {
            window.brandService.delete(id);
            renderBrandList();
            populateBrandDropdown();
            showToast('브랜드가 삭제되었습니다.');
        }
    };

    // Initial Load - Delayed to ensure all functions and services are ready
    setTimeout(() => {
        handleHashChange();
        populateBrandDropdown();
        if (typeof initSettings === 'function') initSettings();
    }, 0);
});
