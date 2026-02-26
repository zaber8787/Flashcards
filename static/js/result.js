// ── 從 URL 取得初始參數 ────────────────────────────────────
const params = new URLSearchParams(window.location.search);
const limit = parseInt(params.get('limit') ?? '20', 10);
const important = params.get('important') === 'true';
const start = parseInt(params.get('start') ?? '1', 10);

// currentStart 記錄目前頁的起始 ID
let currentStart = start < 1 ? 1 : start;

// ── DOM 參考 ───────────────────────────────────────────────
const statusMsg = document.getElementById('statusMsg');
const tableWrap = document.getElementById('tableWrap');
const tableBody = document.getElementById('tableBody');
const emptyMsg = document.getElementById('emptyMsg');
const topbarInfo = document.getElementById('topbarInfo');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const quizBtn = document.getElementById('quizBtn');

// ── 狀態 ──────────────────────────────────────────────────
let currentData = [];

topbarInfo.textContent =
    `每組 ${limit} 個・Important: ${important ? 'True' : 'False'}・從 ID ${currentStart}`;

// ── 資料拉取 ───────────────────────────────────────────────
async function loadData(start) {
    statusMsg.textContent = '載入中…';
    tableWrap.hidden = true;
    emptyMsg.hidden = true;
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    quizBtn.disabled = true;

    try {
        const res = await fetch('/api/result', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ limit, important, start }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        statusMsg.textContent = '';

        if (!data || data.length === 0) {
            emptyMsg.hidden = false;
            return;
        }

        currentData = data;
        currentStart = start;
        renderTable(data);
        updatePagination();
        tableWrap.hidden = false;
        quizBtn.disabled = false;
    } catch (err) {
        statusMsg.textContent = `載入失敗：${err.message}`;
    }
}

// ── 渲染表格 ───────────────────────────────────────────────
function renderTable(data) {
    tableBody.innerHTML = '';
    data.forEach(v => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${escHtml(v.word)}</td>
            <td>${escHtml(v.value)}</td>
            <td class="desktop-only">${escHtml(v.symbol)}</td>
            <td class="desktop-only">${escHtml(v.roots)}</td>
        `;
        tableBody.appendChild(tr);
    });
}

// ── 翻頁按鈕 ───────────────────────────────────────────────
function updatePagination() {
    // 上一頁：currentStart - limit（最小為 1）
    prevBtn.disabled = currentStart <= 1;
    // 下一頁：回傳筆數 < limit 表示已是最後一頁
    nextBtn.disabled = currentData.length < limit;
}

prevBtn.addEventListener('click', () => {
    loadData(Math.max(1, currentStart - limit));
});

nextBtn.addEventListener('click', () => {
    loadData(currentStart + limit);
});

// ── 開始測驗 ───────────────────────────────────────────────
const quizView = document.getElementById('quizView');
const quizProgress = document.getElementById('quizProgress');
const quizCard = document.getElementById('quizCard');
const quizCardMain = document.getElementById('quizCardMain');
const quizSymbol = document.getElementById('quizSymbol');
const quizDoneView = document.getElementById('quizDoneView');
const tableActions = document.getElementById('tableActions');
const quizActions = document.getElementById('quizActions');
const doneActions = document.getElementById('doneActions');
const unknownBtn = document.getElementById('unknownBtn');
const symbolBtn = document.getElementById('symbolBtn');
const knowBtn = document.getElementById('knowBtn');
const backBtn = document.getElementById('backBtn');

// 測驗狀態
let quizDeck = [];   // 目前這輪的牌組
let quizIndex = 0;    // 目前第幾張
let unknownDeck = [];   // 這輪不會的
let showValue = false; // false=英文 true=中文
let showSym = false; // 是否顯示音標

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function enterQuizMode(deck) {
    quizDeck = shuffle([...deck]);
    quizIndex = 0;
    unknownDeck = [];
    // 切換 UI 面板
    tableWrap.hidden = true;
    emptyMsg.hidden = true;
    quizDoneView.hidden = true;
    quizView.hidden = false;
    tableActions.hidden = true;
    quizActions.hidden = false;
    doneActions.hidden = true;
    showCard();
}

function showCard() {
    showValue = false;
    showSym = false;
    const v = quizDeck[quizIndex];
    quizCardMain.textContent = v.word;
    quizCardMain.classList.remove('is-value');
    quizSymbol.textContent = '';
    updateProgress();
}

function updateProgress() {
    const total = quizDeck.length;
    const current = quizIndex + 1;
    const unk = unknownDeck.length;
    quizProgress.textContent =
        `${current} / ${total}${unk > 0 ? `　・　還剩 ${unk} 張不會` : ''}`;
}

// 點字卡 → 切換英文 / 中文
quizCard.addEventListener('click', () => {
    const v = quizDeck[quizIndex];
    showValue = !showValue;
    quizCardMain.textContent = showValue ? v.value : v.word;
    quizCardMain.classList.toggle('is-value', showValue);
});

// 音標按鈕
symbolBtn.addEventListener('click', () => {
    const v = quizDeck[quizIndex];
    showSym = !showSym;
    quizSymbol.textContent = showSym ? (v.symbol || '（無音標）') : '';
});

// 不會
unknownBtn.addEventListener('click', () => {
    unknownDeck.push(quizDeck[quizIndex]);
    nextCard();
});

// 會
knowBtn.addEventListener('click', () => {
    nextCard();
});

function nextCard() {
    quizIndex++;
    if (quizIndex < quizDeck.length) {
        showCard();
    } else {
        endRound();
    }
}

function endRound() {
    if (unknownDeck.length === 0) {
        // 全部都會 → 完成
        quizView.hidden = true;
        quizDoneView.hidden = false;
        quizActions.hidden = true;
        doneActions.hidden = false;
    } else {
        // 還有不會的 → 重新打亂不會的繼續
        enterQuizMode(unknownDeck);
    }
}

// 開始測驗按鈕
quizBtn.addEventListener('click', () => {
    enterQuizMode(currentData);
});

// 返回單字集
backBtn.addEventListener('click', () => {
    quizDoneView.hidden = true;
    tableWrap.hidden = false;
    doneActions.hidden = true;
    tableActions.hidden = false;
});

// ── 工具 ───────────────────────────────────────────────────
function escHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// ── 初始載入 ───────────────────────────────────────────────
loadData(currentStart);

