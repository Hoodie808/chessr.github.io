// SchachLern 3D-Board
document.getElementById('year').textContent = new Date().getFullYear();

// Szene, Kamera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
camera.position.set(3, 5, 6);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
const container = document.getElementById('scene-container');
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

// Beleuchtung
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 7.5);
scene.add(dirLight);

// Orbit Controls (zum Drehen mit der Maus)
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 1, 0);

// Bodenfläche
const planeGeo = new THREE.PlaneGeometry(10, 10);
const planeMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
const plane = new THREE.Mesh(planeGeo, planeMat);
plane.rotation.x = -Math.PI / 2;
plane.position.y = 0;
scene.add(plane);

// Modell laden (z. B. models/pawn.glb)
const loader = new THREE.GLTFLoader();
loader.load('models/pawn.glb', gltf => {
  const pawn = gltf.scene;
  pawn.scale.set(1.5, 1.5, 1.5);
  pawn.position.set(0, 0, 0);
  scene.add(pawn);

  function animate() {
    requestAnimationFrame(animate);
    pawn.rotation.y += 0.01; // Rotation
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
}, undefined, error => {
  console.error('Fehler beim Laden des Modells:', error);
});

// Responsive Anpassung
window.addEventListener('resize', () => {
  const size = container.getBoundingClientRect();
  camera.aspect = size.width / size.height;
  camera.updateProjectionMatrix();
  renderer.setSize(size.width, size.height);
});
