import {FISH,FISH_SPOT,nearFishing,fishingClearance,FISHING_COMMANDS,type Fish} from './fishing';
import {FishingView} from './fishing-view';
import {claimInteractionEvent} from './interaction-event';
import {OutdoorAnimals} from './outdoor-animals';
import {plantNeeds} from './plant-care';
import {display,saveDisplay,setAutomaticLight,lightEffects,type Effects} from './display-settings';
import {FrameBudget} from './frame-budget';
import {TimeLighting} from './time-lighting';
import {updateClock,AutoWake,clockText} from './time-ui';
import { setupJourney } from './journey';
import { setupLifeUI } from './life-ui';
import { applyLife } from './life-rules';
import {IdleBreathing} from './idle-art';
import { AvatarArt } from './avatar-art';
import { InteriorScene } from './interiors';
import { ANIMALS, DECOR, DECOR_SLOTS, type Avatar } from './content';
import Phaser from 'phaser';
import { CloudFarm } from './cloud';
import { setupOnlineUI } from './online-ui';
import { ECONOMY, levelOf, applyCommand, type OnlineFarm } from './online-rules';
import { findPath, type Point } from './pathfinding';
import { setupInstall } from './pwa';
import './style.css';
import './theme.css';
import './clean-hud.css';
import { createArt } from './art';
import { ACTIONS, ActionClock, actionFrame, DIRECTION_ROW, isPouring, type Direction } from './action-timing';
import { ChickenFlock } from './chickens';
import {entranceAt} from './entrances';
import {EntranceControl} from './entrance-ui';
import { DogCompanions } from './dog-companion';
import { Atmosphere } from './atmosphere';
import { plotPosition,plotUsable,reservedLandPoint,LAND_SITES } from './plots';
import {LandWorld} from './land-world';
import { LAND_SAVE_KEY,restoreLocalFarm,splitLocalFarm } from './local-farm';
import { WorkEffects } from './work-effects';
import nozzleAnchors from '../public/assets/v3/anchors.json';
import { choosePlot } from './interaction';
import { act, hasPests, buySeeds, CROPS, makeFarm, remaining, restoreFarm, SAVE_KEY, sellAll, type Crop, type Farm, type Tool,enableFarmCare } from './farm';

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const cloud = new CloudFarm();
let onlineLoading = false;
const hadLocalFarm=!!localStorage.getItem(SAVE_KEY);
let booting=true;
let journey:ReturnType<typeof setupJourney>;
const cropKeys = Object.keys(CROPS) as Crop[];
let farm: Farm;
let localSaveBlocked=false;
try { farm = restoreLocalFarm(localStorage.getItem(SAVE_KEY),localStorage.getItem(LAND_SAVE_KEY)); } catch { farm = restoreFarm(localStorage.getItem(SAVE_KEY)); localSaveBlocked=true; }
enableFarmCare(farm);
let selected: Crop = 'carrot', tool: Tool = 'hand', modal = false, toastTimer: ReturnType<typeof setTimeout>;
let joystick = { x: 0, y: 0 };
let scene: FarmScene;
let life:ReturnType<typeof setupLifeUI>;
let inside=false;
let entranceLockedUntil=0;
let currentInterior:'house'|'barn'|null=null;
let portraitSignature='';
function previewAvatar(a:Avatar){if(!scene?.previewArt)return '';const key=scene.previewArt.key('farmer-v2',a),image=scene.textures.get(key).getSourceImage() as HTMLCanvasElement;const c=document.createElement('canvas');c.width=48;c.height=64;c.getContext('2d')!.drawImage(image,0,0,48,64,0,0,48,64);return c.toDataURL();}
const dialog = $<HTMLDialogElement>('panel');
const menu = $<HTMLDialogElement>('game-menu');
function closeMenu(){menu.close();$('menu-toggle').setAttribute('aria-expanded','false');}
$('menu-toggle').onclick=()=>{if(menu.open){closeMenu();return;}scene?.cancelMovement();modal=true;joystick={x:0,y:0};$('joystick-knob').style.transform='';document.body.classList.add('modal-open');menu.showModal();$('menu-toggle').setAttribute('aria-expanded','true');};
$('close-menu').onclick=closeMenu;
menu.addEventListener('close',()=>{modal=dialog.open||document.body.classList.contains('journey-open');document.body.classList.toggle('modal-open',dialog.open);$('menu-toggle').setAttribute('aria-expanded','false');});
menu.addEventListener('click',e=>{if((e.target as HTMLElement).closest('[data-menu-actions] button'))closeMenu();},true);
menu.addEventListener('click',e=>{if(e.target===menu){const r=menu.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeMenu();}});
let activePanel: 'shop' | 'other' = 'other';
function toast(message: string) { $('toast').textContent = message; $('toast').classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('toast').classList.remove('show'), 4200); }
function save() {
  if (cloud.active || onlineLoading || booting || localSaveBlocked) return;
  try { const parts=splitLocalFarm(farm);if(parts.land!==null)localStorage.setItem(LAND_SAVE_KEY,parts.land);localStorage.setItem(SAVE_KEY,parts.core); $('save-status').textContent = 'Salvo neste aparelho'; $('save-dot').style.background = '#c4da8c'; }
  catch { $('save-status').textContent = 'Não foi possível salvar'; $('save-dot').style.background = '#e69f69'; }
}
function syncUI() {
  const appearance=JSON.stringify(farm.avatar);if(scene?.previewArt&&appearance!==portraitSignature){portraitSignature=appearance;const el=document.querySelector<HTMLElement>('.farm-mark')!;el.style.backgroundImage=`url(${previewAvatar(farm.avatar)})`;el.style.backgroundSize='43px 57px';el.style.backgroundPosition='center bottom';}
  $('account').textContent = cloud.active ? 'Minha conta' : 'Conta';
  $('day-label').textContent=cloud.active?cloud.name:(farm.playerName||'Um novo começo');
  $('online-bar').hidden = false;
  $('progression').hidden=!cloud.active;$('community').hidden=!cloud.active;
  if (cloud.active) { const f=farm as OnlineFarm; $('progression').textContent = `Nível ${levelOf(f.xp)} · Energia ${f.energy}/${ECONOMY.energyMax}`; }
  $('rod-tool').hidden=!farm.fishing?.rod||tool==='seed';
  $('seed-choice').hidden=tool!=='seed';
  $('quest-card').hidden=farm.questClaimed;
  $('coins').textContent = farm.coins.toLocaleString('pt-BR');
  $('seed-name').textContent = CROPS[selected].name; $('seed-icon').innerHTML = `<img src="${cropImage(selected)}" alt="" />`;
  $('seed-count').textContent = `×${farm.seeds[selected]}`;
  $('bag-count').textContent = String(cropKeys.reduce((sum, c) => sum + farm.inventory[c], 0)+Object.values(farm.products).reduce((a,b)=>a+b,0)+Object.values(farm.fishing?.fish??{}).reduce((a,b)=>a+b,0));
  if (!farm.questClaimed) { $('quest-text').textContent='Colha sua primeira plantação.'; $('quest-progress').textContent='0 / 1 colheita'; $('quest-fill').style.width='0%'; }
  if (farm.questClaimed) { $('quest-text').textContent = 'A primeira colheita a gente nunca esquece.'; $('quest-progress').textContent = 'Capítulo concluído'; $('quest-fill').style.width = '100%'; }
  document.querySelectorAll<HTMLButtonElement>('[data-tool]').forEach(b => { const active = b.dataset.tool === tool; b.classList.toggle('active', active); b.setAttribute('aria-pressed', String(active)); });
}
function setTool(next: Tool) { if(next==='rod'&&!farm.fishing?.rod)return;if(tool==='rod'&&next!=='rod')void scene?.fishingView?.cancel();tool = next; syncUI(); const hints: Record<Tool, string> = {rod:'', hand: 'Toque em uma planta pronta para colher.', hoe: 'Toque em um canteiro para preparar a terra.', seed: `Toque na terra preparada para plantar ${CROPS[selected].name.toLowerCase()}.`, water: 'Toque na plantação para regar e iniciar o crescimento.' }; $('hint').textContent = hints[tool]; }
function openPanel(title: string, content: string, kind: 'shop' | 'other' = 'other') {
  dialog.classList.remove('animal-detail');activePanel = kind; scene?.finishCurrentWork();
  modal = true; scene?.cancelMovement(); $('panel-eyebrow').textContent = 'UM POUQUINHO DE VIDA NO CAMPO'; $('panel-content').innerHTML = `<h2>${title}</h2>${content}`; document.body.classList.add('modal-open'); if (!dialog.open) dialog.showModal();
}
function closePanel() { dialog.close(); }
dialog.addEventListener('close', () => { modal = document.body.classList.contains('journey-open'); activePanel = 'other'; document.body.classList.remove('modal-open'); joystick = { x: 0, y: 0 }; $('joystick-knob').style.transform = ''; });
$('close-panel').onclick = closePanel;
dialog.addEventListener('cancel', e => { if (activePanel === 'shop') e.preventDefault(); });
dialog.addEventListener('click', e => { if (activePanel !== 'shop' && e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closePanel(); } });
function cropImage(c:Crop){return ['carrot','lettuce','tomato'].includes(c)?`/assets/v2/${c}-3.png`:`/assets/v5/${c}.png`;}
function inventory() {
  if(onlineLoading){toast('Aguarde a conexão com sua conta.');return;}
  const total = sellAll(structuredClone(farm));
  openPanel('Seu inventário', `<p>O que você cultiva com carinho fica guardado aqui. Venda a colheita e prepare o próximo plantio.</p>${cropKeys.map(c => `<div class="item-row"><span class="emoji"><img src="${cropImage(c)}" alt="" /></span><div class="item-info"><strong>${CROPS[c].name}</strong><small>${farm.inventory[c]} unidades · ${CROPS[c].sellPrice} moedas cada</small></div><strong>${farm.inventory[c] * CROPS[c].sellPrice} ◉</strong></div>`).join('')}${(['egg','milk','goatMilk'] as const).map(p=>{const a=Object.values(ANIMALS).find(a=>a.product===p)!;return `<div class="item-row"><div class="item-info"><strong>${a.productName}</strong><small>${farm.products[p]} unidades · ${a.sellPrice} moedas cada</small></div></div>`;}).join('')}${farm.fishing?.rod?'<div class="item-row"><img class="shop-art" src="/assets/v10/rod.svg" alt=""/><div class="item-info"><strong>Vara de pescar</strong></div><button id="equip-rod">Equipar</button></div>':''}${(Object.keys(FISH) as Fish[]).filter(k=>(farm.fishing?.fish[k]??0)>0).map(k=>`<div class="item-row"><div class="item-info"><strong>${FISH[k].name}</strong><small>${farm.fishing!.fish[k]} peixes · ${FISH[k].price} moedas cada</small></div></div>`).join('')}<button class="secondary" id="inventory-animals">Cuidar dos animais</button><button class="primary" id="sell-all" ${total === 0 ? 'disabled' : ''}>Vender colheita · ${total} moedas</button><p class="quiet-note">As sementes ficam guardadas separadamente e não são vendidas.</p>`);
  if($('equip-rod'))$('equip-rod').onclick=()=>{setTool('rod');closePanel();};
  $('inventory-animals').onclick=()=>life.animals();
  $('sell-all').onclick = async () => { if (cloud.active) { const b=$<HTMLButtonElement>('sell-all');b.disabled=true;try { const r=await cloud.command({type:'sell'});closePanel();toast(r.message!); }catch(e){toast((e as Error).message);b.disabled=false;} return; } const sold = sellAll(farm); save(); syncUI(); closePanel(); toast(`Colheita vendida: +${sold} moedas. Bom trabalho!`); };
}
function seedPanel() {
  openPanel('O que vamos plantar?', `<p>Escolha vegetais, frutas ou flores. Use a mão também para remover pragas quando aparecerem.</p>${cropKeys.map(c => `<div class="item-row"><span class="emoji"><img src="${cropImage(c)}" alt="" /></span><div class="item-info"><strong>${CROPS[c].name}</strong><small>${farm.seeds[c]} sementes · cresce em ${CROPS[c].seconds}s após regar</small></div><button class="choose-seed" data-crop="${c}">${selected === c ? 'Selecionada' : 'Escolher'}</button></div>`).join('')}`);
  document.querySelectorAll<HTMLButtonElement>('[data-crop]').forEach(b => b.onclick = () => { selected = b.dataset.crop as Crop; setTool('seed'); closePanel(); });
}
function shop(){life.shop();}
function help() { openPanel('Um novo começo', `<p>Bem-vindo ao Vale do Sossego. Aqui, um pedacinho de terra já é uma boa história.</p><ol class="controls-list"><li>Escolha a <b>enxada</b> e toque em um canteiro.</li><li>Selecione <b>Plantar</b> e use uma semente.</li><li>Use o <b>regador</b>. O crescimento começa agora.</li><li>Quando estiver pronta, use a <b>mão</b> para colher.</li><li>Abra o <b>celeiro</b> e venda sua colheita.</li></ol><p>No PC, ande com <b>WASD ou setas</b>. Use <b>E</b> para agir perto de um canteiro ou da venda. As teclas <b>1–5</b> trocam a ferramenta. Compre a vara na aba Pesca da venda e equipe-a para pescar na ponta da ponte. Recolha quando a boia sinalizar a fisgada. Você também pode clicar no terreno para caminhar. No celular, use o joystick ou toque no mapa.</p><p class="quiet-note"><b>Versão de testes 0.14.0:</b> use Conta para criar sua fazenda online e continuar em outro aparelho. Sem entrar, você joga no teste local deste navegador. Minha fazenda abre seu avatar, os animais e o jardim. Entre na casa e no celeiro para explorar. Use a mão para remover pragas. A conta libera ainda níveis, energia, expansão, amigos e feira. Compras e colheitas online precisam de conexão. As plantas regadas continuam crescendo ao fechar. A arte é provisória e original do projeto.</p><button class="primary" id="start-playing">Vamos plantar</button>`); $('start-playing').onclick = closePanel; }
$('inventory').onclick = inventory; $('seed-choice').onclick = seedPanel; $('help').onclick = help;
document.querySelectorAll<HTMLButtonElement>('[data-tool]').forEach(b => b.onclick = () => setTool(b.dataset.tool as Tool));

