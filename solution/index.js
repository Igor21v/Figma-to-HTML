const stack = [];

const TEXT_STYLES_MAPPER = {
    fontFamily: (value) => `font-family: '${value}';`,
    fontSize: (value) => `font-size: ${value}px;`,
    fontWeight: (value) => `font-weight: ${value};`,
    textAlignHorizontal: (value) => `text-align: ${value.toLowerCase()};`,
    lineHeightPx: (value) => `line-height: ${value}px;`,
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
                  ${255 * value[0].color.r}, 
                  ${255 * value[0].color.g}, 
                  ${255 * value[0].color.b}, 
                  ${value[0].color.a});`,
                );
                break;
            case 'absoluteBoundingBox':
                if (node.style.textAutoResize === 'HEIGHT') {
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
    /*  'box-sizing: border-box;' */
    const styleArr = [];
    for (let [key, value] of Object.entries(node)) {
        switch (key) {
            case 'itemSpacing':
                styleArr.push('display: flex;', `gap: ${value}px;`);
                if (node.counterAxisAlignItems === 'CENTER') {
                    styleArr.push('align-items: center;');
                } else if (node.type === 'INSTANCE') {
                    styleArr.push('align-items: start;');
                }
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
            /*             case 'counterAxisAlignItems':
                value === 'CENTER' && styleArr.push('align-items: center;');
                break; */
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
            case 'fills':
                const fills = value[0];
                if (fills) {
                    styleArr.push(
                        `background-color: rgba(
                      ${255 * fills.color.r}, 
                      ${255 * fills.color.g}, 
                      ${255 * fills.color.b}, 
                      ${fills.color.a});`,
                    );
                }

                break;
            case 'strokes':
                if (value.length) {
                    const stroke = value[0];
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
            case 'counterAxisSizingMode':
                if (value === 'FIXED') {
                    styleArr.push(
                        `width: ${node.absoluteBoundingBox.width}px;`,
                    );
                }
                break;
            case 'primaryAxisSizingMode':
                if (value === 'FIXED') {
                    styleArr.push(
                        `width: ${node.absoluteBoundingBox.width}px;`,
                    );
                }
                break;
            case 'type':
                if (value === 'RECTANGLE') {
                    styleArr.push(
                        `width: ${node.absoluteBoundingBox.width}px;`,
                        `height: ${node.absoluteBoundingBox.height}px;`,
                    );
                }
                break;
            case 'effects':
                const effect = value[0];
                if (effect) {
                    styleArr.push(
                        `box-shadow: ${effect.offset.x}px 
                        ${effect.offset.y}px 
                        rgba(${255 * effect.color.r}, 
                            ${255 * effect.color.g}, 
                            ${255 * effect.color.b}, 
                            ${effect.color.a});`,
                    );
                }
                break;
            case 'layoutAlign':
                value === 'STRETCH' && styleArr.push(`width: 100%;`);
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
            // метод at в node 12 не поддерживается
            node.children[node.children.length - 1].closingTag =
                node.closingTag + '</div>';
            node.closingTag = null;
        } else {
            node.children[node.children.length - 1].closingTag = '</div>';
        }
        stack.push(...node.children.reverse());
        return openTag;
    }

    return openTag + '</div>';
};

// Выборка типов блоков
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

// Обходим дерево
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
