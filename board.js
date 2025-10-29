// board.js — angepasst für Debug & automatische Skalierung/Größe

document.getElementById('year').textContent = new Date().getFullYear();

const container = document.getElementById('scene-container');
if(!container){
  console.error('Kein #scene-container gefunden — prüfe board.html');
}
const scene = new THREE.Scene();

// Kamera & Renderer
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
camera.position.set(6, 8, 8);

// Renderer initialisieren mit robustem Größen-Setup
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.shadowMap.enabled = true;
renderer.domElement.style.touchAction = 'none'; // pointer events korrekt verarbeiten

function setRendererSize() {
  const rect = container.getBoundingClientRect();
  // Fallback-Höhe falls aspect-ratio oder CSS noch nicht gerechnet wurde
  const w = Math.max(1, Math.floor(rect.width));
  let h = Math.max(1, Math.floor(rect.height));
  if (h === 0) h = Math.max(420, Math.round(w)); // sicherer Fallback
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  console.log('Renderer-Größe gesetzt:', w, h);
}

// Erstes Setzen der Größe und DOM-Anhang
setRendererSize();
container.appendChild(renderer.domElement);

// Resize robust behandeln
if (window.ResizeObserver) {
  const ro = new ResizeObserver(() => setRendererSize());
  ro.observe(container);
} else {
  window.addEventListener('resize', setRendererSize);
}

// Licht
const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.9);
hemi.position.set(0, 50, 0);
scene.add(hemi);

const dir = new THREE.DirectionalLight(0xffffff, 0.9);
dir.position.set(5, 10, 7);
dir.castShadow = true;
scene.add(dir);

// Ambient, damit man bei fehlendem direkten Licht etwas sieht
const ambient = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambient);

// OrbitControls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.5, 0);
controls.enableDamping = true;

// Debug-Helpers (sichtbar machen, ob gerendert wird)
scene.add(new THREE.AxesHelper(2));
scene.add(new THREE.GridHelper(8, 8, 0x444444, 0x222222));

// Schachbrett-Parameter
const squareSize = 1;
const boardOffset = 3.5;
for (let rank = 0; rank < 8; rank++) {
  for (let file = 0; file < 8; file++) {
    const geo = new THREE.PlaneGeometry(squareSize, squareSize);
    const mat = new THREE.MeshStandardMaterial({ color: ((file + rank) % 2 === 0) ? 0xf0d9b5 : 0xb58863 });
    const sq = new THREE.Mesh(geo, mat);
    sq.rotation.x = -Math.PI / 2;
    sq.position.set(file - boardOffset, 0, rank - boardOffset);
    sq.receiveShadow = true;
    scene.add(sq);
  }
}

// Figuren laden
const loader = new THREE.GLTFLoader();

// Definiere Figuren
const figures = [
  { name: 'White_Pawn', rank: 1, count: 8 },
  { name: 'Black_Pawn', rank: 6, count: 8 },
  { name: 'White_Rook', rank: 0, files: [0, 7] },
  { name: 'Black_Rook', rank: 7, files: [0, 7] },
  { name: 'White_Knight', rank: 0, files: [1, 6] },
  { name: 'Black_Knight', rank: 7, files: [1, 6] },
  { name: 'White_Bishop', rank: 0, files: [2, 5] },
  { name: 'Black_Bishop', rank: 7, files: [2, 5] },
  { name: 'White_Queen', rank: 0, files: [3] },
  { name: 'Black_Queen', rank: 7, files: [3] },
  { name: 'White_King', rank: 0, files: [4] },
  { name: 'Black_King', rank: 7, files: [4] },
];

figures.forEach(fig => {
  const filePositions = fig.files ? fig.files : Array.from({ length: fig.count }, (_, i) => i);
  filePositions.forEach(file => {
    const filename = `${fig.name}.gltf`; // Direkt im gleichen Ordner
    console.log('Lade Modell:', filename);
    loader.load(filename, gltf => {
      console.log(`GTLF geladen: ${filename}`, gltf);
      const obj = gltf.scene.clone(); // clone für mehrere gleiche Figuren

      // traverse: setze Mesh-Parameter, damit sie sichtbar sind
      obj.traverse(node => {
        if (node.isMesh) {
          node.castShadow = true;
          node.receiveShadow = true;
          // falls Material transparente Flächen hat: DoubleSide helfen oft
          if (node.material) {
            try { node.material.side = THREE.DoubleSide; } catch (e) { /* ignore */ }
            node.material.needsUpdate = true;
          }
        }
      });

      // Automatische Skalierung, damit sehr große/kleine Modelle sichtbar werden
      const box = new THREE.Box3().setFromObject(obj);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      if (maxDim > 0) {
        const desired = 0.6; // Zielgröße (anpassen falls nötig)
        const scaleFactor = desired / maxDim;
        obj.scale.multiplyScalar(scaleFactor);
      }

      // leichte Anhebung, damit die Modelle nicht im Boden versinken
      obj.position.set(file - boardOffset, 0.45, fig.rank - boardOffset);

      scene.add(obj);
      console.log(`Objekt hinzugefügt: ${filename} @`, obj.position);
    }, undefined, err => {
      console.error('Fehler beim Laden:', err);
    });
  });
});

// Animation
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// Resize (zusätzlich zur ResizeObserver-Fallback)
window.addEventListener('resize', () => {
  setRendererSize();
});
