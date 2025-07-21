/**
 * Implements auto-indenting in a textarea so that when you hit enter the same
 * indentation as used on the previous line will be used in the new line. Also
 * makes it so that pressing tab will add a tab character where the cursor is.
 *
 * WARNING: This solution clobbers edit history (undo and redo).
 *
 * @param {HTMLTextAreaElement} textarea
 * The textarea to auto-indent.
 */

function autoIndent(textarea) {
  textarea.addEventListener('keydown', event => {
    const isEnter = event.which === 13;
    const isTab = event.which === 9;
    if (isEnter || isTab) {
      event.preventDefault();
      const {selectionStart, value} = textarea;
      const insertion = isEnter ? '\n' + (value.slice(0, selectionStart).match(/(?:^|[\r\n])((?:(?=[^\r\n])[\s])*?)\S[^\r\n]*\s*$/) || [0, ''])[1] : '\t';
      textarea.value = value.slice(0, selectionStart) + insertion + value.slice(selectionStart);
      textarea.selectionEnd = textarea.selectionStart = selectionStart + insertion.length;
      // Attempts to scroll to the next line but will not work if indentation is extreme.
      textarea.scrollTop += textarea.clientHeight / textarea.rows;
    }
  });
}

autoIndent(document.getElementById('input'));
