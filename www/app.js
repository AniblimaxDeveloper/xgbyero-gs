(() => {
  'use strict';
  const STORE = 'xgbyero-gs-local-v1';
  const defaults = { devices: [], logs: [], simulations: 0, settings: { panelName: 'XGBYERO GS', accent: 'red', glow: true } };
  let state = loadState();
  let toastTimer;
  const $ = (id) => document.getElementById(id);
  function loadState() {
    try { const parsed = JSON.parse(localStorage.getItem(STORE) || 'null'); return parsed && typeof parsed === 'object' ? { ...defaults, ...parsed, settings: { ...defaults.settings, ...(parsed.settings || {}) } } : structuredClone(defaults); }
    catch { return JSON.parse(JSON.stringify(defaults)); }
  }
  function persist() { try { localStorage.setItem(STORE, JSON.stringify(state)); } catch { notify('Penyimpanan lokal penuh atau tidak tersedia.'); } }
  function escapeHTML(v) { return String(v).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }
  function nowText() { return new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'medium' }); }
  function log(action, detail, status = 'LOCAL') { state.logs.unshift({ time: nowText(), action, detail, status }); state.logs = state.logs.slice(0, 250); persist(); renderLogs(); updateStats(); }
  function notify(message) { const el = $('toast'); el.textContent = message; el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2800); }
  function navigate(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.toggle('active', p.id === `page-${page}`));
    document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.page === page));
    const active = document.querySelector(`.nav-item[data-page="${page}"]`); $('crumb').textContent = active ? active.textContent.trim() : 'Dashboard';
    $('sidebar').classList.remove('open'); window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  document.querySelectorAll('.nav-item').forEach(b => b.addEventListener('click', () => navigate(b.dataset.page)));
  document.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => navigate(b.dataset.go)));
  $('menuToggle').addEventListener('click', () => $('sidebar').classList.toggle('open'));
  document.addEventListener('click', e => { if (window.innerWidth <= 780 && $('sidebar').classList.contains('open') && !$('sidebar').contains(e.target) && !$('menuToggle').contains(e.target)) $('sidebar').classList.remove('open'); });

  function renderDevices() {
    $('deviceCount').textContent = state.devices.length; $('deviceCounter').textContent = `${state.devices.length} perangkat`;
    const list = $('deviceList');
    if (!state.devices.length) { list.innerHTML = '<div class="empty-state panel-card"><span>▣</span><b>Belum ada perangkat uji</b><p>Tambahkan perangkat milik sendiri melalui formulir di atas.</p></div>'; return; }
    list.innerHTML = state.devices.map(d => `<div class="device-row"><div class="device-info"><div class="device-icon">▣</div><div><b>${escapeHTML(d.name)}</b><small>${escapeHTML(d.type)} · ditambahkan ${escapeHTML(d.created)}${d.notes ? ' · '+escapeHTML(d.notes) : ''}</small></div></div><button class="outline-btn" data-remove-device="${escapeHTML(d.id)}">Hapus</button></div>`).join('');
    list.querySelectorAll('[data-remove-device]').forEach(b => b.addEventListener('click', () => { const item = state.devices.find(d => d.id === b.dataset.removeDevice); state.devices = state.devices.filter(d => d.id !== b.dataset.removeDevice); persist(); renderDevices(); log('Hapus perangkat uji', item ? item.name : 'entri lokal'); notify('Perangkat uji dihapus dari daftar lokal.'); }));
  }
  $('deviceForm').addEventListener('submit', e => {
    e.preventDefault(); const name = $('deviceName').value.trim(); if (!name) return;
    const device = { id: `dev-${Date.now()}-${Math.random().toString(16).slice(2,7)}`, name, type: $('deviceType').value, notes: $('deviceNotes').value.trim(), created: new Date().toLocaleDateString('id-ID') };
    state.devices.unshift(device); persist(); renderDevices(); log('Tambah perangkat uji', `${device.name} (${device.type})`); e.target.reset(); notify('Perangkat uji ditambahkan secara lokal.');
  });
  const scenarios = {
    render: { title: 'UI Render Warning', code: 'SIM-01', lines: [['dim','> initialise local rendering check'],['green','[PASS] Sandbox created'],['yellow','[WARN] Example render warning detected'],['dim','[INFO] No external app or service was contacted'],['green','[DONE] Visual simulation complete']] },
    timeout: { title: 'Response Timeout', code: 'SIM-02', lines: [['dim','> initialise mock timeout scenario'],['green','[PASS] Mock request generated in memory'],['yellow','[WARN] Simulated response exceeded 3000 ms'],['dim','[INFO] No network request was sent'],['green','[DONE] Timeout scenario recorded locally']] },
    recovery: { title: 'Recovery Check', code: 'SIM-03', lines: [['dim','> initialise local recovery check'],['green','[PASS] Recovery routine started'],['green','[PASS] Mock service status: available'],['green','[PASS] UI state restored'],['green','[DONE] Recovery simulation complete']] }
  };
  $('runSimulation').addEventListener('click', () => {
    const key = document.querySelector('input[name="scenario"]:checked')?.value || 'render'; const scenario = scenarios[key];
    state.simulations++; persist(); updateStats(); const output = $('terminalOutput');
    output.innerHTML = `<p class="terminal-dim">XGBYERO GS // ${scenario.code} // ${escapeHTML(nowText())}</p>` + scenario.lines.map(([cls, text]) => `<p class="terminal-${cls}">${escapeHTML(text)}</p>`).join('');
    log(`Simulasi: ${scenario.title}`, 'Hanya output lokal; tidak ada interaksi dengan WhatsApp atau perangkat lain.'); notify(`${scenario.title} selesai di mode simulasi.`);
  });
  function renderLogs() {
    $('logsCounter').textContent = `${state.logs.length} aktivitas`; const body = $('logTableBody');
    $('emptyLogs').style.display = state.logs.length ? 'none' : 'block';
    body.innerHTML = state.logs.map(row => `<tr><td>${escapeHTML(row.time)}</td><td>${escapeHTML(row.action)}</td><td>${escapeHTML(row.detail)}</td><td><span class="log-status">${escapeHTML(row.status || 'LOCAL')}</span></td></tr>`).join('');
  }
  function updateStats() { $('deviceCount').textContent = state.devices.length; $('simulationCount').textContent = state.simulations; $('logCount').textContent = state.logs.length; }
  $('exportLogs').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify({ app: 'XGBYERO GS', exportedAt: new Date().toISOString(), mode: 'local-simulation-only', logs: state.logs }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'xgbyero-gs-activity-logs.json'; a.click(); URL.revokeObjectURL(url); log('Ekspor activity logs', 'File JSON dibuat di perangkat lokal.'); notify('Log diekspor sebagai JSON.');
  });
  $('clearLogs').addEventListener('click', () => { if (!confirm('Hapus seluruh activity logs lokal?')) return; state.logs = []; persist(); renderLogs(); updateStats(); notify('Activity logs dihapus.'); });
  function applySettings() {
    document.documentElement.dataset.accent = state.settings.accent || 'red'; document.body.classList.toggle('no-glow', !state.settings.glow);
    const label = state.settings.panelName || 'XGBYERO GS'; document.title = `${label} | Security Lab`;
    document.querySelectorAll('.brand strong').forEach(el => { el.textContent = label; });
    $('panelName').value = label; $('accentSelect').value = state.settings.accent || 'red'; $('glowToggle').checked = !!state.settings.glow;
  }
  $('saveSettings').addEventListener('click', () => {
    state.settings = { panelName: $('panelName').value.trim() || 'XGBYERO GS', accent: $('accentSelect').value, glow: $('glowToggle').checked }; persist(); applySettings(); log('Simpan pengaturan', `Accent: ${state.settings.accent}; glow: ${state.settings.glow ? 'on' : 'off'}`); notify('Pengaturan berhasil disimpan secara lokal.');
  });
  $('resetData').addEventListener('click', () => { if (!confirm('Reset perangkat uji, hitungan simulasi, log, dan pengaturan yang tersimpan di aplikasi ini?')) return; localStorage.removeItem(STORE); state = JSON.parse(JSON.stringify(defaults)); applySettings(); renderDevices(); renderLogs(); updateStats(); notify('Semua data lokal telah direset.'); });
  applySettings(); renderDevices(); renderLogs(); updateStats();
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('./sw.js').catch(() => {});
})();
