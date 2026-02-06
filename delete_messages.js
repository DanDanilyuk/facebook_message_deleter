(async function () {
  const ui = setupUI();
  const LIMIT = 50;
  const MAX_RETRIES = 3;
  let deleted = 0;
  let skipped = 0;
  let stopScript = false;

  async function waitFor(conditionFn, timeout = 3000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const result = conditionFn();
      if (result) return result;
      await new Promise(r => setTimeout(r, 50));
    }
    return null;
  }

  function dismissDialogs() {
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
  }

  async function dismissAndWait() {
    dismissDialogs();
    await waitFor(
      () =>
        !document.querySelector('[role="menu"]') &&
        !document.querySelector('[role="dialog"]'),
    );
  }

  const retryMap = new WeakMap();

  while (!stopScript) {
    if (deleted >= LIMIT) {
      const msg = `Deleted ${deleted} / ${LIMIT}. Limit reached.`;
      ui.status.textContent = msg + (skipped ? ` (${skipped} skipped)` : '');
      ui.bar.style.backgroundColor = '#e6b800';
      alert(
        `${deleted} messages deleted. Please reload to avoid temporary bans.`,
      );
      break;
    }

    const rows = [
      ...document.querySelectorAll('div[role="row"] a[href*="messages/t/"]'),
    ]
      .map(el => el.closest('div[role="row"]'))
      .filter(Boolean);

    if (!rows.length) {
      const msg = `Finished. Deleted ${deleted}.`;
      ui.status.textContent = msg + (skipped ? ` (${skipped} skipped)` : '');
      ui.closeBtn.remove();
      break;
    }

    const row = rows[0];

    try {
      const menuBtn = await waitFor(
        () =>
          row.querySelector('div[aria-label^="More options"]') ||
          row.querySelector('div[aria-label="Menu"]') ||
          row.querySelector('.x1i10hfl.x1qjc9v5.xjbqb8w') ||
          row.querySelector('.x10f5nwc.xi81zsa') ||
          row.querySelector('.x1i10hfl.xjqpnuy.xc5r6h4'),
      );

      if (!menuBtn) {
        const attempts = (retryMap.get(row) || 0) + 1;
        retryMap.set(row, attempts);
        if (attempts >= MAX_RETRIES) {
          console.warn('Skipping row — menu button not found after retries');
          row.style.display = 'none';
          skipped++;
        }
        continue;
      }
      menuBtn.click();

      const deleteOption = await waitFor(() => {
        return [...document.querySelectorAll('[role="menuitem"]')].find(
          el =>
            el.textContent.toLowerCase().includes('delete') ||
            el.innerText.includes('Delete chat') ||
            el.innerText.includes('Delete conversation') ||
            el.innerText.includes('Delete selected'),
        );
      });

      if (!deleteOption) {
        const attempts = (retryMap.get(row) || 0) + 1;
        retryMap.set(row, attempts);
        await dismissAndWait();
        if (attempts >= MAX_RETRIES) {
          console.warn('Skipping row — delete option not found after retries');
          row.style.display = 'none';
          skipped++;
        }
        continue;
      }
      deleteOption.click();

      const confirmBtn = await waitFor(() => {
        const dialog = document.querySelector('[role="dialog"]');
        const container = dialog || document;
        const candidates = [
          ...container.querySelectorAll(
            '.x1i10hfl.xjbqb8w.x6umtig.x1b1mbwd.xaqea5y.xav7gou.x9f619 button, .x1s688f.xtk6v10, .n75z76so.ed17d2qt, .x1xmf6yo',
          ),
        ];
        if (!candidates.length && dialog) {
          candidates.push(...dialog.querySelectorAll('button'));
        }
        return candidates.find(
          el =>
            el.textContent.includes('Delete Chat') ||
            el.textContent.includes('Delete Conversation') ||
            (el.textContent.includes('Delete') &&
              !el.textContent.includes('Cancel')) ||
            el.getAttribute('aria-label')?.includes('Delete'),
        );
      });

      if (!confirmBtn) {
        const attempts = (retryMap.get(row) || 0) + 1;
        retryMap.set(row, attempts);
        await dismissAndWait();
        if (attempts >= MAX_RETRIES) {
          console.warn('Skipping row — confirm button not found after retries');
          row.style.display = 'none';
          skipped++;
        }
        continue;
      }

      confirmBtn.click();
      await waitFor(() => !document.body.contains(row));
      deleted++;
      ui.status.textContent = `Deleted ${deleted} / ${LIMIT}...`;
    } catch (err) {
      console.error('Error during deletion, skipping row:', err);
      await dismissAndWait();
      row.style.display = 'none';
      skipped++;
    }
  }

  if (stopScript) {
    await dismissAndWait();
    const msg = `Stopped. Deleted ${deleted}.`;
    ui.status.textContent = msg + (skipped ? ` (${skipped} skipped)` : '');
    ui.bar.style.backgroundColor = '#e6b800';
    ui.closeBtn.textContent = 'Close';
    ui.closeBtn.onclick = () => ui.bar.remove();
  }

  function setupUI() {
    if (document.getElementById('ird')) document.getElementById('ird').remove();

    const div = document.createElement('div');
    div.id = 'ird';
    div.style.cssText =
      'position:fixed; opacity:1; width:100%; top:0; left:0; background-color:#4267B2; color:white; z-index:99999999999999; height:55px; font-family: sans-serif; display:flex; align-items:center; justify-content:center;';

    const h2 = document.createElement('h2');
    h2.style.cssText =
      'color:white; font-size:18px; font-weight:500; margin:0;';
    h2.textContent = 'Detecting Messages...';

    const btn = document.createElement('button');
    btn.id = 'btnclose';
    btn.style.cssText =
      'cursor:pointer; background-color:#d9534f; color:white; border:1px solid maroon; border-radius:5px; padding:6px 12px; font-size:15px; margin-left: 20px;';
    btn.textContent = 'STOP';

    btn.addEventListener('click', () => {
      stopScript = true;
    });

    div.append(h2, btn);
    document.body.prepend(div);

    return { bar: div, status: h2, closeBtn: btn };
  }
})();
