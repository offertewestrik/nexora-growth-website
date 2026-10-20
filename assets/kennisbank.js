/* Progressive enhancement: all articles and links are in the HTML. */
(() => {
  const input = document.getElementById('kb-search');
  if (!input) return;
  const cards = [...document.querySelectorAll('[data-kb-card]')];
  const groups = [...document.querySelectorAll('[data-kb-group]')];
  const normalize = text => text.toLocaleLowerCase('nl').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const index = cards.map(card => ({card, text: normalize(card.dataset.search)}));
  const update = () => {
    const terms = normalize(input.value.trim()).split(/\s+/).filter(Boolean);
    let count = 0;
    index.forEach(({card, text}) => {card.hidden = !terms.every(term => text.includes(term)); if (!card.hidden) count++;});
    groups.forEach(group => {group.hidden = ![...group.querySelectorAll('[data-kb-card]')].some(card => !card.hidden);});
    document.getElementById('kb-results').textContent = `${count} ${count === 1 ? 'artikel' : 'artikelen'}${terms.length ? ' gevonden' : ' beschikbaar'}`;
    document.getElementById('kb-empty').hidden = count > 0;
  };
  document.querySelector('.kb-search').hidden = false;
  input.addEventListener('input', update);
  update();
})();
