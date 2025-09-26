/**
 * uBlobeBM – Clean rewritten bookmarklet manager overlay.
 * Toggle with: Ctrl + Shift + ` (Backquote)
 * Stores bookmarklets in localStorage and lets you add/edit/run them.
 */
(function(){
  'use strict';

  let container=null, iframe=null, opening=false, closing=false;
  let dragging=false, dragOffX=0, dragOffY=0;

  document.addEventListener('keydown', e=>{
    if(e.code==='Backquote' && e.ctrlKey && e.shiftKey){
      if(iframe) closeOverlay(); else if(!opening && !closing) openOverlay();
    }
  });

  function openOverlay(){
    opening=true;
    container=document.createElement('div');
    container.style.cssText='position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:640px;height:480px;z-index:999999999;background:#fff;border-radius:10px;box-shadow:0 4px 20px rgba(0,0,0,.35);opacity:0;transition:opacity .25s ease,transform .25s ease;overflow:hidden;font-family:Arial,Helvetica,sans-serif;';
    const bar=document.createElement('div');
    bar.textContent='uBlobeBM';
    bar.style.cssText='position:absolute;top:0;left:0;height:44px;width:100%;background:#4caf50;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:600;letter-spacing:.5px;user-select:none;cursor:move;';
    bar.addEventListener('mousedown',startDrag);
    const btn=document.createElement('button');
    btn.textContent='×';
    btn.style.cssText='position:absolute;top:0;right:0;width:48px;height:44px;background:transparent;border:none;color:#fff;font-size:26px;cursor:pointer;transition:background .25s;';
    btn.onmouseenter=()=>btn.style.background='rgba(0,0,0,.18)';
    btn.onmouseleave=()=>btn.style.background='transparent';
    btn.onclick=closeOverlay;bar.appendChild(btn);
    iframe=document.createElement('iframe');
    iframe.title='uBlobeBM';
    iframe.setAttribute('sandbox','allow-scripts allow-same-origin');
    iframe.style.cssText='position:absolute;top:44px;left:0;width:100%;height:calc(100% - 44px);border:0;';
    container.appendChild(iframe);container.appendChild(bar);document.body.appendChild(container);
    const doc=iframe.contentDocument||iframe.contentWindow.document;doc.open();doc.write(buildInnerHtml());doc.close();
    requestAnimationFrame(()=>{container.style.opacity='1';container.style.transform='translate(-50%,-52%)';setTimeout(()=>{opening=false;},250);});
    window.addEventListener('message',onMessage);
  }

  function buildInnerHtml(){
    return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>uBlobeBM</title><style>
    body{margin:0;font-family:Arial,Helvetica,sans-serif;background:#f5f5f5;color:#222;font-size:14px;}
    #wrap{padding:10px 14px;}h1{margin:0 0 10px;font-size:18px;font-weight:600;letter-spacing:.5px;}
    label{font-size:11px;text-transform:uppercase;letter-spacing:.55px;color:#555;display:block;margin:4px 0 2px;}
    input,textarea{width:100%;box-sizing:border-box;font:13px/1.3 monospace;padding:6px 8px;border:1px solid #bbb;border-radius:6px;background:#fff;resize:vertical;}
    textarea{min-height:92px;}ul{list-style:none;margin:8px 0 0;padding:0;border:1px solid #bbb;border-radius:7px;background:#fff;max-height:150px;overflow:auto;font:13px/1.35 monospace;}
    li{padding:4px 8px;cursor:pointer;border-bottom:1px solid #eee;}li:last-child{border-bottom:none;}li.sel{background:#4caf50;color:#fff;}
    button{border:none;cursor:pointer;background:#4caf50;color:#fff;padding:7px 14px;border-radius:6px;font-size:13px;letter-spacing:.5px;display:inline-flex;align-items:center;gap:6px;}
    button:hover{background:#3d9342;}button:active{transform:translateY(1px);}button.danger{background:#d32f2f;}button.danger:hover{background:#b22222;}
    #buttons{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;}#status{font-size:11px;margin-top:6px;min-height:14px;}.row{margin-bottom:4px;}
    ::-webkit-scrollbar{width:10px}::-webkit-scrollbar-track{background:#f1f1f1}::-webkit-scrollbar-thumb{background:#d3d3d3}::-webkit-scrollbar-thumb:hover{background:#b2b2b2}
    </style></head><body><div id="wrap">
      <h1>Bookmarklets</h1>
      <div class="row"><label for="disp">Display</label><input id="disp" placeholder="Name"/></div>
      <div class="row"><label for="code">Code</label><textarea id="code" placeholder="javascript:... or raw JS"></textarea></div>
      <div id="buttons"><button id="add">Add</button><button id="edit">Edit</button><button id="del" class="danger">Delete</button><button id="run">Run</button><button id="clr" class="danger">Clear All</button></div>
      <ul id="list" tabindex="0"></ul><div id="status"></div>
      <div style="font-size:10px;opacity:.7;margin-top:4px;">Ctrl+Shift+&#96; to toggle • Stored locally</div>
    </div><script>(function(){
      const list=document.getElementById('list');const disp=document.getElementById('disp');const code=document.getElementById('code');const statusEl=document.getElementById('status');const LS_KEY='uBlobeBM_items_v2';
      function load(){list.innerHTML='';try{const raw=localStorage.getItem(LS_KEY);if(!raw)return;JSON.parse(raw).forEach(o=>addItem(o.display,o.code));}catch(e){}}
      function save(){const items=[...list.querySelectorAll('li')].map(li=>({display:li.dataset.display,code:li.dataset.code}));localStorage.setItem(LS_KEY,JSON.stringify(items));}
      function addItem(d,c){const li=document.createElement('li');li.textContent=d;li.dataset.display=d;li.dataset.code=c;li.tabIndex=0;li.onclick=()=>select(li);list.appendChild(li);} 
      function select(li){[...list.children].forEach(n=>n.classList.remove('sel'));li.classList.add('sel');disp.value=li.dataset.display;code.value=li.dataset.code;}
      function setStatus(m,err){statusEl.textContent=m;statusEl.style.color=err?'#d32f2f':'#2e7d32';}
      function cur(){return list.querySelector('.sel');}
      function normalize(b){return b.startsWith('javascript:')?b.slice(11):b;}
      document.getElementById('add').onclick=()=>{if(!disp.value.trim()||!code.value.trim()){setStatus('Both fields required',true);return;}addItem(disp.value.trim(),code.value.trim());save();disp.value='';code.value='';setStatus('Added');};
      document.getElementById('edit').onclick=()=>{const li=cur();if(!li){setStatus('Select item',true);return;}li.dataset.display=disp.value.trim();li.dataset.code=code.value.trim();li.textContent=li.dataset.display;save();setStatus('Edited');};
      document.getElementById('del').onclick=()=>{const li=cur();if(!li){setStatus('Select item',true);return;}li.remove();save();setStatus('Deleted');};
      document.getElementById('run').onclick=()=>{const li=cur();if(!li){setStatus('Select item',true);return;}parent.postMessage('run:'+encodeURIComponent(normalize(li.dataset.code)),'*');setStatus('Running…');};
      document.getElementById('clr').onclick=()=>{if(confirm('Clear ALL bookmarklets?')){localStorage.removeItem(LS_KEY);list.innerHTML='';setStatus('Cleared');disp.value='';code.value='';}};load();})();</script></body></html>`;
  }

  function startDrag(e){if(!container)return;dragging=true;const r=container.getBoundingClientRect();dragOffX=e.clientX-r.left;dragOffY=e.clientY-r.top;document.addEventListener('mousemove',onDrag);document.addEventListener('mouseup',stopDrag);iframe.style.pointerEvents='none';}
  function onDrag(e){if(!dragging||!container)return;container.style.left=(e.clientX-dragOffX)+'px';container.style.top=(e.clientY-dragOffY)+'px';container.style.transform='translate(0,0)';}
  function stopDrag(){dragging=false;iframe.style.pointerEvents='auto';document.removeEventListener('mousemove',onDrag);document.removeEventListener('mouseup',stopDrag);}

  function manualDecode(str){const map={'%20':' ','%21':'!','%22':'"','%23':'#','%24':'$','%25':'%','%26':'&','%27':'\'','%28':'(','%29':')','%2C':',','%2E':'.','%2F':'/','%3A':':','%3B':';','%3C':'<','%3D':'=','%3E':'>','%3F':'?','%40':'@','%5B':'[','%5D':']','%5E':'^','%60':'`','%7B':'{','%7C':'|','%7D':'}','%7E':'~'};return str.replace(/%(20|21|22|23|24|25|26|27|28|29|2C|2E|2F|3A|3B|3C|3D|3E|3F|40|5B|5D|5E|60|7B|7C|7D|7E)/g,m=>map[m]);}

  function onMessage(ev){if(typeof ev.data==='string' && ev.data.startsWith('run:')){const payload=ev.data.slice(4);closeOverlay();setTimeout(()=>{try{execute(decodeURIComponent(payload));}catch(err){try{execute(manualDecode(payload));}catch(e2){console.error('Bookmarklet error',e2);alert('Bookmarklet error: '+e2.message);}}},170);}}
  function execute(src){const code=src.startsWith('javascript:')?src.slice(11):src;try{(0,eval)(code);}catch(e){console.error(e);alert('Error executing bookmarklet: '+e.message);}}
  function closeOverlay(){if(!container||closing)return;closing=true;container.style.opacity='0';setTimeout(()=>{if(container)container.remove();iframe=null;container=null;closing=false;opening=false;window.removeEventListener('message',onMessage);},220);}  
  window.addEventListener('message',onMessage);
})();