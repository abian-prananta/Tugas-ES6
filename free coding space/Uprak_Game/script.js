/* ===== JavaScript: logika game ===== */
const cv = document.getElementById('game'), ctx = cv.getContext('2d');
const W = 360, H = 540;            // ukuran dunia game (piksel logis)
cv.width = W; cv.height = H;
const $ = id => document.getElementById(id);

let state = 'menu';                // menu | play | pause | over
let score, lives, level, best = 0, shootT, spawnT;
let player, bullets, enemies, parts;
const keys = {};
const stars = Array.from({length: 50}, () => ({x: Math.random()*W, y: Math.random()*H, s: Math.random()*1.5 + .5}));
try { best = +localStorage.getItem('pg-best') || 0; } catch (e) {}

// Mengatur ulang semua data untuk permainan baru
function reset() {
  player = {x: W/2, y: H - 60, inv: 0};
  bullets = []; enemies = []; parts = [];
  score = 0; lives = 3; level = 1; shootT = 0; spawnT = 30;
  hud();
}
// Memperbarui tampilan skor, nyawa, level, rekor (elemen HTML)
function hud() {
  $('sk').textContent = score; $('lv').textContent = level; $('rk').textContent = best;
  $('nyawa').textContent = '♥'.repeat(lives) + '♡'.repeat(3 - lives);
}
// Menyesuaikan ukuran kanvas dengan layar
function fit() {
  const s = Math.min((innerWidth - 24) / W, (innerHeight - 140) / H, 1.4);
  cv.style.width = W*s + 'px'; cv.style.height = H*s + 'px';
  $('hud').style.width = W*s + 'px';
}
addEventListener('resize', fit); fit();

