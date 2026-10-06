(function(){
  'use strict';
  const $=id=>document.getElementById(id),key='danaiwa.portraits.board.v1',nameKey='danaiwa.portraits.name.v1';
  let rows=[];
  try{const data=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(data))rows=data.filter(r=>r&&typeof r.name==='string'&&Number.isFinite(r.score)).slice(-20);}catch(e){}
  let name=localStorage.getItem(nameKey)||'默认用户';
  function saveName(){name=$('nickInput').value.replace(/[\u0000-\u001f]/g,'').trim().slice(0,12)||'默认用户';$('nickInput').value=name;$('myNameLabel').textContent=name;try{localStorage.setItem(nameKey,name);}catch(e){}}
  function render(){
    const list=$('boardList');list.replaceChildren();
    if(!rows.length){list.textContent='还没有成绩，来合出第一张终极合照吧！';return;}
    rows.slice().sort((a,b)=>b.score-a.score).forEach((r,i)=>{
      const row=document.createElement('div');row.className='local-row';
      const label=document.createElement('span'),score=document.createElement('strong');
      label.textContent=(i+1)+'. '+r.name;score.textContent=r.score+' 分';row.append(label,score);list.append(row);
    });
  }
  function open(){render();$('boardModal').classList.add('show');$('boardModal').setAttribute('aria-hidden','false');}
  function close(){$('boardModal').classList.remove('show');$('boardModal').setAttribute('aria-hidden','true');}
  ['boardBtn','boardBtn2','editNameBtn'].forEach(id=>$(id).addEventListener('click',open));
  $('boardClose').addEventListener('click',close);$('boardRefresh').addEventListener('click',render);
  $('boardModal').addEventListener('click',e=>{if(e.target===$('boardModal'))close();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
  $('nickInput').value=name;$('myNameLabel').textContent=name;
  $('nickInput').addEventListener('change',saveName);$('nickInput').addEventListener('blur',saveName);
  window.DanaiwaBoard={onGameOver(score){
    if(score>0){rows.push({name,score,time:Date.now()});rows=rows.slice(-20);try{localStorage.setItem(key,JSON.stringify(rows));$('submitMsg').textContent='成绩已保存在本机';}catch(e){$('submitMsg').textContent='成绩仅保留到页面关闭（浏览器存储不可用）';}}
    else $('submitMsg').textContent='再来一局，拿下第一分！';
  }};
})();
