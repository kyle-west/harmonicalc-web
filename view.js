const queryButtons = (query = '') => [...document.querySelectorAll(`.buttons button${query}`)]
const buttons = Object.fromEntries(queryButtons().map(btn => [btn.id, btn]));
const omnibox = document.getElementById('omnibox');

const strictOperators = ['&', '|', '^', '%', '/', '*', '+', '-'];
let lastItemWasResult = false
let cursorPosition = 0;

function clear (reset = '') {
  omnibox.value = reset;
  lastItemWasResult = false;
  cursorPosition = reset.length;
}

function execute () {
  if (!omnibox.value) return;
  let result;
  try {
    console.log(omnibox.value);
    result = eval(omnibox.value);
  } catch (err) {
    console.error(err);
    result = NaN;
  } finally {
    lastItemWasResult = true;
    omnibox.value = result;
  }
}

function autoClearAfterExec({ data, currentTarget }) {
  if (lastItemWasResult && !strictOperators.includes(data)) {
    clear(currentTarget ? data : '');
  }
  lastItemWasResult = false;
}

function handleCursor({ currentTarget: field }) {
  cursorPosition = field.selectionStart;
  console.log(cursorPosition);
}

function typeChar (text) {
  return () => {
    autoClearAfterExec({ data: text });
    omnibox.value = omnibox.value.slice(0, cursorPosition) + text + omnibox.value.slice(cursorPosition);
    cursorPosition += text.length;
    applyPrefixes();
  }
}

function ensureHexPrefixIfNeeded(word) {
  if (/[a-fA-F]+$/.test(word) && !word.startsWith('0x') && !word.startsWith('0b')) {
    cursorPosition += 2;
    return `0x${word}`;
  }
}

function applyPrefixes () {
  omnibox.value = omnibox.value.replace(/\w+/g, (word) => {
    return ensureHexPrefixIfNeeded(word) || word;
  })
}

function applySideEffects(evt) {
  handleCursor(evt);
  autoClearAfterExec(evt);
  applyPrefixes();
}

buttons.equals.addEventListener('click', execute);
buttons.clear.addEventListener('click', () => clear());
buttons.backspace.addEventListener('click', () => {
  if (cursorPosition > 0) {
    omnibox.value = omnibox.value.slice(0, cursorPosition - 1) + omnibox.value.slice(cursorPosition);
    cursorPosition--;
  }
})
queryButtons('[data-value]').forEach(
  btn => btn.addEventListener('click', typeChar(btn.dataset.value))
);
buttons.typeHEX.addEventListener('click', () => {
  execute()
  if (omnibox.value.trim()) {
    omnibox.value = `0x${Number(omnibox.value).toString(16)}`;
  }
})
buttons.typeBIN.addEventListener('click', () => {
  execute()
  if (omnibox.value.trim()) {
    omnibox.value = `0b${Number(omnibox.value).toString(2)}`;
  }
})
buttons.typeDEC.addEventListener('click', () => execute())

omnibox.addEventListener('input', applySideEffects);
omnibox.addEventListener('keydown', handleCursor);
omnibox.addEventListener('keyup', ({ key }) => key === 'Enter' && execute());