// ----- Input -----
function mulai() { if (state === 'menu' || state === 'over') { reset(); state = 'play'; } }
function jeda() { if (state === 'play') state = 'pause'; else if (state === 'pause') state = 'play'; }
addEventListener('keydown', e => {
  const k = e.key.toLowerCase(); keys[k] = true;
  if (['arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
  if (k === 'enter' || k === ' ') mulai();
  if (k === 'p') jeda();
});
addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);
function geserKe(e) { const r = cv.getBoundingClientRect(); player.x = (e.clientX - r.left) / r.width * W; }
cv.addEventListener('pointermove', e => { if (state === 'play') geserKe(e); });
cv.addEventListener('pointerdown', e => { if (state === 'play') geserKe(e); else if (state === 'pause') jeda(); else mulai(); });

// ----- Aturan game -----
function boom(x, y, n) {           // efek ledakan dari partikel
  for (let i = 0; i < n; i++) {
    const a = Math.random() * 6.28, v = Math.random() * 3 + 1;
    parts.push({x, y, vx: Math.cos(a)*v, vy: Math.sin(a)*v, l: 30});
  }
}
function hit() {                   // pemain kehilangan 1 nyawa
  if (player.inv > 0) return;
  lives--; player.inv = 90; boom(player.x, player.y, 16); hud();
  if (lives <= 0) {
    state = 'over';
    if (score > best) { best = score; try { localStorage.setItem('pg-best', best); } catch (e) {} }
    hud();
  }
}
function update(d) {               // d = faktor waktu antar frame (1 = 60 FPS)
  if (keys.arrowleft || keys.a) player.x -= 4.5 * d;
  if (keys.arrowright || keys.d) player.x += 4.5 * d;
  player.x = Math.max(20, Math.min(W - 20, player.x));
  if (player.inv > 0) player.inv -= d;

  if ((shootT -= d) <= 0) { shootT = 12; bullets.push({x: player.x, y: player.y - 18}); }

  if ((spawnT -= d) <= 0) {        // musuh muncul makin sering saat level naik
    spawnT = Math.max(18, 55 - level * 5);
    const ufo = Math.random() < .2;
    enemies.push({x: 20 + Math.random() * (W - 40), y: -20, v: 1 + level * .25 + Math.random() * .8,
                  ufo, hp: ufo ? 2 : 1, pts: ufo ? 25 : 10});
  }
  for (const b of bullets) b.y -= 7 * d;
  for (const e of enemies) {
    e.y += e.v * d;
    for (const b of bullets) {     // peluru kena musuh?
      if (!b.dead && Math.hypot(b.x - e.x, b.y - e.y) < 20) { b.dead = true; e.hp--; boom(b.x, b.y, 3); }
    }
    if (e.hp <= 0) {
      e.dead = true; score += e.pts; boom(e.x, e.y, 14);
      level = 1 + Math.floor(score / 150); hud();
    } else if (Math.hypot(e.x - player.x, e.y - player.y) < 24) { e.dead = true; boom(e.x, e.y, 10); hit(); }
    else if (e.y > H + 20) { e.dead = true; hit(); }   // musuh lolos
  }
  bullets = bullets.filter(b => !b.dead && b.y > -10);
  enemies = enemies.filter(e => !e.dead);
  for (const p of parts) { p.x += p.vx * d; p.y += p.vy * d; p.l -= d; }
  parts = parts.filter(p => p.l > 0);
}

// ----- Menggambar -----
function teks(t, y, size, warna) {
  ctx.font = `700 ${size}px system-ui, sans-serif`; ctx.fillStyle = warna; ctx.fillText(t, W/2, y);
}
function draw() {
  ctx.fillStyle = '#0d1030'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#fff';
  for (const s of stars) { ctx.globalAlpha = .25 + s.s / 3; ctx.fillRect(s.x, s.y, s.s, s.s); }
  ctx.globalAlpha = 1; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

  if (state !== 'menu') {
    ctx.fillStyle = '#ffd166';
    for (const b of bullets) ctx.fillRect(b.x - 2, b.y - 8, 4, 12);
    ctx.font = '28px serif';
    for (const e of enemies) ctx.fillText(e.ufo ? '🛸' : '👾', e.x, e.y);
    for (const p of parts) { ctx.globalAlpha = p.l / 30; ctx.fillStyle = '#ff9f5a'; ctx.fillRect(p.x, p.y, 3, 3); }
    ctx.globalAlpha = 1;
    if (!(player.inv > 0 && Math.floor(player.inv / 5) % 2)) {   // kedip saat kebal
      const {x, y} = player;
      ctx.fillStyle = '#5eead4'; ctx.beginPath();
      ctx.moveTo(x, y - 18); ctx.lineTo(x + 16, y + 16); ctx.lineTo(x, y + 8); ctx.lineTo(x - 16, y + 16);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ffd166'; ctx.fillRect(x - 3, y + 10, 6, 4 + Math.random() * 6);
    }
  }
  if (state !== 'play') {          // layar menu / jeda / game over
    ctx.fillStyle = 'rgba(13,16,48,.72)'; ctx.fillRect(0, 0, W, H);
    if (state === 'menu') { teks('PENJAGA GALAKSI', 210, 30, '#5eead4'); teks('Hancurkan 👾 dan 🛸 sebelum lolos', 255, 15, '#ecebff'); teks('Ketuk layar atau tekan Enter untuk mulai', 285, 14, '#9a98c8'); }
    if (state === 'pause') { teks('JEDA', 240, 32, '#ffd166'); teks('Tekan P atau ketuk layar untuk lanjut', 280, 14, '#9a98c8'); }
    if (state === 'over') { teks('GAME OVER', 220, 32, '#ff6b81'); teks(`Skor ${score}   Rekor ${best}`, 262, 18, '#ecebff'); teks('Ketuk layar atau tekan Enter untuk main lagi', 296, 14, '#9a98c8'); }
  }
}

// ----- Game loop: update lalu gambar, berulang tiap frame -----
let last = performance.now();
function loop(now) {
  const d = Math.min((now - last) / 16.67, 3); last = now;
  for (const s of stars) { s.y += s.s * .6 * d; if (s.y > H) { s.y = 0; s.x = Math.random() * W; } }
  if (state === 'play') update(d);
  draw();
  requestAnimationFrame(loop);
}
reset();
requestAnimationFrame(loop);
