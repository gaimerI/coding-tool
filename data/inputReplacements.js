const inputReplacements = [
  {
    regex: /:slider min="([^"]+)" max="([^"]+)" step="([^"]+)" value="([^"]+)":/g,
      template: (_, min, max, step, value) =>
        `<input type="range" min="${min}" max="${max}" step="${step}" value="${value}" 
        oninput="this.nextElementSibling.value = this.value">
        <output>${value}</output>`
    },
    {
        regex: /:select name="([^"]+)" options="([^"]+)" selected="([^"]+)":/g,
        template: (_, name, options, selected) =>
            `<select name="${name}">` +
            options.split(', ').map(option =>
                `<option value="${option}"${option === selected ? ' selected' : ''}>${option}</option>`
            ).join('') +
            `</select>`
    },
    {
        regex: /:radio name="([^"]+)" value="([^"]+)"( checked)?:/g,
        template: (_, name, value, checked) =>
            `<input type="radio" name="${name}" value="${value}"${checked ? ' checked' : ''}>`
    },
    {
        regex: /:checkbox( checked)?:/g,
        template: (_, checked) =>
            `<input type="checkbox"${checked ? ' checked' : ''}>`
    },
    {
        regex: /:number min="([^"]+)" max="([^"]+)" value="([^"]+)":/g,
        template: (_, min, max, value) =>
            `<input type="number" min="${min}" max="${max}" value="${value}">`
    },
    {
        regex: /:text placeholder="([^"]+)" value="([^"]+)":/g,
        template: (_, placeholder, value) =>
            `<input type="text" placeholder="${placeholder}" value="${value}">`
    },
    {
        regex: /:textarea placeholder="([^"]+)" rows="(\d+)" cols="(\d+)":([^:]+):/g,
        template: (_, placeholder, rows, cols, content) =>
            `<textarea placeholder="${placeholder}" rows="${rows}" cols="${cols}">${content}</textarea>`
    }
];

export default inputReplacements;
