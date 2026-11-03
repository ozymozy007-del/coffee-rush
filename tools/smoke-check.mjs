import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

class FakeElement {
  constructor(id = '') {
    this.id = id; this.textContent = ''; this.innerHTML = ''; this.dataset = {}; this.style = {};
    this.children = []; this.listeners = {}; this.attributes = {};
    const values = new Set();
    this.classList = { add: (...xs) => xs.forEach(x => values.add(x)), remove: (...xs) => xs.forEach(x => values.delete(x)), toggle: (x, on) => on ? values.add(x) : values.delete(x), contains: x => values.has(x) };
  }
  addEventListener(type, fn) { this.listeners[type] = fn; }
  appendChild(child) { this.children.push(child); return child; }
  setAttribute(key, value) { this.attributes[key] = value; }
  scrollIntoView() {}
  focus() {}
  click() { this.listeners.click?.(); }
}

const ids = ['menu','game','score','progress','timer','timerFill','accuracy','portrait','customerName','customerLine','ticketNumber','orderTitle','orderDesc','orderParts','feedback','tacoSvg','tortillaOptions','fillingOptions','salsaOptions','toppingOptions','endModal','endTitle','endCopy','finalScore','servedResult','mistakeResult','replayBtn','startBtn','serveBtn'];
const elements = new Map(ids.map(id => [id, new FakeElement(id)]));
const document = {
  getElementById(id) { if (!elements.has(id)) elements.set(id, new FakeElement(id)); return elements.get(id); },
  createElement() { return new FakeElement(); },
  querySelectorAll(selector) {
    const match = selector.match(/data-group="([^"]+)"/);
    if (!match) return [];
    return [...elements.values()].flatMap(e => e.children).filter(b => b.dataset.group === match[1]);
  }
};
const source = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const code = source.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(code, 'game script is present');
const context = { document, console, setInterval: () => 1, clearInterval() {}, setTimeout: fn => fn() };
vm.runInNewContext(code, context, { timeout: 1000 });

function clickChoice(group, item) {
  const button = document.getElementById(group + 'Options').children.find(b => b.dataset.item === item);
  assert.ok(button, `choice exists: ${item}`);
  button.click();
}
function assemble(order, wrong = false) {
  clickChoice('tortilla', order.tortilla);
  clickChoice('filling', order.filling);
  clickChoice('salsa', order.salsa);
  for (const topping of order.toppings) clickChoice('toppings', topping);
  if (wrong) clickChoice('toppings', 'Lime');
}
const orders = [
  { tortilla:'Soft corn', filling:'Classic beef', salsa:'Mild salsa', toppings:['Lettuce','Tomato','Cheese'] },
  { tortilla:'Flour', filling:'Chicken', salsa:'Salsa verde', toppings:['Avocado','Cilantro','Onion'] },
  { tortilla:'Crispy shell', filling:'Spicy pork', salsa:'Hot salsa', toppings:['Jalapeño','Onion','Cilantro'] },
  { tortilla:'Soft corn', filling:'Crispy fish', salsa:'Medium salsa', toppings:['Cabbage','Sour cream','Lime'] },
  { tortilla:'Flour', filling:'Garden veggie', salsa:'Salsa verde', toppings:['Avocado','Tomato','Cilantro'] }
];
document.getElementById('startBtn').click();
assemble(orders[0]);
document.getElementById('serveBtn').click();
assert.equal(document.getElementById('score').textContent, '150', 'correct fast order earns 150');
assemble(orders[1], true);
document.getElementById('serveBtn').click();
document.getElementById('serveBtn').click();
assert.equal(document.getElementById('score').textContent, '125', 'one missed ticket applies one 25-point penalty');
for (let i = 2; i < orders.length; i++) {
  assemble(orders[i]);
  document.getElementById('serveBtn').click();
}
assert.equal(document.getElementById('progress').textContent, '5 / 5');
assert.equal(document.getElementById('finalScore').textContent, '775', 'final score includes order points, one penalty, and shift bonus');
assert.equal(document.getElementById('servedResult').textContent, '5 orders served');
assert.equal(document.getElementById('mistakeResult').textContent, '1 mistake');
assert.equal(document.getElementById('endModal').classList.contains('open'), true, 'game-over screen opens');
document.getElementById('replayBtn').click();
assert.equal(document.getElementById('score').textContent, '0', 'replay resets score');
assert.equal(document.getElementById('progress').textContent, '0 / 5', 'replay resets order progress');
console.log('Gameplay smoke check passed: scoring, mistake lockout, five-order completion, game-over, replay reset.');
