const fs = require('fs');
const path = require('path');
const solution = require('./solution');

const INPUT_PATH = path.resolve(__dirname, './input/input.json');
const OUTPUT_PATH = path.resolve(__dirname, './output/output.html');

const json = JSON.parse(fs.readFileSync(INPUT_PATH, { encoding: 'utf-8' }));

const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
    </head>
    <body style="padding: 0; margin: 0;">
    <link rel="preconnect" href="https://rsms.me/">
    <link rel="stylesheet" href="https://rsms.me/inter/inter.css">
        ${solution(json)}
    </body>
    </html>
`;

fs.writeFileSync(OUTPUT_PATH, html, { encoding: 'utf-8' });
