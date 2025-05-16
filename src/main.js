import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 20, 270);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container').appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 50, 50);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const tooltip = document.getElementById('tooltip');
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const interactiveBars = [];

const gridHelper = new THREE.GridHelper(400, 40, 0x444444, 0x222222);
scene.add(gridHelper);

const axesHelper = new THREE.AxesHelper(50);
scene.add(axesHelper);

let centerX = 0;
let centerZ = 0;
let sizeZ = 100;

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100),
  new THREE.MeshStandardMaterial({ color: 0x444444, side: THREE.DoubleSide })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

function gpsToXZ(lat, lon) {
  const scale = 5000;
  const x = (lon - 2.13) * scale;
  const z = (lat - 41.36) * -scale;
  return { x, z };
}

fetch('/data/airquality.json')
  .then(res => res.json())
  .then(data => {
    const positions = data.map(station => gpsToXZ(station.latitude, station.longitude));
    const xs = positions.map(p => p.x);
    const zs = positions.map(p => p.z);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minZ = Math.min(...zs);
    const maxZ = Math.max(...zs);

    const sizeX = maxX - minX + 20;
    sizeZ = maxZ - minZ + 20;

    centerX = (minX + maxX) / 2;
    centerZ = (minZ + maxZ) / 2;

    ground.geometry.dispose();
    ground.geometry = new THREE.PlaneGeometry(sizeX, sizeZ);
    ground.position.set(0, 0, 0);

    data.forEach((station, index) => {
      const { x, z } = positions[index];
      const height = station.NO2;

      const color = new THREE.Color();
      color.setHSL(Math.max(0, 0.4 - station.NO2 / 200), 1, 0.5);

      const geometry = new THREE.BoxGeometry(2, height, 2);
      const material = new THREE.MeshStandardMaterial({ color: color });
      const bar = new THREE.Mesh(geometry, material);

      bar.position.set(x - centerX, 0.01, z - centerZ);
      bar.userData = station;
      bar.scale.y = 0.01; 
      interactiveBars.push(bar);
      scene.add(bar);
    });

    const fontLoader = new FontLoader();
    fontLoader.load('/fonts/helvetiker_regular.typeface.json', (font) => {
      const textGeo = new TextGeometry('Barcelona', {
        font: font,
        size: 15,
        height: 0.3,
        curveSegments: 2,
        bevelEnabled: false
      });

      const textMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
      const textMesh = new THREE.Mesh(textGeo, textMaterial);

      textMesh.position.set(-40, 1, -sizeZ / 2 + 240);
      scene.add(textMesh);
    });
  });

// Hover effect
window.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(interactiveBars);

  if (intersects.length > 0) {
    const data = intersects[0].object.userData;
    tooltip.style.display = 'block';
    tooltip.innerHTML = `
      <strong>${data.station_id}</strong><br/>
      NO₂: ${data.NO2}<br/>
      PM10: ${data.PM10}<br/>
      PM2.5: ${data.PM2_5}<br/>
      Tijd: ${data.timestamp}
    `;
  } else {
    tooltip.style.display = 'none';
  }
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();

  light.position.x = Math.sin(Date.now() * 0.001) * 100;

  // Staafanimatie
  interactiveBars.forEach(bar => {
    if (bar.scale.y < 1) {
      bar.scale.y += 0.05;
      const h = bar.geometry.parameters.height;
      bar.position.y = (h * bar.scale.y) / 2;
    }
  });

  renderer.render(scene, camera);
}
animate();