type Destination = {run?:()=>void; x: number; y: number; field?: number; shop?: boolean; barn?: boolean; house?:boolean;building?:string };
type Work = { clock: ActionClock; field: number; crop: Crop; ground?: Point };
type Field = { x: number; y: number; soil: Phaser.GameObjects.Image; plant: Phaser.GameObjects.Image; label: Phaser.GameObjects.Text; id: number };
class FarmScene extends Phaser.Scene {
  player!: Phaser.Physics.Arcade.Sprite;
  fields: Field[] = [];
  keys!: Record<string, Phaser.Input.Keyboard.Key>;
  obstacles!: Phaser.Physics.Arcade.StaticGroup;
  route: Point[] = [];
  destination: Destination | null = null;
  queuedDestination: Destination | null = null;
  activeWork: Work | null = null;
  actor!: Phaser.GameObjects.Sprite;
  flock!: ChickenFlock;private outdoor!:OutdoorAnimals;private collecting=false;
  private dogCompanions!: DogCompanions;
  private atmosphere!: Atmosphere;
  private timeLighting!:TimeLighting;
  avatarArt!:AvatarArt;
  previewArt!:AvatarArt;
  private decorSprites:Phaser.GameObjects.Image[]=[];
  private decorSignature='';
  workEffects!: WorkEffects;
  focusedField: number | null = null;
  direction: Direction = 'down'; walking = false; lastPaint = 0; lastSave = 0; stuck = 0; previous = { x: 0, y: 0 };
  ripples: Phaser.GameObjects.Rectangle[] = [];
  private entranceControl!:EntranceControl;
  private breathing=new IdleBreathing();
  private landWorld!:LandWorld;
  occluders: Phaser.GameObjects.Image[] = [];
  vignette!: Phaser.GameObjects.Image;
  playerShadow!: Phaser.GameObjects.Ellipse;
  aim!: Phaser.GameObjects.Ellipse;
  fishingView!:FishingView;
  vendor?:Phaser.GameObjects.Sprite;
  select!: Phaser.GameObjects.Rectangle;
  constructor() { super('Farm'); }
  preload() {
    this.load.on('progress', (value: number) => { $('loading-percent').textContent = `${Math.round(value * 100)}%`; });
    for (const key of ['house', 'barn', 'shop', 'mill', 'tree0', 'tree1', 'tree2', 'pine', 'well', 'rock', 'bush', 'fence']) {
      this.load.image(key, `/assets/v2/${key}.png`);
    }
    for(const key of ['bed','tv','sofa','window','wardrobe','rack','cow','goat','dog','chicken','strawberry','tulip','sunflower','corn','cocoaTree','flowerPlanter'])this.load.image(`life-${key}`,`/assets/v5/${key}.png`);
    for(const style of ['crop','puffs','short','braids'])for(const dir of ['down','left','right','up'])this.load.image(`head-${style}-${dir}`,`/assets/v5/head-${style}-${dir}.png`);
    for(const key of ['rooster','chick'])this.load.image(`life-${key}`,`/assets/v8/${key}.png`);
    this.load.image('farmer-v2', '/assets/v2/farmer.png');
    this.load.spritesheet('dog-walk','/assets/v7/dog-walk.png',{frameWidth:48,frameHeight:48});
    this.load.spritesheet('dog-rest','/assets/v7/dog-rest.png',{frameWidth:48,frameHeight:48});
    this.load.spritesheet('chickens-v3', '/assets/v3/chickens.png', { frameWidth: 40, frameHeight: 40 });
    for (const kind of ['hoe', 'water']) this.load.spritesheet(`${kind}-actions`, `/assets/v3/farmer-${kind}.png`, { frameWidth: 96, frameHeight: 112 });
    for (const key of ['hoe', 'seed', 'water']) this.load.spritesheet(`carry-${key}`, `/assets/v3/carry-${key}.png`, { frameWidth: 128, frameHeight: 112 });
    for (const crop of ['carrot','lettuce','tomato']) for (let stage = 0; stage < 4; stage++) this.load.image(`${crop}-${stage}`, `/assets/v2/${crop}-${stage}.png`);
  }
  create() {
    scene = this; createArt(this);this.avatarArt=new AvatarArt(this);this.previewArt=new AvatarArt(this);
    for(const crop of cropKeys.filter(c=>!['carrot','lettuce','tomato'].includes(c))){const image=this.textures.get(`life-${crop}`).getSourceImage() as HTMLImageElement;for(let stage=0;stage<4;stage++){const key=`${crop}-${stage}`;if(this.textures.exists(key))continue;const t=this.textures.createCanvas(key,36,40)!;const ctx=t.getContext();ctx.imageSmoothingEnabled=false;const scale=.35+stage*.216;const h=36*scale,w=Math.min(34,36*image.width/image.height)*scale;ctx.drawImage(image,(36-w)/2,39-h,w,h);t.refresh();}}
    $('loading').hidden = true;
    this.add.image(0, 0, 'terrain').setOrigin(0);
    this.physics.world.setBounds(90, 160, 1410, 930);
    this.obstacles = this.physics.add.staticGroup();
    const block = (x: number, y: number, w: number, h: number) => { const zone = this.add.zone(x, y, w, h); this.obstacles.add(zone); (zone.body as Phaser.Physics.Arcade.StaticBody).setSize(w, h); };
    const shadow = (x: number, y: number, w: number, h: number) => this.add.ellipse(x, y, w, h, 0x203726, .24).setDepth(2);
    shadow(415, 445, 214, 46); shadow(1030, 386, 170, 33); shadow(1050, 787, 154, 40);
    this.add.image(408, 451, 'house').setOrigin(.5, 1).setScale(1.35).setDepth(448); block(408, 400, 180, 88);
    this.add.image(1030, 390, 'shop').setOrigin(.5, 1).setScale(1.25).setDepth(386);
    const vendorArt=new AvatarArt(this),vendorAvatar={style:'short' as const,skin:3,hair:1,shirt:3};
    this.vendor=this.add.sprite(1030,352,vendorArt.idleKey('farmer-v2',vendorAvatar),0).setOrigin(.5,62/64).setScale(.95).setDepth(387);
    const shopImage=this.textures.get('shop').getSourceImage() as HTMLImageElement;
    for(const [y,h] of [[0,shopImage.height*.48],[shopImage.height*.69,shopImage.height*.31]])this.add.image(1030,390,'shop').setOrigin(.5,1).setScale(1.25).setCrop(0,y,shopImage.width,h).setDepth(388);
 block(1030, 350, 130, 65);
    this.add.image(1050, 795, 'barn').setOrigin(.5, 1).setScale(1.15).setDepth(790); block(1050, 752, 128, 80);
    this.add.image(493, 545, 'well').setOrigin(.5, 1).setScale(1.1).setDepth(545); block(493, 530, 44, 25);
    shadow(1120, 995, 150, 32);
    this.add.image(1120, 1000, 'mill').setOrigin(.5, 1).setScale(1.15).setDepth(995); block(1120, 973, 87, 48);
    for (let row = 0; row < 4; row++) for (let col = 0; col < 6; col++) {
      const x = 634 + col * 40, y = 434 + row * 40, id = row * 6 + col;
      const soil = this.add.image(x, y, 'plot-raw').setDepth(1);
      const plant = this.add.image(x, y + 11, 'carrot-0').setOrigin(.5, 1).setDepth(y + 2).setVisible(false);
      const text = this.add.text(x, y - 27, '', { fontFamily: 'monospace', fontSize: '10px', color: '#fff6ce', backgroundColor: '#40563ddd', padding: { x: 4, y: 2 } }).setOrigin(.5).setDepth(1800);
      this.fields.push({ x, y, id, soil, plant, label: text });
    }
    for(let id=24;id<60;id++) {const {x,y}=plotPosition(id,farm)??{x:0,y:0};
      const soil=this.add.image(x,y,'plot-raw').setDepth(1);
      const plant=this.add.image(x,y+11,'carrot-0').setOrigin(.5,1).setDepth(y+2).setVisible(false);
      const text=this.add.text(x,y-27,'',{fontFamily:'monospace',fontSize:'10px',color:'#fff6ce',backgroundColor:'#40563ddd',padding:{x:4,y:2}}).setOrigin(.5).setDepth(1800);
      this.fields.push({x,y,id,soil,plant,label:text});
    }
    this.landWorld=new LandWorld(this,this.obstacles);this.landWorld.update(farm);
    // Mixed woodland, original tiles and a clear playable center.
    const rand = Phaser.Math.RandomDataGenerator ? new Phaser.Math.RandomDataGenerator(['wj-vale']) : null;
    for (let y = 110; y <= 1110; y += 68) for (let x = 95; x < 1300; x += 64) {
      if (x > 220 && x < 1190 && y > 215 && y < 1000) continue;
      if (x > 680 && x < 820 && y > 930) continue;
      const px = x + (rand?.between(-16, 16) ?? 0), py = y + (rand?.between(-12, 12) ?? 0);
      if(reservedLandPoint(px,py)||fishingClearance(px,py))continue;
      const key = (x + y) % 3 === 0 ? 'pine' : `tree${(x + y) % 3}`;
      shadow(px + 10, py - 4, 88, 23);
      this.occluders.push(this.add.image(px, py, key).setOrigin(.5, 1).setScale(rand!.realInRange(1.12, 1.4)).setDepth(py));
      block(px, py - 9, 18, 20);
    }
    for (const [i, [x, y]] of [[190, 840], [330, 790], [535, 860], [940, 940], [1150, 540], [530, 280], [877, 260]].entries()) { if(reservedLandPoint(x,y)||fishingClearance(x,y))continue;shadow(x + 9, y - 2, 95, 24); this.occluders.push(this.add.image(x, y, `tree${i % 3}`).setOrigin(.5, 1).setScale(1.2).setDepth(y)); block(x, y - 9, 18, 20); }
    for (let i = 0; i < 6; i++) { const x = 350 + i * 48; this.add.image(x, 762, 'fence').setOrigin(.5, 1).setDepth(762); block(x, 755, 46, 9); }
    for (let i = 0; i < 4; i++) { this.add.image(350 + i * 48, 889, 'fence').setOrigin(.5, 1).setDepth(889); block(350 + i * 48, 882, 46, 9); }
    this.flock = new ChickenFlock(this,0);
    const windPlants:Phaser.GameObjects.Image[] = this.fields.map(f=>f.plant);
    for (let i = 0; i < 27; i++) { const x = rand!.between(250, 1190), y = rand!.between(280, 980); if (fishingClearance(x,y)||reservedLandPoint(x,y) || x > 580 && x < 900 && y < 620 || Math.abs(y - 640) < 50 || Math.abs(x - 750) < 50 || (x>200 && x<385 && y>500 && y<665)) continue; const foliage=this.add.image(x, y, i % 3 ? 'bush' : 'rock').setOrigin(.5, 1).setDepth(y);if(i%3)windPlants.push(foliage); }
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
    this.workEffects = new WorkEffects(this);this.outdoor=new OutdoorAnimals(this,()=>farm,()=>Date.now()+cloud.offset,id=>life.animals(id),id=>{if(this.collecting)return;this.collecting=true;void lifeCommand({type:'collect-animal',id}).then(r=>toast(r.message??'Coletado.')).catch(e=>toast(e.message)).finally(()=>this.collecting=false);});
    this.physics.add.collider(this.player, this.obstacles);
    this.dogCompanions = new DogCompanions(this, this.player, this.obstacles,this.flock.sprites());
    // A saved spawn may become blocked if a future map changes.
    const inObstacle = this.obstacles.getChildren().some(o => { const b = (o as Phaser.GameObjects.Zone).body as Phaser.Physics.Arcade.StaticBody; return Phaser.Geom.Rectangle.Contains(new Phaser.Geom.Rectangle(b.x - 10, b.y - 10, b.width + 20, b.height + 20), this.player.x, this.player.y - 5); });
    if (inObstacle) this.player.setPosition(710, 650);
    this.select = this.add.rectangle(0, 0, 40, 40).setStrokeStyle(2, 0xf9edba, .85).setDepth(3).setVisible(false);
    this.entranceControl=new EntranceControl(this,this.player,$<HTMLButtonElement>('enter-place'),e=>{this.cancelMovement();if(e.id==='shop')shop();else enterInterior(e.id);},()=>({inside,modal,working:!!this.activeWork,lockedUntil:entranceLockedUntil}));
    this.aim = this.add.ellipse(0, 0, 20, 9).setStrokeStyle(2, 0xffe7a1, .8).setDepth(4).setVisible(false);
    this.cameras.main.setBounds(0, 0, 1600, 1200); this.cameras.main.startFollow(this.player, true, .09, .09, 0, 45);
    this.vignette = this.add.image(0, 0, 'vignette').setOrigin(0).setScrollFactor(0).setDepth(2400).setAlpha(.1);
    const ambientDecor:(Phaser.GameObjects.Image|Phaser.GameObjects.Rectangle)[]=[...this.ripples];
    for (let i = 0; i < (this.scale.width<600?2:3); i++) {
      const cloud = this.add.image(200 + i * 530, 300 + i * 210, 'cloud-shadow').setScale(2.7).setDepth(1500).setAlpha(.1);
      ambientDecor.push(cloud);
      this.tweens.add({ targets: cloud, x: cloud.x + 230, duration: 38000 + i * 7000, yoyo: true, repeat: -1 });
    }
    for (let i = 0; i < (this.scale.width<600?8:18); i++) {
      const pollen = this.add.rectangle(rand!.between(270, 1200), rand!.between(250, 980), i % 3 ? 2 : 3, 2, i % 3 ? 0xf3dc83 : 0xc1d483, .6).setDepth(1550);
      ambientDecor.push(pollen);
      this.tweens.add({ targets: pollen, x: pollen.x + 35, y: pollen.y - 32, alpha: .1, duration: 4200 + i * 130, yoyo: true, repeat: -1, delay: i * 140 });
    }
    this.atmosphere = new Atmosphere(this,[...this.occluders,...windPlants],ambientDecor);
    this.timeLighting=new TimeLighting(this);
    this.fishingView=new FishingView(this,()=>farm,()=>Date.now()+cloud.offset,lifeCommand,toast);
    this.resize();
    this.scale.on('resize', this.resize, this);
    this.keys = this.input.keyboard!.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,E,ONE,TWO,THREE,FOUR') as Record<string, Phaser.Input.Keyboard.Key>;
    this.input.keyboard!.addCapture([Phaser.Input.Keyboard.KeyCodes.SPACE, Phaser.Input.Keyboard.KeyCodes.UP, Phaser.Input.Keyboard.KeyCodes.DOWN]);
    this.input.keyboard!.on('keydown', (e: KeyboardEvent) => { if (modal) return; const tools: Record<string, Tool> = { '1': 'hand', '2': 'hoe', '3': 'seed', '4': 'water','5':'rod' }; if(e.key==='Escape'&&farm.fishing?.cast){void this.fishingView.cancel();return;}if (tools[e.key]) setTool(tools[e.key]); if (e.key.toLowerCase() === 'e' && !inside && !e.repeat && claimInteractionEvent(e)) this.interactNearest(); });
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (modal) return;
      if(farm.fishing?.cast){void this.fishingView.use();return;}
      const p = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      if(tool==='rod'&&p.x>1300&&p.y>780&&p.y<930){this.navigate({...FISH_SPOT,run:()=>void this.fishingView.use()});return;}
      const animal=this.outdoor.hit(p);if(animal){this.navigate(animal);return;}
      const building=this.landWorld.buildingAt(farm,p);if(building){this.navigate({...this.landWorld.access(building),building:building.id});return;}
      const field = this.fields.find(f => Math.abs(f.x - p.x) < 20 && Math.abs(f.y - p.y) < 20);
      if (field) { if(!plotUsable(farm,field.id))return; const blocks=this.obstacles.getChildren().map(o=>{const b=(o as Phaser.GameObjects.Zone).body as Phaser.Physics.Arcade.StaticBody;return{x:b.x,y:b.y,width:b.width,height:b.height};});const approach=[[42,10],[-42,10],[0,45],[0,-45]].map(([dx,dy])=>({x:field.x+dx,y:field.y+dy,field:field.id})).find(p=>findPath(this.player,p,blocks).length);if(approach)this.navigate(approach);else toast('Não há passagem livre até esse canteiro.');return; }
      const entrance=entranceAt(p);if(entrance){this.navigate({x:entrance.x,y:entrance.y,[entrance.id]:true});return;}
      if (tool === 'water' && Math.hypot(p.x-this.player.x,p.y-this.player.y) <= 65) { this.waterGround(p); return; }
      this.navigate({ x: Phaser.Math.Clamp(p.x, 105, 1480), y: Phaser.Math.Clamp(p.y, 190, 1070) });
    });
    window.addEventListener('blur', () => { this.finishCurrentWork(); this.cancelMovement(); });
    window.addEventListener('pagehide', () => { this.finishCurrentWork(); farm.player = { x: this.player.x, y: this.player.y }; cloud.flushPosition(farm.player); save(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden) { this.finishCurrentWork(); this.cancelMovement(); farm.player = { x: this.player.x, y: this.player.y }; cloud.flushPosition(farm.player); save(); } else this.paintFields(); });
    this.paintFields(); syncUI();
    if(localSaveBlocked){$('save-status').textContent='Terreno salvo indisponível; salvamento pausado';toast('Não foi possível carregar o terreno salvo. Não altere os dados do navegador.');}
    void journey.start(hadLocalFarm);
  }
  resize() { this.cameras.main.setZoom(this.scale.width < 600 ? 1.1 : this.scale.height < 560 ? .9 : 1.08); this.vignette?.setDisplaySize(this.scale.width, this.scale.height); }
  cancelMovement() { this.destination = null; this.route = []; this.queuedDestination = null; this.player?.setVelocity(0); this.input.keyboard?.resetKeys(); joystick.x = 0; joystick.y = 0; }
  paintFields() {
    const now = Date.now() + (cloud.active ? cloud.offset : 0);
    const signature=JSON.stringify(farm.decorations);if(signature!==this.decorSignature){this.decorSprites.forEach(x=>x.destroy());this.decorSprites=[];this.decorSignature=signature;for(const d of farm.decorations){const slot=DECOR_SLOTS[d.slot],item=DECOR[d.kind];if(slot&&item)this.decorSprites.push(this.add.image(slot.x,slot.y,`life-${item.texture}`).setOrigin(.5,1).setDepth(slot.y).setScale(d.kind==='cocoaTree'?.85:.65));}}
    if(this.landWorld?.update(farm))this.dogCompanions?.invalidateObstacles();
    for(const b of farm.buildings??[]){const site=LAND_SITES[b.site],cx=site.x+b.col*40+20,cy=site.y+b.row*40+38;if(this.player&&Math.abs(this.player.x-cx)<43&&Math.abs(this.player.y-cy)<30){this.cancelMovement();const access=this.landWorld.access(b);this.player.setPosition(access.x,access.y);}}
    for (const field of this.fields) {
      const point=plotPosition(field.id,farm);const usable=plotUsable(farm,field.id);field.soil.setVisible(!!point&&usable);if(!point||!usable){field.plant.setVisible(false);field.label.setVisible(false);continue;}field.x=point.x;field.y=point.y;field.soil.setPosition(point.x,point.y);field.plant.setPosition(point.x,point.y+11).setDepth(point.y+2);field.label.setPosition(point.x,point.y-27);
      const plot = farm.plots[field.id];
      if ((field.id>=24&&(!farm.landOwned||!plot))||(cloud.active && field.id<24 && field.id >= (farm as OnlineFarm).unlockedPlots)) { field.soil.setTexture('plot-raw').setAlpha(.35);field.plant.setVisible(false);field.label.setText('Bloqueado').setVisible(false);continue; }
      field.soil.setAlpha(1);
      field.soil.setTexture(plot.wateredAt !== null ? 'plot-wet' : plot.tilled ? 'plot-tilled' : 'plot-raw');
      field.plant.setVisible(!!plot.crop);
      if (!plot.crop) { field.label.setText('').setVisible(false); continue; }
      const left = remaining(plot, now), progress = left === null ? 0 : 1 - left / (CROPS[plot.crop].seconds * 1000);
      const stage = left === 0 ? 3 : progress < .3 ? 0 : progress < .7 ? 1 : 2;
      field.plant.setTexture(`${plot.crop}-${stage}`);
      field.label.setText(left === null ? 'Gota?' : left === 0 ? 'COLHER' : `${Math.ceil(left / 1000)}s`).setVisible(left === 0 || left === null);
      if (left === null) field.label.setText('REGAR');
      const needs=plantNeeds(plot,now);field.plant.setTint(needs.sick?0xaaa08b:needs.dry?0xbcb36e:0xffffff);if(hasPests(plot,now))field.label.setText('PRAGAS').setVisible(true);if(needs.dry)field.label.setText('REGAR').setVisible(true);if(needs.sick)field.label.setText('TRATAR').setVisible(true);
    }
    this.contextLabels();
  }
  private nextContext=0;
  private contextLabels(){
    for(const f of this.fields)f.label.setVisible(false);
    if(this.player)this.landWorld?.hints(this.player,!modal&&!inside);
  }
  navigate(target: Destination) {
    this.stuck = 0;
    if (this.activeWork) { this.queuedDestination = target; return; }
    const obstacles = this.obstacles.getChildren().map(o => { const b=(o as Phaser.GameObjects.Zone).body as Phaser.Physics.Arcade.StaticBody;return {x:b.x,y:b.y,width:b.width,height:b.height}; });
    this.route = findPath(this.player,target,obstacles);
    if (!this.route.length) { this.destination=null;toast('Passagem bloqueada.');return; }
    this.destination = target;
  }
  useField(id: number) {
    if(tool==='rod')return;
    if (this.activeWork || onlineLoading || cloud.busy) return;
    if(id>=24&&!plotUsable(farm,id)){if(!localSaveBlocked)life.land();else toast('Terreno salvo indisponível.');return;}
    if (Math.hypot(this.player.x-this.fields[id].x,this.player.y-this.fields[id].y)>70) {toast('Fora de alcance.');return;}
    this.focusedField = id;
    const check = cloud.active ? applyCommand(structuredClone(farm) as OnlineFarm,{type:'work',plot:id,tool,crop:selected},Date.now()+cloud.offset) : act(structuredClone(farm), id, tool, selected);
    if (!check.ok) { toast(check.message); return; }
    const field = this.fields[id];
    const dx = field.x - this.player.x, dy = field.y - this.player.y;
    this.direction = Math.abs(dx) > 12 ? dx < 0 ? 'left' : 'right' : dy > 0 ? 'down' : 'up';
    this.activeWork = { clock: new ActionClock(tool, this.time.now), field: id, crop: selected };
    this.player.setVelocity(0);
  }
  commitWork(work: Work) {
    if (work.ground) { this.workEffects.wetSoil(work.ground); return; }
    if (cloud.active) {
      void cloud.command({type:'work',plot:work.field,tool:work.clock.tool,crop:work.crop},{x:this.player.x,y:this.player.y}).then(result=>{const target=this.fields[work.field];if(work.clock.tool==='hoe')this.workEffects.dirt(target);else if(work.clock.tool==='water')this.workEffects.wetSoil(target);else if(result.harvest)this.workEffects.harvest(target);}).catch(error=>toast(error.message));
      return;
    }
    const result = act(farm, work.field, work.clock.tool, work.crop);
    if (!result.ok) {toast(result.message);return;}
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
      this.workEffects.pour({ x: this.player.x + (nozzle.x - 48) * 1.08, y: this.player.y - 2 + (nozzle.y - 100) * 1.08 }, work.ground ?? this.fields[work.field], time);
    }
    work.clock.commitIfDue(time, () => this.commitWork(work));
    if (work.clock.finished(time)) { this.activeWork = null; const next=this.queuedDestination;this.queuedDestination=null;if(next)this.navigate(next); }
  }
  buildingAccess(b:NonNullable<Farm['buildings']>[number]){return this.landWorld.access(b);}
  careHeart(id:string){const p=this.outdoor.contact(id);if(!p)return;const heart=this.add.text(p.x,p.y-45,'♥',{fontFamily:'monospace',fontSize:'18px',color:'#f0a47e',stroke:'#4e4734',strokeThickness:2}).setDepth(p.y+2);this.tweens.add({targets:heart,y:p.y-67,alpha:0,duration:1100,onComplete:()=>heart.destroy()});}
  tendPlot(id:number,next:Tool){const field=this.fields.find(f=>f.id===id);if(!field)return;setTool(next);const blocks=this.obstacles.getChildren().map(o=>{const b=(o as Phaser.GameObjects.Zone).body as Phaser.Physics.Arcade.StaticBody;return{x:b.x,y:b.y,width:b.width,height:b.height};});const target=[[42,10],[-42,10],[0,45],[0,-45]].map(([dx,dy])=>({x:field.x+dx,y:field.y+dy,field:id})).find(p=>findPath(this.player,p,blocks).length);if(target)this.navigate(target);else toast('Não há passagem livre.');}
  renderAvatar(time: number, moving: boolean) {
    const work = this.activeWork, equipped = work?.clock.tool ?? (tool==='rod'?'hand':tool);
    const usingActionSheet = !!work && (equipped === 'hoe' || equipped === 'water');
    const elapsed = work?.clock.elapsed(time) ?? 0;
    const idle=!moving&&!work,phase=this.breathing.frame(time,moving,!!work,!display.breathing);
    const frame = moving ? Math.floor(time / 130) % 4 : phase;
    const bend = work && !usingActionSheet ? Math.sin(Math.min(1, elapsed / ACTIONS[equipped].duration) * Math.PI) : 0;
    const bob = (moving ? Math.sin(time / 65) * .65 : 0) + bend * 1.5;
    if (usingActionSheet) {
      this.actor.setTexture(this.avatarArt.key(`${equipped}-actions`,farm.avatar), DIRECTION_ROW[this.direction] * 4 + actionFrame(equipped, elapsed)).setOrigin(.5, 100 / 112).setScale(1.08);
    } else if (equipped !== 'hand') {
      // Hands, grip and equipment are a single authored sprite in every frame.
      // No mirroring/pivot guesses or detached inventory icons during movement.
      this.actor.setTexture((idle?this.avatarArt.idleKey(`carry-${equipped}`,farm.avatar):this.avatarArt.key(`carry-${equipped}`,farm.avatar)), DIRECTION_ROW[this.direction] * 4 + frame).setOrigin(.5, 100 / 112).setScale(1.08, 1.08 * (1 - bend * .07));
    } else {
      this.actor.setTexture((idle?this.avatarArt.idleKey('farmer-v2',farm.avatar):this.avatarArt.key('farmer-v2',farm.avatar)),DIRECTION_ROW[this.direction]*4+frame).setOrigin(.5, 62 / 64).setScale(1.08, 1.08 * (1 - bend * .07));
    }
    this.actor.setPosition(this.player.x, this.player.y - 2 + bob).setDepth(this.player.y);
    this.playerShadow.setPosition(this.player.x + 1, this.player.y - 3);
  }
  waterGround(point: Point) {
    if (this.activeWork || modal) return;
    const dx=point.x-this.player.x,dy=point.y-this.player.y;
    this.direction=Math.abs(dx)>Math.abs(dy)?dx<0?'left':'right':dy<0?'up':'down';
    this.activeWork={clock:new ActionClock('water',this.time.now),field:-1,crop:selected,ground:point};
    this.player.setVelocity(0);
  }
  enterNearbyPlace(){return this.entranceControl.enter();}
  interactNearest() {
    if (modal || this.activeWork || performance.now()<entranceLockedUntil) return;
    if(tool==='rod'){if(nearFishing(this.player))void this.fishingView.use();return;}
    if(this.enterNearbyPlace())return;
    const cropDistance=this.fields.filter(f=>farm.plots[f.id]?.crop&&Math.hypot(f.x-this.player.x,f.y-this.player.y)<65).reduce((d,f)=>Math.min(d,Math.hypot(f.x-this.player.x,f.y-this.player.y)),Infinity);
    if(tool==='hand'&&this.outdoor.distance(this.player)<cropDistance&&this.outdoor.interact(this.player))return;
    const available = cloud.active ? this.fields.filter(f=>plotUsable(farm,f.id)&&(f.id>=24||f.id<(farm as OnlineFarm).unlockedPlots)) : this.fields.filter(f=>plotUsable(farm,f.id));
    const target = choosePlot(farm, available, this.player, tool, selected, this.focusedField, Date.now() + cloud.offset);
    if (target !== null) this.useField(target);
    else if(tool==='water') { const offsets={up:[0,-40],down:[0,40],left:[-40,0],right:[40,0]};const [dx,dy]=offsets[this.direction];this.waterGround({x:this.player.x+dx,y:this.player.y+dy}); }

  }
  update(time: number, delta: number) {
    if (!this.player) return;
    this.timeLighting.update(farm.calendar,Date.now()+cloud.offset);
    this.vendor?.setFrame(Math.floor(time/600)%3);
    this.fishingView.update(this.player,this.direction,tool==='rod',modal||inside);
    if(farm.home?.sleep&&!inside&&!modal){enterInterior('house');return;}
    this.entranceControl.update();
    if(time>=this.nextContext){this.nextContext=time+100;this.contextLabels();}
    this.outdoor.update(time);this.flock.update(time, delta); this.dogCompanions.update(farm); this.atmosphere.update(time); this.workEffects.update(time);
    if(farm.fishing?.cast&&Date.now()+cloud.offset<=farm.fishing.cast.expiresAt){this.cancelMovement();this.direction='right';this.renderAvatar(time,false);return;}
    if (this.activeWork) { this.updateWork(time); this.player.setVelocity(0); this.renderAvatar(time, false); return; }
    if (modal) { this.player.setVelocity(0); this.renderAvatar(time, false); return; }
    let vx = Number(this.keys.D.isDown || this.keys.RIGHT.isDown) - Number(this.keys.A.isDown || this.keys.LEFT.isDown) + joystick.x;
    let vy = Number(this.keys.S.isDown || this.keys.DOWN.isDown) - Number(this.keys.W.isDown || this.keys.UP.isDown) + joystick.y;
    if (vx || vy) { this.destination = null;this.route=[]; }
    else if (this.destination) {
      const target = this.destination,waypoint=this.route[0]??target,dx=waypoint.x-this.player.x,dy=waypoint.y-this.player.y,distance=Math.hypot(dx,dy);
      if(distance<8&&this.route.length>1){this.route.shift();return;}
      if (distance < 8) {
        this.destination = null;
        if (target.field !== undefined) this.useField(target.field); else if (target.shop) shop(); else if (target.barn) enterInterior('barn');else if(target.house)enterInterior('house');else if(target.building){const b=farm.buildings?.find(b=>b.id===target.building);if(b?.kind==='shed')life.equipment();else if(b&&['coop','pasture'].includes(b.kind))life.enclosure(b.id);else if(b)openPanel('Coreto do jardim','<p>Seu cantinho para descansar e aproveitar a fazenda.</p>');}target.run?.();
      } else { vx = dx / distance; vy = dy / distance; }
      if (Math.hypot(this.player.x - this.previous.x, this.player.y - this.previous.y) < .15) this.stuck += delta; else this.stuck = 0;
      if (this.stuck > 700) { this.destination = null; this.stuck = 0; this.route=[];toast('Passagem bloqueada.'); }
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
    if (time - this.lastSave > 5000) { if (cloud.active) { const p={x:this.player.x,y:this.player.y};if(!cloud.busy&&Math.hypot(p.x-farm.player.x,p.y-farm.player.y)>20)void cloud.command({type:'position'},p).catch(()=>{}); } else {farm.player={x:this.player.x,y:this.player.y};save();} this.lastSave=time; }
  }
}

