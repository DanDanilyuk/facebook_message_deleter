const divElement = document.createElement('div');
(divElement.id = 'ird'),
  (divElement.style.cssText =
    'position:fixed; opacity:1; width:100%; top:0; left:0; background-color:#4267B2; color:white; z-index:99999999999999; height:55px;');
const h2Element = document.createElement('h2');
(h2Element.style.cssText =
  'text-align:center; color:white; font-size:18px; font-weight:500; margin:0; margin-top:16px;'),
  (h2Element.textContent = 'Detecting Messages...');
const buttonElement = document.createElement('button');
(buttonElement.id = 'btnclose'),
  (buttonElement.style.cssText =
    'float:right; margin-right:40px; cursor:pointer; background-color:#d9534f; color:white; border:1px solid maroon; margin-top:-27px; border-radius:5px; padding:4px; font-size:15px;'),
  (buttonElement.textContent = 'STOP'),
  divElement.append(h2Element, buttonElement),
  document.body.prepend(divElement),
  document.getElementById('btnclose').addEventListener('click', () => {
    window.location.reload();
  });
let dm = 0;
function deletefbmessage() {
  const e = [
    ...document.querySelectorAll('div[role="row"] a[href*="messages/t/"]'),
  ]
    .map(e => e.closest('div[role="row"]'))
    .filter(Boolean);
  if (!e.length)
    return (
      document.getElementById('btnclose').remove(),
      void (h2Element.textContent = `Delete Finished. ${dm} Messages were Deleted.`)
    );
  const t =
    e[0].querySelector('div[aria-label^="More options"]') ||
    e[0].querySelector('div[aria-label="Menu"]') ||
    e[0].querySelector('.x1i10hfl.x1qjc9v5.xjbqb8w') ||
    e[0].querySelector('.x10f5nwc.xi81zsa') ||
    e[0].querySelector('.x1i10hfl.xjqpnuy.xc5r6h4');
  if (!t) return void setTimeout(deletefbmessage, 1e3);
  t.click();
  const n = setInterval(() => {
    const t = [...document.querySelectorAll('[role="menuitem"]')].find(
      e =>
        e.textContent.toLowerCase().includes('delete') ||
        e.innerText.includes('Delete chat') ||
        e.innerText.includes('Delete conversation') ||
        e.innerText.includes('Delete selected')
    );
    if (!t) return;
    t.closest('div[role="dialog"]') ||
      t.closest('.html-div') ||
      document.querySelector('div[role="dialog"]');
    t.click();
    const o = setInterval(() => {
      const t = [
        ...document.querySelectorAll(
          '.x1i10hfl.xjbqb8w.x6umtig.x1b1mbwd.xaqea5y.xav7gou.x9f619 button, .x1s688f.xtk6v10, .n75z76so.ed17d2qt, .x1xmf6yo'
        ),
      ].find(
        e =>
          e.textContent.includes('Delete Chat') ||
          e.textContent.includes('Delete Conversation') ||
          e.textContent.includes('Delete') ||
          e.getAttribute('aria-label')?.includes('Delete')
      );
      if (!t) return;
      e[0].setAttribute('dfmsgs', !0), t.click(), clearInterval(o);
      const n = setInterval(() => {
        document.body.contains(e[0]) ||
          (clearInterval(n),
          dm++,
          (h2Element.textContent = `${dm} Messages Deleted.`),
          deletefbmessage());
      }, 100);
    }, 200);
    clearInterval(n);
  }, 200);
}
deletefbmessage();
