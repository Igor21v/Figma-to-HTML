let stack = [];

const TEXT_STYLES_MAPPER = {
  fontSize: (value) => `font-size: ${value}px;`,
  fontWeight: (value) => `font-weight: ${value};`,
  textAlignHorizontal: (value) => `text-align: ${value.toLowerCase()};`,
};

const getTextStyles = (node) => {
  const styleArr = [];
  if (node.style) {
    for (let [key, value] of Object.entries(node.style)) {
      if (TEXT_STYLES_MAPPER[key]) {
        styleArr.push(TEXT_STYLES_MAPPER[key](value));
      }
    }
  }
  return styleArr.join(" ");
};

const PRIMITIVES = {
  TEXT: (node) => {
    return `
      <span class="${node.type}" style="${getTextStyles(node)}">
      ${node.characters}
      </span>`;
  },
  FRAME: (node) => {
    const openTag = `<div class="${node.type}" style="${getTextStyles(node)}">`;
    if (node.children) {
      stack.push(...node.children);
      stack.at(-1).closingTag = "</div>";
      return openTag;
    }
    return openTag + "</div>";
  },
  /*   INSTANCE: (node) => {
    return buildBlock({
      type: "div",
      content: node.characters,
      className: node.type,
      style: getTextStyles(node),
    });
  },
  RECTANGLE: (node) => {
    return buildBlock({
      type: "div",
      content: node.characters,
      className: node.type,
      style: getTextStyles(node),
    });
  }, */
};

const parse = (entry) => {
  let html = "";
  stack.push(entry.children[0]);
  while (stack.length) {
    const node = stack.pop();
    html += PRIMITIVES[node.type](node);
    if (node.closingTag) {
      html += node.closingTag;
    }
  }
  return html;
};

module.exports = function (json) {
  const entry = json.document.children[0];
  return parse(entry);
};
