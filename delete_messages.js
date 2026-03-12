(async function () {
  const LIMIT = 50;
  const MAX_RETRIES = 3;
  let deleted = 0;
  let skipped = 0;
  let stopped = false;

  const ui = setupUI();

  async function waitFor(fn, timeout = 3000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const result = fn();
      if (result) return result;
      await new Promise(r => setTimeout(r, 50));
    }
    return null;
  }

  async function dismiss() {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await waitFor(() => !document.querySelector('[role="menu"]') && !document.querySelector('[role="dialog"]'));
  }

  function skip(row, reason, debug) {
    console.warn(`Skipping row - ${reason}:`, debug);
    row.style.display = 'none';
    skipped++;
  }

  const retries = new WeakMap();

  function retry(row) {
    const n = (retries.get(row) || 0) + 1;
    retries.set(row, n);
    return n >= MAX_RETRIES;
  }

  while (!stopped) {
    if (deleted >= LIMIT) {
      ui.status(`Deleted ${deleted} / ${LIMIT}. Limit reached.`, '#e6b800');
      alert(`${deleted} messages deleted. Please reload to avoid temporary bans.`);
      break;
    }

    const row = [...document.querySelectorAll('div[role="row"] a[href*="messages/t/"]')]
      .map(el => el.closest('div[role="row"]'))
      .filter(Boolean)[0];

    if (!row) {
      ui.status(`Waiting for more messages...`);
      const newRow = await waitFor(
        () => document.querySelector('div[role="row"] a[href*="messages/t/"]'),
        5000,
      );
      if (!newRow) {
        ui.status(`Finished. Deleted ${deleted}.` + (skipped ? ` (${skipped} skipped)` : ''));
        break;
      }
      continue;
    }

    try {
      const menuBtn = await waitFor(() =>
        row.querySelector('[aria-label^="More options"]') ||
        row.querySelector('[aria-label="Menu"]'),
      );
      if (!menuBtn) {
        if (retry(row)) skip(row, 'menu button not found', [...row.querySelectorAll('[aria-label]')].map(el => el.getAttribute('aria-label')));
        continue;
      }
      menuBtn.click();

      const deleteOption = await waitFor(() =>
        [...document.querySelectorAll('[role="menuitem"]')].find(el => /delete/i.test(el.textContent)),
      );
      if (!deleteOption) {
        await dismiss();
        if (retry(row)) skip(row, 'delete option not found', [...document.querySelectorAll('[role="menuitem"]')].map(el => el.textContent.trim()));
        continue;
      }
      deleteOption.click();

      const confirmBtn = await waitFor(() =>
        document.querySelector(
          '[role="dialog"][aria-label*="Delete"] [role="button"][aria-label*="Delete"]:not([aria-disabled="true"])[tabindex="0"]',
        ),
      );
      if (!confirmBtn) {
        await dismiss();
        if (retry(row)) skip(row, 'confirm button not found', [...document.querySelectorAll('[role="dialog"]')].map(el => el.getAttribute('aria-label')));
        continue;
      }

      confirmBtn.click();
      await waitFor(() => !document.querySelector('[role="dialog"][aria-label*="Delete"]'));
      deleted++;
      ui.status(`Deleted ${deleted} / ${LIMIT}...`);
    } catch (err) {
      console.error('Error during deletion:', err);
      await dismiss();
      row.style.display = 'none';
      skipped++;
    }
  }

  if (stopped) {
    await dismiss();
    ui.status(`Stopped. Deleted ${deleted}.` + (skipped ? ` (${skipped} skipped)` : ''), '#e6b800');
    ui.stop.textContent = 'Close';
    ui.stop.onclick = () => ui.bar.remove();
  }

  function setupUI() {
    const old = document.getElementById('ird');
    if (old) old.remove();

    const bar = document.createElement('div');
    bar.id = 'ird';
    bar.style.cssText = 'position:fixed;width:100%;top:0;left:0;background:#4267B2;color:white;z-index:99999999999999;height:55px;font-family:sans-serif;display:flex;align-items:center;justify-content:center;';

    const h2 = document.createElement('h2');
    h2.style.cssText = 'color:white;font-size:18px;font-weight:500;margin:0;';
    h2.textContent = 'Detecting Messages...';

    const stop = document.createElement('button');
    stop.style.cssText = 'cursor:pointer;background:#d9534f;color:white;border:1px solid maroon;border-radius:5px;padding:6px 12px;font-size:15px;margin-left:20px;';
    stop.textContent = 'STOP';
    stop.onclick = () => { stopped = true; };

    bar.append(h2, stop);
    document.body.prepend(bar);

    return {
      bar, stop,
      status(msg, color) { h2.textContent = msg; if (color) bar.style.backgroundColor = color; },
    };
  }
})();