const stick = $('joystick'), knob = $('joystick-knob');
let stickPointer: number | null = null;
const moveStick = (e: PointerEvent) => { if (e.pointerId !== stickPointer) return; const r = stick.getBoundingClientRect(), radius = r.width / 2; const dx = e.clientX - r.left - radius, dy = e.clientY - r.top - radius, distance = Math.hypot(dx, dy), max = radius * .55; const scale = distance > max ? max / distance : 1; joystick = { x: dx * scale / max, y: dy * scale / max }; knob.style.transform = `translate(${dx * scale}px,${dy * scale}px)`; };
stick.addEventListener('pointerdown', e => { if (stickPointer !== null) return; stickPointer = e.pointerId; stick.setPointerCapture(e.pointerId); moveStick(e); });
stick.addEventListener('pointermove', moveStick);
const releaseStick = (e: PointerEvent) => { if (e.pointerId !== stickPointer) return; stickPointer = null; joystick = { x: 0, y: 0 }; knob.style.transform = ''; };
stick.addEventListener('pointerup', releaseStick); stick.addEventListener('pointercancel', releaseStick); stick.addEventListener('lostpointercapture', releaseStick);
$('fish-action').onclick=()=>{if(!inside&&!modal)void scene.fishingView.use();};
$('enter-place').onclick = () => { if(!scene?.enterNearbyPlace()&&!inside&&!modal)toast('Fora de alcance.'); };
$('touch-action').onclick = () => inside ? (game.scene.getScene('Interior') as InteriorScene).interact() : scene?.interactNearest();
cloud.onStatus=message=>{ $('save-status').textContent=message;$('save-dot').style.background=message.includes('sincronizado')?'#c4da8c':'#e69f69'; };
cloud.onSnapshot=(snapshot,initial)=>{ farm=snapshot.farm;if(initial&&scene?.player){scene.finishCurrentWork();scene.cancelMovement();scene.player.setPosition(farm.player.x,farm.player.y);}syncUI();scene?.paintFields(); };
setupOnlineUI(cloud,openPanel,closePanel,toast,()=>farm as OnlineFarm,()=>{farm=restoreLocalFarm(localStorage.getItem(SAVE_KEY),localStorage.getItem(LAND_SAVE_KEY));scene?.cancelMovement();scene?.player.setPosition(farm.player.x,farm.player.y);scene?.paintFields();syncUI();save();},()=>journey.show());
async function lifeCommand(c:any){
 if(onlineLoading)throw new Error('Aguarde a conexão com sua conta.');
 if((FISHING_COMMANDS as readonly string[]).includes(c.type)&&c.type!=='buy-rod'){if(inside)throw new Error('Pesca disponível no rio.');if(cloud.active)return cloud.command(c,{x:scene.player.x,y:scene.player.y});farm.player={x:scene.player.x,y:scene.player.y};}
 if(cloud.active)return cloud.command(c);
 const result=c.type==='buy'?{ok:buySeeds(farm,c.crop),message:'+5 sementes guardadas!'}:applyLife(farm,c,Date.now());
 if(!result.ok)throw new Error(result.message||'Moedas insuficientes.');save();syncUI();scene?.paintFields();return result;
}
function finishInteriorExit(){entranceLockedUntil=performance.now()+600;currentInterior=null;inside=false;$('hint').hidden=false;setTool(tool);$('exit-interior').hidden=true;$('interior-view').hidden=true;$('world-place').textContent='VALE DO SOSSEGO';scene.cancelMovement();}
function recoverInterior(error:Error,room:'house'|'barn'){
 game.scene.stop('Interior');game.scene.wake('Farm');finishInteriorExit();
 openPanel('Não foi possível abrir o cômodo',`<p>A fazenda foi recuperada e seu progresso foi mantido.</p><p>Detalhe da falha:</p><pre id="room-error-detail" style="white-space:pre-wrap;overflow-wrap:anywhere"></pre><button class="primary" id="retry-room">Tentar entrar novamente</button><button class="secondary" id="continue-farm">Continuar na fazenda</button>`);
 $('room-error-detail').textContent=`v0.14.0 · ${room==='barn'?'Celeiro':'Casa'} · ${error.name}: ${error.message}`;
 $('retry-room').onclick=()=>{closePanel();entranceLockedUntil=0;enterInterior(room);};$('continue-farm').onclick=closePanel;
}
function enterInterior(room:'house'|'barn'){
 if(farm.home?.sleep&&room!=='house'){toast('Aguarde a personagem acordar.');return;}
 if(performance.now()<entranceLockedUntil||(inside&&currentInterior===room))return;entranceLockedUntil=performance.now()+600;
 if(inside)game.scene.stop('Interior');else{scene.finishCurrentWork();scene.cancelMovement();game.scene.sleep('Farm');}
 currentInterior=room;
 inside=true;$('hint').hidden=true;$('enter-place').hidden=true;$('hint').textContent='Toque no cômodo para andar. Use E ou Usar perto dos objetos.';$('exit-interior').hidden=false;$('interior-view').hidden=false;$('interior-view').textContent=room==='barn'?'Aproximar':'Ver cômodo inteiro';$('world-place').textContent=room==='house'?'SUA CASA':'SEU CELEIRO';game.scene.start('Interior',{room});
}
async function bondAnimal(id:string,type:'pet-animal'|'play-animal'){
 closePanel();const animal=farm.animals.find(a=>a.id===id);if(animal?.housing&&animal.housing!=='barn'){if(inside)(game.scene.getScene('Interior') as InteriorScene).exitRoom();if(inside)throw new Error('Aguarde a personagem acordar.');const b=farm.buildings?.find(b=>b.id===animal.housing);if(!b)throw new Error('Instalação não encontrada.');scene.navigate({...scene.buildingAccess(b),run:()=>{void lifeCommand({type,id}).then(()=>{scene.careHeart(id);toast(type==='play-animal'?'Brincadeira realizada.':'Carinho realizado.');}).catch(e=>toast(e.message));}});return;}if(performance.now()<entranceLockedUntil)throw new Error('Aguarde a entrada no cômodo terminar.');const interior=game.scene.getScene('Interior') as InteriorScene;
 if(!inside||interior.getRoom()!=='barn'){
  const created=new Promise<void>(resolve=>interior.events.once('create',()=>resolve()));enterInterior('barn');await created;
 }
 await interior.bond(id,type);
}
life=setupLifeUI({farm:()=>farm,online:()=>cloud.active,now:()=>Date.now()+cloud.offset,open:openPanel,close:closePanel,command:lifeCommand,enter:enterInterior,equip:setTool,bond:bondAnimal,tendPlot:(id,next)=>{if(inside)(game.scene.getScene('Interior') as InteriorScene).exitRoom();if(!inside)scene.tendPlot(id,next);else toast('Aguarde a personagem se levantar.');},toast,preview:previewAvatar});
setupInstall(toast);
journey=setupJourney({cloud,farm:()=>farm,preview:previewAvatar,block:active=>{modal=active;onlineLoading=active;scene?.cancelMovement();},entered:()=>{booting=false;onlineLoading=false;syncUI();},toast});
setInterval(()=>{if(!document.hidden)void cloud.refresh();},15000);
window.addEventListener('online',()=>{if(cloud.active)void cloud.retryPending().then(()=>cloud.refresh()).catch(()=>{});});
window.addEventListener('focus',()=>void cloud.refresh());
syncUI();
const game = new Phaser.Game({ type: Phaser.AUTO, parent: 'game', backgroundColor: '#92ae69', pixelArt: true, roundPixels: true, antialias: false, scale: { mode: Phaser.Scale.RESIZE, width: window.innerWidth, height: window.innerHeight }, physics: { default: 'arcade', arcade: { debug: false } }, scene: [FarmScene], input: { activePointers: 3 }, fps:{target:60},render: { powerPreference: 'high-performance' } });
const frameBudget=new FrameBudget();let frameStart=0;
game.events.on('prestep',()=>{frameStart=performance.now();});
document.addEventListener('visibilitychange',()=>frameBudget.reset());
game.events.on('postrender',()=>{if(frameBudget.tick(performance.now(),!document.hidden&&!booting,performance.now()-frameStart)){setAutomaticLight(frameBudget.light);const reading=document.getElementById('performance-reading');if(reading)reading.textContent=`${frameBudget.fps<10?frameBudget.fps.toFixed(1):Math.round(frameBudget.fps)} FPS medidos · quadro p95 ${frameBudget.p95.toFixed(1)} ms · CPU p95 ${frameBudget.cpu95.toFixed(1)} ms.`;}});
$('frame-rate').onclick=()=>{openPanel('Desempenho e animação',`<p id="performance-reading">${frameBudget.fps<10?frameBudget.fps.toFixed(1):Math.round(frameBudget.fps)} FPS medidos · quadro p95 ${frameBudget.p95.toFixed(1)} ms · CPU p95 ${frameBudget.cpu95.toFixed(1)} ms.</p><p>A meta é 60 FPS (16,7 ms por quadro). O resultado depende do aparelho e do navegador.</p><label>Efeitos do cenário <select id="effects-setting"><option value="auto">Automático</option><option value="full">Completos</option><option value="light">Leves</option></select></label><p>O modo leve reduz efeitos decorativos e mantém personagem, ferramentas e regras da fazenda.</p><label><input id="breathing-setting" type="checkbox" ${display.breathing?'checked':''}/> Respiração da personagem</label><p class="quiet-note">Noite mais clara em todos os modos. A respiração usa quadros de pixel art, sem mudar colisões.</p>`);
 const effects=$<HTMLSelectElement>('effects-setting');effects.value=display.effects;effects.onchange=()=>{display.effects=effects.value as Effects;saveDisplay();};$<HTMLInputElement>('breathing-setting').onchange=e=>{display.breathing=(e.target as HTMLInputElement).checked;saveDisplay();};};
