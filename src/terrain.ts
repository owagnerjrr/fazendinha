import Phaser from 'phaser';

/** Pixel-native ground, generated once. No per-frame ground painting. */
export function createTerrain(scene: Phaser.Scene) {
  const tex = scene.textures.createCanvas('terrain', 1600, 1200)!;
  const c = tex.getContext();
  c.imageSmoothingEnabled = false;
  c.scale(2, 2);
  let seed = 719;
  const rand = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const r = (col: string, x: number, y: number, w: number, h: number) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  const oval = (col: string, x: number, y: number, rx: number, ry: number) => { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fill(); };
  r('#79a64d', 0, 0, 800, 600);
  // Broad meadow color variation, shaded woodland rims, grass clusters.
  for (let i = 0; i < 1100; i++) {
    const x = rand() * 800, y = rand() * 600;
    oval(['#7ca94f', '#80ac50', '#76a149', '#719a46', '#85af54'][i % 5], x, y, 4 + rand() * 18, 3 + rand() * 7);
  }
  for (let i = 0; i < 900; i++) {
    const x = rand() * 800, y = rand() * 600;
    if (x > 110 && x < 610 && y > 100 && y < 510) continue;
    oval(['#547c3d', '#648e43', '#5e873f'][i % 3], x, y, 8 + rand() * 16, 5 + rand() * 8);
  }
  for (let i = 0; i < 22000; i++) {
    const x = Math.floor(rand() * 800), y = Math.floor(rand() * 600);
    const col = ['#638f42', '#96b85b', '#8ab352', '#729b46', '#a0bf61'][i % 5];
    r(col, x, y, i % 4 === 0 ? 2 : 1, 1);
    if (i % 7 === 0) { r('#547f3b', x, y - 2, 1, 3); r('#9cbf61', x + 1, y - 1, 1, 2); }
  }
  // Paths: stepped grassy borders and small gravel, rather than flat ribbons.
  const paths = [[203, 233, 240, 233], [240, 233, 240, 320], [240, 320, 510, 320], [510, 320, 510, 198], [375, 320, 375, 535]];
  const path = (color: string, width: number) => {
    c.strokeStyle = color; c.lineWidth = width; c.lineCap = 'round'; c.lineJoin = 'round';
    for (const [x, y, xx, yy] of paths) { c.beginPath(); c.moveTo(x, y); c.lineTo(xx, yy); c.stroke(); }
  };
  path('#4f7839', 32); path('#9d9655', 29); path('#bd9b5f', 25); path('#c6a66a', 20);
  for (let i = 0; i < 2000; i++) {
    const x = 229 + rand() * 292, y = 309 + rand() * 22;
    r(['#b29057', '#d8b978', '#aa8a50'][i % 3], x, y, i % 5 === 0 ? 2 : 1, 1);
  }
  for (let y = 330; y < 535; y += 3) for (let n = 0; n < 5; n++) r(n % 2 ? '#b29158' : '#d8b978', 365 + rand() * 20, y, 1, 1);
  // Weathered stone path near the home and the barn.
  for (const [sx, sy, count, horizontal] of [[191, 225, 5, 1], [508, 408, 5, 0]]) {
    for (let i = 0; i < count; i++) { const x = sx + (horizontal ? i * 11 : i % 2 * 4), y = sy + (horizontal ? i % 2 * 2 : i * 9); r('#555e45', x, y + 1, 10, 6); r('#a3a07d', x, y, 9, 5); r('#bab592', x + 1, y, 7, 1); }
  }
  // Crop terrace and irregular edging, consistent with the unchanged plot IDs.
  r('#58763b', 296, 196, 144, 104); r('#96915a', 298, 198, 140, 100); r('#997a4d', 300, 200, 136, 96);
  for (let x = 298; x < 440; x += 7) { r('#655e43', x, 195, 7, 5); r('#b2a477', x, 194, 6, 4); r('#d1bb87', x + 1, 194, 4, 1); r('#776b4c', x, 297, 7, 4); r('#b2a477', x, 296, 6, 3); }
  // River with grass overhang, stones, shallow turquoise water and dark depth.
  for (let y = 0; y < 600; y += 4) {
    const bank = 640 + Math.floor(Math.sin(y / 95) * 4) * 4;
    r('#3e6949', bank - 10, y, 180, 4); r('#868c58', bank - 7, y, 177, 4); r('#a8ad70', bank - 4, y, 174, 4);
    r('#76bdae', bank, y, 170, 4); r('#449b9a', bank + 7, y, 165, 4); r('#277f8d', bank + 25, y, 160, 4); r('#287287', bank + 60, y, 140, 4);
    if (y % 12 === 0) { r('#b1d8b4', bank, y, 5, 1); r('#63b2a7', bank + 12 + rand() * 23, y, 6, 1); }
  }
  for (let i = 0; i < 140; i++) { const y = rand() * 600, bank = 640 + Math.floor(Math.sin(y / 95) * 4) * 4; const x = bank - 7 + rand() * 5; r('#456c42', x, y, 2, 5); r('#83a756', x, y, 1, 3); }
  for (let y = 402; y < 443; y += 4) {
    r('#59472f', 605, y, 113, 4); r('#9c7546', 607, y, 109, 3); r('#c09a60', 608, y, 106, 1);
    for (let x = 611; x < 716; x += 16) r('#805d39', x, y + 1, 1, 2);
  }
  for (const y of [401, 441]) { r('#443c2d', 603, y, 116, 3); r('#bb965d', 603, y - 1, 116, 2); }
  for (const x of [604, 640, 677, 715]) for (const y of [397, 438]) { r('#57432c', x, y, 4, 10); r('#d0aa6c', x, y - 1, 3, 8); }
  // Rocks and little flowers break up the repeated grass.
  for (let i = 0; i < 550; i++) {
    const x = rand() * 620, y = rand() * 590;
    if ((x > 145 && x < 580 && y > 100 && y < 475)) continue;
    const col = ['#ecd7a2', '#ecb98b', '#b8b0cf', '#e7e7b2'][i % 4];
    r('#446b38', x, y, 1, 3); r(col, x - 1, y - 1, 3, 1); r(col, x, y - 2, 1, 3); r('#ca9c48', x, y - 1, 1, 1);
  }
  tex.refresh();
}

export function createAtmosphereTextures(scene: Phaser.Scene) {
  const tex = scene.textures.createCanvas('vignette', 512, 512)!;
  const c = tex.getContext();
  const g = c.createRadialGradient(256, 240, 80, 256, 256, 350);
  g.addColorStop(0, 'rgba(15,32,32,0)'); g.addColorStop(.6, 'rgba(15,32,32,0.05)'); g.addColorStop(1, 'rgba(12,28,29,0.5)');
  c.fillStyle = g; c.fillRect(0, 0, 512, 512); tex.refresh();
  const cloud = scene.textures.createCanvas('cloud-shadow', 256, 128)!;
  const cc = cloud.getContext(); const cg = cc.createRadialGradient(128, 64, 10, 128, 64, 120);
  cg.addColorStop(0, 'rgba(20,43,49,.25)'); cg.addColorStop(1, 'rgba(20,43,49,0)'); cc.fillStyle = cg; cc.fillRect(0, 0, 256, 128); cloud.refresh();
}
