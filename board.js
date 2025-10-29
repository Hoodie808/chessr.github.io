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

// Schachbrett erstellen
const squareSize = 1;
const boardOffset = 3.5;
for(let rank=0; rank<8; rank++){
  for(let file=0; file<8; file++){
    const geo = new THREE.PlaneGeometry(squareSize,squareSize);
    const mat = new THREE.MeshStandardMaterial({color: ((file+rank)%2===0)?0xf0d9b5:0xb58863});
    const sq = new THREE.Mesh(geo, mat);
    sq.rotation.x = -Math.PI/2;
    sq.position.set(file - boardOffset, 0, rank - boardOffset);
    scene.add(sq);
  }
}

// Figuren laden
const loader = new THREE.GLTFLoader();

// Definiere Figuren
const figures = [
  {name:'White_Pawn', rank:1, count:8},
  {name:'Black_Pawn', rank:6, count:8},
  {name:'White_Rook', rank:0, files:[0,7]},
  {name:'Black_Rook', rank:7, files:[0,7]},
  {name:'White_Knight', rank:0, files:[1,6]},
  {name:'Black_Knight', rank:7, files:[1,6]},
  {name:'White_Bishop', rank:0, files:[2,5]},
  {name:'Black_Bishop', rank:7, files:[2,5]},
  {name:'White_Queen', rank:0, files:[3]},
  {name:'Black_Queen', rank:7, files:[3]},
  {name:'White_King', rank:0, files:[4]},
  {name:'Black_King', rank:7, files:[4]},
];

figures.forEach(fig=>{
  const filePositions = fig.files ? fig.files : Array.from({length:fig.count}, (_,i)=>i);
  filePositions.forEach(file=>{
    const filename = `${fig.name}.gltf`; // Direkt im gleichen Ordner
    loader.load(filename, gltf=>{
      const obj = gltf.scene.clone();  // clone für mehrere gleiche Figuren
      obj.position.set(file - boardOffset, 0, fig.rank - boardOffset);
      obj.scale.set(1.2,1.2,1.2);
      scene.add(obj);
    }, undefined, err=>console.error("Fehler beim Laden:", err));
  });
});

// Animation
function animate(){
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene,camera);
}
animate();

// Resize
window.addEventListener('resize', ()=>{
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
});
