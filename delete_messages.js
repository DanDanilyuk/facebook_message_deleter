(async function () {
  const LIMIT = 50;

  const SEL = {
    row: 'div[role="row"]',
    rowLink: 'a[href*="messages/t/"]',
    menuBtn: ['[aria-label^="More options"]', '[aria-label^="Menu"]'],
    menuItem: '[role="menuitem"]',
    deleteText: /^\s*delete\b/i,
    dialog: '[role="dialog"][aria-label*="Delete"]',
    confirm: [
      '[role="button"][aria-label*="Delete"]:not([aria-disabled="true"])[tabindex="0"]',
      '[role="button"][aria-label*="Delete"]:not([aria-disabled="true"])',
    ],
  };

  const handled = new WeakSet();
  let deleted = 0, skipped = 0, stopped = false;
  const ui = setupUI();

  function waitFor(check, timeoutMs = 3000) {
    const r = check();
    if (r) return Promise.resolve(r);
    return new Promise((resolve) => {
      const done = (v) => { observer.disconnect(); clearTimeout(timer); resolve(v); };
      const observer = new MutationObserver(() => {
        const r = check();
        if (r) done(r);
      });
      observer.observe(document.body, { childList: true, subtree: true, attributes: true });
      const timer = setTimeout(() => done(null), timeoutMs);
    });
  }

  function pick(sels, root = document) {
    for (const s of sels) { const el = root.querySelector(s); if (el) return el; }
    return null;
  }

  async function dismiss() {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await waitFor(() => !document.querySelector('[role="menu"]') && !document.querySelector('[role="dialog"]'));
  }

  function findRow() {
    for (const link of document.querySelectorAll(`${SEL.row} ${SEL.rowLink}`)) {
      const row = link.closest(SEL.row);
      if (row && !handled.has(row)) return row;
    }
    return null;
  }

  async function deleteOne(row) {
    const menuBtn = await waitFor(() => pick(SEL.menuBtn, row));
    if (!menuBtn) return false;
    menuBtn.click();

    const item = await waitFor(() =>
      [...document.querySelectorAll(SEL.menuItem)].find(el => SEL.deleteText.test(el.textContent.trim())));
    if (!item) { await dismiss(); return false; }
    item.click();

    const btn = await waitFor(() => {
      const d = document.querySelector(SEL.dialog);
      return d ? pick(SEL.confirm, d) : null;
    });
    if (!btn) { await dismiss(); return false; }
    btn.click();
    await waitFor(() => !document.querySelector(SEL.dialog));
    return true;
  }

  function counts() {
    return `${deleted} / ${LIMIT} deleted` + (skipped ? `  -  ${skipped} skipped` : '');
  }

  while (!stopped) {
    if (deleted >= LIMIT) {
      ui.status(`Deleted ${deleted} / ${LIMIT}. Reload before running again to avoid temporary bans.`, '#e6b800');
      break;
    }
    let row = findRow();
    if (!row) {
      ui.status('Waiting for more messages...');
      row = await waitFor(findRow, 5000);
      if (!row) { ui.status(`Finished. ${counts()}`); break; }
    }
    handled.add(row);
    if (await deleteOne(row)) {
      deleted++;
      ui.status(`Deleting messages...  ${counts()}`);
    } else {
      skipped++;
      console.warn('[fb-delete] skipped row');
    }
  }

  await dismiss();
  if (stopped) ui.status(`Stopped. ${counts()}`, '#e6b800');
  ui.toClose();

  function setupUI() {
    const old = document.getElementById('ird');
    if (old) old.remove();
    const bar = document.createElement('div');
    bar.id = 'ird';
    bar.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:48px;background:#4267B2;color:white;z-index:99999999999999;font-family:sans-serif;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.15);';
    const h2 = document.createElement('h2');
    h2.style.cssText = 'color:white;font-size:16px;font-weight:500;margin:0;';
    h2.textContent = 'Detecting messages...';
    const stopBtn = document.createElement('button');
    stopBtn.style.cssText = 'cursor:pointer;background:#d9534f;color:white;border:1px solid maroon;border-radius:5px;padding:6px 12px;font-size:14px;margin-left:20px;';
    stopBtn.textContent = 'STOP';
    stopBtn.onclick = () => { stopped = true; };
    bar.append(h2, stopBtn);
    document.body.prepend(bar);
    return {
      status(msg, color) { h2.textContent = msg; if (color) bar.style.backgroundColor = color; },
      toClose() { stopBtn.textContent = 'Close'; stopBtn.onclick = () => bar.remove(); },
    };
  }
})();
