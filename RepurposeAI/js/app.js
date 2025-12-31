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
            const sidebarOverlay = document.getElementById('sidebar-overlay');
            if (sidebarOverlay) {
                sidebarOverlay.addEventListener('click', toggleSidebar);
            }

            lucide.createIcons();

            // Re-initialization for specific views if needed
            if (hash === 'home') {
                updateDashboardStats();
            } else if (hash === 'dashboard') {
                loadHistory();
            }
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
        if (hash === 'home') {
            updateDashboardStats();
        } else if (hash === 'dashboard') {
            loadHistory();
        } else if (hash === 'brands') {
            // Init Brands Logic
            if (typeof initBrands === 'function') initBrands();
        }

        // Close mobile sidebar if open
        const sidebar = document.getElementById('sidebar');
        if (sidebar && !sidebar.classList.contains('-translate-x-full')) {
            toggleSidebar();
        } else {
            // Safety: Ensure scrolling is enabled
            document.body.classList.remove('overflow-hidden');
        }
    }

    // --- Dashboard Logic ---

    function updateDashboardStats() {
        const history = JSON.parse(localStorage.getItem('rep_history') || '[]');

        // Total Count
        const totalCount = history.length;
        document.getElementById('stat-total-count').innerText = totalCount;

        // Average Viral Score
        let totalScore = 0;
        let scoreCount = 0;

        // प्लेटफार्म별 통계 (Most used platform)
        const platformCounts = {};

        // 이번 주 생성 건수
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        let weekCount = 0;

        history.forEach(item => {
            // Score
            if (item.metadata && item.metadata.viralScore) {
                totalScore += parseInt(item.metadata.viralScore);
                scoreCount++;
            }

            // Platform
            if (item.platform) {
                platformCounts[item.platform] = (platformCounts[item.platform] || 0) + 1;
            }

            // Week count
            if (item.timestamp) {
                const itemDate = new Date(item.timestamp);
                if (itemDate >= oneWeekAgo) weekCount++;
            }
        });

        const avgScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;
        document.getElementById('stat-avg-score').innerText = avgScore;

        let topPlatform = '-';
        let maxCount = 0;
        for (const [platform, count] of Object.entries(platformCounts)) {
            if (count > maxCount) {
                maxCount = count;
                topPlatform = platform;
            }
        }
        document.getElementById('stat-top-platform').innerText = topPlatform;
        document.getElementById('stat-week-count').innerText = weekCount;
    }

    function loadHistory() {
        const container = document.getElementById('history-container');
        const emptyState = document.getElementById('history-empty-state');
        if (!container) return;

        const history = JSON.parse(localStorage.getItem('rep_history') || '[]');

        if (history.length === 0) {
            container.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');
        container.innerHTML = history.reverse().map(item => {
            const date = new Date(item.timestamp).toLocaleDateString();

            // Platform Icons & Colors Helper
            const getPlatformStyle = (p) => {
                const map = {
                    'twitter': { icon: 'twitter', color: 'text-sky-500', bg: 'bg-sky-500/10', border: 'border-sky-500/20' },
                    'linkedin': { icon: 'linkedin', color: 'text-blue-600', bg: 'bg-blue-600/10', border: 'border-blue-600/20' },
                    'naver_blog': { icon: 'layout', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
                    'instagram_feed': { icon: 'instagram', color: 'text-pink-500', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
                    'youtube_shorts': { icon: 'play', color: 'text-red-600', bg: 'bg-red-600/10', border: 'border-red-600/20' },
                    'instagram_reels': { icon: 'instagram', color: 'text-pink-600', bg: 'bg-pink-600/10', border: 'border-pink-600/20' },
                    'tiktok': { icon: 'music', color: 'text-gray-900 dark:text-white', bg: 'bg-gray-900/10 dark:bg-white/10', border: 'border-gray-900/20 dark:border-white/20' }
                };
                return map[p] || { icon: 'file-text', color: 'text-gray-500', bg: 'bg-gray-500/10', border: 'border-gray-500/20' };
            };

            const style = getPlatformStyle(item.platform);

            return `
                <div class="group relative bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                    
                    <!-- Header -->
                    <div class="flex justify-between items-start mb-4">
                        <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg ${style.bg} ${style.color} ${style.border} border border-dashed">
                            <i data-lucide="${style.icon}" class="w-4 h-4"></i>
                            <span class="text-xs font-bold uppercase tracking-wide">${item.platform.replace('_', ' ')}</span>
                        </div>
                        <div class="text-[10px] font-medium text-gray-400 bg-gray-50 dark:bg-white/5 px-2 py-1 rounded-md">
                            ${date}
                        </div>
                    </div>

                    <!-- Content Preview -->
                    <div class="flex-grow mb-6">
                        <div class="relative">
                            <p class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-3 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
                                ${item.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                            </p>
                            <!-- Fade Overlay -->
                            <div class="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white dark:from-dark-card to-transparent"></div>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
                        <div class="flex items-center gap-1.5 text-xs text-gray-500">
                             ${item.metadata && item.metadata.viralScore ? `
                                <i data-lucide="trending-up" class="w-3.5 h-3.5 text-brand"></i>
                                <span class="font-bold text-gray-900 dark:text-white">${item.metadata.viralScore}</span> Score
                             ` : ''}
                        </div>

                        <div class="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button class="view-history-detail p-2 hover:bg-brand hover:text-white text-gray-400 rounded-lg transition-all" data-id="${item.id}" title="상세보기">
                                <i data-lucide="eye" class="w-4 h-4"></i>
                            </button>
                            <button class="delete-history-btn p-2 hover:bg-red-500 hover:text-white text-gray-400 rounded-lg transition-all" data-id="${item.id}" title="삭제">
                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        lucide.createIcons();

        // Attach listeners
        document.querySelectorAll('.delete-history-btn').forEach(btn => {
            btn.onclick = (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                deleteHistoryItem(id);
            };
        });

        document.querySelectorAll('.view-history-detail').forEach(btn => {
            btn.onclick = (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                const item = history.find(h => h.id === id);
                if (item) {
                    widgetService.open(item.content, item.platform, item.metadata);
                }
            };
        });
    }

    async function deleteHistoryItem(id) {
        const confirmed = await showAppModal({
            title: '기록 삭제',
            message: '선택한 생성 기록을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
            confirmText: '삭제하기',
            cancelText: '취소',
            type: 'confirm'
        });

        if (confirmed) {
            let history = JSON.parse(localStorage.getItem('rep_history') || '[]');
            history = history.filter(item => item.id !== id);
            localStorage.setItem('rep_history', JSON.stringify(history));
            loadHistory();
            updateDashboardStats();
            showToast('기록이 삭제되었습니다.');
        }
    }

    // Helper: Save to History
    function saveToHistory(content, platform, originalInput, metadata) {
        if (!user) return;

        const history = JSON.parse(localStorage.getItem('rep_history') || '[]');
        const newItem = {
            id: Date.now(),
            content: content,
            originalInput: originalInput || '',
            platform: platform,
            metadata: metadata || null,
            timestamp: new Date().toISOString()
        };
        history.push(newItem);
        localStorage.setItem('rep_history', JSON.stringify(history));
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
    const toast = document.getElementById('toast');

    // Auth Simulation Logic
    const user = JSON.parse(localStorage.getItem('rep_user'));

    function updateAuthUI() {
        const loginBtn = document.getElementById('login-btn');
        const logoutBtn = document.getElementById('logout-btn');
        const sidebarUserName = document.getElementById('sidebar-user-name');

        const currentUser = JSON.parse(localStorage.getItem('rep_user'));

        if (currentUser) {
            if (loginBtn) loginBtn.classList.add('hidden');
            if (logoutBtn) logoutBtn.classList.remove('hidden');
            if (sidebarUserName) sidebarUserName.textContent = currentUser.name;
        } else {
            if (loginBtn) loginBtn.classList.remove('hidden');
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

        // Render Analysis Widget Helper
        function renderAnalysisWidget(data, isWidget = false) {
            const prefix = isWidget ? 'widget-' : 'viral-';
            const keywordsPrefix = isWidget ? 'widget-' : 'analysis-';

            const scoreVal = document.getElementById(`${prefix}score-value`);
            const scoreText = document.getElementById(`${prefix}score-text`);
            const scoreCircle = document.getElementById(`${prefix}score-circle`);
            const reason = document.getElementById(`${prefix}score-reason`);
            const keywordsContainer = document.getElementById(`${keywordsPrefix}keywords`);
            const pillarsContainer = document.getElementById(`${keywordsPrefix}pillars`);
            const seoTitleEl = document.getElementById(isWidget ? 'widget-seo-title' : 'analysis-seo-title');

            // Score Logic
            const score = data.viralScore || 0;
            if (scoreVal) scoreVal.textContent = score;

            let grade = '분석 필요';
            let colorClass = 'text-red-500';
            if (score >= 90) { grade = '바이럴 가능성 매우 높음'; colorClass = 'text-purple-600 dark:text-purple-400'; }
            else if (score >= 80) { grade = '우수'; colorClass = 'text-green-600 dark:text-green-400'; }
            else if (score >= 70) { grade = '좋음'; colorClass = 'text-indigo-600 dark:text-indigo-400'; }
            else if (score >= 50) { grade = '보통'; colorClass = 'text-yellow-600 dark:text-yellow-400'; }
            else { grade = '개선 필요'; }

            if (scoreText) {
                scoreText.textContent = grade;
                scoreText.className = isWidget ? `text-sm font-black ${colorClass} transition-all` : `text-xs font-bold ${colorClass}`;
            }

            // Circle Animation
            // Main: 125.6 (r=20), Widget: 175.9 (r=28)
            const maxOffset = isWidget ? 175.9 : 125.6;
            const offset = maxOffset - (score / 100 * maxOffset);
            if (scoreCircle) {
                scoreCircle.setAttribute('stroke-dasharray', maxOffset);
                scoreCircle.style.strokeDashoffset = maxOffset;
                setTimeout(() => {
                    scoreCircle.style.strokeDashoffset = offset;
                }, 100);
            }

            // Reason (Clean up redundant score patterns if present)
            if (reason) {
                let cleanReason = data.viralScoreReason || '분석 정보를 불러올 수 없습니다.';
                // Strip patterns like "Hook: 38/40, Value: 28/30, Structure: 20/20, CTA: 10/10." or "Hook: 38, ..."
                cleanReason = cleanReason.replace(/Hook:?\s*\d+\/\d+,?\s*Value:?\s*\d+\/\d+,?\s*Structure:?\s*\d+\/\d+,?\s*CTA:?\s*\d+\/\d+\.?\s*/i, '');
                // Also strip simpler patterns if the AI misses the full block
                cleanReason = cleanReason.replace(/Hook:?\s*\d+,?\s*Value:?\s*\d+,?\s*Structure:?\s*\d+,?\s*CTA:?\s*\d+\.?\s*/i, '');

                reason.textContent = cleanReason.trim();
            }

            // Decomposed Pillar Badges
            if (pillarsContainer) {
                if (data.decomposed) {
                    const d = data.decomposed;
                    const pillars = [
                        { key: 'hook', label: 'Hook', icon: 'zap', class: 'badge-hook', val: d.hook },
                        { key: 'value', label: 'Value', icon: 'lightbulb', class: 'badge-value', val: d.value },
                        { key: 'structure', label: 'Structure', icon: 'layout', class: 'badge-structure', val: d.structure },
                        { key: 'cta', label: 'CTA', icon: 'mouse-pointer-2', class: 'badge-cta', val: d.cta }
                    ];

                    pillarsContainer.innerHTML = pillars.map(p => {
                        const scoreData = p.val || { score: 0, comment: '' };
                        const maxScore = p.key === 'hook' ? 40 : p.key === 'value' ? 30 : p.key === 'structure' ? 20 : 10;

                        // Pass data as JSON strings for the onclick handler
                        const safeComment = (scoreData.comment || p.label).replace(/'/g, "\\'");

                        return `
                            <div class="badge-pillar ${p.class} group/pillar relative cursor-pointer" 
                                 onclick="window.showPillarDetail('${p.label}', ${scoreData.score}, ${maxScore}, '${safeComment}', '${p.icon}')">
                                <i data-lucide="${p.icon}"></i>
                                <span>${p.label} ${scoreData.score}</span>
                            </div>
                        `;
                    }).join('');
                } else {
                    pillarsContainer.innerHTML = '';
                }
            }

            // Recommended Tags (Keywords)
            if (keywordsContainer) {
                if (data.keywords && data.keywords.length > 0) {
                    keywordsContainer.innerHTML = data.keywords.slice(0, 8).map(k =>
                        `<span class="px-2 py-0.5 bg-white dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-md text-[10px] text-gray-600 dark:text-gray-400 font-medium whitespace-nowrap shadow-sm">
                            #${k}
                        </span>`
                    ).join('');
                } else {
                    keywordsContainer.innerHTML = '<p class="text-[10px] text-gray-400">데이터 없음</p>';
                }
            }

            // SEO Title
            if (seoTitleEl) seoTitleEl.textContent = data.seoTitle || '-';

            // Re-initialize icons inside the container if it was updated
            lucide.createIcons();
        }

        // Pillar Detail Modal Logic
        window.showPillarDetail = function (title, score, maxScore, comment, icon) {
            const modal = document.getElementById('pillar-detail-modal');
            const container = document.getElementById('pillar-detail-container');
            const backdrop = document.getElementById('pillar-detail-backdrop');

            if (!modal || !container || !backdrop) return;

            document.getElementById('pillar-modal-title').textContent = title;
            document.getElementById('pillar-modal-score').textContent = `Score: ${score}/${maxScore}`;
            document.getElementById('pillar-modal-comment').textContent = comment;

            // Set icon
            const iconContainer = document.getElementById('pillar-modal-icon');
            if (iconContainer) {
                iconContainer.innerHTML = `<i data-lucide="${icon}"></i>`;
                lucide.createIcons();
            }

            // Show Modal
            modal.classList.remove('hidden');
            setTimeout(() => {
                backdrop.classList.add('opacity-100');
                container.classList.add('opacity-100', 'scale-100');
                container.classList.remove('scale-95', 'opacity-0');
            }, 10);
        };

        function closePillarModal() {
            const modal = document.getElementById('pillar-detail-modal');
            const container = document.getElementById('pillar-detail-container');
            const backdrop = document.getElementById('pillar-detail-backdrop');

            if (!modal || !container || !backdrop) return;

            backdrop.classList.remove('opacity-100');
            container.classList.remove('opacity-100', 'scale-100');
            container.classList.add('scale-95', 'opacity-0');

            setTimeout(() => {
                modal.classList.add('hidden');
            }, 300);
        }

        document.getElementById('close-pillar-modal')?.addEventListener('click', closePillarModal);
        document.getElementById('pillar-modal-close-btn')?.addEventListener('click', closePillarModal);
        document.getElementById('pillar-detail-backdrop')?.addEventListener('click', closePillarModal);

        // Copy Keywords Logic Setup
        function setupKeywordCopy(btnId, containerId) {
            const btn = document.getElementById(btnId);
            if (!btn) return;
            if (btn.hasAttribute('data-listener-attached')) return;

            btn.setAttribute('data-listener-attached', 'true');
            btn.addEventListener('click', () => {
                const container = document.getElementById(containerId);
                if (!container) return;

                const tags = Array.from(container.querySelectorAll('span'))
                    .map(span => span.textContent.trim())
                    .join(' ');

                if (tags) {
                    navigator.clipboard.writeText(tags).then(() => {
                        const originalHtml = btn.innerHTML;
                        btn.innerHTML = `<i data-lucide="check" class="w-3 h-3"></i> Copied!`;
                        setTimeout(() => {
                            btn.innerHTML = originalHtml;
                            lucide.createIcons();
                        }, 2000);
                    });
                }
            });
        }

        setupKeywordCopy('widget-copy-keywords', 'widget-keywords');

        // Expose to window for history.js
        window.renderAnalysisWidget = renderAnalysisWidget;

        // --- Widget Service ---
        window.widgetService = {
            metadata: null,
            results: {},
            currentPlatform: null,

            open: function (metadata, generatedContent) {
                this.metadata = metadata;
                this.results = this.parseResults(generatedContent);

                const widget = document.getElementById('result-widget');
                const container = document.getElementById('widget-container');

                // Reset scroll
                document.getElementById('widget-editor').scrollTop = 0;

                // Show modal
                widget.classList.remove('hidden');
                setTimeout(() => {
                    document.body.classList.add('widget-open');
                    container.classList.remove('translate-x-full');
                }, 10);

                // Render Analytics
                this.renderAnalytics();

                // Render Tabs
                this.renderTabs();

                // Select First Platform
                const platforms = Object.keys(this.results);
                if (platforms.length > 0) {
                    this.switchTab(platforms[0]);
                }

                lucide.createIcons();
            },

            close: function () {
                const widget = document.getElementById('result-widget');
                const container = document.getElementById('widget-container');

                container.classList.add('translate-x-full');
                setTimeout(() => {
                    document.body.classList.remove('widget-open');
                    widget.classList.add('hidden');
                }, 300);
            },

            parseResults: function (content) {
                const results = {};
                // Split by "## [Platform Name]" headers
                const sections = content.split(/^##\s+/m);

                sections.forEach(section => {
                    if (!section.trim()) return;

                    const lines = section.split('\n');
                    const title = lines[0].trim();
                    const body = lines.slice(1).join('\n').trim();

                    if (title && body) {
                        results[title] = body;
                    }
                });

                // Fallback for single platform without header
                if (Object.keys(results).length === 0 && content.trim()) {
                    results['Generated Content'] = content.trim();
                }

                return results;
            },

            renderAnalytics: function () {
                const data = this.metadata || {};
                renderAnalysisWidget(data, true); // true for isWidget
            },

            renderTabs: function () {
                const container = document.getElementById('widget-tabs');
                container.innerHTML = Object.keys(this.results).map(platform => {
                    const isActive = platform === this.currentPlatform;
                    return `<button class="platform-tab ${isActive ? 'active' : ''}" onclick="window.widgetService.switchTab('${platform}')">
                        ${platform}
                    </button>`;
                }).join('');
            },

            switchTab: function (platform) {
                this.currentPlatform = platform;
                const editor = document.getElementById('widget-editor');
                const content = this.results[platform];

                // Update Tabs
                this.renderTabs();

                // Update Editor
                if (editor && content) {
                    // Use marked for preview, but we might want RAW for editing.
                    // For now, let's show MD rendered preview in the editor-like area.
                    editor.innerHTML = marked.parse(content);
                }
            }
        };

        // Modal Event Listeners
        document.getElementById('close-widget-btn').addEventListener('click', () => window.widgetService.close());
        document.getElementById('widget-backdrop').addEventListener('click', () => window.widgetService.close());

        document.getElementById('widget-copy-content').addEventListener('click', () => {
            const editor = document.getElementById('widget-editor');
            if (editor) {
                // Get innerText to strip HTML tags if needed, or just keep as is
                const text = editor.innerText;
                navigator.clipboard.writeText(text).then(() => {
                    showToast('콘텐츠가 복사되었습니다!');
                });
            }
        });

        document.getElementById('widget-copy-keywords').addEventListener('click', () => {
            if (window.widgetService.metadata?.keywords) {
                const tags = window.widgetService.metadata.keywords.join(' ');
                navigator.clipboard.writeText(tags).then(() => {
                    showToast('키워드가 복사되었습니다!');
                });
            }
        });

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

                // Get Selected Tone/Style (Replaces complex Brand logic for Quick Create)
                const toneSelect = document.getElementById('tone-select');
                const selectedTone = toneSelect ? toneSelect.value : 'professional';

                // Construct synthetic brand input for AI Service
                const brandInput = {
                    name: 'Custom Tone',
                    tone: selectedTone.charAt(0).toUpperCase() + selectedTone.slice(1),
                    style: `${selectedTone} Style`,
                    keywords: '',
                    forbidden: ''
                };

                // API Key is handled globally via Settings/localStorage now.

                const rawContent = await window.aiService.generateContent(text, selectedPlatforms, selectedLanguage, brandInput);

                // Parse Metadata
                const metadataSeparator = "---METADATA---";
                let generatedContent = rawContent;
                let metadata = null;

                if (rawContent.includes(metadataSeparator)) {
                    const parts = rawContent.split(metadataSeparator);
                    generatedContent = parts[0].trim();
                    try {
                        let jsonStr = parts[1].trim();
                        // Remove Markdown Code Blocks if present
                        jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
                        metadata = JSON.parse(jsonStr);
                    } catch (e) {
                        console.warn('Metadata Parse Error:', e);
                    }
                }

                if (window.widgetService) {
                    window.widgetService.open(metadata, generatedContent);
                }

                showToast('생성이 완료되었습니다! 위젯에서 편집을 계속하세요.', 3000);

                // Save to History
                const platformLabel = selectedPlatforms.length > 1 ? 'Multi-Platform' : selectedPlatforms[0];
                saveToHistory(generatedContent, platformLabel, text, metadata);



            } catch (error) {
                console.error('Generation failed:', error);
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

            } else {
                generateBtn.disabled = false;
                generateBtn.innerHTML = '<i data-lucide="wand-2" class="w-5 h-5"></i> <span>AI 콘텐츠 생성하기</span>';
                lucide.createIcons();

            }
        }

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
        } else if (platform === 'instagram_reels') {
            return `[Instagram Reels 스크립트]\n\n🎵 추천 오디오: 트렌딩 오디오 (비트감 있는 음악)\n\n(0:00-0:03) ⚡️ [Hook]\n화면: 텍스트 오버레이 "아직도 ${context} 모르세요?"\n동작: 카메라를 향해 의문스러운 표정 짓기\n\n(0:03-0:15) 💡 [Value]\n화면: 핵심 내용 3가지가 순차적으로 나타남\n1. 첫 번째 포인트\n2. 두 번째 포인트\n3. 세 번째 포인트\n자막: "캡션에 자세한 내용 확인! 👇"\n\n(0:15-0:20) 👉 [CTA]\n화면: 웃으며 인사 + 손짓으로 아래 가리킴\n자막: "저장하고 필요할 때 꺼내보세요!"\n\n📝 [Caption Preview]\n${context}에 대한 진실, 알고 계셨나요? 더 자세한 내용은 프로필 링크에서 확인하세요! \n.\n.\n#꿀팁 #릴스 #인사이트 #자기계발`;
        }
        return "콘텐츠 생성 오류";
    }








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
                <div class="group relative bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-brand/30 hover:-translate-y-1 transition-all duration-300">
                    
                    <!-- Decorative Gradient Blob -->
                    <div class="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-bl-full -mr-8 -mt-8 opacity-50 group-hover:scale-110 transition-transform duration-500"></div>

                    <div class="relative z-10">
                        <div class="flex justify-between items-start mb-4">
                            <div class="flex items-center gap-3">
                                <div class="w-12 h-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <i data-lucide="briefcase" class="w-6 h-6"></i>
                                </div>
                                <div>
                                    <h3 class="font-bold text-gray-900 dark:text-white text-lg leading-tight group-hover:text-brand transition-colors">${brand.name}</h3>
                                    <p class="text-xs text-brand font-medium tracking-wide uppercase mt-0.5">브랜드 프로필</p>
                                </div>
                            </div>
                            
                            <!-- Actions (Hover Reveal) -->
                            <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                                <button onclick="editBrand('${brand.id}')" class="p-2 text-gray-400 hover:text-brand hover:bg-brand/10 rounded-lg transition-colors" title="수정">
                                    <i data-lucide="edit-2" class="w-4 h-4"></i>
                                </button>
                                 <button onclick="deleteBrand('${brand.id}')" class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="삭제">
                                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                                </button>
                            </div>
                        </div>

                        <div class="space-y-3 mt-4">
                            <div class="bg-gray-50 dark:bg-white/5 rounded-xl p-3 border border-gray-100 dark:border-white/5">
                                <div class="flex items-start gap-2 text-sm">
                                    <i data-lucide="message-circle" class="w-4 h-4 text-gray-400 mt-0.5 shrink-0"></i>
                                    <div>
                                        <span class="block text-xs font-bold text-gray-500 uppercase">톤앤매너 (Tone)</span>
                                        <span class="text-gray-700 dark:text-gray-300 font-medium">${brand.tone}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="bg-gray-50 dark:bg-white/5 rounded-xl p-3 border border-gray-100 dark:border-white/5">
                                <div class="flex items-start gap-2 text-sm">
                                    <i data-lucide="pen-tool" class="w-4 h-4 text-gray-400 mt-0.5 shrink-0"></i>
                                    <div>
                                        <span class="block text-xs font-bold text-gray-500 uppercase">작문 스타일 (Style)</span>
                                        <span class="text-gray-700 dark:text-gray-300 font-medium line-clamp-1">${brand.style}</span>
                                    </div>
                                </div>
                            </div>
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

            // General test context
            const output = await window.aiService.generateContent(testText, ['twitter'], 'Korean', tempBrand);

            if (resultContent) {
                resultContent.innerHTML = marked.parse(output);
            }
        } catch (error) {
            console.error('Test Gen Error:', error);
            if (resultContent) {
                const msg = error.message.toLowerCase();
                if (msg.includes('api key') || msg.includes('not valid')) {
                    resultContent.innerHTML = `<span class="text-red-500 font-bold text-xs">⚠️ API 키 오류: 설정에서 키를 확인해주세요.</span>`;
                } else if (msg.includes('quota') || msg.includes('rate limit')) {
                    resultContent.innerHTML = `<span class="text-orange-500 font-bold text-xs">⚠️ 할당량 초과: 무료 사용량을 모두 소진했습니다.</span>`;
                } else {
                    resultContent.innerHTML = `<span class="text-red-500 text-xs text-bold">오류 발생: ${error.message}</span>`;
                }
            }
        }
    };

    window.editBrand = function (id) {
        if (window.openBrandEditor) window.openBrandEditor(id);
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

    // Initial Onboarding Check (logic moved from extracted block)
    const onboardingModal = document.getElementById('onboarding-modal');
    const closeOnboardingBtn = document.getElementById('close-onboarding');

    if (!localStorage.getItem('rep_onboarding_seen')) {
        if (onboardingModal) {
            onboardingModal.classList.remove('hidden');
            setTimeout(() => {
                onboardingModal.classList.remove('opacity-0');
                const content = onboardingModal.querySelector('#onboarding-content');
                if (content) content.classList.remove('scale-95');
            }, 100);
        }
    }

    // Expose for Settings
    window.openOnboardingModal = function () {
        if (onboardingModal) {
            // Ensure logic assumes we want to show it now
            onboardingModal.classList.remove('hidden');
            setTimeout(() => {
                onboardingModal.classList.remove('opacity-0');
                const content = onboardingModal.querySelector('#onboarding-content');
                if (content) content.classList.remove('scale-95');
            }, 10);
        }
    };

    if (closeOnboardingBtn) {
        closeOnboardingBtn.addEventListener('click', () => {
            localStorage.setItem('rep_onboarding_seen', 'true');
            // Remove pending class to reveal dashboard
            document.documentElement.classList.remove('onboarding-pending');

            if (onboardingModal) {
                onboardingModal.classList.add('opacity-0');
                const content = onboardingModal.querySelector('#onboarding-content');
                if (content) content.classList.add('scale-95');
                setTimeout(() => {
                    onboardingModal.classList.add('hidden');
                }, 300);
            }
        });
    }

    // Initial Load
    setTimeout(() => {
        handleHashChange();
        populateBrandDropdown();
        if (window.loadHistory && window.location.hash === '#dashboard') {
            window.loadHistory();
        }
        // Reveal Layout
        document.documentElement.classList.remove('app-loading');
    }, 50);

}); // End of DOMContentLoaded
