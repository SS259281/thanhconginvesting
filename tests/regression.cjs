// Run against a local HTTP server. All external requests are blocked or mocked.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');
const base = process.env.TCI_BASE_URL || 'http://127.0.0.1:4173/thanhconginvesting/';
const output = process.env.TCI_QA_DIR || path.join(__dirname, '..', '.qa');
const viewports = [[1440,900],[1280,800],[1024,768],[768,1024],[430,932],[390,844],[375,812],[360,800],[320,720]];
const endpoint = 'https://formsubmit.co/ajax/contact.nhatradehoc@gmail.com';
const results = [];
const check = async (name,fn) => { await fn(); results.push({name,status:'passed'}); console.log('PASS '+name); };
(async () => {
  await fs.mkdir(output,{recursive:true});
  const browser = await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH ? {executablePath:process.env.CHROMIUM_PATH}:{})});
  const context = await browser.newContext({timezoneId:'Asia/Ho_Chi_Minh',reducedMotion:'reduce'});
  await context.addInitScript(() => { try { localStorage.setItem('tci_first_visit_started_at','1'); } catch {} });
  await context.route('**/*',route => new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort());
  const page=await context.newPage();
  const errors=[],missing=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.url().startsWith(new URL(base).origin)&&r.status()>=400)missing.push({url:r.url(),status:r.status()});});
  const ready = async () => {
    await page.goto(base,{waitUntil:'networkidle'});
    await page.evaluate(()=>document.fonts.ready);
    await page.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}'});
    await page.evaluate(()=>document.querySelectorAll('[data-private-reveal]').forEach(e=>e.classList.add('is-revealed')));
  };
  for(const [width,height] of viewports){
    await page.setViewportSize({width,height});await ready();
    await check(`viewport ${width}x${height}: assets, anchors, overflow`,async()=>{
      const state=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,broken:[...document.images].filter(i=>i.getAttribute('src')&&!i.closest('[hidden]')&&i.complete&&!i.naturalWidth).map(i=>i.src),missingAnchors:[...document.querySelectorAll('a[href^="#"]')].filter(a=>!document.getElementById(a.getAttribute('href').slice(1))).map(a=>a.getAttribute('href'))}));
      assert.equal(state.scrollWidth,state.width);assert.deepEqual(state.broken,[]);assert.deepEqual(state.missingAnchors,[]);
      assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
    });
    const metrics=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth,components:[...document.querySelectorAll('.private-header,.private-hero h1,.private-button-primary,.private-price-card,.private-lead-form,.private-chat-launcher,.private-proof-tabs,.private-sticky-cta,.private-community-card,.private-final-cta')].slice(0,14).map(el=>{const s=getComputedStyle(el);return {selector:el.className,font:s.fontFamily,fontSize:s.fontSize,color:s.color,background:s.backgroundColor,padding:s.padding,border:s.borderRadius}})}));
    await fs.writeFile(path.join(output,`after-${width}-metrics.json`),JSON.stringify(metrics,null,2));
    await page.screenshot({path:path.join(output,`after-${width}.png`),fullPage:true,animations:'disabled'});
    if(width===1440)await page.screenshot({path:path.join(output,'preview-desktop.png'),animations:'disabled'});
    if(width<=768)await check(`drawer keyboard ${width}`,async()=>{
      await page.locator('.private-menu-button').click();assert.equal(await page.locator('.private-menu-button').getAttribute('aria-expanded'),'true');
      await page.keyboard.press('Shift+Tab');assert(await page.evaluate(()=>document.querySelector('.private-drawer-panel').contains(document.activeElement)));
      await page.keyboard.press('Escape');assert.equal(await page.locator('.private-menu-button').getAttribute('aria-expanded'),'false');assert(await page.locator('.private-menu-button').evaluate(e=>e===document.activeElement));
      await page.locator('.private-menu-button').click();await page.locator('.private-drawer-panel a[href="#private-insights"]').click();assert.equal(await page.locator('.private-menu-button').getAttribute('aria-expanded'),'false');
    });
  }
  await page.setViewportSize({width:1440,height:900});await ready();
  await check('proof data and keyboard tabs',async()=>{
    await page.locator('#private-proof-tab-mt5').click();assert.match(await page.locator('#private-proof-panel').innerText(),/394\.218,26 USD/);assert.match(await page.locator('#private-proof-panel').innerText(),/414\.690,26/);assert.equal(await page.locator('#private-proof-panel').getAttribute('aria-labelledby'),'private-proof-tab-mt5');
    await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#private-proof-tab-crypto').getAttribute('aria-selected'),'true');assert.match(await page.locator('#private-proof-panel').innerText(),/353,39/);
    await page.keyboard.press('Home');assert.match(await page.locator('#private-proof-panel').innerText(),/225/);assert.match(await page.locator('#private-proof-panel').innerText(),/80 tỷ/);
  });
  await check('course validation, weekday policy, prices and modal focus',async()=>{
    const register=page.locator('.private-scheduler-footer button');await register.click();assert(await page.locator('.tci-payment-modal').evaluate(e=>e.hidden));
    await page.locator('#private-course input[type="date"]').fill('2026-10-12'); // Monday
    assert.equal(await page.getByRole('button',{name:'Thứ 2',exact:true}).getAttribute('aria-pressed'),'true');
    await page.getByRole('button',{name:'Thứ 3',exact:true}).click();await register.click();assert(await page.locator('.tci-payment-modal').evaluate(e=>e.hidden));
    await page.getByRole('button',{name:'Thứ 3',exact:true}).click();await page.getByRole('button',{name:'Thứ 5',exact:true}).click();await register.click();
    assert(!(await page.locator('.tci-payment-modal').evaluate(e=>e.hidden)));assert.equal(await page.locator('[data-bank-amount]').innerText(),'15.000.000 VND');
    await page.keyboard.press('Shift+Tab');assert(await page.locator('.tci-payment-modal').evaluate(e=>e.contains(document.activeElement)));
    await page.locator('[data-pay-tab="usdt"]').click();assert.equal(await page.locator('[data-usdt-amount]').innerText(),'555 USDT');
    await page.keyboard.press('ArrowRight');assert.equal(await page.locator('[data-pay-tab="binance"]').getAttribute('aria-selected'),'true');
    assert.match(await page.locator('[data-confirm-payment]').getAttribute('href'),/^https:\/\/t.me\/mmto1b\?text=/);
    await page.keyboard.press('Escape');assert(await register.evaluate(e=>e===document.activeElement));
  });
  await check('SSI account reference and clipboard',async()=>{
    const url=await page.evaluate(()=>{let opened='';const original=window.open;window.open=(u)=>{opened=u;return null};[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Mở tài khoản ngay').click();window.open=original;return opened;});
    assert.equal(url,'https://www.ssi.com.vn/khach-hang-ca-nhan/mo-tai-khoan?mgm=3186');
  });
  await page.setViewportSize({width:390,height:844});await ready();
  await check('chat mobile: focus, input visibility, truthful handoff',async()=>{
    await page.locator('.private-chat-launcher').click();assert.equal(await page.locator('#private-chat-panel').getAttribute('aria-modal'),'true');
    await page.locator('#private-chat-input').fill('<img src=x onerror=alert(1)>');await page.locator('#private-chat-panel > form button').click();assert.equal(await page.locator('.private-chat-messages img').count(),0);
    await page.screenshot({path:path.join(output,'after-chat-390.png'),animations:'disabled'});
    await page.keyboard.press('Escape');assert(await page.locator('.private-chat-launcher').evaluate(e=>e===document.activeElement));
    await page.locator('.private-chat-launcher').click();await page.locator('[data-chat-action="contact"]').click();await page.locator('[data-chat-action="lead"]').click();
    const mini=page.locator('.tci-chat-lead');await mini.locator('[name="name"]').fill('QA Local');await mini.locator('[name="need"]').selectOption({label:'Khóa học'});await mini.locator('[name="contact"]').fill('0901234567');await mini.locator('[type="checkbox"]').check();await mini.locator('[type="submit"]').click();
    assert.equal(await page.locator('.private-lead-form [name="name"]').inputValue(),'QA Local');assert(!(await page.locator('.private-lead-form [name="consent"]').isChecked()));assert.match(await page.locator('.tci-lead-prefill-note').innerText(),/chưa được gửi/);
  });
  await check('chat input fits a short mobile viewport',async()=>{
    await page.setViewportSize({width:390,height:400});await page.locator('.private-chat-launcher').click();await page.locator('#private-chat-input').focus();const box=await page.locator('#private-chat-input').boundingBox();assert(box.y>=0 && box.y+box.height<=400);await page.keyboard.press('Escape');await page.setViewportSize({width:390,height:844});
  });
  const form=page.locator('.private-lead-form');
  const fillForm=async()=>{await form.locator('[name="name"]').fill('QA Local');await form.locator('[name="phone"]').fill('0901234567');await form.locator('[name="need"]').selectOption({label:'Khóa học'});await form.locator('[name="nav"]').selectOption({label:'Dưới 100 triệu'});await form.locator('[name="consent"]').check();};
  await check('lead validation prevents empty submit',async()=>{await ready();await form.locator('[type="submit"]').click();assert.equal(await form.locator('.private-form-success').count(),0);});
  for(const scenario of [{name:'success',status:200,body:{success:'true'},success:true},{name:'HTTP failure',status:500,body:{success:false},success:false},{name:'application failure',status:200,body:{success:false},success:false},{name:'malformed body',status:200,raw:'not json',success:false}]){
    await check('mocked lead '+scenario.name,async()=>{
      await page.route(endpoint,route=>route.fulfill({status:scenario.status,contentType:'application/json',body:scenario.raw||JSON.stringify(scenario.body)}));await fillForm();await form.locator('[type="submit"]').click();await page.locator(scenario.success?'.private-form-success':'.private-form-error').waitFor();
      assert.equal(await form.locator('[type="submit"]').isDisabled(),false);if(scenario.success)assert.equal(await form.locator('[name="name"]').inputValue(),'');else assert.equal(await form.locator('[name="name"]').inputValue(),'QA Local');await page.unroute(endpoint);
    });
  }
  await check('lead timeout retains data and releases submit',async()=>{
    await page.clock.install();
    await page.evaluate((target)=>{window.__qaFetch=window.fetch;window.fetch=(url,options)=>String(url)===target?new Promise((resolve,reject)=>options.signal.addEventListener('abort',()=>reject(new DOMException('timeout','AbortError')))):window.__qaFetch(url,options)},endpoint);
    await fillForm();await form.locator('[type="submit"]').click();await page.clock.fastForward(15001);await form.locator('.private-form-error').waitFor();assert.equal(await form.locator('[type="submit"]').isDisabled(),false);assert.equal(await form.locator('[name="name"]').inputValue(),'QA Local');
    await page.evaluate(()=>{window.fetch=window.__qaFetch;delete window.__qaFetch});await page.clock.resume();
  });
  await check('honeypot prevents network submission',async()=>{
    let calls=0;await page.route(endpoint,route=>{calls++;return route.abort()});await fillForm();await form.locator('[name="_honey"]').evaluate(e=>e.value='bot');await form.locator('[type="submit"]').click();assert.equal(calls,0);assert.equal(await form.locator('.private-form-success').count(),0);await form.locator('[name="_honey"]').evaluate(e=>e.value='');await page.unroute(endpoint);
  });
  await check('localStorage unavailable and fresh discounted offer',async()=>{
    await context.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new DOMException('blocked','SecurityError')}})});await ready();assert.equal(await page.locator('.private-price-row.is-highlight strong').innerText(),'11.250.000đ');await page.reload({waitUntil:'networkidle'});assert.equal(await page.locator('.private-offer-clock').getAttribute('data-active'),'true');
  });
  await check('original design only, including old Tết demo URL',async()=>{
    await ready();assert.equal(await page.locator('.tci-event-decoration').count(),0);
    const legacyPreview = new URL(base);legacyPreview.searchParams.set('tci-event','tet-demo');
    await page.goto(legacyPreview.href,{waitUntil:'networkidle'});
    assert.equal(await page.locator('.tci-event-decoration').count(),0);
    assert.equal(await page.locator('#private-top').getAttribute('data-tci-event-motion'),null);
    assert.match(await page.locator('.private-hero h1').innerText(),/đồng hành/);
    await page.screenshot({path:path.join(output,'preview-original-mobile.png'),animations:'disabled'});
    await page.setViewportSize({width:1440,height:900});await page.screenshot({path:path.join(output,'preview-original-desktop.png'),animations:'disabled'});
  });
  for(const name of ['huong-dan-mo-tk-ssi.html','chuyen-ma-ssi.html','goc-nhin.html'])await check('subpage '+name,async()=>{
    await page.setViewportSize({width:390,height:844});await page.goto(new URL(name,base).href,{waitUntil:'networkidle'});assert(await page.locator('h1').count());assert.equal(await page.locator('.tci-chat-launcher').count(),1);
    const menu=page.locator('.tci-menu-button');await menu.click();assert.equal(await menu.getAttribute('aria-expanded'),'true');await page.keyboard.press('Escape');assert.equal(await menu.getAttribute('aria-expanded'),'false');assert(await menu.evaluate(e=>e===document.activeElement));
    await page.locator('.tci-chat-launcher').click();await page.keyboard.press('Escape');assert(await page.locator('.tci-chat-launcher').evaluate(e=>e===document.activeElement));assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  });
  assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
  await browser.close();await fs.writeFile(path.join(output,'regression-results.json'),JSON.stringify({base,results,errors,missing},null,2));
  console.log(`${results.length} checks passed. No real form submissions or payment actions.`);
})().catch(error=>{console.error(error);process.exit(1)});
