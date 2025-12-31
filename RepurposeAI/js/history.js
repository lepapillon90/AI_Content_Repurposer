/**
 * History Logic
 * Handles saving, loading, and deleting content generation history.
 */

// Helper: Get Format Icon
function getFormatIcon(format) {
    const icons = {
        'twitter': 'twitter',
        'linkedin': 'linkedin',
        'instagram': 'instagram',
        'youtube': 'youtube',
        'tiktok': 'video',
        'Multi-Platform': 'layers'
    };
    return icons[format.toLowerCase()] || 'file-text';
}

// Helper: Format Time Relative
function timeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "년 전";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "개월 전";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "일 전";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "시간 전";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "분 전";
    return "방금 전";
}

function saveToHistory(output, platform, originalInput) {
    const historyItem = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        platform: platform,
        original: originalInput,
        output: output,
        preview: output.substring(0, 80) + '...'
    };

    let history = JSON.parse(localStorage.getItem('rep_history') || '[]');
    history.unshift(historyItem); // Add to top
    if (history.length > 50) history.pop(); // Keep max 50
    localStorage.setItem('rep_history', JSON.stringify(history));
}

function loadHistory() {
    const historyList = document.getElementById('history-list');
    const emptyState = document.getElementById('history-empty-state');

    if (!historyList) return;

    const history = JSON.parse(localStorage.getItem('rep_history') || '[]');

    if (history.length === 0) {
        historyList.innerHTML = '';
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    }

    if (emptyState) emptyState.classList.add('hidden');
    historyList.innerHTML = '';

    history.forEach(item => {
        const date = new Date(item.date);
        const iconName = getFormatIcon(item.platform);

        const card = document.createElement('div');
        card.className = 'bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all cursor-pointer group';
        card.onclick = (e) => {
            // Prevent triggering if delete button clicked
            if (e.target.closest('.delete-btn')) return;
            openHistoryItem(item);
        };

        card.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <div class="flex items-center gap-2">
                    <div class="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300">
                        <i data-lucide="${iconName}" class="w-4 h-4"></i>
                    </div>
                    <div>
                        <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">${item.platform}</span>
                        <div class="text-[10px] text-gray-400 flex items-center gap-1">
                            <i data-lucide="clock" class="w-3 h-3"></i> ${timeAgo(date)}
                        </div>
                    </div>
                </div>
                <button class="delete-btn p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors" data-id="${item.id}" title="삭제">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </div>
            <h4 class="font-bold text-gray-800 dark:text-white mb-2 line-clamp-1 text-sm">
                ${item.original ? item.original.substring(0, 30) + (item.original.length > 30 ? '...' : '') : '생성된 콘텐츠'}
            </h4>
            <p class="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                ${item.preview}
            </p>
        `;

        // Attach delete event
        const deleteBtn = card.querySelector('.delete-btn');
        deleteBtn.onclick = async (e) => {
            e.stopPropagation();
            const confirmed = await window.showAppConfirm('기록 삭제', '이 기록을 삭제하시겠습니까?');
            if (confirmed) {
                deleteHistoryItem(item.id);
            }
        };

        historyList.appendChild(card);
    });

    // Refresh Icons
    if (window.lucide) lucide.createIcons();
}

function deleteHistoryItem(id) {
    let history = JSON.parse(localStorage.getItem('rep_history') || '[]');
    history = history.filter(item => item.id !== id);
    localStorage.setItem('rep_history', JSON.stringify(history));
    showToast('기록이 삭제되었습니다.');
    loadHistory(); // Re-render
}

function openHistoryItem(item) {
    // We can re-use the generate view to show result, 
    // OR show a modal. For simplicity, let's load it into the main output area 
    // and switch to 'Home' view.

    const outputContent = document.getElementById('output-content');
    const resultSection = document.getElementById('view-home'); // Assuming output is here

    if (outputContent) {
        // Set Content
        outputContent.innerHTML = marked.parse(item.output);
        outputContent.classList.remove('hidden');

        // Populate inputs if possible? 
        const inputArea = document.getElementById('input-text');
        if (inputArea && item.original) {
            inputArea.value = item.original;
            // update char count
            const charCount = document.getElementById('char-count');
            if (charCount) charCount.textContent = item.original.length.toLocaleString();
        }

        // Show Translate & Copy buttons
        const translateSection = document.getElementById('translate-section');
        const copyBtn = document.getElementById('copy-btn');
        if (translateSection) translateSection.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-1');
        if (copyBtn) {
            copyBtn.classList.remove('opacity-0', 'pointer-events-none');
            copyBtn.disabled = false;
        }

        // Switch to Home View
        window.location.hash = 'home';

        // Scroll to output
        setTimeout(() => {
            outputContent.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }
}

// Export functions to global scope
window.loadHistory = loadHistory;
window.saveToHistory = saveToHistory;
