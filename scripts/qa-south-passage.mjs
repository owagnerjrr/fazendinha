import assert from 'node:assert/strict';
const{chromium}=await import(process.env.PLAYWRIGHT_MODULE??'playwright');
const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
try{for(const width of [1280,390]){
 const page=await browser.newPage({viewport:{width,height:900},hasTouch:width===390,isMobile:width===390}),errors=[];
 page.on('pageerror',e=>errors.push(e.stack));
 await page.route('**/src/journey.ts*',r=>r.fulfill({contentType:'text/javascript',body:'export function setupJourney(s){return{start:async()=>{s.block(false);s.entered()},show(){},acceptAccount(){}}}'}));
 await page.route('**/src/main.ts*',async r=>{const response=await r.fetch();await r.fulfill({response,body:await response.text()+'\nwindow.southQA={game,cloud,startVisit,activeVisit,get farm(){return farm},get scene(){return scene}};'});});
 await page.goto(process.env.QA_BASE??'http://127.0.0.1:5173');await page.waitForFunction(()=>window.southQA?.scene?.player);
 await page.evaluate(async()=>{
  const q=window.southQA,{applyLife}=await import('/src/life-rules.ts');q.positions=[];q.calls=[];q.host=structuredClone(q.farm);
  const snapshot=()=>({farm:q.farm,revision:q.cloud.revision,now:Date.now(),code:'VISITOR001'});
  const valid=p=>{if(p&&(!Number.isFinite(p.x)||!Number.isFinite(p.y)||p.x<100||p.x>1480||p.y<180||p.y>1090))throw Error('Posição inválida como no servidor: '+p.y);};
  const hostView=()=>({...q.host,name:'Amigo QA',code:'HOSTCODE33',now:Date.now(),unlockedPlots:24,protected:false});
  q.cloud.active=true;q.cloud.code='VISITOR001';
  q.cloud.request=async(path,body)=>{if(path.includes('presence')){if(body&&!body.leave){valid(body);q.positions.push({...body});}return{players:[]};}return path.includes('visit')?hostView():snapshot();};
  q.cloud.command=async(c,position)=>{valid(position);q.calls.push({c,position});if(position)q.farm.player={x:position.x,y:position.y};if(c.type==='position')return snapshot();const result=applyLife(q.farm,c,Date.now());if(!result.ok)throw Error(result.message);q.cloud.revision++;q.cloud.accept(snapshot());return{...snapshot(),...result};};
 });
 const move=async(direction,ms)=>{
  if(width===1280){await page.keyboard.down(direction==='south'?'ArrowDown':'ArrowUp');await page.waitForTimeout(ms);await page.keyboard.up(direction==='south'?'ArrowDown':'ArrowUp');}
  else{const box=await page.locator('#joystick').boundingBox();assert.ok(box,'joystick visible');const x=box.x+box.width/2,y=box.y+box.height/2;await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x,y+(direction==='south'?38:-38));await page.waitForTimeout(ms);await page.mouse.up();}
 };
 await move('south',3300);
 const own=await page.evaluate(()=>window.southQA.scene.presencePosition());assert.ok(own.y>1000&&own.y<=1090,JSON.stringify(own));
 await page.locator('#enter-place').click();await page.waitForFunction(()=>window.southQA.game.scene.isActive('Expansion'));
 await move('north',500);await page.locator('#enter-place').click();await page.waitForFunction(()=>window.southQA.game.scene.isActive('Farm'));
 await page.evaluate(()=>{const q=window.southQA;q.startVisit('HOSTCODE33',{...q.host,name:'Amigo QA',code:'HOSTCODE33',now:Date.now(),unlockedPlots:24,protected:false});});await page.waitForTimeout(300);
 await move('south',3300);const friend=await page.evaluate(()=>window.southQA.activeVisit().presencePosition());assert.ok(friend.y>1000&&friend.y<=1090,JSON.stringify(friend));
 await page.locator('#enter-place').click();await page.waitForFunction(()=>window.southQA.game.scene.isActive('VisitExpansion'));
 await move('north',500);await page.locator('#enter-place').click();await page.waitForFunction(()=>window.southQA.game.scene.isActive('Visit'));
 assert.deepEqual(errors,[]);console.log('PASS '+width+': actual walk '+(width===390?'with joystick':'with keyboard')+', own/friend south passage and return; foot coordinates accepted by server limits.',own,friend);
 await page.close();
}}finally{await browser.close();}
