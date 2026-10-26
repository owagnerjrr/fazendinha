import Phaser from 'phaser';
import './style.css';
import './theme.css';
import { createArt } from './art';
import { ACTIONS, ActionClock, actionFrame, DIRECTION_ROW, isPouring, type Direction } from './action-timing';
import { ChickenFlock } from './chickens';
import { WorkEffects } from './work-effects';
import nozzleAnchors from '../public/assets/v3/anchors.json';
import { choosePlot } from './interaction';
import { act, buySeeds, CROPS, makeFarm, remaining, restoreFarm, SAVE_KEY, sellAll, type Crop, type Farm, type Tool } from './farm';

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const cropKeys = Object.keys(CROPS) as Crop[];
let farm: Farm;
try { farm = restoreFarm(localStorage.getItem(SAVE_KEY)); } catch { farm = makeFarm(); }
let selected: Crop = 'carrot', tool: Tool = 'hand', modal = false, toastTimer: ReturnType<typeof setTimeout>;
let joystick = { x: 0, y: 0 };
let scene: FarmScene;
const dialog = $<HTMLDialogElement>('panel');
let activePanel: 'shop' | 'other' = 'other';
function toast(message: string) { $('toast').textContent = message; $('toast').classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('toast').classList.remove('show'), 4200); }
function save() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(farm)); $('save-status').textContent = 'Salvo neste aparelho'; $('save-dot').style.background = '#c4da8c'; }
  catch { $('save-status').textContent = 'Não foi possível salvar'; $('save-dot').style.background = '#e69f69'; }
}
function syncUI() {
  $('coins').textContent = farm.coins.toLocaleString('pt-BR');
  $('seed-name').textContent = CROPS[selected].name; $('seed-icon').innerHTML = `<img src="/assets/v2/${selected}-3.png" alt="" />`;
  $('seed-count').textContent = `${farm.seeds[selected]} sementes`;
  $('bag-count').textContent = String(cropKeys.reduce((sum, c) => sum + farm.inventory[c], 0));
  if (farm.questClaimed) { $('quest-text').textContent = 'A primeira colheita a gente nunca esquece.'; $('quest-progress').textContent = 'Capítulo concluído'; $('quest-fill').style.width = '100%'; }
  document.querySelectorAll<HTMLButtonElement>('[data-tool]').forEach(b => { const active = b.dataset.tool === tool; b.classList.toggle('active', active); b.setAttribute('aria-pressed', String(active)); });
}
function setTool(next: Tool) { tool = next; syncUI(); const hints: Record<Tool, string> = { hand: 'Toque em uma planta pronta para colher.', hoe: 'Toque em um canteiro para preparar a terra.', seed: `Toque na terra preparada para plantar ${CROPS[selected].name.toLowerCase()}.`, water: 'Toque na plantação para regar e iniciar o crescimento.' }; $('hint').textContent = hints[tool]; }
function openPanel(title: string, content: string, kind: 'shop' | 'other' = 'other') {
  activePanel = kind; scene?.finishCurrentWork();
  modal = true; scene?.cancelMovement(); $('panel-eyebrow').textContent = 'UM POUQUINHO DE VIDA NO CAMPO'; $('panel-content').innerHTML = `<h2>${title}</h2>${content}`; document.body.classList.add('modal-open'); if (!dialog.open) dialog.showModal();
}
function closePanel() { dialog.close(); }
dialog.addEventListener('close', () => { modal = false; activePanel = 'other'; document.body.classList.remove('modal-open'); joystick = { x: 0, y: 0 }; $('joystick-knob').style.transform = ''; });
$('close-panel').onclick = closePanel;
dialog.addEventListener('cancel', e => { if (activePanel === 'shop') e.preventDefault(); });
dialog.addEventListener('click', e => { if (activePanel !== 'shop' && e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closePanel(); } });
function inventory() {
  const total = cropKeys.reduce((n, c) => n + farm.inventory[c] * CROPS[c].sellPrice, 0);
  openPanel('Seu celeiro', `<p>O que você cultiva com carinho fica guardado aqui. Venda a colheita e prepare o próximo plantio.</p>${cropKeys.map(c => `<div class="item-row"><span class="emoji"><img src="/assets/v2/${c}-3.png" alt="" /></span><div class="item-info"><strong>${CROPS[c].name}</strong><small>${farm.inventory[c]} unidades · ${CROPS[c].sellPrice} moedas cada</small></div><strong>${farm.inventory[c] * CROPS[c].sellPrice} ◉</strong></div>`).join('')}<button class="primary" id="sell-all" ${total === 0 ? 'disabled' : ''}>Vender colheita · ${total} moedas</button><p class="quiet-note">As sementes ficam guardadas separadamente e não são vendidas.</p>`);
  $('sell-all').onclick = () => { const sold = sellAll(farm); save(); syncUI(); closePanel(); toast(`Colheita vendida: +${sold} moedas. Bom trabalho!`); };
}
function seedPanel() {
  openPanel('O que vamos plantar?', `<p>Você já começa com sementes das três culturas. Os tempos são curtos para experimentar este protótipo.</p>${cropKeys.map(c => `<div class="item-row"><span class="emoji"><img src="/assets/v2/${c}-3.png" alt="" /></span><div class="item-info"><strong>${CROPS[c].name}</strong><small>${farm.seeds[c]} sementes · cresce em ${CROPS[c].seconds}s após regar</small></div><button class="choose-seed" data-crop="${c}">${selected === c ? 'Selecionada' : 'Escolher'}</button></div>`).join('')}`);
  document.querySelectorAll<HTMLButtonElement>('[data-crop]').forEach(b => b.onclick = () => { selected = b.dataset.crop as Crop; setTool('seed'); closePanel(); });
}
function shop() {
  openPanel('A venda do vale', `<p>Escolha seus pacotes. Cada um vem com 5 sementes; você pode fazer várias compras antes de sair.</p>${cropKeys.map(c => `<div class="item-row"><span class="emoji"><img src="/assets/v2/${c}-3.png" alt="" /></span><div class="item-info"><strong>${CROPS[c].name}</strong><small id="shop-owned-${c}">5 sementes · ${farm.seeds[c]} guardadas</small></div><button class="buy-seeds" data-buy="${c}" aria-label="Comprar 5 sementes de ${CROPS[c].name.toLowerCase()} por ${CROPS[c].seedPrice * 5} moedas">${CROPS[c].seedPrice * 5} ◉</button></div>`).join('')}<div class="shop-wallet">Seu saldo <strong id="shop-balance"></strong></div><p id="shop-feedback" class="shop-feedback" role="status" aria-live="polite">A venda permanece aberta até você clicar em sair.</p><button class="primary" id="leave-shop">Sair da venda</button>`, 'shop');
  const updateShop = (message?: string) => {
    $('shop-balance').textContent = `${farm.coins.toLocaleString('pt-BR')} moedas`;
    for (const c of cropKeys) {
      $(`shop-owned-${c}`).textContent = `5 sementes · ${farm.seeds[c]} guardadas`;
      document.querySelector<HTMLButtonElement>(`[data-buy="${c}"]`)!.disabled = farm.coins < CROPS[c].seedPrice * 5;
    }
    if (message) $('shop-feedback').textContent = message;
  };
  document.querySelectorAll<HTMLButtonElement>('[data-buy]').forEach(b => b.onclick = () => {
    const c = b.dataset.buy as Crop;
    if (buySeeds(farm, c)) { save(); syncUI(); updateShop(`Compra feita! +5 sementes de ${CROPS[c].name.toLowerCase()}. Pode continuar escolhendo.`); }
    else updateShop('Você não tem moedas suficientes para este pacote.');
  });
  $('leave-shop').onclick = closePanel;
  updateShop();
}
function help() { openPanel('Um novo começo', `<p>Bem-vindo ao Vale do Sossego. Aqui, um pedacinho de terra já é uma boa história.</p><ol class="controls-list"><li>Escolha a <b>enxada</b> e toque em um canteiro.</li><li>Selecione <b>Plantar</b> e use uma semente.</li><li>Use o <b>regador</b>. O crescimento começa agora.</li><li>Quando estiver pronta, use a <b>mão</b> para colher.</li><li>Abra o <b>celeiro</b> e venda sua colheita.</li></ol><p>No PC, ande com <b>WASD ou setas</b>. Use <b>E</b> para agir perto de um canteiro ou da venda. As teclas <b>1–4</b> trocam a ferramenta. Você também pode clicar no terreno para caminhar. No celular, use o joystick ou toque no mapa.</p><p class="quiet-note"><b>Protótipo 0.3:</b> o progresso é salvo somente neste navegador. Não há conta online, feira ou sincronização entre aparelhos ainda. As plantas regadas continuam crescendo ao fechar. A arte é provisória e original do projeto.</p><button class="primary" id="start-playing">Vamos plantar</button>`); $('start-playing').onclick = closePanel; }
$('inventory').onclick = inventory; $('seed-choice').onclick = seedPanel; $('help').onclick = help;
document.querySelectorAll<HTMLButtonElement>('[data-tool]').forEach(b => b.onclick = () => setTool(b.dataset.tool as Tool));