window.addEventListener('error', event => { $('save-status').textContent = 'Ocorreu um erro. Recarregue para continuar.';if(inside){const room=currentInterior??'barn',error=event.error instanceof Error?event.error:new Error(event.message);queueMicrotask(()=>{recoverInterior(error,room);game.loop.wake();});} });
// Expose no account state or mutation hooks. The Phaser instance remains module-local.
game.scene.add('Interior',new InteriorScene({farm:()=>farm,stick:()=>joystick,modal:()=>modal,tool:()=>tool,now:()=>Date.now()+cloud.offset,avatar:()=>life.avatar(),animals:id=>life.animals(id),equipment:()=>life.equipment(),care:lifeCommand,home:lifeCommand,collect:id=>lifeCommand({type:'collect-animal',id}).then(r=>{toast(r.message??'Produto coletado.');return r;}),toast,open:openPanel,exit:finishInteriorExit,failed:recoverInterior}),false);
$('exit-interior').onclick=()=>{if(inside)(game.scene.getScene('Interior') as InteriorScene).exitRoom();};
void game;

$('interior-view').onclick=()=>{const overview=(game.scene.getScene('Interior') as InteriorScene).toggleView();$('interior-view').textContent=overview?'Aproximar':'Ver cômodo inteiro';};

const automaticWake=new AutoWake();
setInterval(()=>{
 const now=Date.now()+cloud.offset,t=clockText(farm,now);updateClock($('world-clock'),farm,now);$('season-label').textContent=t.season;
 if(!booting&&!onlineLoading&&!localSaveBlocked)automaticWake.update(farm,now,c=>lifeCommand(c).then(r=>{toast(r.message??'Bom dia!');return r;}));
},500);
