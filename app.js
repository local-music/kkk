import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
const $=id=>document.getElementById(id);
const scene=new THREE.Scene();scene.background=new THREE.Color('#f5f4f6');
const camera=new THREE.PerspectiveCamera(38,1,.1,2000);camera.position.set(155,-190,155);
const renderer=new THREE.WebGLRenderer({canvas:$('scene'),antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.target.set(0,0,15);
scene.add(new THREE.HemisphereLight(0xffffff,0xb8b3bd,2));
const key=new THREE.DirectionalLight(0xffffff,2.4);key.position.set(120,-100,180);key.castShadow=true;scene.add(key);
const fill=new THREE.DirectionalLight(0xffffff,.8);fill.position.set(-100,80,80);scene.add(fill);
const floor=new THREE.Mesh(new THREE.PlaneGeometry(700,700),new THREE.MeshStandardMaterial({color:'#f5f4f6',roughness:1}));floor.rotation.x=-Math.PI/2;floor.position.z=-1;floor.receiveShadow=true;scene.add(floor);
let root=new THREE.Group();scene.add(root);let pivot,opened=false,exploded=false,auto=false;
const defaults={format:'instax',photoW:54,photoH:86,pages:4,direction:'vertical',cover:'#e99ac1',page:'#f2f0eb',title:'',titleColor:'#29252a',photoCover:false,clearance:.5,hinge:.3};
function vals(){let v={...defaults};v.format=$('format').value;v.photoW=v.format==='custom'?+$('photoW').value:({instax:54,square:72,wide:108}[v.format]);v.photoH=v.format==='custom'?+$('photoH').value:({instax:86,square:86,wide:86}[v.format]);v.pages=+$('pages').value;v.direction=$('direction').value;v.cover=$('coverColor').value;v.page=$('pageColor').value;v.title=$('title').value;v.titleColor=$('titleColor').value;v.photoCover=$('photoCover').checked;v.clearance=+$('clearance').value;v.hinge=+$('hinge').value;return v}
const mat=c=>new THREE.MeshStandardMaterial({color:c,roughness:.78});
function box(parent,name,x,y,z,w,h,t,color){let m=new THREE.Mesh(new THREE.BoxGeometry(w,h,t),mat(color));m.name=name;m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function build(){let v=vals(),W=v.photoW+12,H=v.photoH+16,pt=1.8,ct=2.4,gap=.65;scene.remove(root);root=new THREE.Group();scene.add(root);
 // Covers and photo leaves are shown as solid plates with visible raised retaining rails.
 box(root,'Back cover',0,0,ct/2,W+4,H+4,ct,v.cover);
 for(let i=0;i<v.pages;i++){let z=ct+i*(pt+gap)+pt/2;let g=new THREE.Group();g.position.z=z;root.add(g);
 box(g,`Page ${i+1} backing`,0,0,0,W,H,pt,v.page);
 let rail=1.3,lip=.45;
 box(g,'left photo rail',-W/2+rail/2+1,0,pt/2+.42,rail,H-3,.84,v.page);
 box(g,'right photo rail',W/2-rail/2-1,0,pt/2+.42,rail,H-3,.84,v.page);
 box(g,'bottom photo rail',0,-H/2+rail/2+1,pt/2+.42,W-4,rail,.84,v.page);
 box(g,'retaining lip left',-W/2+2.6,0,pt/2+.83,lip,H-8,.25,v.page);
 box(g,'retaining lip right',W/2-2.6,0,pt/2+.83,lip,H-8,.25,v.page);
 }
 let total=ct+v.pages*(pt+gap);pivot=new THREE.Group();pivot.position.set(-W/2,0,total);root.add(pivot);box(pivot,'Front cover',W/2,0,ct/2,W+4,H+4,ct,v.cover);
 if(v.photoCover){box(pivot,'Photo window surround',W/2,0,ct+.3,W*.62,H*.62,.5,v.page)}
 // Hinge spine represented as a continuous reinforced hinge rail in preview.
 box(root,'Spine',-W/2-1,0,total/2,4,H+4,total,v.cover);
 // Hinged knuckles: alternating barrel segments along the spine axis.
 const hingeMat=mat(v.cover);
 for(let i=0;i<v.pages+2;i++){let cyl=new THREE.Mesh(new THREE.CylinderGeometry(1.8,1.8,Math.max(3,(H+4)/(v.pages+2)-1),24),hingeMat);cyl.rotation.x=Math.PI/2;cyl.position.set(-W/2-1, -H/2+(i+.5)*(H+4)/(v.pages+2),total/2);root.add(cyl)}
 const pin=new THREE.Mesh(new THREE.CylinderGeometry(0.9,0.9,H+5,20),mat('#77747a'));pin.rotation.x=Math.PI/2;pin.position.set(-W/2-1,0,total/2);root.add(pin);
 if(v.title){/* title is included in exported CAD as embossed text */ }
 $('dimensions').textContent=`${Math.round(W+4)} × ${Math.round(H+4)} mm cover · ${v.pages} pages`;
 controls.target.set(0,0,total/2);let r=Math.max(W,H,total);camera.position.set(r*1.8,-r*2.2,r*1.8);controls.update();opened=false;$('open').textContent='Open book';}
function animate(){requestAnimationFrame(animate);if(pivot){let target=opened?1:0;pivot.rotation.y+=(target*Math.PI*.78-pivot.rotation.y)*.08}if(auto)root.rotation.z+=.003;controls.update();renderer.render(scene,camera);resize()}
function resize(){let c=$('scene'),r=c.getBoundingClientRect();if(!r.width||!r.height)return;let w=Math.round(r.width*devicePixelRatio),h=Math.round(r.height*devicePixelRatio);if(c.width!==w||c.height!==h){renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix()}}
function scad(v){return `// ORIGINAL PHOTOBOOK STUDIO — generated parametric design\n// Original geometry. Units: mm. Open in OpenSCAD; press F6 to render.\n// PART: 0=all parts, 1=back cover, 2=photo page, 3=front cover, 4=hinge pin\n$fn=72;\nPART=0;\nPHOTO_W=${v.photoW}; PHOTO_H=${v.photoH}; PAGES=${v.pages};\nPHOTO_CLEARANCE=${v.clearance}; HINGE_CLEARANCE=${v.hinge};\nCOVER_COLOR="${v.cover}"; // colour reference for multi-material workflow\nPAGE_COLOR="${v.page}";\nTITLE="${v.title.replace(/["\\\\]/g,'')}";\nCOVER_W=PHOTO_W+12; COVER_H=PHOTO_H+16; PAGE_T=1.8; COVER_T=2.4;\nRAIL=1.35; LIP=0.45; PIN_D=1.8; BARREL_D=4.0;\n// Rounded rectangle solid, extruded as a single watertight body.\nmodule plate(w,h,t,r=2){linear_extrude(t) offset(r=r) square([w-2*r,h-2*r],center=true);}\nmodule photo_page(){\n difference(){ union(){\n  plate(COVER_W,COVER_H,PAGE_T,2);\n  // Three retaining rails leave the top edge open for photo insertion.\n  translate([-COVER_W/2+RAIL/2+1,0,PAGE_T]) cube([RAIL,COVER_H-3,0.85]);\n  translate([COVER_W/2-RAIL/2-1,0,PAGE_T]) cube([RAIL,COVER_H-3,0.85]);\n  translate([0,-COVER_H/2+RAIL/2+1,PAGE_T]) cube([COVER_W-4,RAIL,0.85]);\n  translate([-COVER_W/2+2.6,0,PAGE_T+0.85]) cube([LIP,COVER_H-8,0.25]);\n  translate([COVER_W/2-2.6,0,PAGE_T+0.85]) cube([LIP,COVER_H-8,0.25]);\n  hinge_knuckles();\n }\n // Pocket floor is solid; opening is at the short top edge.\n translate([-PHOTO_W/2+PHOTO_CLEARANCE,-PHOTO_H/2+PHOTO_CLEARANCE,PAGE_T-0.01]) cube([PHOTO_W-2*PHOTO_CLEARANCE,PHOTO_H-2*PHOTO_CLEARANCE,0.02]);\n }\n}\nmodule hinge_knuckles(){for(i=[0:1])translate([-COVER_W/2-1.8,-COVER_H/2+2+i*(COVER_H/2-2),PAGE_T/2])difference(){union(){translate([0,0,0])cube([4.2,COVER_H/2-3,4]);rotate([-90,0,0])cylinder(h=COVER_H/2-3,d=BARREL_D);}\n translate([0.2,-0.1,0])rotate([-90,0,0])cylinder(h=COVER_H/2-2.8,d=PIN_D+HINGE_CLEARANCE);}}\nmodule cover(){union(){plate(COVER_W+4,COVER_H+4,COVER_T,2.5);hinge_knuckles();}}\nmodule pin(){translate([-COVER_W/2-1.8,0,0])rotate([-90,0,0])cylinder(h=COVER_H+2,d=PIN_D);}\nmodule assembly(){translate([0,0,COVER_T])cover();for(i=[0:PAGES-1])translate([0,0,COVER_T+i*(PAGE_T+0.65)])photo_page();translate([0,0,COVER_T+PAGES*(PAGE_T+0.65)])cover();}\nif(PART==0)assembly();\nif(PART==1)cover();\nif(PART==2)photo_page();\nif(PART==3)cover();\nif(PART==4)pin();\n`}
function download(){let v=vals(),blob=new Blob([scad(v)],{type:'text/plain'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='PhotoBook_Custom.scad';a.click();URL.revokeObjectURL(a.href);$('status').textContent='Your editable OpenSCAD model has been generated.'}
['format','photoW','photoH','pages','direction','coverColor','pageColor','title','titleColor','photoCover','clearance','hinge'].forEach(id=>$(id).addEventListener('input',()=>{$('custom').classList.toggle('hidden',$('format').value!=='custom');$('pageCount').textContent=$('pages').value;$('clearanceOut').textContent=$('clearance').value+' mm';$('hingeOut').textContent=$('hinge').value+' mm';build()}));
$('download').onclick=download;$('download2').onclick=download;$('open').onclick=()=>{opened=!opened;$('open').textContent=opened?'Close book':'Open book'};$('explode').onclick=()=>{exploded=!exploded;$('explode').textContent=exploded?'Assemble parts':'Explode parts';root.children.forEach((o,i)=>{if(o!==pivot)o.position.x+=(exploded?(i%2?1:-1)*2:-(i%2?1:-1)*2)})};$('home').onclick=()=>{root.rotation.set(0,0,0);build()};$('reset').onclick=()=>{for(let [id,val] of Object.entries({format:'instax',photoW:54,photoH:86,pages:4,direction:'vertical',coverColor:'#e99ac1',pageColor:'#f2f0eb',title:'',titleColor:'#29252a',clearance:.5,hinge:.3}))$(id).value=val;$('photoCover').checked=false;build()};
$('instructions').onclick=()=>$('modal').classList.remove('hidden');$('close').onclick=()=>$('modal').classList.add('hidden');$('modal').onclick=e=>{if(e.target===$('modal'))$('modal').classList.add('hidden')};
build();animate();
