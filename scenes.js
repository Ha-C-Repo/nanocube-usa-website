/* Nano Cube USA - detailed structural steel 3D scene library (three.js r128) */
(function(){
  function fail(){ var n=document.querySelectorAll('.s3d'); for(var i=0;i<n.length;i++) n[i].classList.add('nowebgl'); }
  if(!window.THREE){ fail(); return; }
  var T=window.THREE;
  function mat(c,m,r,e){ var o={color:c,metalness:m,roughness:r}; if(e){o.emissive=e;o.emissiveIntensity=0.9;} return new T.MeshStandardMaterial(o); }
  var M={
    steel:mat(0x9aa6b2,0.82,0.36), steel2:mat(0x828e9a,0.8,0.42), dark:mat(0x5f6b77,0.72,0.5),
    plate:mat(0x4b5560,0.75,0.45), base:mat(0x3c454e,0.6,0.6), concrete:mat(0xcfd1d4,0.04,0.94),
    embed:mat(0x6b7480,0.7,0.5), deck:mat(0xb7c0c9,0.5,0.6),
    glow:mat(0xc8102e,0.5,0.4,0xc8102e), bolt:mat(0xb9c2cc,0.7,0.4),
    red:mat(0xcf2233,0.5,0.5), yellow:mat(0xe6b422,0.45,0.55), teal:mat(0x2bb6a8,0.4,0.55), gray:mat(0x9aa3ad,0.6,0.5)
  };
  function box(g,material,w,h,d){ var m=new T.Mesh(new T.BoxGeometry(w,h,d),material); g.add(m); return m; }
  // W-shape column/beam built from 3 plates (2 flanges + web)
  function wshape(g,material,len,depth,wide,axis){
    var grp=new T.Group(); var t=Math.max(0.05,depth*0.09);
    var web,f1,f2;
    if(axis==='y'){ web=box(grp,material,wide*0.16,len,depth-2*t); f1=box(grp,material,wide,len,t); f1.position.z=(depth-t)/2; f2=box(grp,material,wide,len,t); f2.position.z=-(depth-t)/2; }
    else if(axis==='x'){ web=box(grp,material,len,depth-2*t,wide*0.16); f1=box(grp,material,len,t,wide); f1.position.z=(depth-t)/2; f2=box(grp,material,len,t,wide); f2.position.z=-(depth-t)/2; }
    else { web=box(grp,material,wide*0.16,depth-2*t,len); f1=box(grp,material,wide,t,len); f1.position.x=(depth-t)/2; f2=box(grp,material,wide,t,len); f2.position.x=-(depth-t)/2; }
    g.add(grp); return grp;
  }
  function reg(L,obj,o){ o=o||{};
    var p1=obj.position.clone(); var p0=o.from? p1.clone().add(o.from): p1.clone().add(new T.Vector3(0,18,0));
    var r1={x:obj.rotation.x,y:obj.rotation.y,z:obj.rotation.z}; var r0=o.r0? o.r0:{x:r1.x,y:r1.y,z:r1.z};
    var it={obj:obj,p0:p0,p1:p1,r0:r0,r1:r1,delay:o.delay||0,dur:o.dur||0.6}; if(o.s0!=null) it.s0=o.s0; L.push(it); return obj;
  }
  function grid(g,s,n,c1,c2){ g.add(new T.GridHelper(s,n,c1||0x3a4b5c,c2||0x222e3a)); }

  var B={};
  // ---- DETAILED multi-story steel assembly (dark) ----
  B.assembly=function(g){ var L=[]; grid(g,90,45);
    var BX=[-12,-6,0,6,12], BZ=[-6,0,6], story=4.5, levels=3, c=0.55, d=0, i,j,lv;
    // base plates + columns (W-shape)
    for(i=0;i<BX.length;i++)for(j=0;j<BZ.length;j++){
      var bp=box(g,M.base,1.3,0.18,1.3); bp.position.set(BX[i],0.09,BZ[j]); reg(L,bp,{from:new T.Vector3(0,-3,0),delay:d*0.5,dur:0.4});
      var col=wshape(g,M.steel,levels*story,c,c,'y'); col.position.set(BX[i],levels*story/2,BZ[j]); reg(L,col,{delay:d,dur:0.6}); d+=0.05;
    }
    // beams per level + connection glow plates
    for(lv=1;lv<=levels;lv++){ var y=lv*story;
      for(j=0;j<BZ.length;j++){ var bx=wshape(g,M.steel,24.6,0.5,0.42,'x'); bx.position.set(0,y,BZ[j]); reg(L,bx,{delay:d,dur:0.5}); d+=0.04; }
      for(i=0;i<BX.length;i++){ var bz=wshape(g,M.steel,12.6,0.5,0.42,'z'); bz.position.set(BX[i],y,0); reg(L,bz,{delay:d,dur:0.5}); d+=0.04; }
      // infill floor joists (one direction)
      for(var x=-10.5;x<=10.5;x+=2.2){ var jo=box(g,M.dark,0.16,0.26,12.4); jo.position.set(x,y-0.05,0); reg(L,jo,{delay:d,dur:0.35}); d+=0.015; }
      // connection glow at perimeter joints
      for(i=0;i<BX.length;i++){ for(j=0;j<BZ.length;j+=2){ var gp=box(g,M.glow,0.7,0.55,0.7); gp.position.set(BX[i],y,BZ[j]); reg(L,gp,{s0:0.01,delay:d+0.2,dur:0.4}); } }
      d+=0.06;
    }
    // HSS X-bracing on the two X-end faces, each level
    function brace(xc,zc,delay){ var len=Math.sqrt(6*6+story*story), a=Math.atan2(story,6);
      var b=box(g,M.steel2,len,0.3,0.3); b.position.set(xc,story/2+ (delay*0),zc); b.rotation.z=a; }
    for(lv=0;lv<levels;lv++){ var y0=lv*story, len=Math.sqrt(6*6+story*story), a=Math.atan2(story,6);
      [[-12,-6],[12,6]].forEach(function(p,k){ var midx=(p[0]+p[1])/2;
        var br=box(g,M.steel2,len,0.28,0.28); br.position.set(midx,y0+story/2,7); br.rotation.z=(k===0?a:-a); reg(L,br,{s0:0.02,delay:d+lv*0.15,dur:0.4});
        var br2=box(g,M.steel2,len,0.28,0.28); br2.position.set(midx,y0+story/2,7); br2.rotation.z=(k===0?-a:a); reg(L,br2,{s0:0.02,delay:d+lv*0.15+0.08,dur:0.4}); }); }
    g.position.y=-3.4; return {members:L,camR:38,camH:15,spin:0.14}; };

  // ---- DETAILED concrete tilt-up building (dark) - rebuilt 2026-06-17 per CEO ----
  B.tiltwall=function(g){ var L=[]; grid(g,80,40);
    var W=18,D=12,H=6.5,d=0,i,j,x,z;
    var cx=[-W/2+1.2,0,W/2-1.2], cz=[-D/2+1.2,0,D/2-1.2];
    // interior W-shape steel columns - real I-beam section (2 flanges + web), RED
    for(i=0;i<cx.length;i++)for(j=0;j<cz.length;j++){
      var col=wshape(g,M.red,H,0.58,0.5,'y'); col.position.set(cx[i],H/2,cz[j]); reg(L,col,{from:new T.Vector3(0,3,0),delay:0.1+d,dur:0.45}); d+=0.04; }
    // roof girders carrying the joists - real W-shape profile, YELLOW (span in z over the column lines)
    for(i=0;i<cx.length;i++){ var gd=wshape(g,M.yellow,D-1.0,0.62,0.48,'z'); gd.position.set(cx[i],H+0.06,0); reg(L,gd,{from:new T.Vector3(0,3,0),delay:0.45+d,dur:0.4}); d+=0.03; }
    var eg1=wshape(g,M.yellow,W-1.0,0.56,0.44,'x'); eg1.position.set(0,H+0.06,-D/2+1.2); reg(L,eg1,{from:new T.Vector3(0,3,0),delay:0.5,dur:0.4});
    var eg2=wshape(g,M.yellow,W-1.0,0.56,0.44,'x'); eg2.position.set(0,H+0.06, D/2-1.2); reg(L,eg2,{from:new T.Vector3(0,3,0),delay:0.55,dur:0.4});
    // open-web bar joists: top chord + bottom chord + real web zigzag, GRAY with RED seat accent
    function joist(zc,delay){ var span=W-1.6, x0=-span/2, x1=span/2, ch=0.6, yT=H+0.40;
      var tc=box(g,M.gray,span,0.10,0.17); tc.position.set(0,yT,zc); reg(L,tc,{from:new T.Vector3(0,2.5,0),delay:delay,dur:0.3});
      var bc=box(g,M.gray,span,0.09,0.14); bc.position.set(0,yT-ch,zc); reg(L,bc,{from:new T.Vector3(0,2.5,0),delay:delay+0.02,dur:0.3});
      var n=Math.round(span/1.0), pitch=span/n, k;
      for(k=0;k<n;k++){ var xc=x0+pitch*(k+0.5); var diag=box(g,M.gray,0.07,Math.sqrt(ch*ch+pitch*pitch),0.07);
        diag.position.set(xc,yT-ch/2,zc); diag.rotation.z=(k%2?1:-1)*Math.atan2(pitch,ch); reg(L,diag,{s0:0.05,delay:delay+0.04+k*0.006,dur:0.22}); }
      var s1=box(g,M.glow,0.34,0.18,0.32); s1.position.set(x0+0.12,H+0.18,zc); reg(L,s1,{s0:0.01,delay:delay+0.05,dur:0.25});
      var s2=box(g,M.glow,0.34,0.18,0.32); s2.position.set(x1-0.12,H+0.18,zc); reg(L,s2,{s0:0.01,delay:delay+0.05,dur:0.25}); }
    for(z=-D/2+2.0; z<=D/2-2.0; z+=1.5){ joist(z,0.7+d); d+=0.02; }
    // ribbed standing-seam roof deck - real fluted profile, LIGHT GRAY
    var deckslab=box(g,M.deck,W-1,0.05,D-0.6); deckslab.position.set(0,H+0.78,0); reg(L,deckslab,{from:new T.Vector3(0,9,0),delay:1.4,dur:0.5});
    for(x=-W/2+0.8;x<=W/2-0.8;x+=0.62){ var rib=box(g,M.deck,0.15,0.17,D-0.6); rib.position.set(x,H+0.88,0); reg(L,rib,{from:new T.Vector3(0,9,0),delay:1.45,dur:0.45}); }
    // thick tilt-up concrete panels (WHITE/light) tilt up from flat, with darker embedded weld plates at bearing lines
    function panel(w,h,axis,sign,cx2,cz2,delay){ var grp=new T.Group();
      var pn=box(grp,M.concrete,w,h,0.5); pn.position.y=h/2;
      for(var k=-1;k<=1;k++){ for(var m2=0;m2<2;m2++){ var ep=box(grp,M.embed,0.66,0.66,0.07);
        if(axis==='x'){ ep.position.set(k*w*0.30, h*(0.62+m2*0.26), -0.27*sign); }
        else { ep.position.set(-0.27*sign, h*(0.62+m2*0.26), k*w*0.30); } } }
      grp.position.set(cx2,0,cz2); g.add(grp);
      var r0={x:0,y:0,z:0}; if(axis==='x'){r0.x=sign*Math.PI/2;} else {r0.z=sign*Math.PI/2;}
      L.push({obj:grp,p0:grp.position.clone(),p1:grp.position.clone(),r0:r0,r1:{x:0,y:0,z:0},delay:delay,dur:1.0}); }
    panel(W,H+0.6,'x',-1,0,-D/2-0.25,0); panel(W,H+0.6,'x',1,0,D/2+0.25,0.3);
    panel(D,H+0.6,'z',1,-W/2-0.25,0,0.6); panel(D,H+0.6,'z',-1,W/2+0.25,0,0.9);
    g.position.y=-2.6; return {members:L,camR:34,camH:13,spin:0.12}; };

  // ---- WHITE-BG isometric colored frame ----
  B.isoframe=function(g){ var L=[]; var W=12,D=8,story=3.6,levels=2,c=0.5,i,j,lv,d=0;
    var BX=[-W/2,0,W/2],BZ=[-D/2,D/2];
    for(i=0;i<BX.length;i++)for(j=0;j<BZ.length;j++){ var col=box(g,M.red,c,levels*story,c); col.position.set(BX[i],levels*story/2,BZ[j]); reg(L,col,{delay:d,dur:0.4}); d+=0.04; }
    for(lv=1;lv<=levels;lv++){ var y=lv*story;
      for(j=0;j<BZ.length;j++){ var bx=box(g,M.yellow,W+0.4,0.45,0.4); bx.position.set(0,y,BZ[j]); reg(L,bx,{delay:d,dur:0.35}); d+=0.03; }
      for(i=0;i<BX.length;i++){ var bz=box(g,M.yellow,0.4,0.45,D+0.4); bz.position.set(BX[i],y,0); reg(L,bz,{delay:d,dur:0.35}); d+=0.03; }
      var deck=box(g,M.teal,W,0.12,D); deck.position.set(0,y+0.28,0); reg(L,deck,{from:new T.Vector3(0,7,0),delay:d+0.1,dur:0.4}); d+=0.05;
    }
    g.position.y=-3; return {members:L,camR:22,camH:9,spin:0.22,light:1}; };

  // ---- WHITE-BG composite floor cutaway ----
  B.composite=function(g){ var L=[]; var span=14, n=3, i, d=0;
    for(i=0;i<n;i++){ var z=(i-(n-1)/2)*3.2;
      var bm=wshape(g,M.gray,span,1.0,0.6,'x'); bm.position.set(0,0,z); reg(L,bm,{delay:d,dur:0.5}); d+=0.06;
      // shear studs along top flange
      for(var x=-span/2+1;x<=span/2-1;x+=1.1){ var st=new T.Mesh(new T.CylinderGeometry(0.07,0.07,0.4,10),M.gray); st.position.set(x,0.7,z); g.add(st);
        L.push({obj:st,p0:st.position.clone().add(new T.Vector3(0,4,0)),p1:st.position.clone(),r0:{x:0,y:0,z:0},r1:{x:0,y:0,z:0},s0:0.1,delay:0.6+x*0.01,dur:0.3}); }
    }
    // corrugated metal deck on top (ribs)
    for(var x2=-span/2;x2<=span/2;x2+=0.5){ var rib=box(g,M.gray,0.28,0.18,n*3.2+1); rib.position.set(x2,0.95,0); reg(L,rib,{from:new T.Vector3(0,6,0),delay:0.9,dur:0.4}); }
    g.position.y=0; return {members:L,camR:18,camH:6,look:new T.Vector3(0,0.4,0),spin:0.2,light:1}; };

  // ---- WHITE-BG bolted connection ----
  B.connection=function(g){ var L=[];
    var col=wshape(g,M.gray,10,1.1,0.8,'y'); col.position.set(0,0,0); reg(L,col,{from:new T.Vector3(0,10,0),delay:0,dur:0.6});
    var bL=wshape(g,M.gray,5.4,0.9,0.6,'x'); bL.position.set(-3.3,0.7,0); reg(L,bL,{from:new T.Vector3(-9,0,0),delay:0.5,dur:0.6});
    var bR=wshape(g,M.gray,5.4,0.9,0.6,'x'); bR.position.set(3.3,-1.7,0); reg(L,bR,{from:new T.Vector3(9,0,0),delay:0.65,dur:0.6});
    var pL=box(g,M.plate,0.1,1.4,0.7); pL.position.set(-0.66,0.7,0); reg(L,pL,{from:new T.Vector3(-3,0,0),delay:1.0,dur:0.45});
    var pR=box(g,M.plate,0.1,1.4,0.7); pR.position.set(0.66,-1.7,0); reg(L,pR,{from:new T.Vector3(3,0,0),delay:1.1,dur:0.45});
    function bolt(x,y,delay){ var b=new T.Mesh(new T.CylinderGeometry(0.11,0.11,0.55,12),M.bolt); b.position.set(x,y,0.42); g.add(b);
      L.push({obj:b,p0:b.position.clone(),p1:b.position.clone(),r0:{x:Math.PI/2,y:0,z:0},r1:{x:Math.PI/2,y:0,z:0},s0:0.01,delay:delay,dur:0.35}); }
    var bb=[[-0.66,1.15],[-0.66,0.7],[-0.66,0.25],[0.66,-1.25],[0.66,-1.7],[0.66,-2.15]]; for(var i=0;i<bb.length;i++) bolt(bb[i][0],bb[i][1],1.4+i*0.1);
    return {members:L,camR:12,camH:3,look:new T.Vector3(0,-0.4,0),fov:40,spin:0.22,light:1}; };

  // keep simpler scenes for reuse
  B.erection=function(g){ var L=[]; grid(g,70,35);
    var BX=[-7,-2.3,2.3,7],BZ=[-4,4],H=6,c=0.5,d=0,i,j;
    for(i=0;i<4;i++)for(j=0;j<2;j++){ var bp=box(g,M.base,1,0.14,1); bp.position.set(BX[i],0.07,BZ[j]); reg(L,bp,{from:new T.Vector3(0,-3,0),delay:0.02,dur:0.4}); }
    for(i=0;i<4;i++)for(j=0;j<2;j++){ var col=wshape(g,M.steel,H,0.5,0.5,'y'); col.position.set(BX[i],H/2,BZ[j]); reg(L,col,{from:new T.Vector3(0,-H-2,0),delay:d,dur:0.7}); d+=0.08; }
    for(j=0;j<2;j++){ var b=wshape(g,M.steel,14.4,0.5,0.42,'x'); b.position.set(0,H,BZ[j]); reg(L,b,{from:new T.Vector3(0,24,0),delay:d+j*0.6,dur:1.2}); }
    for(i=0;i<4;i++){ var b2=wshape(g,M.steel,8.4,0.5,0.42,'z'); b2.position.set(BX[i],H,0); reg(L,b2,{from:new T.Vector3(0,22,0),delay:d+1.2+i*0.25,dur:1.0}); }
    g.position.y=-2.4; return {members:L,camR:28,camH:12}; };

  
  /* ===== Capabilities detailed models - rebuilt 2026-06-17 ===== */
  M.red=mat(0xd11f33,0.55,0.40); M.yellow=mat(0xe2a417,0.55,0.40); M.teal=mat(0x1eb4a6,0.50,0.42);
  M.gray=mat(0x9aa4ae,0.78,0.34); M.purple=mat(0x7b50d1,0.55,0.42); M.orange=mat(0xe8731c,0.55,0.40);
  M.anchor=mat(0x707a86,0.90,0.32);
  function corrDeck(g,L,w,d,y,delay){
    var base=box(g,M.teal,w,0.05,d); base.position.set(0,y,0); reg(L,base,{from:new T.Vector3(0,5,0),delay:delay,dur:0.4});
    for(var x=-w/2+0.35;x<=w/2-0.35;x+=0.66){ var rib=box(g,M.teal,0.34,0.17,d); rib.position.set(x,y+0.1,0); reg(L,rib,{from:new T.Vector3(0,5,0),delay:delay+0.02,dur:0.4}); }
  }
  function baseAnchor(g,L,x,z,delay){
    var p=box(g,M.gray,1.25,0.16,1.25); p.position.set(x,0.08,z); reg(L,p,{from:new T.Vector3(0,2.4,0),delay:delay,dur:0.4});
    var o=[[-0.4,-0.4],[0.4,-0.4],[-0.4,0.4],[0.4,0.4]],k;
    for(k=0;k<4;k++){ var b=new T.Mesh(new T.CylinderGeometry(0.08,0.08,0.36,10),M.anchor); b.position.set(x+o[k][0],0.27,z+o[k][1]); g.add(b);
      L.push({obj:b,p0:b.position.clone().add(new T.Vector3(0,2.4,0)),p1:b.position.clone(),r0:{x:0,y:0,z:0},r1:{x:0,y:0,z:0},s0:1,delay:delay+0.05,dur:0.4}); }
  }
  function hexBolt(g,L,x,y,z,axis,delay){ var b=new T.Mesh(new T.CylinderGeometry(0.12,0.12,0.5,6),M.anchor);
    b.position.set(x,y,z); if(axis==='z') b.rotation.x=Math.PI/2; else if(axis==='x') b.rotation.z=Math.PI/2;
    g.add(b); L.push({obj:b,p0:b.position.clone(),p1:b.position.clone(),r0:{x:b.rotation.x,y:0,z:b.rotation.z},r1:{x:b.rotation.x,y:0,z:b.rotation.z},s0:0.01,delay:delay,dur:0.3}); }

  // MODEL 1 - steel framing model (3 levels, 3 bays x 2 bays)
  B.isoframe=function(g){ var L=[]; var BX=[-7.5,-2.5,2.5,7.5],BZ=[-5,0,5],story=3.4,levels=3,c=0.55,i,j,lv,d=0;
    for(i=0;i<BX.length;i++)for(j=0;j<BZ.length;j++){ baseAnchor(g,L,BX[i],BZ[j],0);
      var col=wshape(g,M.red,levels*story,c,c,'y'); col.position.set(BX[i],levels*story/2+0.16,BZ[j]); reg(L,col,{from:new T.Vector3(0,2.5,0),delay:0.1+d,dur:0.4}); d+=0.015; }
    for(lv=1;lv<=levels;lv++){ var y=lv*story+0.16;
      for(j=0;j<BZ.length;j++){ var gd=wshape(g,M.yellow,15.4,0.55,0.44,'x'); gd.position.set(0,y,BZ[j]); reg(L,gd,{from:new T.Vector3(0,3,0),delay:0.3+d,dur:0.35}); d+=0.012; }
      for(i=0;i<BX.length;i++){ var bm=wshape(g,M.yellow,10.4,0.50,0.40,'z'); bm.position.set(BX[i],y,0); reg(L,bm,{from:new T.Vector3(0,3,0),delay:0.32+d,dur:0.35}); d+=0.012; }
      for(i=0;i<BX.length-1;i++){ var mx=(BX[i]+BX[i+1])/2; var inf=wshape(g,M.yellow,10.4,0.34,0.28,'z'); inf.position.set(mx,y,0); reg(L,inf,{from:new T.Vector3(0,3,0),delay:0.34+d,dur:0.35}); d+=0.008; }
      corrDeck(g,L,15.2,10.2,y+0.34,0.5+lv*0.05);
      for(i=0;i<BX.length;i++){ for(j=0;j<BZ.length;j+=2){ var cp=box(g,M.gray,0.46,0.50,0.46); cp.position.set(BX[i],y,BZ[j]); reg(L,cp,{s0:0.01,delay:0.4+d,dur:0.3}); } }
    }
    for(lv=0;lv<levels;lv++){ var y0=lv*story+0.16, ln=Math.sqrt(5*5+story*story), a=Math.atan2(story,5);
      [[-7.5,-2.5],[2.5,7.5]].forEach(function(p){ var mx=(p[0]+p[1])/2;
        var b1=box(g,M.purple,ln,0.32,0.32); b1.position.set(mx,y0+story/2,5); b1.rotation.z=a; reg(L,b1,{s0:0.02,delay:0.7+lv*0.12,dur:0.4});
        var b2=box(g,M.purple,ln,0.32,0.32); b2.position.set(mx,y0+story/2,5); b2.rotation.z=-a; reg(L,b2,{s0:0.02,delay:0.78+lv*0.12,dur:0.4}); }); }
    g.position.y=-(levels*story)/2-0.3; return {members:L,camR:23,camH:9,spin:0.2,light:1,shadow:1,ground:-(levels*story)/2-0.3}; };

  // MODEL 2 - bolted moment connection (close-up)
  B.connection=function(g){ var L=[];
    var col=wshape(g,M.gray,11,1.25,0.9,'y'); col.position.set(0,0,0); reg(L,col,{from:new T.Vector3(0,4,0),delay:0,dur:0.5});
    var beam=wshape(g,M.orange,5.6,1.0,0.66,'x'); beam.position.set(3.4,0,0); reg(L,beam,{from:new T.Vector3(7,0,0),delay:0.4,dur:0.5});
    var ep=box(g,M.gray,0.14,1.5,0.9); ep.position.set(0.7,0,0); reg(L,ep,{from:new T.Vector3(2,0,0),delay:0.7,dur:0.4});
    var tab=box(g,M.gray,0.7,1.0,0.10); tab.position.set(1.2,0,0); reg(L,tab,{from:new T.Vector3(2,0,0),delay:0.75,dur:0.4});
    var by=[0.55,0,-0.55], bz=[0.28,-0.28], ri=0,p,q;
    for(p=0;p<bz.length;p++)for(q=0;q<by.length;q++){ hexBolt(g,L,0.80,by[q],bz[p],'x',1.0+ri*0.06); ri++; }
    var gus=box(g,M.gray,1.7,1.7,0.12); gus.position.set(0.55,-1.5,0); gus.rotation.z=Math.PI/4; reg(L,gus,{from:new T.Vector3(0,-2,0),delay:1.2,dur:0.4});
    var brace=box(g,M.purple,5.2,0.55,0.55); brace.position.set(2.4,-3.0,0); brace.rotation.z=-0.62; reg(L,brace,{from:new T.Vector3(4,-3,0),delay:1.35,dur:0.45});
    var gb=[[0.1,-1.1],[0.55,-1.5],[1.0,-1.9],[0.1,-1.9],[1.0,-1.1]],k; for(k=0;k<gb.length;k++) hexBolt(g,L,gb[k][0],gb[k][1],0.10,'z',1.5+k*0.06);
    return {members:L,camR:11,camH:2.2,look:new T.Vector3(0.6,-0.4,0),fov:40,spin:0.22,light:1,shadow:0}; };

  // MODEL 3 - composite floor system (2-bay cutaway)
  B.composite=function(g){ var L=[]; var span=15,ZB=[-3.4,0,3.4],i,d=0;
    for(i=0;i<ZB.length;i++){ var bm=wshape(g,M.yellow,span,1.0,0.62,'x'); bm.position.set(0,0,ZB[i]); reg(L,bm,{from:new T.Vector3(0,3,0),delay:d,dur:0.45}); d+=0.05;
      for(var x=-span/2+1;x<=span/2-1;x+=0.95){ var st=new T.Mesh(new T.CylinderGeometry(0.08,0.08,0.62,10),M.anchor); st.position.set(x,0.78,ZB[i]); g.add(st);
        L.push({obj:st,p0:st.position.clone().add(new T.Vector3(0,3,0)),p1:st.position.clone(),r0:{x:0,y:0,z:0},r1:{x:0,y:0,z:0},s0:1,delay:0.5+x*0.008,dur:0.3}); } }
    var w=span, zc=-1.4, dd=6.0;
    var base=box(g,M.teal,w,0.05,dd); base.position.set(0,1.02,zc); reg(L,base,{from:new T.Vector3(0,5,0),delay:0.9,dur:0.4});
    for(var x2=-w/2+0.35;x2<=w/2-0.35;x2+=0.66){ var rib=box(g,M.teal,0.34,0.17,dd); rib.position.set(x2,1.12,zc); reg(L,rib,{from:new T.Vector3(0,5,0),delay:0.92,dur:0.4}); }
    g.position.y=-0.3; return {members:L,camR:16,camH:5.5,look:new T.Vector3(0,0.3,0.6),spin:0.2,light:1,shadow:1,ground:-1.1}; };

  function ease(t){ return 1-Math.pow(1-t,3); }
  function buildScene(section,canvas){
    var renderer;
    try{ renderer=new T.WebGLRenderer({canvas:canvas,alpha:true,antialias:true,powerPreference:'high-performance',failIfMajorPerformanceCaveat:false}); }
    catch(e){ section.classList.add('nowebgl'); return null; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
    var name=section.getAttribute('data-scene')||'assembly';
    var scene=new T.Scene(); var g=new T.Group(); scene.add(g);
    var conf=(B[name]||B.assembly)(g);
    var lite=conf.light||section.getAttribute('data-light')==='1';
    if(!lite) scene.fog=new T.Fog(0x131c25,40,110);
    scene.add(new T.HemisphereLight(0xbcd2ff,lite?0xffffff:0x10161d,lite?0.92:0.85));
    scene.add(new T.AmbientLight(0xffffff,lite?0.5:0.2));
    var key=new T.DirectionalLight(0xffffff,lite?0.95:1.05); key.position.set(16,26,16); scene.add(key);
    if(!lite){ var rim=new T.DirectionalLight(0xe8324a,0.55); rim.position.set(-18,9,-13); scene.add(rim); }
    if(conf.shadow){ renderer.shadowMap.enabled=true; renderer.shadowMap.type=T.PCFSoftShadowMap;
      key.castShadow=true; key.shadow.mapSize.width=1024; key.shadow.mapSize.height=1024;
      var sc=key.shadow.camera; sc.near=1; sc.far=140; sc.left=-32; sc.right=32; sc.top=32; sc.bottom=-32; sc.updateProjectionMatrix();
      g.traverse(function(o){ if(o.isMesh) o.castShadow=true; });
      var gy=(conf.ground!=null?conf.ground:-3);
      var gp=new T.Mesh(new T.PlaneGeometry(140,140), new T.ShadowMaterial({opacity:0.20}));
      gp.rotation.x=-Math.PI/2; gp.position.y=gy-0.02; gp.receiveShadow=true; scene.add(gp);
    }
    var Lm=conf.members;
    for(var i=0;i<Lm.length;i++){ Lm[i].obj.position.copy(Lm[i].p0); if(Lm[i].s0!=null) Lm[i].obj.scale.setScalar(Lm[i].s0); Lm[i].obj.visible=false; }
    var camR=conf.camR||30,camH=conf.camH||12,look=conf.look||new T.Vector3(0,2.2,0),spin=conf.spin||0.16;
    var camera=new T.PerspectiveCamera(conf.fov||36,1,0.1,500);
    var clock=new T.Clock(),start=0;
    function size(){ var w=section.clientWidth,h=section.clientHeight||1; renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix(); }
    function onShow(){ start=clock.getElapsedTime(); }
    function render(){ var t=clock.getElapsedTime(), local=t-start;
      for(var i=0;i<Lm.length;i++){ var m=Lm[i], lt=(local-m.delay)/m.dur;
        if(lt<=0){ m.obj.visible=false; continue; } m.obj.visible=true; var e=ease(lt<1?lt:1);
        m.obj.position.lerpVectors(m.p0,m.p1,e);
        m.obj.rotation.x=m.r0.x+(m.r1.x-m.r0.x)*e; m.obj.rotation.y=m.r0.y+(m.r1.y-m.r0.y)*e; m.obj.rotation.z=m.r0.z+(m.r1.z-m.r0.z)*e;
        if(m.s0!=null){ var s=m.s0+(1-m.s0)*e; m.obj.scale.setScalar(s); } }
      var orbit=t*spin;
      camera.position.set(Math.cos(orbit)*camR, camH+Math.sin(t*0.25)*1.2, Math.sin(orbit)*camR);
      camera.lookAt(look); renderer.render(scene,camera); }
    canvas.addEventListener('webglcontextlost',function(e){ e.preventDefault(); section.classList.add('nowebgl'); },false);
    return {size:size,onShow:onShow,render:render};
  }
  function initScene(section){
    var canvas=section.querySelector('canvas'); if(!canvas) return;
    var ctx=null,built=false,active=false;
    function ensure(){ if(built) return; built=true; ctx=buildScene(section,canvas); if(ctx) ctx.size(); }
    var io=new IntersectionObserver(function(es){ for(var k=0;k<es.length;k++){ active=es[k].isIntersecting; if(active){ ensure(); if(ctx) ctx.onShow(); } } },{threshold:0.14});
    io.observe(section);
    window.addEventListener('resize',function(){ if(ctx) ctx.size(); });
    function frame(){ requestAnimationFrame(frame); if(active&&ctx) ctx.render(); }
    frame();
  }
  function startAll(){ var n=document.querySelectorAll('.s3d'); for(var i=0;i<n.length;i++) initScene(n[i]); }
  if(document.readyState!=='loading'){ startAll(); } else { document.addEventListener('DOMContentLoaded', startAll); }
})();
