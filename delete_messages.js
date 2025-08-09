const divElement = document.createElement('div');
divElement.id = 'ird';
divElement.style.cssText =
  'position:fixed; opacity:1; width:100%; top:0; left:0; background-color:#4267B2; color:white; z-index:99999999999999; height:55px;';

const h2Element = document.createElement('h2');
h2Element.style.cssText =
  'text-align:center; color:white; font-size:18px; font-weight:500; margin:0; margin-top:16px;';
h2Element.textContent = 'Detecting Messages...';

const buttonElement = document.createElement('button');
buttonElement.id = 'btnclose';
buttonElement.style.cssText =
  'float:right; margin-right:40px; cursor:pointer; background-color:#d9534f; color:white; border:1px solid maroon; margin-top:-27px; border-radius:5px; padding:4px; font-size:15px;';
buttonElement.textContent = 'STOP';

divElement.append(h2Element, buttonElement);
document.body.prepend(divElement);

document.getElementById('btnclose').addEventListener('click', () => {
  window.location.reload();
});

let dm = 0;
deletefbmessage();

function deletefbmessage() {
  const elms = [
    ...document.querySelectorAll('div[role="row"] a[href*="messages/t/"]'),
  ]
    .map(el => el.closest('div[role="row"]'))
    .filter(Boolean);

  if (!elms.length) {
    document.getElementById('btnclose').remove();
    h2Element.textContent = `Delete Finished. ${dm} Messages were Deleted.`;
    return;
  }

  const button =
    elms[0].querySelector('div[aria-label^="More options"]') ||
    elms[0].querySelector('div[aria-label="Menu"]') ||
    elms[0].querySelector('.x1i10hfl.x1qjc9v5.xjbqb8w') ||
    elms[0].querySelector('.x10f5nwc.xi81zsa') ||
    elms[0].querySelector('.x1i10hfl.xjqpnuy.xc5r6h4');

  if (!button) {
    setTimeout(deletefbmessage, 1000);
    return;
  }

  button.click();

  const s2 = setInterval(() => {
    const deleteBtn = [...document.querySelectorAll('[role="menuitem"]')].find(
      el =>
        el.textContent.toLowerCase().includes('delete') ||
        el.innerText.includes('Delete chat') ||
        el.innerText.includes('Delete conversation') ||
        el.innerText.includes('Delete selected')
    );

    if (!deleteBtn) return;

    const parentDialog =
      deleteBtn.closest('div[role="dialog"]') ||
      deleteBtn.closest('.html-div') ||
      document.querySelector('div[role="dialog"]');
    deleteBtn.click();

    const s3 = setInterval(() => {
      const b3 = [
        ...document.querySelectorAll(
          '.x1i10hfl.xjbqb8w.x6umtig.x1b1mbwd.xaqea5y.xav7gou.x9f619 button, .x1s688f.xtk6v10, .n75z76so.ed17d2qt, .x1xmf6yo'
        ),
      ].find(
        el =>
          el.textContent.includes('Delete Chat') ||
          el.textContent.includes('Delete Conversation') ||
          el.textContent.includes('Delete') ||
          el.getAttribute('aria-label')?.includes('Delete')
      );

      if (!b3) return;

      elms[0].setAttribute('dfmsgs', true);
      b3.click();
      clearInterval(s3);

      // Simple element removal check
      const checkRemoval = setInterval(() => {
        if (!document.body.contains(elms[0])) {
          clearInterval(checkRemoval);
          dm++;
          h2Element.textContent = `${dm} Messages Deleted.`;
          deletefbmessage(); // Removed the 500ms delay
        }
      }, 100);
    }, 200); // Reduced from 500ms to 200ms
    clearInterval(s2);
  }, 200); // Reduced from 500ms to 200ms
}