type Destination = { x: number; y: number; field?: number; shop?: boolean; barn?: boolean };
type Work = { clock: ActionClock; field: number; crop: Crop };
type Field = { x: number; y: number; soil: Phaser.GameObjects.Image; plant: Phaser.GameObjects.Image; label: Phaser.GameObjects.Text; id: number };
class FarmScene extends Phaser.Scene {
  player!: Phaser.Physics.Arcade.Sprite;
  fields: Field[] = [];
  keys!: Record<string, Phaser.Input.Keyboard.Key>;
  obstacles!: Phaser.Physics.Arcade.StaticGroup;
  destination: Destination | null = null;
  queuedDestination: Destination | null = null;
  activeWork: Work | null = null;
  actor!: Phaser.GameObjects.Sprite;
  flock!: ChickenFlock;
  workEffects!: WorkEffects;
  focusedField: number | null = null;
  direction: Direction = 'down'; walking = false; lastPaint = 0; lastSave = 0; stuck = 0; previous = { x: 0, y: 0 };
  ripples: Phaser.GameObjects.Rectangle[] = [];
  occluders: Phaser.GameObjects.Image[] = [];
  vignette!: Phaser.GameObjects.Image;
  playerShadow!: Phaser.GameObjects.Ellipse;
  aim!: Phaser.GameObjects.Ellipse;
  select!: Phaser.GameObjects.Rectangle;
  constructor() { super('Farm'); }
  preload() {
    this.load.on('progress', (value: number) => { $('loading-percent').textContent = `${Math.round(value * 100)}%`; });
    for (const key of ['house', 'barn', 'shop', 'mill', 'tree0', 'tree1', 'tree2', 'pine', 'well', 'rock', 'bush', 'fence']) {
      this.load.image(key, `/assets/v2/${key}.png`);
    }
    this.load.image('farmer-v2', '/assets/v2/farmer.png');
    this.load.spritesheet('chickens-v3', '/assets/v3/chickens.png', { frameWidth: 40, frameHeight: 40 });
    for (const kind of ['hoe', 'water']) this.load.spritesheet(`${kind}-actions`, `/assets/v3/farmer-${kind}.png`, { frameWidth: 96, frameHeight: 112 });
    for (const key of ['hoe', 'seed', 'water']) this.load.spritesheet(`carry-${key}`, `/assets/v3/carry-${key}.png`, { frameWidth: 128, frameHeight: 112 });
    for (const crop of cropKeys) for (let stage = 0; stage < 4; stage++) this.load.image(`${crop}-${stage}`, `/assets/v2/${crop}-${stage}.png`);
  }
  create() {
    scene = this; createArt(this);
    $('loading').hidden = true;
    this.add.image(0, 0, 'terrain').setOrigin(0);
    this.physics.world.setBounds(90, 160, 1410, 930);
    this.obstacles = this.physics.add.staticGroup();
    const block = (x: number, y: number, w: number, h: number) => { const zone = this.add.zone(x, y, w, h); this.obstacles.add(zone); (zone.body as Phaser.Physics.Arcade.StaticBody).setSize(w, h); };
    const shadow = (x: number, y: number, w: number, h: number) => this.add.ellipse(x, y, w, h, 0x203726, .24).setDepth(2);
    shadow(415, 445, 214, 46); shadow(1030, 386, 170, 33); shadow(1050, 787, 154, 40);
    this.add.image(408, 451, 'house').setOrigin(.5, 1).setScale(1.35).setDepth(448); block(408, 400, 180, 88);
    this.add.image(1030, 390, 'shop').setOrigin(.5, 1).setScale(1.25).setDepth(386); block(1030, 350, 130, 65);
    this.add.image(1050, 795, 'barn').setOrigin(.5, 1).setScale(1.15).setDepth(790); block(1050, 752, 128, 80);
    this.add.image(493, 545, 'well').setOrigin(.5, 1).setScale(1.1).setDepth(545); block(493, 530, 44, 25);
    shadow(1120, 995, 150, 32);
    this.add.image(1120, 1000, 'mill').setOrigin(.5, 1).setScale(1.15).setDepth(995); block(1120, 973, 87, 48);
    const label = (x: number, y: number, text: string) => this.add.text(x, y, text, { fontFamily: 'monospace', fontSize: '10px', color: '#f6da8c', backgroundColor: '#302f29cc', padding: { x: 9, y: 4 } }).setOrigin(.5).setDepth(1900);
    label(1030, 240, 'A VENDA'); label(1050, 820, 'CELEIRO');
    for (let row = 0; row < 4; row++) for (let col = 0; col < 6; col++) {
      const x = 634 + col * 40, y = 434 + row * 40, id = row * 6 + col;
      const soil = this.add.image(x, y, 'plot-raw').setDepth(1);
      const plant = this.add.image(x, y + 11, 'carrot-0').setOrigin(.5, 1).setDepth(y + 2).setVisible(false);
      const text = this.add.text(x, y - 27, '', { fontFamily: 'monospace', fontSize: '10px', color: '#fff6ce', backgroundColor: '#40563ddd', padding: { x: 4, y: 2 } }).setOrigin(.5).setDepth(1800);
      this.fields.push({ x, y, id, soil, plant, label: text });
    }
    // Mixed woodland, original tiles and a clear playable center.
    const rand = Phaser.Math.RandomDataGenerator ? new Phaser.Math.RandomDataGenerator(['wj-vale']) : null;
    for (let y = 110; y <= 1110; y += 68) for (let x = 95; x < 1300; x += 64) {
      if (x > 220 && x < 1190 && y > 215 && y < 1000) continue;
      if (x > 680 && x < 820 && y > 930) continue;
      const px = x + (rand?.between(-16, 16) ?? 0), py = y + (rand?.between(-12, 12) ?? 0);
      const key = (x + y) % 3 === 0 ? 'pine' : `tree${(x + y) % 3}`;
      shadow(px + 10, py - 4, 88, 23);
      this.occluders.push(this.add.image(px, py, key).setOrigin(.5, 1).setScale(rand!.realInRange(1.12, 1.4)).setDepth(py));
      block(px, py - 9, 18, 20);
    }
    for (const [i, [x, y]] of [[300, 600], [330, 790], [535, 860], [940, 940], [1150, 540], [530, 280], [877, 260]].entries()) { shadow(x + 9, y - 2, 95, 24); this.occluders.push(this.add.image(x, y, `tree${i % 3}`).setOrigin(.5, 1).setScale(1.2).setDepth(y)); block(x, y - 9, 18, 20); }
    for (let i = 0; i < 6; i++) { const x = 350 + i * 48; this.add.image(x, 762, 'fence').setOrigin(.5, 1).setDepth(762); block(x, 755, 46, 9); }
    for (let i = 0; i < 4; i++) { this.add.image(350 + i * 48, 889, 'fence').setOrigin(.5, 1).setDepth(889); block(350 + i * 48, 882, 46, 9); }
    this.flock = new ChickenFlock(this);
    for (let i = 0; i < 27; i++) { const x = rand!.between(250, 1190), y = rand!.between(280, 980); if (x > 580 && x < 900 && y < 620 || Math.abs(y - 640) < 50 || Math.abs(x - 750) < 50) continue; this.add.image(x, y, i % 3 ? 'bush' : 'rock').setOrigin(.5, 1).setDepth(y); }
    // River bank is solid, with one crossing at the bridge.
    block(1280, 420, 28, 760); block(1280, 1020, 28, 280);
    for (let i = 0; i < 40; i++) {
      const r = this.add.rectangle(1335 + i % 4 * 45, 100 + i * 25, 12 + i % 3 * 6, 2, 0xc4dfc3, .45).setDepth(2); this.ripples.push(r);
      this.tweens.add({ targets: r, x: r.x + 18, alpha: .15, duration: 1500 + i % 5 * 400, yoyo: true, repeat: -1 });
    }
    this.playerShadow = this.add.ellipse(farm.player.x, farm.player.y - 3, 30, 12, 0x1e3029, .38).setDepth(3);
    this.player = this.physics.add.sprite(farm.player.x, farm.player.y, 'farmer-down-0').setScale(1.08).setOrigin(.5, 1).setCollideWorldBounds(true);
    this.player.body!.setSize(14, 10).setOffset(17, 52);
    this.player.setVisible(false);
    this.actor = this.add.sprite(this.player.x, this.player.y - 2, 'farmer-down-0').setOrigin(.5, 62 / 64).setScale(1.08);
    this.workEffects = new WorkEffects(this);
    this.physics.add.collider(this.player, this.obstacles);
    // A saved spawn may become blocked if a future map changes.
    const inObstacle = this.obstacles.getChildren().some(o => { const b = (o as Phaser.GameObjects.Zone).body as Phaser.Physics.Arcade.StaticBody; return Phaser.Geom.Rectangle.Contains(new Phaser.Geom.Rectangle(b.x - 10, b.y - 10, b.width + 20, b.height + 20), this.player.x, this.player.y - 5); });
    if (inObstacle) this.player.setPosition(710, 650);
    this.select = this.add.rectangle(0, 0, 40, 40).setStrokeStyle(2, 0xf9edba, .85).setDepth(3).setVisible(false);
    this.aim = this.add.ellipse(0, 0, 20, 9).setStrokeStyle(2, 0xffe7a1, .8).setDepth(4).setVisible(false);
    this.cameras.main.setBounds(0, 0, 1600, 1200); this.cameras.main.startFollow(this.player, true, .09, .09, 0, 45);
    this.vignette = this.add.image(0, 0, 'vignette').setOrigin(0).setScrollFactor(0).setDepth(2400).setAlpha(.5);
    for (let i = 0; i < 3; i++) {
      const cloud = this.add.image(200 + i * 530, 300 + i * 210, 'cloud-shadow').setScale(2.7).setDepth(1500).setAlpha(.35);
      this.tweens.add({ targets: cloud, x: cloud.x + 230, duration: 38000 + i * 7000, yoyo: true, repeat: -1 });
    }
    for (let i = 0; i < 26; i++) {
      const pollen = this.add.rectangle(rand!.between(270, 1200), rand!.between(250, 980), i % 3 ? 2 : 3, 2, i % 3 ? 0xf3dc83 : 0xc1d483, .6).setDepth(1550);
      this.tweens.add({ targets: pollen, x: pollen.x + 35, y: pollen.y - 32, alpha: .1, duration: 4200 + i * 130, yoyo: true, repeat: -1, delay: i * 140 });
    }
    this.resize();
    this.scale.on('resize', this.resize, this);
    this.keys = this.input.keyboard!.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,E,ONE,TWO,THREE,FOUR') as Record<string, Phaser.Input.Keyboard.Key>;
    this.input.keyboard!.addCapture([Phaser.Input.Keyboard.KeyCodes.SPACE, Phaser.Input.Keyboard.KeyCodes.UP, Phaser.Input.Keyboard.KeyCodes.DOWN]);
    this.input.keyboard!.on('keydown', (e: KeyboardEvent) => { if (modal) return; const tools: Record<string, Tool> = { '1': 'hand', '2': 'hoe', '3': 'seed', '4': 'water' }; if (tools[e.key]) setTool(tools[e.key]); if (e.key.toLowerCase() === 'e' && !e.repeat) this.interactNearest(); });
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (modal) return;
      const p = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      const field = this.fields.find(f => Math.abs(f.x - p.x) < 20 && Math.abs(f.y - p.y) < 20);
      if (field) { this.navigate({ x: field.x + 42, y: field.y + 10, field: field.id }); return; }
      if (p.x > 930 && p.x < 1130 && p.y > 245 && p.y < 410) { this.navigate({ x: 1030, y: 425, shop: true }); return; }
      if (p.x > 960 && p.x < 1140 && p.y > 620 && p.y < 820) { this.navigate({ x: 1050, y: 840, barn: true }); return; }
      this.navigate({ x: Phaser.Math.Clamp(p.x, 105, 1480), y: Phaser.Math.Clamp(p.y, 190, 1070) });
    });
    window.addEventListener('blur', () => { this.finishCurrentWork(); this.cancelMovement(); });
    window.addEventListener('pagehide', () => { this.finishCurrentWork(); farm.player = { x: this.player.x, y: this.player.y }; save(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden) { this.finishCurrentWork(); this.cancelMovement(); farm.player = { x: this.player.x, y: this.player.y }; save(); } else this.paintFields(); });
    this.paintFields(); syncUI();
    this.time.delayedCall(1400, () => toast('Bem-vindo ao vale! Escolha a enxada para começar.'));
  }
  resize() { this.cameras.main.setZoom(this.scale.width < 600 ? 1.1 : this.scale.height < 560 ? .9 : 1.08); this.vignette?.setDisplaySize(this.scale.width, this.scale.height); }
  cancelMovement() { this.destination = null; this.queuedDestination = null; this.player?.setVelocity(0); this.input.keyboard?.resetKeys(); joystick.x = 0; joystick.y = 0; }
  paintFields() {
    const now = Date.now();
    for (const field of this.fields) {
      const plot = farm.plots[field.id];
      field.soil.setTexture(plot.wateredAt !== null ? 'plot-wet' : plot.tilled ? 'plot-tilled' : 'plot-raw');
      field.plant.setVisible(!!plot.crop);
      if (!plot.crop) { field.label.setVisible(false); continue; }
      const left = remaining(plot, now), progress = left === null ? 0 : 1 - left / (CROPS[plot.crop].seconds * 1000);
      const stage = left === 0 ? 3 : progress < .3 ? 0 : progress < .7 ? 1 : 2;
      field.plant.setTexture(`${plot.crop}-${stage}`);
      field.label.setText(left === null ? 'Gota?' : left === 0 ? 'COLHER' : `${Math.ceil(left / 1000)}s`).setVisible(left === 0 || left === null);
      if (left === null) field.label.setText('REGAR');
    }
  }
  navigate(target: Destination) {
    this.stuck = 0;
    if (this.activeWork) this.queuedDestination = target;
    else this.destination = target;
  }
  useField(id: number) {
    if (this.activeWork) return;
    this.focusedField = id;
    const check = act(structuredClone(farm), id, tool, selected);
    if (!check.ok) { toast(check.message); return; }
    const field = this.fields[id];
    const dx = field.x - this.player.x, dy = field.y - this.player.y;
    this.direction = Math.abs(dx) > 12 ? dx < 0 ? 'left' : 'right' : dy > 0 ? 'down' : 'up';
    this.activeWork = { clock: new ActionClock(tool, this.time.now), field: id, crop: selected };
    this.player.setVelocity(0);
  }
  commitWork(work: Work) {
    const result = act(farm, work.field, work.clock.tool, work.crop);
    toast(result.message);
    if (!result.ok) return;
    save(); syncUI(); this.paintFields();
    const target = this.fields[work.field];
    if (work.clock.tool === 'hoe') this.workEffects.dirt(target);
    else if (work.clock.tool === 'water') this.workEffects.wetSoil(target);
    else if (result.harvest) this.workEffects.harvest(target);
  }
  finishCurrentWork() {
    const work = this.activeWork;
    if (!work) return;
    work.clock.commitIfDue(this.time.now, () => this.commitWork(work), true);
    this.activeWork = null;
  }
  updateWork(time: number) {
    const work = this.activeWork;
    if (!work) return;
    const elapsed = work.clock.elapsed(time);
    if (work.clock.tool === 'water' && isPouring(elapsed)) {
      const frame = actionFrame('water', elapsed);
      const nozzle = nozzleAnchors.water[this.direction][frame];
      this.workEffects.pour({ x: this.player.x + (nozzle.x - 48) * 1.08, y: this.player.y - 2 + (nozzle.y - 100) * 1.08 }, this.fields[work.field], time);
    }
    work.clock.commitIfDue(time, () => this.commitWork(work));
    if (work.clock.finished(time)) { this.activeWork = null; this.destination = this.queuedDestination; this.queuedDestination = null; }
  }
  renderAvatar(time: number, moving: boolean) {
    const work = this.activeWork, equipped = work?.clock.tool ?? tool;
    const usingActionSheet = !!work && (equipped === 'hoe' || equipped === 'water');
    const elapsed = work?.clock.elapsed(time) ?? 0;
    const frame = moving ? Math.floor(time / 130) % 4 : 0;
    const bend = work && !usingActionSheet ? Math.sin(Math.min(1, elapsed / ACTIONS[equipped].duration) * Math.PI) : 0;
    const bob = (moving ? Math.sin(time / 65) * .65 : 0) + bend * 1.5;
    if (usingActionSheet) {
      this.actor.setTexture(`${equipped}-actions`, DIRECTION_ROW[this.direction] * 4 + actionFrame(equipped, elapsed)).setOrigin(.5, 100 / 112).setScale(1.08);
    } else if (equipped !== 'hand') {
      // Hands, grip and equipment are a single authored sprite in every frame.
      // No mirroring/pivot guesses or detached inventory icons during movement.
      this.actor.setTexture(`carry-${equipped}`, DIRECTION_ROW[this.direction] * 4 + frame).setOrigin(.5, 100 / 112).setScale(1.08, 1.08 * (1 - bend * .07));
    } else {
      this.actor.setTexture(`farmer-${this.direction}-${frame}`).setOrigin(.5, 62 / 64).setScale(1.08, 1.08 * (1 - bend * .07));
    }
    this.actor.setPosition(this.player.x, this.player.y - 2 + bob).setDepth(this.player.y);
    this.playerShadow.setPosition(this.player.x + 1, this.player.y - 3);
  }
  interactNearest() {
    if (modal || this.activeWork) return;
    if (Phaser.Math.Distance.Between(this.player.x, this.player.y, 1030, 425) < 85) { shop(); return; }
    if (Phaser.Math.Distance.Between(this.player.x, this.player.y, 1050, 840) < 85) { inventory(); return; }
    const target = choosePlot(farm, this.fields, this.player, tool, selected, this.focusedField);
    if (target !== null) this.useField(target);
    else toast('Aproxime-se de um canteiro, da venda ou do celeiro.');
  }
  update(time: number, delta: number) {
    if (!this.player) return;
    this.flock.update(time, delta); this.workEffects.update(time);
    if (this.activeWork) { this.updateWork(time); this.player.setVelocity(0); this.renderAvatar(time, false); return; }
    if (modal) { this.player.setVelocity(0); this.renderAvatar(time, false); return; }
    let vx = Number(this.keys.D.isDown || this.keys.RIGHT.isDown) - Number(this.keys.A.isDown || this.keys.LEFT.isDown) + joystick.x;
    let vy = Number(this.keys.S.isDown || this.keys.DOWN.isDown) - Number(this.keys.W.isDown || this.keys.UP.isDown) + joystick.y;
    if (vx || vy) this.destination = null;
    else if (this.destination) {
      const target = this.destination, dx = target.x - this.player.x, dy = target.y - this.player.y, distance = Math.hypot(dx, dy);
      if (distance < 8) {
        this.destination = null;
        if (target.field !== undefined) this.useField(target.field); else if (target.shop) shop(); else if (target.barn) inventory();
      } else { vx = dx / distance; vy = dy / distance; }
      if (Math.hypot(this.player.x - this.previous.x, this.player.y - this.previous.y) < .15) this.stuck += delta; else this.stuck = 0;
      if (this.stuck > 700) { this.destination = null; this.stuck = 0; toast('Tem algo no caminho. Contorne usando as setas ou o joystick.'); }
    }
    this.previous = { x: this.player.x, y: this.player.y };
    const length = Math.hypot(vx, vy), speed = 160;
    this.player.setVelocity(length ? vx / Math.max(1, length) * speed : 0, length ? vy / Math.max(1, length) * speed : 0);
    if (length > .1) { this.direction = Math.abs(vx) > Math.abs(vy) ? vx < 0 ? 'left' : 'right' : vy < 0 ? 'up' : 'down'; }
    this.renderAvatar(time, length > .1);
    if (this.activeWork) this.player.setVelocity(0);
    this.aim.setVisible(!!this.destination); if (this.destination) this.aim.setPosition(this.destination.x, this.destination.y);
    for (const tree of this.occluders) { const hidden = Math.abs(this.player.x - tree.x) < 60 && this.player.y < tree.y && this.player.y > tree.y - tree.displayHeight + 20; tree.setAlpha(hidden ? .42 : 1); }
    const pointer = this.input.activePointer, world = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
    const hover = this.fields.find(f => Math.abs(f.x - world.x) < 20 && Math.abs(f.y - world.y) < 20);
    this.select.setVisible(!!hover); if (hover) this.select.setPosition(hover.x, hover.y);
    if (time - this.lastPaint > 500) { this.paintFields(); this.lastPaint = time; }
    if (time - this.lastSave > 5000) { farm.player = { x: this.player.x, y: this.player.y }; save(); this.lastSave = time; }
  }
}

