// Local-only QA for the native-scroll cinematic journey. No real leads or payments.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { PNG } = require(process.env.PNGJS_MODULE || require.resolve('pngjs', {
  paths: [path.dirname(require.resolve(process.env.PLAYWRIGHT_MODULE || 'playwright'))]
}));
const base = process.env.TCI_BASE_URL || 'http://127.0.0.1:4173/thanhconginvesting/';
const output = process.env.TCI_QA_DIR || path.join(__dirname, '..', '.qa');
const origin = new URL(base).origin;
const results = [], contexts = [];
const selectors = {
  root: '#tci-journey', scene: '.tci-journey-scene', chapter: '[data-journey-chapter]',
  rail: '.tci-journey-rail', previous: '[data-journey-prev]', next: '[data-journey-next]',
  reading: '[data-journey-reading]', skip: '[data-journey-skip]'
};
// Text fingerprints taken before adding the journey, excluding markup/comments.
// These guard the owner's requirement that every existing detail remains present.
const originalDetails = {
  'private-proof-strip': '866f2e5160cb9b8b47d82d9363ee700c702868519220c9fe2ae58e5ad8da1607',
  'private-problem-section': 'dc6715f9d699ced88a6bc2b8f9d191140a180cc67cd0918987fb6719cb51942d',
  'private-about': '89621fb82a36fbf73a6637fac43ab19712f057ff93ad35ebd425abde96ecdd2a',
  'private-pathways': '20fbc04c8167292ecd3d5d1f632e7dac3d5bd83f6dc51d54b7d44be112b81678',
  'private-benefits': '5019f629b221162776ad0b44e428e16920b1f9782cffd39ea8d23c2e08be3777',
  'private-community-section': '5f9480c7131b35358fd6d0a6aca7d7b1896578bf9b7388a0f667b816ee7f82e8',
  'private-proof-section': 'ff97a2288d120b37c211d13987a6a3d433a3fb2861793aababb97d96cd2bb194',
  'private-course': '17f9640069918c00ff365cc1245b134b54fce0bf95c6f366a583939e94392eea',
  'private-service': '6e08d5b8bf749c7316145a3d52063cefcc009a3d861d68de0fc0ec94bb70af7e',
  'private-insights-section': '557b095e7e55a7027040a90f900fa57211c9eadf9ece84489f60224f07318338',
  'private-process-section': 'aeca15c4e4244f2f3471350c15b36a5532127a83d5c09dbff9b19f4dfb6fdab8',
  'private-lead-section': 'a8dd9750551596834a885a7e206f7ca02f5b5df79fb014226e618b9b48d9962a',
  'private-faq': 'f0722000957c5dc952e09f57ac0e1b0b41ccdae4e9388e5764d0c11326da639d',
  'private-final-cta': '9d85765e3c12df9717bb7f267dc21f1e3683a3b5622b9eb63e49f71a2c789679'
};
const lessonPdf='./%C4%90%E1%BA%A6U%20T%C6%AF%20TH%E1%BB%B0C%20CHI%E1%BA%BEN%20%20BU%E1%BB%94I%201%20NGUY%C3%8AN%20L%C3%9D%20V%E1%BA%ACN%20%C4%90%E1%BB%98NG%20C%E1%BB%A6A%20TH%E1%BB%8A%20TR%C6%AF%E1%BB%9CNG%20V%C3%80%20C%C3%81C%20TH%C3%80NH%20PH%E1%BA%A6N%20THAM%20GIA%20TH%E1%BB%8A%20TR%C6%AF%E1%BB%9CNG%20(FINAL).pdf';
const originalUrls={
  'private-pathways':['href:chuyen-ma-ssi.html'],
  'private-benefits':['href:https://www.ssi.com.vn/tin-tuc/tin-tuc-su-kien-ssi/chuong-trinh-khuyen-mai-song-lon-can-tau-lon','src:assets/brand/ssi-campaign.png'],
  'private-community-section':['href:https://zalo.me/g/awu9n0xkftxzzocsrjlw'],
  'private-proof-section':['src:IMG_1261.jpg'],
  'private-course':['href:#private-course-schedule','href:'+lessonPdf,'href:'+lessonPdf],
  'private-service':['href:https://zalo.me/0977921597'],
  'private-insights-section':['href:chuyen-ma-ssi.html','href:goc-nhin.html','href:goc-nhin.html','href:huong-dan-mo-tk-ssi.html','src:assets/photos/tci-insight-iboard.jpg','src:assets/photos/tci-insight-library.jpg','src:assets/photos/tci-insight-open.jpg'],
  'private-lead-section':['href:https://zalo.me/0977921597','href:mailto:contact.nhatradehoc@gmail.com','href:tel:+84977921597'],
  'private-faq':['href:https://www.ssi.com.vn/khach-hang-ca-nhan/quan-ly-tai-khoan-kieu-xac-thuc-iboard-pro','href:https://zalo.me/0977921597'],
  'private-final-cta':['href:https://zalo.me/0977921597']
};
// Balanced extraction handles original sections moved into nested act wrappers.
const extractSections=html=>{
  const stack=[],sections=[];
  for(const match of html.matchAll(/<\/?section\b[^>]*>/gi)){
    if(/^<\//.test(match[0])){const start=stack.pop();assert.notEqual(start,undefined);sections.push(html.slice(start,match.index+match[0].length));}
    else stack.push(match.index);
  }
  assert.equal(stack.length,0);return sections;
};
const sectionClasses=section=>((section.slice(0,section.indexOf('>')+1).match(/class=["']([^"']*)["']/)||[])[1]||'').split(/\s+/);
const check=async(name,fn)=>{try{await fn();results.push({name,status:'passed'});console.log('PASS '+name);}catch(error){results.push({name,status:'failed',error:error.message});throw error;}};
const healthy=state=>{assert.deepEqual(state.errors,[]);assert.deepEqual(state.missing,[]);};
const getRoot=page=>page.locator('#tci-journey').evaluate(root=>root.__tciJourney);
const getEngine=page=>page.locator('.tci-journey-scene').evaluate(host=>host.__tciJourneyThree);
const originalSelector=Object.keys(originalDetails).map(name=>'section.'+name).join(',');
const readable=async state=>{
  assert.equal(await state.page.locator(originalSelector).count(),14);
  assert.equal(await state.page.locator('[data-journey-section]').count(),9);
  const visibility=await state.page.locator(originalSelector).evaluateAll(sections=>sections.map(section=>({id:section.id,inert:section.inert,hidden:section.getAttribute('aria-hidden'),display:getComputedStyle(section).display,visibility:getComputedStyle(section).visibility,height:section.getBoundingClientRect().height})));
  assert(visibility.every(section=>!section.inert&&section.hidden!=='true'&&section.display!=='none'&&section.visibility!=='hidden'&&section.height>40));
  assert.equal(await state.page.locator('article[data-journey-chapter],.tci-journey-chapters,.tci-journey.is-cinematic').count(),0);
  assert.equal(await state.page.evaluate(()=>document.documentElement.scrollWidth),await state.page.evaluate(()=>innerWidth));healthy(state);
};
const nativePoint=async(page,id,fraction=.1)=>{
  const point=await page.locator('#tci-journey').evaluate((root,id)=>root.__tciJourney.sections.find(point=>point.id===id),id);assert(point,'Native source point '+id);
  const top=point.start+(point.end-point.start)*fraction;
  const eased=fraction*fraction*(3-2*fraction);const expected=point.from+(point.to-point.from)*eased; // the film eases between camera stops
  await page.evaluate(top=>scrollTo({top,behavior:'instant'}),top);
  await page.waitForFunction(({id,expected})=>{const root=document.querySelector('#tci-journey').__tciJourney,engine=document.querySelector('.tci-journey-scene').__tciJourneyThree;return root.activeSection===id&&root.visible&&engine?.active&&Math.abs(engine.targetProgress-expected)<.001;},{id,expected},{timeout:20000});
  await page.waitForFunction(expected=>Math.abs(document.querySelector('.tci-journey-scene').__tciJourneyThree.progress-expected)<.001,expected,{timeout:30000}); // camera has arrived (the city keeps its ambient motion)
  const actual=await getEngine(page);assert(Math.abs(actual.progress-expected)<.001);assert(Math.abs(await page.evaluate(()=>scrollY)-top)<2);return{point,expected,top,actual};
};
const capture=async(page,id,position)=>{
  const buffer=await page.locator('.tci-journey-scene canvas').screenshot({omitBackground:true,style:`
    html,body,.private-page,.tci-journey-flow,.tci-journey-stage,.tci-journey-scene{background:transparent!important;}
    .private-page *,.private-page *::before,.private-page *::after{visibility:hidden!important;}
    .tci-journey-scene,.tci-journey-scene canvas{visibility:visible!important;opacity:1!important;}
  `});
  const png=PNG.sync.read(buffer);let bright=0,samples=0;const stride=Math.max(1,Math.floor(png.width*png.height/16000));
  for(let pixel=0;pixel<png.width*png.height;pixel+=stride){const i=pixel*4;samples++;if(png.data[i+3]&&Math.max(png.data[i],png.data[i+1],png.data[i+2])>45)bright++;}
  assert(bright>Math.max(50,samples*.005),'Real geometry appears at '+id);
  await fs.writeFile(path.join(output,'native-canvas-'+id+'.png'),buffer);
  await page.screenshot({path:path.join(output,'native-desktop-'+id+'.png')});
  return{id,...position,bright,samples,width:png.width,height:png.height,hash:crypto.createHash('sha256').update(png.data).digest('hex')};
};
const staticPoint=async(page,selector)=>{
  await page.locator(selector).evaluate(section=>{const bounds=section.getBoundingClientRect();scrollTo({top:scrollY+bounds.top+Math.min(bounds.height*.5,500)-innerHeight*.35,behavior:'instant'});});
  await page.waitForFunction(()=>!document.querySelector('#tci-journey').__tciJourney.visible);
  const root=await getRoot(page),engine=await getEngine(page);assert.equal(root.visible,false);assert.equal(engine.active,false);assert.equal(await page.locator('[data-journey-hud]').isVisible(),false);
  const frames=engine.frames;await page.waitForTimeout(120);assert.equal((await getEngine(page)).frames,frames);
};

(async()=>{
  await fs.mkdir(output,{recursive:true});
  await check('all fourteen originals preserve full text, assets and links exactly once',async()=>{
    const html=await fs.readFile(path.join(__dirname,'..','index.html'),'utf8'),sections=extractSections(html);
    for(const [className,expected]of Object.entries(originalDetails)){
      const matches=sections.filter(section=>sectionClasses(section).includes(className));assert.equal(matches.length,1,className+' once');
      const text=matches[0].replace(/<!--[\s\S]*?-->/g,' ').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
      assert.equal(crypto.createHash('sha256').update(text).digest('hex'),expected,className+' text');
      const urls=[...matches[0].matchAll(/\b(src|href|srcset|poster)=["']([^"']*)["']/g)].map(match=>match[1]+':'+match[2]).sort();assert.deepEqual(urls,[...(originalUrls[className]||[])].sort(),className+' assets/links');
    }
  });
  const browser=await chromium.launch({headless:true,args:['--enable-webgl','--enable-unsafe-swiftshader','--use-angle=swiftshader'],...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
  const createPage=async({viewport={width:1440,height:900},reducedMotion='no-preference',javaScriptEnabled=true,init}={})=>{
    const context=await browser.newContext({viewport,reducedMotion,javaScriptEnabled,timezoneId:'Asia/Ho_Chi_Minh'});contexts.push(context);
    await context.addInitScript(()=>{try{localStorage.setItem('tci_first_visit_started_at','1')}catch{}});if(init)await context.addInitScript(init);
    await context.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());
    const page=await context.newPage(),errors=[],missing=[],requested=[];page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>requested.push(request.url()));page.on('response',response=>{if(response.url().startsWith(origin)&&response.status()>=400)missing.push({url:response.url(),status:response.status()});});
    await page.goto(base,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);await page.locator('#tci-journey').waitFor({state:'attached'});
    if(javaScriptEnabled)await page.waitForFunction(()=>Boolean(document.querySelector('#tci-journey').__tciJourney));
    return{page,context,errors,missing,requested};
  };
  try{
    const normal=await createPage(),page=normal.page;
    await page.waitForFunction(()=>document.querySelector('#tci-journey').dataset.tciJourneyMode==='cinematic');
    await check('the original content forms two native acts with no duplicate intro or hidden originals',async()=>{
      await readable(normal);assert.equal((await getRoot(page)).sectionCount,9);
      const structure=await page.evaluate(()=>({stageDisplay:getComputedStyle(document.querySelector('.tci-journey-stage')).display,scenePosition:getComputedStyle(document.querySelector('.tci-journey-scene')).position,
        first:document.querySelector('#tci-journey>[data-journey-section]')?.id,courseAct:document.querySelector('#private-course').closest('.tci-journey-flow')?.id||null,leadAct:document.querySelector('#private-lead').closest('.tci-journey-flow')?.id||null}));
      assert.equal(structure.stageDisplay,'contents');assert.equal(structure.scenePosition,'fixed');assert.equal(structure.first,'private-principles');assert.equal(structure.courseAct,null);assert.equal(structure.leadAct,null);
      assert.equal(await page.locator('#tci-journey-followup').count(),1);
    });
    await check('hero remains autonomous and responds over its copy despite journey flags and return scrolling',async()=>{
      await page.waitForFunction(()=>document.querySelector('.tci-hero-scene').__tciThree?.running);
      const before=await page.locator('.tci-hero-scene').evaluate(host=>host.__tciThree);
      await page.evaluate(()=>document.dispatchEvent(new CustomEvent('tci:journey-active',{detail:true})));
      await page.waitForFunction(frames=>document.querySelector('.tci-hero-scene').__tciThree.frames>frames+8,before.frames);
      const after=await page.locator('.tci-hero-scene').evaluate(host=>host.__tciThree);assert(after.elapsed>before.elapsed);assert.notEqual(after.rotation.z,before.rotation.z);
      const box=await page.locator('.private-hero h1').boundingBox();await page.mouse.move(box.x+box.width*.2,box.y+box.height*.2);
      const pointer=await page.locator('.tci-hero-scene').evaluate(host=>host.__tciThree.pointerX);
      await page.mouse.move(box.x+box.width*.8,box.y+box.height*.7);await page.waitForFunction(pointer=>document.querySelector('.tci-hero-scene').__tciThree.pointerX!==pointer,pointer);
      await nativePoint(page,'private-pathways');await page.waitForFunction(()=>!document.querySelector('.tci-hero-scene').__tciThree.running);
      await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForFunction(()=>document.querySelector('.tci-hero-scene').__tciThree.running);
      const resumed=await page.locator('.tci-hero-scene').evaluate(host=>host.__tciThree);await page.waitForFunction(frames=>document.querySelector('.tci-hero-scene').__tciThree.frames>frames+5,resumed.frames);healthy(normal);
    });
    const views=[];
    await check('native original sections drive different real 3D camera views and reverse deterministically',async()=>{
      const ids=['private-principles','private-about','private-pathways','private-ssi','private-proof','private-community','private-process'];
      for(const id of ids){const position=await nativePoint(page,id);views.push(await capture(page,id,position));}
      assert(new Set(views.map(view=>view.hash)).size>=6,'At least six native camera views differ');
      for(const id of [...ids].reverse()){
        const reverse=await nativePoint(page,id),original=views.find(view=>view.id===id);
        const cam=v=>v.actual.shotCamera||v.actual.camera;for(const axis of ['x','y','z'])assert(Math.abs(cam(reverse)[axis]-cam(original)[axis])<.06,'Reverse camera at '+id);
      }
      results.push({name:'native rendered camera evidence',status:'observed',views});healthy(normal);
    });
    await check('original proof tabs remain interactive while the native scene is active',async()=>{
      await nativePoint(page,'private-proof');await page.locator('#private-proof-tab-mt5').click();assert.match(await page.locator('#private-proof-panel').innerText(),/394\.218,26 USD/);assert.match(await page.locator('#private-proof-panel').innerText(),/414\.690,26/);
      await page.locator('#private-proof-tab-crypto').click();assert.match(await page.locator('#private-proof-panel').innerText(),/353,39/);await page.locator('#private-proof-tab-ssi').click();assert.match(await page.locator('#private-proof-panel').innerText(),/225/);
      assert((await getEngine(page)).frames>0);assert.equal(await page.locator('#private-proof').evaluate(section=>section.inert),false);healthy(normal);
    });
    await check('course, lead, FAQ and final CTA keep static behavior with the journey canvas inactive',async()=>{
      for(const selector of ['#private-course','#private-lead','#private-faq','.private-final-cta'])await staticPoint(page,selector);
      assert.equal(await page.locator('.private-lead-form [name="consent"]').count(),1);assert.equal(await page.locator('#private-course [type="date"]').count(),1);assert.match(await page.locator('#private-course').textContent(),/15\.000\.000đ/);await readable(normal);
    });
    await check('3D on/off preserves reading position and keeps the restore control available',async()=>{
      await nativePoint(page,'private-pathways');await page.locator('#private-pathways').evaluate(section=>scrollTo({top:scrollY+section.getBoundingClientRect().top-document.querySelector('.private-header').getBoundingClientRect().height-20,behavior:'instant'}));
      await page.waitForFunction(()=>document.querySelector('#tci-journey').__tciJourney.activeSection==='private-pathways');
      const top=await page.locator('#private-pathways').evaluate(section=>section.getBoundingClientRect().top);const toggle=page.locator('[data-journey-reading]');await toggle.click();
      await page.waitForFunction(()=>document.querySelector('#tci-journey').dataset.tciJourneyMode==='reading');assert(Math.abs(await page.locator('#private-pathways').evaluate(section=>section.getBoundingClientRect().top)-top)<2);
      assert(await toggle.isVisible());assert.equal((await getEngine(page)).active,false);await readable(normal);await toggle.click();await page.waitForFunction(()=>document.querySelector('#tci-journey').dataset.tciJourneyMode==='cinematic');
      assert(Math.abs(await page.locator('#private-pathways').evaluate(section=>section.getBoundingClientRect().top)-top)<2);healthy(normal);
    });
    await check('native anchor navigation, keyboard rail and ordinary wheel input remain usable',async()=>{
      await nativePoint(page,'private-pathways');const links=page.locator('.tci-journey-rail a');assert.equal(await links.count(),6);await links.first().focus();const before=await page.evaluate(()=>scrollY);await page.keyboard.press('ArrowRight');assert(await links.nth(1).evaluate(link=>link===document.activeElement));assert(Math.abs(await page.evaluate(()=>scrollY)-before)<2);
      const target=await links.nth(1).getAttribute('href');await page.keyboard.press('Enter');await page.waitForFunction(hash=>location.hash===hash,target);await page.waitForTimeout(500);assert.equal(await page.locator(target).evaluate(section=>section.inert),false);
      await page.locator('[data-journey-static]').click();await page.waitForFunction(()=>location.hash==='#private-course');await page.waitForFunction(()=>{const c=document.querySelector('#private-course').getBoundingClientRect().top;return Math.abs(c)<120;},null,{timeout:30000});await staticPoint(page,'#private-course');
      await nativePoint(page,'private-pathways');const wheelBefore=await page.evaluate(()=>scrollY);await page.mouse.move(700,450);await page.mouse.wheel(0,200);await page.waitForFunction(before=>scrollY>before+20,wheelBefore);assert(await page.evaluate(before=>scrollY-before,wheelBefore)<500);healthy(normal);
    });
    const lifecycle=await createPage();
    await check('native renderer stops at idle/static content and retains persisted-page lifecycle state',async()=>{
      await nativePoint(lifecycle.page,'private-community');await lifecycle.page.waitForFunction(()=>!document.querySelector('.tci-journey-scene').__tciJourneyThree.rendering,null,{timeout:30000}); /* ambient motion sleeps ~6s after arrival */const idle=await getEngine(lifecycle.page);await lifecycle.page.waitForTimeout(150);assert.equal((await getEngine(lifecycle.page)).frames,idle.frames);
      await lifecycle.page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true})));const paused=await getEngine(lifecycle.page);await lifecycle.page.waitForTimeout(150);assert.equal((await getEngine(lifecycle.page)).frames,paused.frames);assert.equal(await lifecycle.page.locator('.tci-journey-scene canvas').count(),1);
      await lifecycle.page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));await nativePoint(lifecycle.page,'private-process');
      await staticPoint(lifecycle.page,'#private-lead');healthy(lifecycle);results.push({name:'synthetic persisted lifecycle evidence',status:'observed',idle,paused,limitation:'Synthetic events do not prove a BFCache hit.'});
    });
    for(const [width,height]of[[430,932],[390,844],[375,812],[360,800],[320,720]])await check('native mobile '+width+'px: all original content readable and wide proof fits',async()=>{
      const state=await createPage({viewport:{width,height}});await state.page.waitForFunction(()=>document.querySelector('#tci-journey').dataset.tciJourneyMode==='cinematic');await readable(state);
      await nativePoint(state.page,'private-proof');await state.page.screenshot({path:path.join(output,'native-mobile-proof-'+width+'.png')});
      assert.equal(await state.page.locator('.private-proof-mobile-accordion details').count(),3);await state.page.locator('.private-proof-mobile-accordion details').nth(1).locator('summary').click();assert.match(await state.page.locator('.private-proof-mobile-accordion details').nth(1).innerText(),/394\.218,26 USD/);
      await nativePoint(state.page,'private-community');await state.page.screenshot({path:path.join(output,'native-mobile-community-'+width+'.png')});await readable(state);
      await state.page.setViewportSize({width,height:400});await state.page.waitForFunction(()=>document.querySelector('#tci-journey').dataset.tciJourneyMode==='fallback');await readable(state);assert.equal((await getEngine(state.page)).active,false);
    });
    await check('short viewport and motion preference changes restore 3D without forced entry scrolling',async()=>{
      const state=await createPage({viewport:{width:1440,height:400}});await readable(state);const top=await state.page.evaluate(()=>scrollY);await state.page.setViewportSize({width:1440,height:900});await state.page.waitForFunction(()=>document.querySelector('#tci-journey').dataset.tciJourneyMode==='cinematic');assert.equal(await state.page.evaluate(()=>scrollY),top);
      await nativePoint(state.page,'private-about');await state.page.emulateMedia({reducedMotion:'reduce'});await state.page.waitForFunction(()=>document.querySelector('#tci-journey').dataset.tciJourneyMode==='fallback');await readable(state);await state.page.emulateMedia({reducedMotion:'no-preference'});await state.page.waitForFunction(()=>document.querySelector('#tci-journey').dataset.tciJourneyMode==='cinematic');healthy(state);
    });
    for(const scenario of[
      {name:'reduced motion',options:{reducedMotion:'reduce'}},
      {name:'Save-Data',options:{init:()=>Object.defineProperty(navigator,'connection',{configurable:true,value:{saveData:true,effectiveType:'4g',addEventListener(){},removeEventListener(){}}})}},
      {name:'unavailable WebGL',options:{init:()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /^webgl/i.test(type)?null:original.call(this,type,...args)};}}},
      {name:'disabled JavaScript',options:{javaScriptEnabled:false}}
    ])await check(scenario.name+' preserves the full single-copy native content flow',async()=>{
      const state=await createPage(scenario.options);await readable(state);assert.equal(await state.page.locator('article[data-journey-chapter]').count(),0);
      if(scenario.name==='Save-Data')assert.equal(state.requested.some(url=>/\/assets\/vendor\/three\.(?:module|core)\.js(?:\?|$)/.test(url)),false);
      const visible=await state.page.locator('#private-about h2,#private-course h2,#private-lead h2').evaluateAll(headings=>headings.map(heading=>({display:getComputedStyle(heading).display,height:heading.getBoundingClientRect().height})));assert(visible.every(heading=>heading.display!=='none'&&heading.height>0));
      await state.page.locator('#private-about').scrollIntoViewIfNeeded();await state.page.screenshot({path:path.join(output,'native-fallback-'+scenario.name.replace(/\W+/g,'-')+'.png'),animations:'disabled'});
    });
  }finally{await fs.writeFile(path.join(output,'journey-results.json'),JSON.stringify({base,browser:browser.version(),results},null,2));await Promise.all(contexts.map(context=>context.close()));await browser.close();}
  console.log(results.filter(result=>result.status==='passed').length+' native journey checks passed; all off-origin traffic blocked.');
})().catch(error=>{console.error(error);process.exitCode=1;});
