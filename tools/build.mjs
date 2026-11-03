import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const sourcePath = resolve(root, 'index.html');
const html = await readFile(sourcePath, 'utf8');
const required = [
  'TACO RUSH', 'Classic beef', 'Chicken', 'Spicy pork', 'Crispy fish',
  'Garden veggie', 'Mild salsa', 'Medium salsa', 'Hot salsa', 'Salsa verde',
  '100', '50', 'finish()', 'replayBtn', 'lang="en"'
];
const missing = required.filter((phrase) => !html.includes(phrase));
if (missing.length) throw new Error(`Build check failed; missing: ${missing.join(', ')}`);
const output = resolve(root, 'dist/index.html');
await mkdir(dirname(output), { recursive: true });
await writeFile(output, html);
const androidAsset = resolve(root, 'android/app/src/main/assets/index.html');
await mkdir(dirname(androidAsset), { recursive: true });
await copyFile(sourcePath, androidAsset);
console.log(`Built ${output} and synchronized ${androidAsset}`);
