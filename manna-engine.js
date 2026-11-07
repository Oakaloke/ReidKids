/* Manna from Heaven: deterministic brick-breaker rules, independent of rendering. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.MannaRules = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const WIDTH = 720, HEIGHT = 600, MAX_LEVEL = 3;
  const MODES = { gentle: { speed: 290, width: 142, lives: 5 }, classic: { speed: 370, width: 112, lives: 3 } };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function bricks(level) {
    const rows = level + 3, list = [];
    for (let row = 0; row < rows; row++) for (let col = 0; col < 7; col++) {
      // Every piece needs one hit. Clear gaps add variety without hidden rules.
      if (level === 2 && row === 0 && (col === 0 || col === 6)) continue;
      if (level === 3 && row < 2 && (col + row) % 3 === 0) continue;
      list.push({ x: 43 + col * 92, y: 90 + row * 38, w: 82, h: 26, row, alive: true });
    }
    return list;
  }
  function dock(s) { s.ball.x = s.paddle.x; s.ball.y = s.paddle.y - s.ball.r - 2; s.ball.vx = 0; s.ball.vy = 0; }
  function initial(mode = 'gentle') {
    mode = MODES[mode] ? mode : 'gentle';
    const s = { mode, level: 1, score: 0, lives: MODES[mode].lives, status: 'ready', bricks: bricks(1), hits: 0,
      paddle: { x: WIDTH / 2, y: 538, w: MODES[mode].width, h: 17 }, ball: { x: 0, y: 0, vx: 0, vy: 0, r: 9 } };
    dock(s); return s;
  }
  function speed(s) { return MODES[s.mode].speed + (s.level - 1) * 28 + Math.min(45, s.hits * 1.4); }
  function move(s, center) {
    if (!Number.isFinite(center)) return;
    s.paddle.x = clamp(center, s.paddle.w / 2 + 9, WIDTH - s.paddle.w / 2 - 9);
    if (s.status === 'ready' || s.status === 'serve') dock(s);
  }
  function launch(s) {
    if (s.status !== 'ready' && s.status !== 'serve') return false;
    s.status = 'running'; const v = speed(s); s.ball.vx = v * (s.level % 2 ? .34 : -.34); s.ball.vy = -Math.sqrt(v * v - s.ball.vx * s.ball.vx); return true;
  }
  function nextLevel(s) {
    if (s.status !== 'level') return false;
    s.level++; s.bricks = bricks(s.level); s.hits = 0; s.lives = Math.min(MODES[s.mode].lives, s.lives + 1); s.status = 'serve'; dock(s); return true;
  }
  function normalize(s) { const b = s.ball, v = speed(s), norm = Math.hypot(b.vx, b.vy) || 1; b.vx *= v / norm; b.vy *= v / norm; }
  function step(s, seconds) {
    const events = [];
    if (s.status !== 'running' || !Number.isFinite(seconds) || seconds <= 0) return events;
    // Small substeps prevent tunneling even at top speed or after a slow frame.
    const duration = Math.min(seconds, .05), count = Math.ceil(duration / (1 / 240)), dt = duration / count;
    for (let n = 0; n < count && s.status === 'running'; n++) {
      const b = s.ball, p = s.paddle, oldX = b.x, oldY = b.y;
      b.x += b.vx * dt; b.y += b.vy * dt;
      if (b.x < b.r) { b.x = b.r; b.vx = Math.abs(b.vx); events.push({ type: 'wall' }); }
      if (b.x > WIDTH - b.r) { b.x = WIDTH - b.r; b.vx = -Math.abs(b.vx); events.push({ type: 'wall' }); }
      if (b.y < b.r) { b.y = b.r; b.vy = Math.abs(b.vy); events.push({ type: 'wall' }); }
      if (b.vy > 0 && oldY + b.r <= p.y && b.y + b.r >= p.y && b.x + b.r >= p.x - p.w / 2 && b.x - b.r <= p.x + p.w / 2) {
        const offset = clamp((b.x - p.x) / (p.w / 2), -1, 1), angle = offset * Math.PI / 3;
        const v = speed(s); b.vx = Math.sin(angle) * v; b.vy = -Math.cos(angle) * v;
        if (Math.abs(b.vx) < 45) b.vx = (b.vx < 0 ? -1 : 1) * 45;
        normalize(s); b.y = p.y - b.r - .01; events.push({ type: 'paddle' });
      }
      for (const brick of s.bricks) {
        if (!brick.alive) continue;
        const nearestX = clamp(b.x, brick.x, brick.x + brick.w), nearestY = clamp(b.y, brick.y, brick.y + brick.h);
        if ((b.x - nearestX) ** 2 + (b.y - nearestY) ** 2 > b.r ** 2) continue;
        const fromLeft = oldX + b.r <= brick.x, fromRight = oldX - b.r >= brick.x + brick.w;
        const fromTop = oldY + b.r <= brick.y, fromBottom = oldY - b.r >= brick.y + brick.h;
        if (fromLeft || fromRight) { b.vx = fromLeft ? -Math.abs(b.vx) : Math.abs(b.vx); b.x = fromLeft ? brick.x - b.r - .01 : brick.x + brick.w + b.r + .01; }
        else if (fromTop || fromBottom) { b.vy = fromTop ? -Math.abs(b.vy) : Math.abs(b.vy); b.y = fromTop ? brick.y - b.r - .01 : brick.y + brick.h + b.r + .01; }
        else { b.vy *= -1; b.y = oldY; }
        brick.alive = false; s.score += 10; s.hits++; normalize(s);
        events.push({ type: 'brick', x: brick.x + brick.w / 2, y: brick.y + brick.h / 2 }); break;
      }
      if (!s.bricks.some(brick => brick.alive)) { s.status = s.level === MAX_LEVEL ? 'won' : 'level'; events.push({ type: s.status }); }
      else if (b.y - b.r > HEIGHT) {
        s.lives--; s.status = s.lives > 0 ? 'serve' : 'over'; dock(s); events.push({ type: 'miss' });
      }
    }
    return events;
  }
  return { WIDTH, HEIGHT, MAX_LEVEL, MODES, initial, launch, move, step, nextLevel, speed, bricks };
});
