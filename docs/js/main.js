const baseUrl = 'https://webmention.lusmo.re';
const post = async function (ev) {
  ev.preventDefault();

  const body = new URLSearchParams([
    ['source', ev.target.source.value],
    ['target', ev.target.target.value]
  ]);

  const resp = await fetch(
    `${baseUrl}/post`,
    {
      method: 'POST',
      body
    });
  if (resp.ok) {
    ev.target.getElementsByClassName('success')[0].innerText = 'Success!';
    ev.target.getElementsByClassName('error')[0].innerText = '';
    ev.target.reset();
  } else {
    const error = await resp.text();
    ev.target.getElementsByClassName('error')[0].innerText = error || resp.statusText || `Error ${resp.status}`;
  }

  return false;
};

const get = async function (ev) {
  ev.preventDefault();

  const params = new URLSearchParams([
    ['target', ev.target.target.value]
  ]);

  const resp = await fetch(`${baseUrl}/get?${params}`);
  if (resp.ok) {
    const mentions = await resp.json();
    const list = ev.target.getElementsByClassName('success')[0];
    list.innerHTML = '';
    if (mentions.length) {
      for (const mention of mentions) {
        const item = document.createElement('li');
        item.innerHTML = `<a href="${mention.source}">${mention.title}</a>`;
        list.appendChild(item);
      }
    } else {
      const item = document.createElement('li');
      item.innerHTML = 'No Webmentions';
      list.appendChild(item);
    }
    ev.target.getElementsByClassName('error')[0].innerText = '';
  } else {
    const error = await resp.text();
    ev.target.getElementsByClassName('error')[0].innerText = error || resp.statusText || `Error ${resp.status}`;
  }

  return false;
};