const stick = $('joystick'), knob = $('joystick-knob');
let stickPointer: number | null = null;
const moveStick = (e: PointerEvent) => { if (e.pointerId !== stickPointer) return; const r = stick.getBoundingClientRect(), radius = r.width / 2; const dx = e.clientX - r.left - radius, dy = e.clientY - r.top - radius, distance = Math.hypot(dx, dy), max = radius * .55; const scale = distance > max ? max / distance : 1; joystick = { x: dx * scale / max, y: dy * scale / max }; knob.style.transform = `translate(${dx * scale}px,${dy * scale}px)`; };
stick.addEventListener('pointerdown', e => { if (stickPointer !== null) return; stickPointer = e.pointerId; stick.setPointerCapture(e.pointerId); moveStick(e); });
stick.addEventListener('pointermove', moveStick);
const releaseStick = (e: PointerEvent) => { if (e.pointerId !== stickPointer) return; stickPointer = null; joystick = { x: 0, y: 0 }; knob.style.transform = ''; };
stick.addEventListener('pointerup', releaseStick); stick.addEventListener('pointercancel', releaseStick); stick.addEventListener('lostpointercapture', releaseStick);
$('touch-action').onclick = () => scene?.interactNearest();
syncUI();
const game = new Phaser.Game({ type: Phaser.AUTO, parent: 'game', backgroundColor: '#92ae69', pixelArt: true, roundPixels: true, antialias: false, scale: { mode: Phaser.Scale.RESIZE, width: window.innerWidth, height: window.innerHeight }, physics: { default: 'arcade', arcade: { debug: false } }, scene: [FarmScene], input: { activePointers: 3 }, render: { powerPreference: 'low-power' } });
window.addEventListener('error', () => { $('save-status').textContent = 'Ocorreu um erro. Recarregue para continuar.'; });
// Expose no account state or mutation hooks. The Phaser instance remains module-local.
void game;
