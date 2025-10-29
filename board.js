document.getElementById('year').textContent = new Date().getFullYear();

const container = document.getElementById('scene-container');
const scene = new THREE.Scene();

// Kamera & Renderer
const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
camera.position.set(6, 8, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.shadowMap.enabled = true;
container.appendChild(renderer.domElement);

// Licht
const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.9);
hemi.position.set(0,50,0);
scene.add(hemi);
const dir = new THREE.DirectionalLight(0xffffff,0.9);
dir.position.set(5,10,7);
dir.castShadow = true;
scene.add(dir);

// OrbitControls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.target.set(0,0.5,0);
controls.enableDamping = true;

// Boden
const squareSize = 1;
const boardOffset = 3.5;
for(let rank=0; rank<8; rank++){
  for(let file=0; file<8; file++){
    const geo = new THREE.PlaneGeometry(squareSize,squareSize);
    const mat = new THREE.MeshStandardMaterial({color: ((file+rank)%2===0)?0xf0d9b5:0xb58863});
    const sq = new THREE.Mesh(geo,mat);
    sq.rotation.x = -Math.PI/2;
    sq.position.set(file-squareOffset(file),0,rank-boardOffset);
    scene.add(sq);
  }
}

function squareOffset(file){ return 3.5; } // Brett zentrieren

// Figuren automatisch laden
const loader = new THREE.GLTFLoader();
const figures = [
  {name:'White_Pawn', count:8, rank:1},
  {name:'Black_Pawn', count:8, rank:6},
  {name:'White_Rook', count:2, rank:0, files:[0,7]},
  {name:'Black_Rook', count:2, rank:7, files:[0,7]},
  {name:'White_Knight', count:2, rank:0, files:[1,6]},
  {name:'Black_Knight', count:2, rank:7, files:[1,6]},
  {name:'White_Bishop', count:2, rank:0, files:[2,5]},
  {name:'Black_Bishop', count:2, rank:7, files:[2,5]},
  {name:'White_Queen', count:1, rank:0, files:[3]},
  {name:'Black_Queen', count:1, rank:7, files:[3]},
  {name:'White_King', count:1, rank:0, files:[4]},
  {name:'Black_King', count:1, rank:7, files:[4]},
];

figures.forEach(fig=>{
  for(let i=0;i<fig.count;i++){
    const file = fig.files? fig.files[i]:i;
    const rank = fig.rank;
    loader.load(`${fig.name}_${i+1}.glb`, gltf=>{
      const obj = gltf.scene;
      obj.position.set(file-squareOffset(file),0,rank-boardOffset);
      obj.scale.set(1.2,1.2,1.2);
      scene.add(obj);
    },undefined,err=>console.error(err));
  }
});

// Animation
function animate(){
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene,camera);
}
animate();

// Resize
window.addEventListener('resize',()=>{
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
});
