/* Wormie's Garden: deterministic, DOM-free classic Snake rules. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SnakeRules = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const SIZE = 20;
  const VECTORS = { up: { x: 0, y: -1 }, right: { x: 1, y: 0 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 } };
  const opposite = { up: 'down', down: 'up', left: 'right', right: 'left' };
  const same = (a, b) => a.x === b.x && a.y === b.y;
  function foodFor(snake, random = Math.random, size = SIZE) {
    const occupied = new Set(snake.map(p => p.y * size + p.x));
    const free = [];
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (!occupied.has(y * size + x)) free.push({ x, y });
    return free.length ? free[Math.min(free.length - 1, Math.max(0, Math.floor(random() * free.length)))] : null;
  }
  function initial() {
    return { snake: [{ x: 8, y: 10 }, { x: 7, y: 10 }, { x: 6, y: 10 }, { x: 5, y: 10 }], direction: 'right', queue: [], food: { x: 13, y: 10 }, score: 0, status: 'ready', reason: null };
  }
  function steer(state, direction) {
    if (!VECTORS[direction] || state.status !== 'running' || state.queue.length >= 2) return false;
    const last = state.queue[state.queue.length - 1] || state.direction;
    if (direction === last || direction === opposite[last]) return false;
    state.queue.push(direction);
    return true;
  }
  function step(state, random = Math.random, size = SIZE) {
    if (state.status !== 'running') return { ate: false };
    if (state.queue.length) state.direction = state.queue.shift();
    const vector = VECTORS[state.direction];
    const head = { x: state.snake[0].x + vector.x, y: state.snake[0].y + vector.y };
    const ate = state.food !== null && same(head, state.food);
    const body = ate ? state.snake : state.snake.slice(0, -1);
    if (head.x < 0 || head.y < 0 || head.x >= size || head.y >= size || body.some(p => same(head, p))) {
      state.status = 'over';
      state.reason = head.x < 0 || head.y < 0 || head.x >= size || head.y >= size ? 'wall' : 'tail';
      state.queue = [];
      return { ate: false };
    }
    state.snake.unshift(head);
    if (ate) {
      state.score++;
      state.food = foodFor(state.snake, random, size);
      if (state.food === null) { state.status = 'won'; state.queue = []; }
    } else state.snake.pop();
    return { ate };
  }
  function interval(mode, score) {
    const speeds = { gentle: [205, 140], classic: [150, 85], zippy: [112, 65] };
    const [start, floor] = speeds[mode] || speeds.classic;
    return Math.max(floor, start - Math.floor(score / 5) * 7);
  }
  return { SIZE, initial, steer, step, foodFor, interval };
});
