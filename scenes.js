/* Nano Cube USA - structural steel 3D scene library (three.js r128) */
(function(){
  function markFail(){ var n=document.querySelectorAll('.s3d'); for(var i=0;i<n.length;i++) n[i].classList.add('nowebgl'); }
  if(!window.THREE){ markFail(); return; }
  var T=window.THREE;
  function mat(c,m,r){ return new T.MeshStandardMaterial({color:c,metalness:m,roughness:r}); }
  var M={ steel:mat(0x9aa6b2,0.78,0.4), dark:mat(0x6e7b88,0.72,0.5), deck:mat(0xb6bfc9,0.45,0.65),
          panel:mat(0x8f9aa6,0.5,0.55), concrete:mat(0xc7c9cc,0.05,0.92), bolt:mat(0xc8102e,0.55,0.5) };
  function box(g,material,w,h,d){ var m=new T.Mesh(new T.BoxGeometry(w,h,d),material); g.add(m); return m; }
  function reg(L,obj,o){ o=o||{};
    var p1=obj.position.clone();
    var p0=o.from? p1.clone().add(o.from): p1.clone().add(new T.Vector3(0,16,0));
    var r1={x:obj.rotation.x,y:obj.rotation.y,z:obj.rotation.z};
    var r0=o.r0? o.r0 : {x:r1.x,y:r1.y,z:r1.z};
    var it={obj:obj,p0:p0,p1:p1,r0:r0,r1:r1,delay:o.delay||0,dur:o.dur||0.6};
    if(o.s0!=null) it.s0=o.s0;
    L.push(it); return obj;
  }
  function grid(g,s,n){ g.add(new T.GridHelper(s,n,0x33455a,0x1d2935)); }

  var B={};
  B.assembly=function(g){ var L=[]; grid(g,80,40);
    var BX=[-9,-3,3,9],BZ=[-5,0,5],H=6,c=0.5,d=0,i,j,x;
    for(i=0;i<4;i++)for(j=0;j<3;j++){ var col=box(g,M.steel,c,H,c); col.position.set(BX[i],H/2,BZ[j]); reg(L,col,{delay:d,dur:0.6}); d+=0.05; }
    for(j=0;j<3;j++){ var b=box(g,M.steel,18.4,0.5,0.42); b.position.set(0,H,BZ[j]); reg(L,b,{delay:d,dur:0.6}); d+=0.11; }
    for(i=0;i<4;i++){ var b2=box(g,M.steel,0.42,0.5,10.4); b2.position.set(BX[i],H,0); reg(L,b2,{delay:d,dur:0.6}); d+=0.09; }
    for(x=-8.4;x<=8.4;x+=1.2){ var jo=box(g,M.dark,0.18,0.3,10.2); jo.position.set(x,H+0.4,0); reg(L,jo,{delay:d,dur:0.5}); d+=0.035; }
    var dk=box(g,M.deck,18.8,0.12,10.8); dk.position.set(0,H+0.64,0); reg(L,dk,{delay:d+0.2,dur:0.6});
    g.position.y=-2.4; return {members:L,camR:32,camH:13}; };

  B.tiltwall=function(g){ var L=[]; grid(g,70,35);
    var W=14,D=9,H=5.5,c=0.45,d=0,i,j,x; var px=[-W/2,W/2],pz=[-D/2,D/2];
    for(i=0;i<2;i++)for(j=0;j<2;j++){ var col=box(g,M.steel,c,H,c); col.position.set(px[i],H/2,pz[j]); reg(L,col,{delay:d,dur:0.5}); d+=0.06; }
    var rb1=box(g,M.steel,W+0.4,0.45,0.4); rb1.position.set(0,H,pz[0]); reg(L,rb1,{delay:d,dur:0.5}); d+=0.08;
    var rb2=box(g,M.steel,W+0.4,0.45,0.4); rb2.position.set(0,H,pz[1]); reg(L,rb2,{delay:d,dur:0.5}); d+=0.08;
    for(x=-W/2+1;x<W/2;x+=1.5){ var jo=box(g,M.dark,0.16,0.26,D+0.3); jo.position.set(x,H+0.32,0); reg(L,jo,{delay:d,dur:0.4}); d+=0.03; }
    function panel(w,h,thick,axis,sign,cx,cz,delay){ var grp=new T.Group(); var m=box(grp,M.concrete,w,h,thick); m.position.y=h/2;
      grp.position.set(cx,0,cz); g.add(grp);
      var r0={x:0,y:0,z:0}; if(axis==='x'){ r0.x=sign*Math.PI/2; } else { r0.z=sign*Math.PI/2; }
      L.push({obj:grp,p0:grp.position.clone(),p1:grp.position.clone(),r0:r0,r1:{x:0,y:0,z:0},delay:delay,dur:0.95}); }
    var pd=d+0.25;
    panel(W,H+0.4,0.3,'x',-1,0,-D/2-0.18,pd); panel(W,H+0.4,0.3,'x',1,0,D/2+0.18,pd+0.35);
    panel(D,H+0.4,0.3,'z',1,-W/2-0.18,0,pd+0.7); panel(D,H+0.4,0.3,'z',-1,W/2+0.18,0,pd+1.05);
    g.position.y=-2.2; return {members:L,camR:30,camH:12,spin:0.13}; };

  B.cladding=function(g){ var L=[]; grid(g,70,35);
    var W=14,D=9,H=5.5,c=0.45,d=0,i,j; var px=[-W/2,-W/6,W/6,W/2],pz=[-D/2,D/2];
    for(i=0;i<4;i++)for(j=0;j<2;j++){ var col=box(g,M.steel,c,H,c); col.position.set(px[i],H/2,pz[j]); reg(L,col,{delay:d,dur:0.45}); d+=0.04; }
    for(j=0;j<2;j++){ var b=box(g,M.steel,W+0.4,0.45,0.4); b.position.set(0,H,pz[j]); reg(L,b,{delay:d,dur:0.45}); d+=0.06; }
    for(i=0;i<4;i++){ var b2=box(g,M.steel,0.4,0.45,D+0.4); b2.position.set(px[i],H,0); reg(L,b2,{delay:d,dur:0.45}); d+=0.05; }
    var cd=d+0.25, seg=W/4;
    function wall(w,h,cx,cz,fromV,delay){ var p=box(g,M.panel,w,h,0.16); p.position.set(cx,h/2,cz); reg(L,p,{from:fromV,delay:delay,dur:0.7}); }
    for(i=0;i<4;i++){ wall(seg-0.1,H,(-W/2)+seg/2+i*seg,D/2+0.18,new T.Vector3(0,0,9),cd+i*0.09);
                      wall(seg-0.1,H,(-W/2)+seg/2+i*seg,-D/2-0.18,new T.Vector3(0,0,-9),cd+0.45+i*0.09); }
    var rd=box(g,M.deck,W+0.5,0.14,D+0.5); rd.position.set(0,H+0.5,0); reg(L,rd,{from:new T.Vector3(0,11,0),delay:cd+1.1,dur:0.7});
    g.position.y=-2.2; return {members:L,camR:30,camH:12,spin:0.14}; };

  B.connection=function(g){ var L=[];
    var col=box(g,M.steel,1.1,9,0.7); col.position.set(0,0,0); reg(L,col,{from:new T.Vector3(0,9,0),delay:0,dur:0.6});
    var bL=box(g,M.steel,5,0.9,0.55); bL.position.set(-3.1,0.6,0); reg(L,bL,{from:new T.Vector3(-9,0,0),delay:0.45,dur:0.6});
    var bR=box(g,M.steel,5,0.9,0.55); bR.position.set(3.1,-1.6,0); reg(L,bR,{from:new T.Vector3(9,0,0),delay:0.6,dur:0.6});
    var pL=box(g,M.dark,0.12,1.3,0.7); pL.position.set(-0.62,0.6,0); reg(L,pL,{from:new T.Vector3(-3,0,0),delay:0.95,dur:0.5});
    var pR=box(g,M.dark,0.12,1.3,0.7); pR.position.set(0.62,-1.6,0); reg(L,pR,{from:new T.Vector3(3,0,0),delay:1.05,dur:0.5});
    function bolt(x,y,delay){ var b=new T.Mesh(new T.CylinderGeometry(0.1,0.1,0.5,12),M.bolt); b.position.set(x,y,0.42); g.add(b);
      L.push({obj:b,p0:b.position.clone(),p1:b.position.clone(),r0:{x:Math.PI/2,y:0,z:0},r1:{x:Math.PI/2,y:0,z:0},s0:0.01,delay:delay,dur:0.4}); }
    var bb=[[-0.62,1.05],[-0.62,0.15],[0.62,-1.15],[0.62,-2.05]]; for(var i=0;i<bb.length;i++) bolt(bb[i][0],bb[i][1],1.35+i*0.12);
    return {members:L,camR:11,camH:3.2,look:new T.Vector3(0,-0.5,0),fov:40,spin:0.22}; };

  B.erection=function(g){ var L=[]; grid(g,70,35);
    var BX=[-7,-2.3,2.3,7],BZ=[-4,4],H=6,c=0.5,d=0,i,j;
    for(i=0;i<4;i++)for(j=0;j<2;j++){ var bp=box(g,M.dark,1,0.12,1); bp.position.set(BX[i],0.06,BZ[j]); reg(L,bp,{from:new T.Vector3(0,-3,0),delay:0.02+i*0.01,dur:0.4}); }
    for(i=0;i<4;i++)for(j=0;j<2;j++){ var col=box(g,M.steel,c,H,c); col.position.set(BX[i],H/2,BZ[j]); reg(L,col,{from:new T.Vector3(0,-H-2,0),delay:d,dur:0.7}); d+=0.09; }
    for(j=0;j<2;j++){ var b=box(g,M.steel,14.4,0.5,0.42); b.position.set(0,H,BZ[j]); reg(L,b,{from:new T.Vector3(0,24,0),delay:d+j*0.6,dur:1.2}); }
    for(i=0;i<4;i++){ var b2=box(g,M.steel,0.42,0.5,8.4); b2.position.set(BX[i],H,0); reg(L,b2,{from:new T.Vector3(0,22,0),delay:d+1.2+i*0.25,dur:1.0}); }
    g.position.y=-2.4; return {members:L,camR:28,camH:12}; };

  B.joist=function(g){ var L=[];
    function jst(z,delay){ var span=16,h=2.2;
      var top=box(g,M.steel,span,0.26,0.18); top.position.set(0,h,z); reg(L,top,{delay:delay,dur:0.5});
      var bot=box(g,M.steel,span,0.26,0.18); bot.position.set(0,0,z); reg(L,bot,{delay:delay+0.1,dur:0.5});
      var n=10,x0=-span/2,step=span/n,dl=delay+0.32;
      for(var k=0;k<n;k++){ var up=(k%2===0); var len=Math.sqrt(step*step+h*h); var ang=Math.atan2((up?h:-h),step);
        var w=new T.Mesh(new T.BoxGeometry(len,0.12,0.12),M.dark); w.position.set(x0+(k+0.5)*step,h/2,z); w.rotation.z=ang; g.add(w);
        L.push({obj:w,p0:w.position.clone(),p1:w.position.clone(),r0:{x:0,y:0,z:ang},r1:{x:0,y:0,z:ang},s0:0.02,delay:dl+k*0.06,dur:0.3}); } }
    jst(-3.2,0); jst(0,0.5); jst(3.2,1.0);
    g.position.y=0; return {members:L,camR:23,camH:5.5,look:new T.Vector3(0,1.1,0),spin:0.2}; };

  B.moment=function(g){ var L=[]; grid(g,70,35);
    var span=14,H=5,ridge=7.6,c=0.5,frames=[-5,0,5],fi;
    for(fi=0;fi<frames.length;fi++){ var z=frames[fi],dd=fi*0.5;
      var cL=box(g,M.steel,c,H,c); cL.position.set(-span/2,H/2,z); reg(L,cL,{from:new T.Vector3(0,-H,0),delay:dd,dur:0.55});
      var cR=box(g,M.steel,c,H,c); cR.position.set(span/2,H/2,z); reg(L,cR,{from:new T.Vector3(0,-H,0),delay:dd+0.05,dur:0.55});
      var rl=Math.sqrt((span/2)*(span/2)+(ridge-H)*(ridge-H)); var ang=Math.atan2(ridge-H,span/2);
      var rL=new T.Mesh(new T.BoxGeometry(rl,0.45,0.4),M.steel); rL.position.set(-span/4,(H+ridge)/2,z); rL.rotation.z=ang; g.add(rL);
      L.push({obj:rL,p0:rL.position.clone().add(new T.Vector3(0,12,0)),p1:rL.position.clone(),r0:{x:0,y:0,z:ang},r1:{x:0,y:0,z:ang},delay:dd+0.6,dur:0.6});
      var rR=new T.Mesh(new T.BoxGeometry(rl,0.45,0.4),M.steel); rR.position.set(span/4,(H+ridge)/2,z); rR.rotation.z=-ang; g.add(rR);
      L.push({obj:rR,p0:rR.position.clone().add(new T.Vector3(0,12,0)),p1:rR.position.clone(),r0:{x:0,y:0,z:-ang},r1:{x:0,y:0,z:-ang},delay:dd+0.7,dur:0.6}); }
    var rp=box(g,M.dark,0.18,0.18,11); rp.position.set(0,ridge,0); reg(L,rp,{delay:2.3,dur:0.5});
    g.position.y=-2; return {members:L,camR:28,camH:11}; };

  B.braced=function(g){ var L=[]; grid(g,60,30);
    var w=8,levels=3,story=4,c=0.55,px=[-w/2,w/2],pz=[-w/2,w/2],i,j,d=0,lv,H=levels*story;
    for(i=0;i<2;i++)for(j=0;j<2;j++){ var col=box(g,M.steel,c,H,c); col.position.set(px[i],H/2,pz[j]); reg(L,col,{from:new T.Vector3(0,-H,0),delay:d,dur:0.7}); d+=0.08; }
    for(lv=1;lv<=levels;lv++){ var y=lv*story;
      for(i=0;i<2;i++){ var b=box(g,M.steel,w+0.4,0.4,0.36); b.position.set(0,y,pz[i]); reg(L,b,{delay:d,dur:0.4}); d+=0.05; }
      for(j=0;j<2;j++){ var b2=box(g,M.steel,0.36,0.4,w+0.4); b2.position.set(px[j],y,0); reg(L,b2,{delay:d,dur:0.4}); d+=0.05; } }
    for(lv=0;lv<levels;lv++){ var y0=lv*story,len=Math.sqrt(w*w+story*story),ang=Math.atan2(story,w);
      var a1=ang; var br=new T.Mesh(new T.BoxGeometry(len,0.16,0.16),M.dark); br.position.set(0,y0+story/2,w/2); br.rotation.z=a1; g.add(br);
      L.push({obj:br,p0:br.position.clone(),p1:br.position.clone(),r0:{x:0,y:0,z:a1},r1:{x:0,y:0,z:a1},s0:0.02,delay:d+lv*0.2,dur:0.4});
      var br2=new T.Mesh(new T.BoxGeometry(len,0.16,0.16),M.dark); br2.position.set(0,y0+story/2,w/2); br2.rotation.z=-a1; g.add(br2);
      L.push({obj:br2,p0:br2.position.clone(),p1:br2.position.clone(),r0:{x:0,y:0,z:-a1},r1:{x:0,y:0,z:-a1},s0:0.02,delay:d+lv*0.2+0.12,dur:0.4}); }
    g.position.y=-2; return {members:L,camR:26,camH:8,look:new T.Vector3(0,4,0)}; };

  function ease(t){ return 1-Math.pow(1-t,3); }
  function initScene(section){
    var canvas=section.querySelector('canvas'); if(!canvas) return; var renderer;
    try{ renderer=new T.WebGLRenderer({canvas:canvas,alpha:true,antialias:true}); }catch(e){ section.classList.add('nowebgl'); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
    var scene=new T.Scene(); scene.fog=new T.Fog(0x131c25,40,95);
    scene.add(new T.HemisphereLight(0xbcd2ff,0x10161d,0.85));
    scene.add(new T.AmbientLight(0xffffff,0.18));
    var key=new T.DirectionalLight(0xffffff,1.05); key.position.set(14,22,12); scene.add(key);
    var rim=new T.DirectionalLight(0xe8324a,0.5); rim.position.set(-16,8,-12); scene.add(rim);
    var g=new T.Group(); scene.add(g);
    var name=section.getAttribute('data-scene')||'assembly';
    var conf=(B[name]||B.assembly)(g);
    var L=conf.members;
    for(var i=0;i<L.length;i++){ L[i].obj.position.copy(L[i].p0); if(L[i].s0!=null) L[i].obj.scale.setScalar(L[i].s0); L[i].obj.visible=false; }
    var camR=conf.camR||30,camH=conf.camH||12,look=conf.look||new T.Vector3(0,2.2,0),spin=conf.spin||0.16;
    var camera=new T.PerspectiveCamera(conf.fov||36,1,0.1,400);
    var clock=new T.Clock(),start=1e9,active=false;
    function size(){ var w=section.clientWidth,h=section.clientHeight||1; renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix(); }
    var io=new IntersectionObserver(function(es){ for(var k=0;k<es.length;k++){ active=es[k].isIntersecting; if(es[k].isIntersecting) start=clock.getElapsedTime(); } },{threshold:0.16});
    io.observe(section);
    function frame(){ requestAnimationFrame(frame); if(!active) return;
      var t=clock.getElapsedTime(), local=t-start;
      for(var i=0;i<L.length;i++){ var m=L[i], lt=(local-m.delay)/m.dur;
        if(lt<=0){ m.obj.visible=false; continue; } m.obj.visible=true; var e=ease(lt<1?lt:1);
        m.obj.position.lerpVectors(m.p0,m.p1,e);
        m.obj.rotation.x=m.r0.x+(m.r1.x-m.r0.x)*e; m.obj.rotation.y=m.r0.y+(m.r1.y-m.r0.y)*e; m.obj.rotation.z=m.r0.z+(m.r1.z-m.r0.z)*e;
        if(m.s0!=null){ var s=m.s0+(1-m.s0)*e; m.obj.scale.setScalar(s); } }
      var orbit=t*spin;
      camera.position.set(Math.cos(orbit)*camR, camH+Math.sin(t*0.25)*1.2, Math.sin(orbit)*camR);
      camera.lookAt(look); renderer.render(scene,camera); }
    size(); window.addEventListener('resize',size); frame();
  }
  function startAll(){ var n=document.querySelectorAll('.s3d'); for(var i=0;i<n.length;i++) initScene(n[i]); }
  if(document.readyState!=='loading'){ startAll(); } else { document.addEventListener('DOMContentLoaded', startAll); }
})();
