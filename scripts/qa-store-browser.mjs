// Isolated browser fixtures only; no player accounts or payments.
// Optional env: PLAYWRIGHT_MODULE (module URL), CHROME_PATH, QA_BASE, QA_OUTPUT_DIR.
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE??'playwright');
const output=process.env.QA_OUTPUT_DIR??'work/qa';await mkdir(output,{recursive:true});
const base=process.env.QA_BASE??'http://localhost:5173';
const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
try{
 for(const [label,viewport] of [['desktop',{width:1280,height:1000}],['mobile',{width:390,height:844}]]){
  const page=await browser.newPage({viewport,isMobile:label==='mobile',hasTouch:label==='mobile'}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/tests/store-preview.html');await page.waitForSelector('#outfit-direction');
  assert.equal(await page.locator('.outfit-card').count(),4);
  for(const direction of ['0','1','2','3']){await page.selectOption('#outfit-direction',direction);assert.equal(await page.locator('#outfit-direction').inputValue(),direction);}
  const preview=page.locator('.outfit-card img').first(),initial=await preview.getAttribute('src');
  await page.waitForFunction(src=>document.querySelector('.outfit-card img').src!==src,initial);
  await page.locator('[data-buy-outfit="adventure"]').click();
  await page.waitForFunction(()=>document.querySelector('.store-balance').textContent.includes('3.500'));
  await page.locator('[data-equip-outfit="adventure"]').click();
  await page.waitForFunction(()=>document.querySelector('[data-equip-outfit="adventure"]').disabled);
  assert.equal(await page.locator('[data-buy-outfit="adventure"]').count(),0);
  assert.ok(await page.locator('[data-buy-outfit="space"]').isDisabled());
  await page.locator('[data-equip-outfit="original"]').click();
  await page.waitForFunction(()=>document.querySelector('[data-equip-outfit="original"]').disabled);
  assert.match(await page.locator('.store-balance').textContent(),/3\.500/);
  await page.screenshot({path:output+'/wardrobe-'+label+'.png'});
  assert.ok(await page.locator('#panel').evaluate(el=>el.getBoundingClientRect().width<=innerWidth));
  await page.locator('[data-store-tab="coins"]').click();await page.waitForSelector('#coin-form');
  assert.equal(await page.locator('input[name="package"]').count(),5);assert.ok(await page.locator('#create-payment').isDisabled());
  assert.match(await page.locator('.store-unavailable').textContent(),/indisponível/);
  await page.screenshot({path:output+'/coins-'+label+'.png'});
  assert.deepEqual(errors,[]);await page.close();console.log('PASS '+label+': animated previews, four directions, buy/equip/free restore, no duplicate purchase and disabled payments');
 }
 const page=await browser.newPage({viewport:{width:1280,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const outfit of ['', 'adventure','space','gardener']){
  await page.goto(base+'/tests/avatar-visual-qa.html?sheet=1&outfit='+outfit);await page.waitForFunction(()=>document.querySelectorAll('#gallery img').length===144);
  for(const motion of ['farmer-v2','carry-hoe','carry-seed','carry-water','hoe-actions','water-actions']){
   await page.selectOption('#base',motion);await page.waitForFunction(()=>Array.from(document.querySelectorAll('#gallery img')).every(img=>img.complete&&img.naturalWidth>0));
   assert.equal(await page.locator('#gallery img').count(),144);
  }
 }
 await page.goto(base+'/tests/avatar-visual-qa.html?sheet=1');await page.waitForFunction(()=>document.querySelectorAll('#gallery img').length===144);
 await page.evaluate(()=>{for(const el of document.querySelectorAll('#gallery article'))if(!el.textContent.includes('costas')||!(/palha|Capuz|ondulado/.test(el.textContent)))el.remove();});
 await page.screenshot({path:output+'/back-heads.png',fullPage:true});
 assert.deepEqual(errors,[]);console.log('PASS 9 models × 4 outfits × 6 motions × 16 frames rendered without browser errors');
 await page.close();
}finally{await browser.close();}
