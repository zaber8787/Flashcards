// ── 狀態 ──────────────────────────────────────────
const state = {
    limit: 20,
    important: false,
    start: null,   // null = 預設 1
};

// ── 每組數量 ──────────────────────────────────────
document.querySelectorAll('#limitGroup .chip').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('#limitGroup .chip').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.limit = parseInt(btn.dataset.value, 10);
        updateSummary();
    });
});

// ── Important ──────────────────────────────────────
document.querySelectorAll('#importantGroup .toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('#importantGroup .toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.important = btn.dataset.value === 'true';
        updateSummary();
    });
});

// ── 起始 ID ───────────────────────────────────────
document.getElementById('startInput').addEventListener('input', function () {
    const v = parseInt(this.value, 10);
    state.start = (!isNaN(v) && v >= 1) ? v : null;
    updateSummary();
});

// ── 摘要更新 ──────────────────────────────────────
function updateSummary() {
    document.getElementById('sumStart').textContent = state.start ?? 1;
    document.getElementById('sumLimit').textContent = state.limit;
}

// ── 開始練習 ──────────────────────────────────────
document.getElementById('startBtn').addEventListener('click', () => {
    const limit = state.limit;
    const important = state.important;
    const start = state.start ?? 1;

    const url = `/result?limit=${limit}&important=${important}&start=${start}`;
    window.location.href = url;
});
