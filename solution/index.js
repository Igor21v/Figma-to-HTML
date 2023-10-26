const stack = [];

const TEXT_STYLES_MAPPER = {
    fontFamily: (value) => `font-family: '${value}';`,
    fontSize: (value) => `font-size: ${value}px;`,
    fontWeight: (value) => `font-weight: ${value};`,
    textAlignHorizontal: (value) => `text-align: ${value.toLowerCase()};`,
    fills: (value) => `color: rgba(
      ${255 * value.color.r}, 
      ${255 * value.color.g}, 
      ${255 * value.color.b}, 
      ${value.color.a});`,
};

const getTextStyles = (node) => {
    const styleArr = [];
    for (let [key, value] of Object.entries(node)) {
        switch (key) {
            case 'style':
                for (let [key, value] of Object.entries(node.style)) {
                    if (TEXT_STYLES_MAPPER[key]) {
                        styleArr.push(TEXT_STYLES_MAPPER[key](value));
                    }
                }
                break;
            case 'fills':
                styleArr.push(
                    `color: rgba(
                  ${255 * value[0].color?.r}, 
                  ${255 * value[0].color?.g}, 
                  ${255 * value[0].color?.b}, 
                  ${value[0].color?.a});`,
                );
                break;
            case 'absoluteBoundingBox':
                if (node.style?.textAutoResize === 'HEIGHT') {
                    styleArr.push(`width: ${value.width}px;`);
                }
                break;
            default:
                break;
        }
    }
    return styleArr.join(' ');
};

const getDivStyles = (node) => {
    const styleArr = ['display: flex;'];
    for (let [key, value] of Object.entries(node)) {
        switch (key) {
            case 'itemSpacing':
                styleArr.push(`gap: ${value}px;`);
                break;
            case 'layoutMode':
                value === 'VERTICAL' &&
                    styleArr.push('flex-direction: column;');
                break;
            case 'primaryAxisAlignItems':
                value === 'SPACE_BETWEEN' &&
                    styleArr.push('justify-content: space-between;');
                value === 'CENTER' && styleArr.push('justify-content: center;');
                break;
            case 'counterAxisAlignItems':
                value === 'CENTER' && styleArr.push('align-items: center;');
                break;
            case 'paddingLeft':
                styleArr.push(`padding-left: ${value}px;`);
                break;
            case 'paddingRight':
                styleArr.push(`padding-right: ${value}px;`);
                break;

            case 'paddingTop':
                styleArr.push(`padding-top: ${value}px;`);
                break;

            case 'paddingBottom':
                styleArr.push(`padding-bottom: ${value}px;`);
                break;
            case 'backgroundColor':
                styleArr.push(
                    `background-color: rgba(
                      ${255 * value.r}, 
                      ${255 * value.g}, 
                      ${255 * value.b}, 
                      ${value.a});`,
                );
                break;
            case 'strokes':
                if (value.length) {
                    const stroke = value[0];
                    console.log(stroke);
                    styleArr.push(
                        `border: 
                        ${node.strokeWeight}px
                        ${stroke.type.toLowerCase()}
                        rgba(
                          ${255 * stroke.color.r}, 
                          ${255 * stroke.color.g}, 
                          ${255 * stroke.color.b}, 
                          ${stroke.color.a});`,
                    );
                }
                break;
            default:
                break;
        }
    }
    return styleArr.join(' ');
};

const buildDiv = (node) => {
    const openTag = `<div class="${node.type}" 
                    style="${getDivStyles(node)}" 
                    id=${node.name}>`;
    if (node.children) {
        if (node.closingTag) {
            node.children.at(-1).closingTag = node.closingTag + '</div>';
            node.closingTag = null;
        } else {
            node.children.at(-1).closingTag = '</div>';
        }
        stack.push(...node.children.reverse());
        return openTag;
    }

    return openTag + '</div>';
};

const PRIMITIVES = {
    TEXT: (node) => {
        return `
      <span class="${node.type}" style="${getTextStyles(node)}">
      ${node.characters}
      </span>`;
    },
    FRAME: (node) => buildDiv(node),
    INSTANCE: (node) => buildDiv(node),
    RECTANGLE: (node) => buildDiv(node),
};

const parse = (entry) => {
    let html = `<link rel="preconnect" href="https://rsms.me/">
    <link rel="stylesheet" href="https://rsms.me/inter/inter.css">
    `;
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
