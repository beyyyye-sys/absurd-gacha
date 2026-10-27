import { ITEMS, RARITIES } from './catalog.js';
import { loadState, saveState, drawItems, unlockSecret, getStats, getAchievements, exportState, importState, createInitialState, PITY_LIMIT } from './engine.js';
import { itemArt } from './icons.js';

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const byId = new Map(ITEMS.map(item => [item.id, item]));
const loaded = loadState();
let state = loaded.state;
let saveError = loaded.warning || '';
let busy = false;
let activeView = 'arcade';
let filter = 'all';
let lastFocused = null;
let logoClicks = 0;
let logoTimer;
let keyBuffer = [];
const pendingSecrets = new Set();
let currentBatch = null;
const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const esc = text => String(text).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const color = item => RARITIES[item.rarity].color;
const pad = (n, digits=2) => String(n).padStart(digits,'0');

let audioContext;
function tone(frequency, duration=.1, type='sine', delay=0, volume=.06) {
  if (!state.settings.sound) return;
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const at = audioContext.currentTime + delay;
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, at);
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(volume, at + .012);
    gain.gain.exponentialRampToValueAtTime(.001, at + duration);
    oscillator.connect(gain); gain.connect(audioContext.destination);
    oscillator.start(at); oscillator.stop(at + duration + .02);
  } catch { /* Silent play remains available when Web Audio is unavailable. */ }
}
function sound(kind, high=false) {
  if (kind === 'pull') [160,210,270,190,340].forEach((f,i) => tone(f,.09,'triangle',i*.1));
  if (kind === 'reveal') (high ? [392,494,587,784,988] : [440,554,659]).forEach((f,i) => tone(f,.28,'triangle',i*.085,.07));
  if (kind === 'click') tone(520,.07,'sine');
  if (kind === 'secret') [523,659,784,1047,784,1047].forEach((f,i) => tone(f,.23,'square',i*.08,.025));
}
function toast(title, message='', icon='✳') {
  const node = document.createElement('div');
  node.className = 'toast';
  node.innerHTML = `<span>${esc(icon)}</span><div><b>${esc(title)}</b><small>${esc(message)}</small></div>`;
  $('#toast-stack').append(node);
  while ($('#toast-stack').children.length > 3) $('#toast-stack').firstElementChild.remove();
  setTimeout(() => node.remove(), 4800);
}
function persist() {
  const result = saveState(state);
  const hadError = Boolean(saveError);
  saveError = result.ok ? '' : result.error;
  if (!result.ok && !hadError) toast('进度暂存在内存中', result.error, '!');
  return result.ok;
}
function renderSettings() {
  $('#sound-toggle').classList.toggle('enabled', state.settings.sound);
  $('#sound-toggle').setAttribute('aria-pressed', String(state.settings.sound));
  $('#sound-toggle').setAttribute('aria-label', state.settings.sound ? '关闭音效' : '开启音效');
  $('#sound-toggle').title = state.settings.sound ? '关闭音效' : '开启音效';
  $('#reduce-motion').checked = state.settings.reduceMotion;
  document.body.classList.toggle('reduced-motion', state.settings.reduceMotion);
  $('#save-status').textContent = saveError ? `! ${saveError}` : '✓ 自动存档已就绪 · 进度仅保存在当前浏览器';
}
function rarityBadge(item) { return `<span class="rarity-badge">${item.secret ? '隐藏 · ' : ''}${RARITIES[item.rarity].label}</span>`; }
function card(item, {preview=false, hidden=false}={}) {
  const owned = state.inventory[item.id];
  const locked = hidden && !owned;
  return `<button class="item-card${locked?' locked':''}${item.secret?' secret-card':''}" style="--item-color:${color(item)}" data-item="${item.id}" aria-label="${locked ? `未发现的${item.secret?'隐藏':RARITIES[item.rarity].label}收藏品` : esc(item.name)}"><span class="item-serial">${esc(item.serial)}</span><span class="card-rarity">${rarityBadge(item)}</span><div class="item-art">${locked?'<span class="locked-symbol">?</span>':itemArt(item)}</div><div class="item-info"><h3>${locked?'未知怪东西':esc(item.name)}</h3><p>${locked ? item.secret?'藏在机器的小秘密里':'还在扭蛋机里摸鱼' : esc(item.tag)}</p></div>${owned?`<span class="item-count">×${owned.count}</span>`:preview?'<span class="preview-label">CATALOG PREVIEW</span>':''}</button>`;
}
function renderRecent() {
  const ids = [...new Set(state.history.map(entry => entry.id))].slice(0,4);
  const preview = ids.length === 0;
  const recent = (preview ? ['lp029','lp062','lp053','lp069'] : ids).map(id => byId.get(id));
  $('#recent-grid').innerHTML = recent.map(item => card(item,{preview})).join('');
  $('#recent-label').textContent = preview ? '本期离谱样本 · 点击预览' : '新鲜出炉，趁热收藏';
}
function renderCollection() {
  const stats = getStats(state);
  $('#collection-summary').textContent = `${stats.normalOwned} / 72 常规收藏 · ${Object.keys(state.inventory).filter(id=>byId.get(id)?.secret).length} / 4 隐藏彩蛋`;
  $('#collection-progress-bar').style.width = `${stats.completion}%`;
  const query = $('#collection-search').value.trim().toLowerCase();
  const ownedOnly = $('#owned-only').checked;
  const items = ITEMS.filter(item => {
    const owned = Boolean(state.inventory[item.id]);
    return (filter==='all'||filter==='secret'&&item.secret||filter===item.rarity&&!item.secret) && (!ownedOnly||owned) && (!query||owned&&`${item.name} ${item.tag} ${item.category}`.toLowerCase().includes(query));
  });
  $('#collection-grid').innerHTML = items.map(item=>card(item,{hidden:true})).join('');
  $('#collection-empty').hidden = items.length>0;
}
function renderAchievements() {
  const achievements = getAchievements(state);
  $('#achievement-summary').textContent = `${achievements.filter(a=>a.unlocked).length} / ${achievements.length} 已达成`;
  $('#achievement-grid').innerHTML = achievements.map((a,i) => `<article class="achievement-card${a.unlocked?' unlocked':''}"><div class="achievement-icon" aria-hidden="true">${['↗','✳','⟳','ϟ','∞','▣','⌂','♛','✦','☀','⌘','✚'][i]}</div><div><h3>${esc(a.name)}${a.unlocked?' ✓':''}</h3><p>${esc(a.description)}</p><div class="progress-track"><span style="width:${a.current/a.goal*100}%"></span></div><small>${a.unlocked ? 'UNLOCKED · '+new Date(a.unlockedAt).toLocaleDateString('zh-CN') : `${a.current} / ${a.goal}`}</small></div></article>`).join('');
}
function render() {
  const stats = getStats(state);
  $('#total-draws').textContent = pad(stats.totalPulls,3);
  $('#unique-count').textContent = pad(stats.normalOwned);
  $('#pity-text').textContent = `传说保底：${state.pity} / ${PITY_LIMIT} 次`;
  const today = new Date().toDateString();
  const todayPulls = state.history.filter(h => !byId.get(h.id)?.secret && new Date(h.at).toDateString()===today).length;
  $('#mission-count').textContent = `${Math.min(todayPulls,5)}/5`;
  $('#mission-copy').textContent = todayPulls>=5?'今日份的快乐已签收。明天见，或再扭一个。':'扭 5 次，给无聊放个假。';
  $('#mission-progress').style.width = `${Math.min(todayPulls,5)/5*100}%`;
  renderRecent(); renderCollection(); renderAchievements(); renderSettings();
}
function setView(view) {
  if (!['arcade','collection','achievements'].includes(view)) return;
  activeView = view;
  $$('.view').forEach(el=>el.classList.toggle('active', el.id===`view-${view}`));
  $$('.main-nav [data-view]').forEach(el=>{el.classList.toggle('active',el.dataset.view===view);el.setAttribute('aria-current',el.dataset.view===view?'page':'false');});
  sound('click');
  if (view==='collection') renderCollection();
  if (view==='achievements') renderAchievements();
  window.scrollTo({top:0,behavior:motionQuery.matches||state.settings.reduceMotion?'instant':'smooth'});
}
function openDialog(dialog) {
  if (dialog.open) return;
  lastFocused = document.activeElement;
  dialog.showModal();
  document.body.classList.add('modal-open');
}
function closeDialog(dialog) {
  dialog.close();
  lastFocused?.focus({preventScroll:true});
}
function confetti() {
  if (motionQuery.matches||state.settings.reduceMotion) return;
  for(let i=0;i<35;i++) {
    const node=document.createElement('i');node.className='confetti';
    node.style.cssText=`--x:${Math.random()*100}vw;--color:${['#d6f75b','#b5a2ea','#ff976b','#ffcc72'][i%4]};--delay:${Math.random()*.4}s;--drift:${Math.random()*240-120}px`;
    document.body.append(node);setTimeout(()=>node.remove(),3400);
  }
}
function showItem(item, result=null, detail=false, fromBatch=false) {
  const owned = state.inventory[item.id];
  const label = detail ? owned ? 'CABINET / OBJECT FILE' : 'CATALOG / SAMPLE PREVIEW' : item.secret?'YOU KNOW TOO MUCH':'FRESH NONSENSE DELIVERED';
  $('#result-content').innerHTML = `<div style="--item-color:${color(item)}"><div class="result-eyebrow">${label}</div>${!detail&&result?.isNew?'<div class="result-stamp">NEW DISCOVERY!</div>':''}<div class="result-art">${itemArt(item)}</div><div class="result-rarity">${rarityBadge(item)}<span>${esc(item.serial)}</span></div><h2 class="result-name">${esc(item.name)}</h2><p class="result-tagline">${esc(item.tag)} · ${esc(item.category)}</p><p class="result-description">${esc(item.description)}</p>${result?.guaranteed?`<p class="result-total">${result.guaranteed==='pity'?'宇宙的良心到账：传说保底已触发。':'十连保底已触发：至少一件稀有。'}</p>`:''}${fromBatch?'<button class="text-link batch-back" data-batch-back>← 返回本次十连</button>':''}<div class="result-footer"><button class="secondary-button" data-result-collection>放进图鉴 ↗</button><button class="primary-button" data-result-again>再扭一个 ✳</button></div><p class="result-total">${owned?`已拥有 ×${owned.count}`:'本期样本预览，扭蛋获得后收入收藏'}${result&&!item.secret?' · 第 '+pad(result.pull,3)+' 次离谱':''}</p></div>`;
  openDialog($('#result-dialog'));
}
function showBatch(results) {
  currentBatch = results;
  const newCount = results.filter(r=>r.isNew).length;
  $('#result-content').innerHTML = `<div class="result-eyebrow">TEN TIMES THE NONSENSE</div><h2 class="batch-title">一份快乐，全家桶装。</h2><p class="batch-subtitle">发现 ${newCount} 件新怪东西 · 十连至少一件稀有 · 点击查看物品</p><div class="batch-result-grid">${results.map(r=>`<button class="batch-item" data-batch-item="${r.item.id}" style="--item-color:${color(r.item)}" aria-label="查看${esc(r.item.name)}">${r.isNew?'<span class="batch-new">NEW</span>':''}${itemArt(r.item)}<h3>${esc(r.item.name)}</h3>${rarityBadge(r.item)}</button>`).join('')}</div><div class="result-footer"><button class="secondary-button" data-result-collection>收好，去图鉴看看 ↗</button><button class="primary-button" data-result-ten>再来十个 ✳</button></div><p class="result-total">所有物品已自动存档 · 第 ${state.totalPulls-9}—${state.totalPulls} 次离谱</p>`;
  openDialog($('#result-dialog'));
}
function announceAchievements(list) {
  list.forEach((a,i)=>setTimeout(()=>toast('成就解锁 · '+a.name,a.description,'✦'),i*650));
}
async function draw(count=1) {
  if (busy) return;
  busy=true;
  const machine=$('#machine');
  [$('#draw-one'),$('#draw-ten'),$('#lever')].forEach(el=>el.disabled=true);
  $('#machine-message').textContent = count===10?'正在批量生成离谱…':'正在搅拌你的好运…';
  $('#live-status').textContent='正在抽取扭蛋';
  machine.classList.remove('dropping');machine.classList.add('drawing');
  sound('pull');
  let response;
  try {
    response=drawItems(state,count);
    state=response.state;
    persist();
    if (!state.settings.reduceMotion&&!motionQuery.matches) {await sleep(1000);machine.classList.add('dropping');await sleep(480);}
    machine.classList.remove('drawing');
    render();
    const high=response.results.some(r=>['epic','legendary'].includes(r.rarity));
    sound('reveal',high);
    if(high) confetti();
    if(count===10)showBatch(response.results);else showItem(response.results[0].item,response.results[0]);
    $('#machine-message').textContent='离谱已送达。下一个？';
    $('#live-status').textContent=count===10?`已获得10件收藏品，${response.results.filter(r=>r.isNew).length}件新发现`:`获得${RARITIES[response.results[0].rarity].label}物品：${response.results[0].item.name}`;
    announceAchievements(response.newAchievements);
  } catch(error) {toast('机器卡了一下',error.message,'!');$('#machine-message').textContent='故障已记录，请再试一次';}
  finally {busy=false;[$('#draw-one'),$('#draw-ten'),$('#lever')].forEach(el=>el.disabled=false);machine.classList.remove('drawing');}
  if(response && new Date().getHours()<6) setTimeout(()=>secret('secret-night'),600);
}
function secret(id) {
  if(state.secrets.includes(id))return;
  if(busy || $('dialog[open]')){pendingSecrets.add(id);return;}
  const response=unlockSecret(state,id);
  state=response.state;persist();render();sound('secret');confetti();
  if(response.item) {showItem(response.item,response.result);toast('机密档案已解锁',response.item.name,'⌘');}
  announceAchievements(response.newAchievements);
}
function renderHistory() {
  $('#history-list').innerHTML = state.history.length ? state.history.map(entry=>{
    const item=byId.get(entry.id);const date=new Date(entry.at);
    return `<div class="history-row" style="--item-color:${color(item)}"><div class="history-icon">${itemArt(item)}</div><div><h3>${esc(item.name)}${entry.isNew?'<span class="history-new">NEW</span>':''}</h3>${rarityBadge(item)}</div><time datetime="${date.toISOString()}">${date.toLocaleDateString('zh-CN',{month:'2-digit',day:'2-digit'})} ${date.toLocaleTimeString('zh-CN',{hour12:false})}</time></div>`;
  }).join('') : '<p class="empty-state">这里还很清白。去扭一下，留下点证据。</p>';
}
$('#draw-one').addEventListener('click',()=>draw());
$('#draw-ten').addEventListener('click',()=>draw(10));
$('#lever').addEventListener('click',()=>draw());
$$('[data-view]').forEach(button=>button.addEventListener('click',()=>setView(button.dataset.view)));
$('#sound-toggle').addEventListener('click',()=>{state.settings.sound=!state.settings.sound;persist();renderSettings();sound('click');toast(state.settings.sound?'音效已开启':'音效已关闭',state.settings.sound?'离谱现在有声音了。':'安静胡闹，也很好。','♪');});
$('#settings-toggle').addEventListener('click',()=>{renderSettings();$('#reset-confirm').hidden=true;openDialog($('#settings-dialog'));});
$('#open-guide').addEventListener('click',()=>openDialog($('#guide-dialog')));
$('#settings-guide').addEventListener('click',()=>{closeDialog($('#settings-dialog'));openDialog($('#guide-dialog'));});
$('#import-trigger').addEventListener('click',()=>$('#import-save').click());
$('#open-history').addEventListener('click',()=>{renderHistory();openDialog($('#history-dialog'));});
$$('dialog').forEach(dialog=>{
  dialog.querySelector('[data-close]')?.addEventListener('click',()=>closeDialog(dialog));
  dialog.addEventListener('close',()=>{
    document.body.classList.toggle('modal-open', Boolean($('dialog[open]')));
    setTimeout(()=>{
      if(!busy&&!$('dialog[open]')&&pendingSecrets.size){const id=pendingSecrets.values().next().value;pendingSecrets.delete(id);secret(id);}
    },250);
  });
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeDialog(dialog);}});
});
function handleCardClick(event) {
  const button=event.target.closest('[data-item]');if(!button)return;
  const item=byId.get(button.dataset.item);
  if(activeView==='collection'&&!state.inventory[item.id]){toast(item.secret?'机密尚未解锁':'这件还没来报到',item.secret?'多探索一下机器，也许会发现小秘密。':`扭蛋可能获得${RARITIES[item.rarity].label}收藏品。`,'?');return;}
  showItem(item,null,true);
}
$('#recent-grid').addEventListener('click',handleCardClick);
$('#collection-grid').addEventListener('click',handleCardClick);
$('#result-content').addEventListener('click',event=>{
  const dialog=$('#result-dialog');
  if(event.target.closest('[data-batch-back]')&&currentBatch)showBatch(currentBatch);
  if(event.target.closest('[data-result-again]')){closeDialog(dialog);draw();}
  if(event.target.closest('[data-result-ten]')){closeDialog(dialog);draw(10);}
  if(event.target.closest('[data-result-collection]')){closeDialog(dialog);setView('collection');}
  const itemButton=event.target.closest('[data-batch-item]');if(itemButton)showItem(byId.get(itemButton.dataset.batchItem),null,true,true);
});
$('#rarity-filters').addEventListener('click',event=>{const button=event.target.closest('[data-rarity]');if(!button)return;filter=button.dataset.rarity;$$('#rarity-filters button').forEach(el=>el.classList.toggle('active',el===button));renderCollection();});
$('#collection-search').addEventListener('input',renderCollection);
$('#owned-only').addEventListener('change',renderCollection);
$('#reduce-motion').addEventListener('change',()=>{state.settings.reduceMotion=$('#reduce-motion').checked;persist();renderSettings();});
$('#export-save').addEventListener('click',()=>{
  const blob=new Blob([exportState(state)],{type:'application/json'});const url=URL.createObjectURL(blob);const anchor=document.createElement('a');
  anchor.href=url;anchor.download=`离谱制造局存档-${new Date().toLocaleDateString('sv-SE')}.json`;anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('离谱已打包','妥善保管这个 JSON 文件，下次可以导入。','↓');
});
$('#import-save').addEventListener('change',async event=>{
  const input=event.target;const file=input.files?.[0];if(!file)return;
  if(busy){toast('扭蛋正在出货','等这次抽奖完成再导入存档。','!');input.value='';return;}
  try {
    if(file.size>2000000)throw new Error('存档文件不能超过 2 MB。');
    const incoming=importState(await file.text());
    // Preserve the current game before replacing it with a validated imported save.
    const previous=exportState(state);
    try {localStorage.setItem('absurd-gacha-before-import',previous);} catch { /* Import still works in memory. */ }
    state=incoming;persist();render();toast('存档已接收','你的怪东西，一个都没少。','↑');
  }catch(error){toast('导入失败',error.message,'!');}
  input.value='';
});
$('#reset-save').addEventListener('click',()=>{$('#reset-confirm').hidden=false;$('#cancel-reset').focus();});
$('#cancel-reset').addEventListener('click',()=>{$('#reset-confirm').hidden=true;});
$('#confirm-reset').addEventListener('click',()=>{
  if(busy){toast('请等这颗扭蛋出货','抽奖完成后再重新开始。','!');return;}
  pendingSecrets.clear();state=createInitialState();persist();render();$('#reset-confirm').hidden=true;closeDialog($('#settings-dialog'));toast('档案已清空','今天也是崭新的离谱人。','↺');
});
$('.brand').addEventListener('click',event=>{
  event.preventDefault();logoClicks++;clearTimeout(logoTimer);logoTimer=setTimeout(()=>logoClicks=0,2200);
  if(logoClicks>=7){logoClicks=0;secret('secret-logo');}else if(activeView!=='arcade')setView('arcade');
});
$('#footer-secret').addEventListener('click',()=>secret('secret-404'));
const konami=['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
document.addEventListener('keydown',event=>{
  if(event.target.matches('input,textarea,select,[contenteditable]'))return;
  if(event.repeat)return;
  if(event.code==='Space'&&activeView==='arcade'&&!$('dialog[open]')&&event.target===document.body){event.preventDefault();draw();}
  if(!busy&&!$('dialog[open]')){
    keyBuffer.push(event.key.length===1?event.key.toLowerCase():event.key);keyBuffer=keyBuffer.slice(-10);
    if(keyBuffer.join(',')===konami.join(',')){keyBuffer=[];secret('secret-konami');}
  }
});
window.addEventListener('storage',event=>{
  if(event.key==='absurd-gacha-save-v1'&&!busy){const next=loadState();if(!next.warning){state=next.state;render();toast('本地档案已同步','另一个标签页更新了你的收藏。','↺');}}
});
render();
if(loaded.warning)setTimeout(()=>toast('存档读取提醒',loaded.warning,'!'),500);
