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
  const elms = [...document.querySelectorAll("a[href*='/messages/t/']")]
    .map(el => el.closest('[role="row"]'))
    .filter(Boolean);

  if (!elms.length) {
    document.getElementById('btnclose').remove();
    h2Element.textContent = `Delete Finished. ${dm} Messages were Deleted.`;
    return;
  }

  const button = elms[0].querySelector('.x10f5nwc.xi81zsa');
  if (!button) return;
  button.click();

  const s2 = setInterval(() => {
    const deleteBtn = [...document.querySelectorAll('[role="menuitem"]')].find(
      el => el.textContent.includes('Delete')
    );
    if (!deleteBtn) return;
    const parentHtmlDiv = deleteBtn.closest('.html-div');
    deleteBtn.click();

    const s3 = setInterval(() => {
      const b3 = [
        ...document.querySelectorAll('.n75z76so.ed17d2qt,.x1s688f.xtk6v10'),
      ].find(
        el =>
          el.textContent.includes('Delete Conversation') ||
          el.textContent.includes('Delete')
      );
      if (!b3) return;
      elms[0].setAttribute('dfmsgs', true);
      b3.click();
      clearInterval(s3);

      const checkRemoval = setInterval(() => {
        if (!document.body.contains(parentHtmlDiv)) {
          clearInterval(checkRemoval);
          dm++;
          h2Element.textContent = `${dm} Messages Deleted.`;
          deletefbmessage();
        }
      }, 500);
    }, 500);
    clearInterval(s2);
  }, 500);
}
