/* Original transparent atlas, rendered as 11 sprites without re-generating faces.
 * Coordinates use the 1600 × 1567 preview coordinate system. */
(function (root) {
  'use strict';
  const regions = [
    { name: '困困脸', box: [60, 101, 117, 150] },
    { name: '鼓鼓脸', box: [243, 94, 159, 162] },
    { name: '眯眼笑', box: [449, 44, 179, 258] },
    { name: '大笑脸', box: [695, 32, 295, 320] },
    { name: '卷发少年', box: [1056, 0, 392, 417] },
    { name: '侧脸少年', box: [0, 443, 303, 426] },
    { name: '吃饼少年', box: [357, 378, 455, 565] },
    { name: '金色大脸', box: [790, 377, 411, 699],
      clip: [[875,377],[1050,377],[1113,460],[1113,935],[1201,985],[1201,1076],[922,1076],[911,1048],[895,1026],[840,994],[812,975],[831,944],[838,900],[838,500]] },
    { name: '雕像合影', box: [0, 985, 576, 582] },
    { name: '眼镜大脸', box: [573, 937, 404, 618],
      clip: [[573,937],[790,937],[831,944],[812,975],[840,994],[895,1026],[911,1048],[922,1076],[977,1076],[977,1555],[573,1555]] },
    { name: '终极合照', box: [975, 1072, 625, 495] }
  ];

  function renderAtlas(image, createCanvas) {
    return regions.map(region => {
      const [x,y,w,h] = region.box;
      const crop = createCanvas(Math.ceil(w * image.width / 1600), Math.ceil(h * image.height / 1567));
      const c = crop.getContext('2d');
      c.save();
      if (region.clip) {
        c.beginPath();
        region.clip.forEach(([px,py],i) => c[i ? 'lineTo' : 'moveTo']((px-x)*crop.width/w,(py-y)*crop.height/h));
        c.closePath(); c.clip();
      }
      c.drawImage(image, x*image.width/1600, y*image.height/1567,
        w*image.width/1600, h*image.height/1567, 0,0,crop.width,crop.height);
      c.restore();
      const sprite = createCanvas(512,512), target = sprite.getContext('2d');
      const scale = 512 * 0.92 / Math.max(crop.width,crop.height);
      const dw=crop.width*scale, dh=crop.height*scale;
      target.drawImage(crop,(512-dw)/2,(512-dh)/2,dw,dh);
      return sprite;
    });
  }

  // Fit inscribed circles to the alpha silhouette; same units as the game's PBD solver.
  function shapeFor(sprite, createCanvas) {
    const n=128, c=createCanvas(n,n), ctx=c.getContext('2d');
    ctx.drawImage(sprite,0,0,n,n);
    const data=ctx.getImageData(0,0,n,n).data;
    const mask=new Uint8Array(n*n), dist=new Float32Array(n*n), covered=new Uint8Array(n*n);
    let total=0;
    for(let i=0;i<mask.length;i++){mask[i]=data[i*4+3]>128?1:0;total+=mask[i];dist[i]=mask[i]?1e6:0;}
    for(let y=1;y<n-1;y++)for(let x=1;x<n-1;x++){
      const i=y*n+x;dist[i]=Math.min(dist[i],dist[i-1]+1,dist[i-n]+1,dist[i-n-1]+Math.SQRT2,dist[i-n+1]+Math.SQRT2);
    }
    for(let y=n-2;y>0;y--)for(let x=n-2;x>0;x--){
      const i=y*n+x;dist[i]=Math.min(dist[i],dist[i+1]+1,dist[i+n]+1,dist[i+n+1]+Math.SQRT2,dist[i+n-1]+Math.SQRT2);
    }
    const parts=[];let count=0,rb=0;
    const unit=n*0.92/2;
    while(parts.length<24 && count<total*0.97){
      let best=-1,r=0;
      for(let i=0;i<mask.length;i++)if(mask[i]&&!covered[i]&&dist[i]>r){best=i;r=dist[i];}
      if(best<0||r<1.8)break;
      const cx=best%n,cy=Math.floor(best/n);
      r=Math.max(1,r-0.4);
      const ox=(cx-n/2)/unit,oy=(cy-n/2)/unit,s=r/unit;
      parts.push([ox,oy,s].map(v=>+v.toFixed(4)));rb=Math.max(rb,Math.hypot(ox,oy)+s);
      for(let y=Math.max(0,Math.floor(cy-r));y<=Math.min(n-1,Math.ceil(cy+r));y++)
        for(let x=Math.max(0,Math.floor(cx-r));x<=Math.min(n-1,Math.ceil(cx+r));x++){
          const i=y*n+x;if((x-cx)**2+(y-cy)**2<=r*r && mask[i]&&!covered[i]){covered[i]=1;count++;}
        }
    }
    if(!parts.length)throw new Error('Empty portrait silhouette');
    return {parts,rb:+rb.toFixed(4)};
  }

  const api={regions,renderAtlas,shapeFor};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else {
    root.Portraits=api;
    const image=new Image();
    api.ready=new Promise((resolve,reject)=>{
      image.onload=()=>{try{resolve(renderAtlas(image,(w,h)=>{
        const c=document.createElement('canvas');c.width=w;c.height=h;return c;
      }));}catch(e){reject(e);}};
      image.onerror=()=>reject(new Error('人物素材加载失败，请重新打开游戏'));
      image.src=root.PORTRAIT_ATLAS;
    });
  }
})(typeof window==='undefined'?globalThis:window);
