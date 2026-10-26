import Phaser from 'phaser';
type Ctx = CanvasRenderingContext2D;
const rect = (c: Ctx, color: string, x: number, y: number, w: number, h: number) => { c.fillStyle = color; c.fillRect(x, y, w, h); };
const ellipse = (c: Ctx, color: string, x: number, y: number, rx: number, ry: number) => { c.fillStyle = color; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fill(); };
function rng(seed: number) { return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; }
export function createArt(scene: Phaser.Scene) {
  function texture(key: string, w: number, h: number, draw: (c: Ctx) => void) {
    const tex = scene.textures.createCanvas(key, w, h)!;
    const c = tex.getContext(); c.imageSmoothingEnabled = false; draw(c); tex.refresh();
  }
  texture('terrain', 1600, 1200, c => {
    rect(c, '#92ae69', 0, 0, 1600, 1200);
    const rand = rng(271);
    for (let n = 0; n < 16000; n++) {
      const x = Math.floor(rand() * 800) * 2, y = Math.floor(rand() * 600) * 2;
      rect(c, ['#9eb976', '#a3bc79', '#839f5c', '#8ba563', '#b1bf7d'][n % 5], x, y, n % 3 === 0 ? 4 : 2, 2);
    }
    // Hand-laid winding paths and a softer border.
    const path = (color: string, width: number) => {
      c.strokeStyle = color; c.lineWidth = width; c.lineJoin = 'round'; c.lineCap = 'round';
      c.beginPath(); c.moveTo(405, 465); c.lineTo(480, 465); c.lineTo(480, 640); c.lineTo(1020, 640); c.lineTo(1020, 395); c.stroke();
      c.beginPath(); c.moveTo(750, 640); c.lineTo(750, 1020); c.stroke();
    };
    path('#81995b', 67); path('#b8af7c', 57); path('#d5c393', 43);
    for (let n = 0; n < 1000; n++) {
      const x = 470 + rand() * 570, y = 623 + rand() * 34;
      rect(c, n % 2 ? '#c6b584' : '#decc9f', x | 0, y | 0, 3, 2);
    }
    rect(c, '#829b5b', 600, 396, 270, 196);
    rect(c, '#b6ab78', 604, 400, 262, 188);
    // River at the east edge: stepped pixel banks and layered shallow water.
    for (let y = 0; y < 1200; y += 16) {
      const bank = 1280 + Math.floor(Math.sin(y / 190) * 4) * 8;
      rect(c, '#668e70', bank - 14, y, 340, 16); rect(c, '#cfca99', bank - 6, y, 326, 16);
      rect(c, '#7eb4ac', bank + 5, y, 315, 16); rect(c, '#609e9d', bank + 24, y, 300, 16);
      rect(c, '#528f96', bank + 60, y, 280, 16);
    }
    // Flower clusters across the grass.
    for (let n = 0; n < 260; n++) {
      const x = rand() * 1230, y = rand() * 1150;
      if ((x > 350 && x < 1100 && y > 260 && y < 820)) continue;
      rect(c, '#66884e', x | 0, y | 0, 2, 7);
      const col = ['#e8db9d', '#f2e9c5', '#c9999b'][n % 3];
      rect(c, col, (x - 2) | 0, y | 0, 6, 2); rect(c, col, x | 0, (y - 2) | 0, 2, 6); rect(c, '#c6a35d', x | 0, y | 0, 2, 2);
    }
    // Little bridge.
    rect(c, '#547c70', 1220, 828, 205, 64);
    for (let x = 1214; x < 1430; x += 12) { rect(c, '#78684a', x, 820, 10, 62); rect(c, '#b4986b', x, 820, 8, 56); }
    rect(c, '#655a40', 1210, 807, 224, 6); rect(c, '#c0a575', 1210, 803, 224, 5);
    for (const x of [1210, 1282, 1354, 1426]) { rect(c, '#6f6043', x, 794, 8, 30); rect(c, '#c9af7c', x, 794, 5, 26); }
  });
  for (let v = 0; v < 3; v++) texture(`tree${v}`, 88, 114, c => {
    ellipse(c, '#213f3933', 47, 103, 33, 9);
    rect(c, '#67583d', 39, 62, 13, 43); rect(c, '#937344', 42, 64, 6, 38); rect(c, '#ac8550', 41, 91, 3, 12);
    const colors = v === 1 ? ['#355b40', '#477147', '#5a8650', '#759758', '#8fa762'] : ['#3b6445', '#537c4a', '#709150', '#8da65e', '#9eb469'];
    const foliage = (x: number, y: number, w: number, h: number, col: string) => { rect(c, col, x + 6, y, w - 12, h); rect(c, col, x, y + 8, w, h - 16); };
    foliage(9, 31, 68, 48, colors[0]); foliage(3, 24, 70, 40, colors[1]); foliage(17, 8, 56, 57, colors[1]);
    foliage(10, 22, 55, 32, colors[2]); foliage(23, 5, 39, 42, colors[2]);
    const rand = rng(82 + v);
    for (let n = 0; n < 45; n++) { const x = 16 + rand() * 49, y = 14 + rand() * 40; rect(c, colors[n % 2 + 3], x | 0, y | 0, 5, 3); }
    rect(c, colors[0], 19, 67, 7, 8); rect(c, colors[0], 58, 62, 10, 9);
  });
  texture('pine', 66, 118, c => {
    ellipse(c, '#213f3930', 34, 106, 25, 8); rect(c, '#756043', 29, 70, 8, 38);
    for (let tier = 0; tier < 5; tier++) {
      const y = 7 + tier * 15, w = 16 + tier * 10;
      for (let row = 0; row < 5; row++) { const width = Math.min(w, row * 9 + 9); rect(c, '#365b43', 33 - width / 2, y + row * 5, width, 6); rect(c, '#50794d', 33 - width / 2, y + row * 5, width * .55, 4); }
    }
  });
  texture('house', 180, 184, c => {
    ellipse(c, '#314b3430', 96, 168, 80, 12);
    rect(c, '#705b45', 24, 86, 134, 76); rect(c, '#eddbac', 27, 82, 128, 73);
    rect(c, '#d6c28f', 27, 142, 128, 13);
    for (let y = 92; y < 147; y += 12) rect(c, '#d9c796', 29, y, 124, 2);
    rect(c, '#79614a', 129, 21, 16, 39); rect(c, '#ad8b67', 132, 23, 9, 29); rect(c, '#655744', 125, 18, 24, 7);
    for (let row = 0; row < 12; row++) {
      const y = 22 + row * 6, left = 89 - row * 7;
      rect(c, '#694d40', left - 5, y, row * 14 + 12, 8);
      rect(c, row % 2 ? '#9e6749' : '#b47b53', left, y, row * 14 + 5, 5);
      for (let x = left + (row % 2 ? 9 : 0); x < 90 + row * 7; x += 18) rect(c, '#7f553f', x, y, 2, 5);
    }
    rect(c, '#554e3e', 8, 94, 164, 7); rect(c, '#c39262', 12, 92, 156, 4);
    for (const x of [41, 113]) {
      rect(c, '#745e43', x, 111, 27, 27); rect(c, '#8fafaa', x + 4, 114, 19, 18); rect(c, '#c0d4bc', x + 5, 115, 7, 8);
      rect(c, '#f1dfb3', x + 12, 114, 3, 20); rect(c, '#f1dfb3', x + 4, 122, 20, 3); rect(c, '#6b7650', x - 2, 139, 31, 6);
      rect(c, '#aa8060', x, 145, 27, 6); for (let f = 0; f < 4; f++) rect(c, f % 2 ? '#d3a1a1' : '#eed7a6', x + f * 7, 136, 4, 4);
    }
    rect(c, '#65543c', 79, 113, 26, 44); rect(c, '#9b7b50', 82, 115, 20, 42); rect(c, '#c8a56b', 84, 118, 3, 35); rect(c, '#e6c579', 96, 137, 3, 3);
    rect(c, '#8a8262', 74, 158, 37, 7); rect(c, '#b0a584', 70, 165, 45, 7); rect(c, '#cac09c', 66, 172, 53, 5);
  });
  texture('shop', 160, 150, c => {
    ellipse(c, '#314b3430', 82, 136, 70, 10);
    rect(c, '#7b6547', 23, 58, 114, 73); rect(c, '#b89b69', 27, 58, 106, 68);
    rect(c, '#6f7750', 14, 31, 132, 43); rect(c, '#466546', 10, 68, 140, 8);
    for (let i = 0; i < 7; i++) { rect(c, i % 2 ? '#efe1b6' : '#7f9560', 14 + i * 19, 33, 19, 34); rect(c, i % 2 ? '#d8c99c' : '#667c51', 14 + i * 19, 67, 19, 9); }
    rect(c, '#5a5940', 38, 82, 84, 31); rect(c, '#c4a678', 34, 112, 92, 12);
    for (let i = 0; i < 3; i++) { rect(c, '#99744d', 39 + i * 27, 98, 24, 15); for (let j = 0; j < 3; j++) ellipse(c, ['#c17b4c', '#93a35e', '#b86b52'][i], 43 + i * 27 + j * 7, 100, 4, 5); }
    rect(c, '#65513a', 43, 12, 77, 18); rect(c, '#dec99a', 45, 14, 73, 14);
    c.fillStyle = '#5b623f'; c.font = 'bold 10px monospace'; c.textAlign = 'center'; c.fillText('A VENDA', 81, 25);
    rect(c, '#b19668', 28, 129, 105, 5);
  });
  texture('barn', 144, 164, c => {
    ellipse(c, '#314b3430', 76, 151, 66, 9);
    rect(c, '#71513f', 17, 60, 111, 90); rect(c, '#ae6e4f', 21, 62, 103, 84);
    for (let x = 25; x < 123; x += 13) rect(c, '#c58b63', x, 66, 3, 78);
    for (let row = 0; row < 10; row++) { rect(c, '#485b56', 71 - row * 7, 14 + row * 6, row * 14 + 5, 8); rect(c, '#6a7b6a', 72 - row * 7, 14 + row * 6, row * 14 + 2, 3); }
    rect(c, '#e4d2a1', 12, 74, 122, 5); rect(c, '#e4d2a1', 20, 77, 5, 72); rect(c, '#e4d2a1', 120, 77, 5, 72);
    rect(c, '#624c37', 43, 99, 58, 50); rect(c, '#8c6347', 46, 102, 52, 44); rect(c, '#dbc491', 70, 100, 4, 48);
    c.strokeStyle = '#dbc491'; c.lineWidth = 4; c.beginPath(); c.moveTo(47, 104); c.lineTo(96, 145); c.moveTo(97, 104); c.lineTo(47, 145); c.stroke();
    rect(c, '#d9c391', 60, 47, 27, 22); rect(c, '#4c6154', 64, 50, 19, 15); rect(c, '#cbb98c', 72, 50, 3, 16);
    rect(c, '#cbb788', 36, 151, 73, 6);
  });
  texture('well', 56, 76, c => {
    ellipse(c, '#314b3430', 28, 66, 24, 7); rect(c, '#717763', 9, 43, 39, 21); rect(c, '#afb193', 10, 43, 36, 17);
    for (let y = 44; y < 61; y += 6) { rect(c, '#878e77', 11, y, 34, 1); for (let x = 13 + (y % 2) * 5; x < 45; x += 11) rect(c, '#878e77', x, y, 1, 6); }
    ellipse(c, '#525f51', 28, 43, 20, 7); ellipse(c, '#364f4b', 28, 42, 14, 4);
    rect(c, '#745c3f', 10, 18, 5, 31); rect(c, '#745c3f', 41, 18, 5, 31); rect(c, '#d3b787', 27, 17, 2, 26);
    for (let y = 0; y < 5; y++) rect(c, y % 2 ? '#b47a54' : '#9c674a', 28 - y * 6, 4 + y * 4, y * 12 + 3, 5);
  });
  texture('fence', 48, 34, c => { rect(c, '#536c4930', 1, 27, 46, 5); rect(c, '#82704e', 0, 8, 48, 5); rect(c, '#c5ae7d', 0, 7, 48, 3); rect(c, '#82704e', 0, 21, 48, 5); rect(c, '#bfa879', 0, 20, 48, 3); for (const x of [4, 39]) { rect(c, '#806849', x, 1, 6, 30); rect(c, '#d2bb89', x, 0, 4, 28); } });
  texture('rock', 34, 25, c => { ellipse(c, '#344b3c30', 18, 20, 15, 5); rect(c, '#7f8e79', 4, 9, 27, 12); rect(c, '#9aa48a', 8, 4, 19, 14); rect(c, '#b8bda0', 10, 4, 13, 4); rect(c, '#697b68', 24, 12, 5, 8); });
  texture('bush', 35, 26, c => { ellipse(c, '#3d6645', 17, 17, 17, 8); ellipse(c, '#5d804a', 17, 11, 14, 10); rect(c, '#91a45e', 8, 8, 8, 4); rect(c, '#789650', 20, 6, 7, 5); rect(c, '#c19a89', 13, 14, 3, 3); });
  texture('chicken', 20, 23, c => { ellipse(c, '#314b3422', 10, 20, 8, 3); rect(c, '#bb904f', 6, 16, 2, 5); rect(c, '#bb904f', 13, 16, 2, 5); rect(c, '#e9e2bb', 3, 7, 14, 10); rect(c, '#fff3d4', 5, 5, 11, 9); rect(c, '#fff3d4', 12, 2, 5, 8); rect(c, '#b97055', 12, 0, 4, 3); rect(c, '#bf944d', 16, 6, 4, 3); rect(c, '#495844', 14, 4, 2, 2); rect(c, '#d0c9a1', 4, 10, 7, 4); });
  // Four original walking frames per direction, hats, overalls and tool-ready silhouette.
  for (const direction of ['down', 'up', 'left', 'right']) for (let frame = 0; frame < 4; frame++) texture(`farmer-${direction}-${frame}`, 28, 39, c => {
    const bob = frame % 2, step = frame === 1 ? 2 : frame === 3 ? -2 : 0;
    ellipse(c, '#263f3930', 14, 35, 10, 3);
    rect(c, '#425d64', 7, 25 + bob, 6, 9 + step); rect(c, '#425d64', 15, 25 + bob, 6, 9 - step);
    rect(c, '#544b3e', 6, 33 + step, 8, 3); rect(c, '#544b3e', 15, 33 - step, 8, 3);
    rect(c, '#c29469', 3, 20 + bob, 4, 9); rect(c, '#c29469', 22, 20 + bob, 3, 9);
    rect(c, '#d1b37e', 6, 17 + bob, 16, 13); rect(c, '#638088', 8, 22 + bob, 12, 9); rect(c, '#638088', 8, 18 + bob, 3, 7); rect(c, '#638088', 17, 18 + bob, 3, 7);
    rect(c, '#bf926b', 8, 7 + bob, 13, 12); rect(c, '#e0b285', 10, 8 + bob, 11, 9);
    if (direction === 'up') rect(c, '#735b43', 8, 8 + bob, 14, 9);
    else { const eye = direction === 'left' ? 9 : direction === 'right' ? 18 : 11; rect(c, '#4f4b3c', eye, 12 + bob, 2, 2); if (direction === 'down') rect(c, '#4f4b3c', 17, 12 + bob, 2, 2); }
    rect(c, '#a0804d', 4, 7 + bob, 22, 4); rect(c, '#d2b775', 2, 5 + bob, 25, 4); rect(c, '#d2b775', 8, 0 + bob, 13, 7); rect(c, '#e2c98a', 9, bob, 10, 2); rect(c, '#826c49', 8, 4 + bob, 13, 2);
  });
  texture('plot-raw', 40, 40, c => { rect(c, '#a69768', 1, 1, 38, 38); rect(c, '#b5a676', 3, 3, 34, 34); for (const [x, y] of [[7, 9], [25, 25], [29, 8], [10, 27]]) { rect(c, '#829355', x, y, 3, 6); rect(c, '#829355', x - 2, y + 1, 7, 2); } });
  for (const wet of [false, true]) texture(`plot-${wet ? 'wet' : 'tilled'}`, 40, 40, c => { rect(c, '#786345', 1, 1, 38, 38); rect(c, wet ? '#806548' : '#a08055', 3, 3, 34, 34); for (let y = 8; y < 37; y += 8) { rect(c, wet ? '#6e573f' : '#886a47', 5, y, 30, 2); rect(c, wet ? '#96764f' : '#b49562', 6, y + 2, 28, 2); } });
  for (const crop of ['carrot', 'lettuce', 'tomato']) for (let stage = 0; stage < 4; stage++) texture(`${crop}-${stage}`, 32, 38, c => {
    const size = stage + 1;
    if (stage === 0) { rect(c, '#477145', 15, 24, 2, 8); rect(c, '#76934e', 11, 23, 6, 4); rect(c, '#9cb25a', 17, 20, 5, 4); return; }
    for (let i = 0; i < 3; i++) {
      const x = 7 + i * 9, y = 24 - (i % 2) * 6;
      if (crop === 'carrot') { if (stage === 3) { rect(c, '#c57b42', x - 3, y, 7, 8); rect(c, '#e5a156', x - 2, y, 4, 5); } rect(c, '#466e3f', x, y - size * 3, 2, size * 4); rect(c, '#779847', x - size * 2, y - size * 2, size * 4, 3); rect(c, '#8da94e', x - 2, y - size * 4, 3, size * 3); }
      if (crop === 'lettuce') { ellipse(c, '#4c773f', x, y, size * 2 + 1, size * 2); ellipse(c, '#90aa56', x - 1, y - 2, size * 1.7, size * 1.5); rect(c, '#bed07a', x - 1, y - 5, 3, 6); }
      if (crop === 'tomato') { rect(c, '#557042', x, y - size * 5, 2, size * 6); rect(c, '#79994b', x - 5, y - size * 3, 11, 3); if (stage >= 2) { ellipse(c, stage === 3 ? '#b85f45' : '#a5a351', x - 3, y - 3, 4, 4); rect(c, stage === 3 ? '#e89762' : '#c0ba69', x - 4, y - 5, 2, 2); } }
    }
  });
}
