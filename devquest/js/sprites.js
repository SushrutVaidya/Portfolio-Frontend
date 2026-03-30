(() => {
  // ── Image paths (relative to landing.html in devquest/) ──
  const ASSET = p => `assets/${p}`;

  // ── Sprite crop definitions ──
  // [imgKey, sx, sy, sw, sh, thresh(dist²), cropTop, erodeR]
  // thresh=0 → no removal | thresh=150 → gentle | thresh=350 → standard
  const CROPS = [
    ['sada', 191, 311, 482, 362,   0,  0, 0],  //  0 SADAHARU_A
    ['sada', 887, 309, 518, 364,   0,  0, 0],  //  1 SADAHARU_B
    ['yoro', 100,  60, 429, 520, 350, 75, 0],  //  2 GINTOKI_A
    ['yoro', 566,  60, 343, 520, 350, 75, 0],  //  3 GINTOKI_B
    ['yoro',1136,  60, 443, 520, 350, 75, 0],  //  4 SHINPACHI_A
    ['yoro',1604,  60, 287, 514, 350, 75, 0],  //  5 SHINPACHI_B
    ['yoro',2090,  60, 423, 516, 350, 75, 0],  //  6 KAGURA_A
    ['yoro',2514,  60, 349, 516, 350, 75, 0],  //  7 KAGURA_B
    ['ek',  137, 327, 313, 356, 150,  0, 3],   //  8 ELIZABETH_A
    ['ek',  450, 332, 292, 348, 150,  0, 3],   //  9 ELIZABETH_B
    ['ek',  827, 332, 248, 348, 350,  0, 0],   // 10 KATSURA_A
    ['ek', 1119, 338, 263, 342, 350,  0, 0],   // 11 KATSURA_B
    ['shin', 162, 162, 196, 298, 350,  0, 0],  // 12 HIJIKATA_A
    ['shin', 162, 548, 196, 295, 350,  0, 0],  // 13 HIJIKATA_B
    ['shin', 474, 167, 258, 293, 350,  0, 0],  // 14 OKITA_A
    ['shin', 474, 553, 198, 290, 350,  0, 0],  // 15 OKITA_B
    ['shin', 805, 173, 201, 287, 350,  0, 0],  // 16 KONDO_A
    ['shin', 805, 552, 201, 291, 350,  0, 0],  // 17 KONDO_B
    ['shin',1117, 175, 209, 285, 350,  0, 0],  // 18 YAMAZAKI_A
    ['shin',1103, 555, 225, 288, 350,  0, 0],  // 19 YAMAZAKI_B
  ];

  // ── Character definitions ──
  // [name, fA, fB, norm, startX, flipX, blend]
  // norm = targetHeight / spriteEffectiveHeight  (at scale=1 → targetHeight rendered px)
  const H = 95, SH = 75, EH = 92;
  const CHARS = [
    ['Gintoki',   2,  3, H/445,   -80,  false, 'source-over'],
    ['Shinpachi', 4,  5, H/445,  -280,  false, 'source-over'],
    ['Kagura',    6,  7, H/441,  -480,  false, 'source-over'],
    ['Sadaharu',  0,  1, SH/362, -680,  true,  'source-over'],
    ['Hijikata', 12, 13, H/298, -1000,  false, 'source-over'],
    ['Okita',    14, 15, H/293, -1200,  false, 'source-over'],
    ['Kondo',    16, 17, H/287, -1400,  false, 'source-over'],
    ['Yamazaki', 18, 19, H/285, -1600,  false, 'source-over'],
    ['Elizabeth', 8,  9, EH/356,-2000,  false, 'source-over'],
    ['Katsura',  10, 11, H/348, -2200,  false, 'source-over'],
  ];

  // ── Background removal ──
  function removeBG(d, w, h, thresh, erodeR) {
    if (thresh === 0) return;
    if (erodeR === 0) {
      for (let i = 0; i < d.length; i += 4) {
        const dr=255-d[i], dg=255-d[i+1], db=255-d[i+2];
        if (dr*dr+dg*dg+db*db < thresh) d[i+3] = 0;
      }
      return;
    }
    const bg = new Uint8Array(w * h);
    const vis = new Uint8Array(w * h);
    function isBg(x, y) {
      const i=(y*w+x)*4, dr=255-d[i], dg=255-d[i+1], db=255-d[i+2];
      return dr*dr+dg*dg+db*db < thresh;
    }
    function fill(sx, sy) {
      const stk=[sx,sy];
      while(stk.length){
        const cy=stk.pop(), cx=stk.pop();
        if(cx<0||cx>=w||cy<0||cy>=h) continue;
        const idx=cy*w+cx; if(vis[idx]) continue; vis[idx]=1;
        if(!isBg(cx,cy)) continue;
        bg[idx]=1;
        stk.push(cx-1,cy, cx+1,cy, cx,cy-1, cx,cy+1);
      }
    }
    for(let x=0;x<w;x++){fill(x,0);fill(x,h-1);}
    for(let y=1;y<h-1;y++){fill(0,y);fill(w-1,y);}
    for(let y=0;y<h;y++) for(let x=0;x<w;x++) {
      if(!bg[y*w+x]) continue;
      let ok=true;
      outer: for(let dy=-erodeR;dy<=erodeR;dy++) for(let dx=-erodeR;dx<=erodeR;dx++) {
        const nx=x+dx, ny=y+dy;
        if(nx<0||nx>=w||ny<0||ny>=h) continue;
        if(!bg[ny*w+nx]){ok=false;break outer;}
      }
      if(ok) d[(y*w+x)*4+3]=0;
    }
  }

  // ── Process a crop into a transparent canvas ──
  function makeSprite(img, sx, sy, sw, sh, thresh, ct, erodeR) {
    const ch = sh - ct;
    const oc = document.createElement('canvas'); oc.width=sw; oc.height=ch;
    const c = oc.getContext('2d');
    c.drawImage(img, sx, sy+ct, sw, ch, 0, 0, sw, ch);
    try {
      const id = c.getImageData(0, 0, sw, ch);
      removeBG(id.data, sw, ch, thresh, erodeR);
      c.putImageData(id, 0, 0);
    } catch(e) {
      // file:// CORS blocks getImageData — skip bg removal, sprites still render
    }
    return oc;
  }

  // ── Draw background ──
  function drawBackground(ctx, W, H, groundY, bgImg) {
    const sky = ctx.createLinearGradient(0, 0, 0, groundY);
    sky.addColorStop(0, '#7ec8e3'); sky.addColorStop(1, '#c5e8f5');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, groundY);
    if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
      const iw=bgImg.naturalWidth, ih=bgImg.naturalHeight;
      const bScale = groundY / (ih * 0.55);
      const bw = Math.round(iw * bScale);
      const bh = Math.round(ih * bScale);
      const bx = Math.round(W/2 - bw/2);
      const by = Math.round(groundY - bh * 0.72);
      ctx.drawImage(bgImg, bx, by, bw, bh);
    }
    ctx.fillStyle = '#c8aa78'; ctx.fillRect(0, groundY, W, H - groundY);
    ctx.fillStyle = '#a08858'; ctx.fillRect(0, groundY, W, 2);
  }

  // ── Init ──
  const init = () => {
    const scene = document.createElement('div');
    scene.className = 'sprite-scene';
    document.body.appendChild(scene);

    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;bottom:0;left:0;image-rendering:pixelated;';
    scene.appendChild(canvas);

    const H_CANVAS = 180;
    function resize() { canvas.width = window.innerWidth; canvas.height = H_CANVAS; }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const ctx = canvas.getContext('2d');
    const groundY = Math.round(H_CANVAS * 0.78);

    // ── Load images ──
    const imgSrcs = {
      yoro: ASSET('sprites_ref.png'),
      shin: ASSET('shinsengumi_ref.png'),
      sada: ASSET('sadaharu_ref.png'),
      ek:   ASSET('elizabeth_katsura_ref.png'),
      bg:   ASSET('yorozuya_small.png'),
    };
    const imgs = {}, loaded = {};
    const proc = [];
    const SPRITE_KEYS = ['yoro','shin','sada','ek'];

    function tryBuild() {
      if (!SPRITE_KEYS.every(k => loaded[k])) return;
      if (proc.length) return;
      try {
        CROPS.forEach(c => proc.push(makeSprite(imgs[c[0]],c[1],c[2],c[3],c[4],c[5],c[6],c[7])));
      } catch(e) {
        // If sprite building fails entirely, proc stays empty and characters won't render
      }
    }

    Object.entries(imgSrcs).forEach(([k, src]) => {
      const im = new Image(); imgs[k] = im;
      im.onload  = () => { loaded[k] = true;  tryBuild(); };
      im.onerror = () => { loaded[k] = true;  tryBuild(); };
      im.src = src;
    });

    // ── Character state ──
    const SPEED  = 2.0;
    const LOOP_W = 2600;
    const cs = CHARS.map(([name,fA,fB,norm,sx,flipX,blend]) =>
      ({ fA, fB, norm, flipX, blend, x: sx })
    );

    // ── Animation ──
    let frame = 0, timer = 0, last = 0;
    const FPS = 6;

    function loop(ts) {
      const dt = Math.min(ts - last, 50); last = ts;
      const W = canvas.width;
      ctx.clearRect(0, 0, W, H_CANVAS);
      drawBackground(ctx, W, H_CANVAS, groundY, imgs.bg);

      if (proc.length) {
        timer += dt;
        if (timer >= 1000 / FPS) { frame = (frame + 1) % 2; timer = 0; }
        cs.forEach(ch => {
          ch.x += SPEED * (dt / 16);
          if (ch.x > W + 140) ch.x -= LOOP_W;
        });
        cs.forEach(ch => {
          const pc = proc[frame === 0 ? ch.fA : ch.fB]; if (!pc) return;
          const dw = Math.round(pc.width  * ch.norm);
          const dh = Math.round(pc.height * ch.norm);
          const dy = Math.round(groundY - dh);
          ctx.save();
          ctx.globalCompositeOperation = ch.blend || 'source-over';
          if (ch.flipX) {
            ctx.translate(Math.round(ch.x) + dw, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(pc, 0, dy, dw, dh);
          } else {
            ctx.drawImage(pc, Math.round(ch.x), dy, dw, dh);
          }
          ctx.restore();
        });
      }

      requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
  };

  // Only run on desktop
  if (window.innerWidth > 600) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }
})();
