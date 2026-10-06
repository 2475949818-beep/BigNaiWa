(function(root){
  'use strict';
  const colors=['#dec3a5','#e9bd81','#ffbb62','#ff9465','#f183ad','#cb80f3','#80bcff','#ffd844','#f1b626','#8183ff','#f7b5ff'];
  const reduced=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clock=()=>reduced?0:performance.now()/1000;
  function star(c,x,y,s,color){
    c.fillStyle=color;c.beginPath();c.moveTo(x,y-s);c.lineTo(x+s*.3,y-s*.3);c.lineTo(x+s,y);c.lineTo(x+s*.3,y+s*.3);
    c.lineTo(x,y+s);c.lineTo(x-s*.3,y+s*.3);c.lineTo(x-s,y);c.lineTo(x-s*.3,y-s*.3);c.closePath();c.fill();
  }
  function draw(c,r,tier){
    const t=clock(),hero=tier>=8,color=colors[tier];
    c.save();
    const outer=r*(hero?1.34:1.15),glow=c.createRadialGradient(0,0,r*.25,0,0,outer);
    glow.addColorStop(0,color+(hero?'48':'12'));glow.addColorStop(.72,color+(hero?'38':'18'));glow.addColorStop(1,color+'00');
    c.fillStyle=glow;c.beginPath();c.arc(0,0,outer,0,Math.PI*2);c.fill();
    // The first eight grades gain a few more moving glints with each evolution.
    const count=hero?8+(tier-8)*4:Math.floor(tier/2)+1;
    for(let i=0;i<count;i++){
      const a=i/count*Math.PI*2+t*(hero?.32:.18),rr=r*(hero?1.12:1.02);
      const tint=tier===10?['#ff65ad','#78d9ff','#ffd55d','#b79bff'][i%4]:color;
      star(c,Math.cos(a)*rr,Math.sin(a)*rr,Math.max(1.1,r*(hero?.039:.021)),tint);
    }
    if(hero){
      c.rotate(t*.22);c.lineWidth=Math.max(.8,r*.018);
      c.strokeStyle=color;c.globalAlpha=.8;c.setLineDash([r*.16,r*.08]);
      c.beginPath();c.arc(0,0,r*1.055,0,Math.PI*2);c.stroke();c.setLineDash([]);
      if(tier===8){
        c.globalAlpha=.55;c.lineWidth=Math.max(.8,r*.01);c.beginPath();c.arc(0,0,r*1.17,0,Math.PI*2);c.stroke();
      }
      if(tier===9){
        c.strokeStyle='#5cd9ff';c.lineWidth=Math.max(1,r*.018);
        for(let j=0;j<3;j++){
          c.beginPath();for(let k=0;k<=12;k++){
            const a=j*Math.PI*2/3+k*.055-t*.4;
            const rr=r*(1.12+(k%2?.055:-.018));
            c[k?'lineTo':'moveTo'](Math.cos(a)*rr,Math.sin(a)*rr);
          }c.stroke();
        }
      }
      if(tier===10){
        c.lineWidth=Math.max(1.3,r*.025);
        ['#ff70ae','#ffcf63','#6be6d1','#85b4ff','#c294ff','#ff70ae'].forEach((color,i)=>{
          c.strokeStyle=color;c.beginPath();c.arc(0,0,r*1.18,i*Math.PI/3+.04,(i+1)*Math.PI/3-.04);c.stroke();
        });
        for(let i=0;i<12;i++){
          c.rotate(Math.PI/6);c.strokeStyle=i%2?'#ffd670':'#baa5ff';c.globalAlpha=.35;
          c.beginPath();c.moveTo(r*1.25,0);c.lineTo(r*1.36,0);c.stroke();
        }
      }
    }
    c.restore();
  }
  function burst(c,x,y,r,tier,t){
    if(reduced||tier<2)return;
    c.save();c.translate(x,y);c.globalAlpha=(1-t)*(tier>=8?.9:.45);
    c.strokeStyle=colors[tier];c.lineWidth=Math.max(1,(tier>=8?5:2)*(1-t));
    c.beginPath();c.arc(0,0,r*(.7+t*.9),0,Math.PI*2);c.stroke();
    if(tier>=8)for(let i=0;i<12;i++){
      const a=i*Math.PI/6,rr=r*(1+t*.8);star(c,Math.cos(a)*rr,Math.sin(a)*rr,r*.045*(1-t),colors[tier]);
    }
    c.restore();
  }
  root.PortraitFX={draw,burst,colors};
})(typeof window==='undefined'?globalThis:window);
