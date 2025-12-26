const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.002);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 50);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.domElement.style.touchAction = 'none'; 
container.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enablePan = false; 

const textureLoader = new THREE.TextureLoader();

// PASTE YOUR IMAGE NAMES HERE
const ringImageFiles = [
    'images/IMG-20250615-WA0160.jpg',
    'images/IMG-20250615-WA0192.jpg',
    'images/IMG-20250827-WA0016.jpg',
    'images/IMG-20251020-WA0023.jpg',
    'images/IMG-20251201-WA0000.jpg',
    'images/IMG-20251207-WA0003.jpg',
    'images/IMG_20250310_134114897.jpg',
    'images/IMG_20250311_140731324.jpg',
    'images/IMG_20250402_161106166.jpg',
    'images/IMG_20250426_221300777.jpg',
    'images/IMG_20250427_090632916.jpg',
    'images/IMG_20250427_112026316.jpg',
    'images/IMG_20250510_134407788.jpg',
    'images/IMG_20250513_191538183.jpg',
    'images/IMG_20250615_124141020.jpg',
    'images/IMG_20250615_153020002.jpg',
    'images/IMG_20250615_153030437.jpg',
    'images/IMG_20250621_170211244.jpg',
    'images/IMG_20250629_181334.jpg',
    'images/IMG_20250709_110200044.jpg',
    'images/IMG_20250709_170214236.jpg',
    'images/IMG_20250726_143310748.jpg',
    'images/IMG_20250928_190805488.jpg',
    'images/IMG_20250928_212425492.jpg',
    'images/IMG_20251101_182703745.jpg',
    'images/IMG_20251101_182808410.jpg',
    'images/IMG_20251101_192539600.jpg',
    'images/IMG_20251101_194738133.jpg',
    'images/IMG_20251101_195017933.jpg',
    'images/IMG_20251101_195020108.jpg',
    'images/IMG_20251103_203305659.jpg',
    'images/IMG_20251103_214353584.jpg',
    'images/IMG_20251112_161707558.jpg',
    'images/Screenshot_20250921-185431.png',
    'images/Snapchat-1107510158.jpg',
    'images/Snapchat-1389478897.jpg',
    'images/Snapchat-1541976499.jpg',
    'images/Snapchat-1936189598.jpg',
    'images/Snapchat-1951084450.jpg',
    'images/Snapchat-1999100101.jpg',
    'images/Snapchat-282320954.jpg',
    'images/Snapchat-387399194.jpg',
    'images/Snapchat-444291468.jpg',
    'images/Snapchat-474225175.jpg',
    'images/Snapchat-529481478.jpg',
    'images/Snapchat-982585256.jpg',
];

const canvas = document.createElement('canvas');
canvas.width = 32; canvas.height = 32;
const context = canvas.getContext('2d');
const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
gradient.addColorStop(0, 'rgba(255,255,255,1)');
gradient.addColorStop(0.5, 'rgba(255,255,255,1)'); 
gradient.addColorStop(1, 'rgba(255,255,255,0)');
context.fillStyle = gradient;
context.fillRect(0, 0, 32, 32);
const bodyTexture = new THREE.CanvasTexture(canvas);

let ringSprites = []; 
let bodyParticles;
const particleCount = 16000; 

const physicsDataBody = []; 
const initialBodyColor = new THREE.Color(0xfff6bd);

const saturnGroup = new THREE.Group();
scene.add(saturnGroup);

function randomSpherePoint(radius) {
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);
    return { x, y, z };
}

function createSaturn() {
    while(saturnGroup.children.length > 0){ 
        saturnGroup.remove(saturnGroup.children[0]); 
    }
    ringSprites = [];
    physicsDataBody.length = 0;
    const bodyPositions = [];
    
    const bodyCount = Math.floor(particleCount * 0.3);
    for (let i = 0; i < bodyCount; i++) {
        const p = randomSpherePoint(10);
        bodyPositions.push(p.x, p.y, p.z);
        physicsDataBody.push({
            type: 'body',
            radius: Math.sqrt(p.x*p.x + p.z*p.z),
            angle: Math.atan2(p.z, p.x),
            y: p.y,
            speed: 0.0005 + Math.random() * 0.0005,
        });
    }

    const totalRingCount = 325; 
    
    const placedPositions = []; 
    const minSeparation = 2.0; 

    if (ringImageFiles.length > 0) {
        const countPerImage = Math.floor(totalRingCount / ringImageFiles.length);

        ringImageFiles.forEach(fileName => {
            textureLoader.load(fileName, (texture) => {
                
                const img = texture.image;
                const aspectRatio = img.width / img.height;
                const baseSize = 3.0; 

                const mat = new THREE.SpriteMaterial({
                    map: texture,
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0.85, 
                    depthWrite: false 
                });

                for (let i = 0; i < countPerImage; i++) {
                    
                    let x, y, z, distance, angle;
                    let validPosition = false;
                    let attempts = 0;

                    while (!validPosition && attempts < 20) {
                        angle = Math.random() * Math.PI * 2;
                        const innerRadius = 15;
                        const outerRadius = 40; 
                        distance = Math.sqrt(Math.random()) * (outerRadius - innerRadius) + innerRadius;
                        
                        x = Math.cos(angle) * distance;
                        z = Math.sin(angle) * distance;
                        y = (Math.random() - 0.5) * 2.0; 

                        let tooClose = false;
                        for (let p of placedPositions) {
                            const dx = x - p.x;
                            const dy = y - p.y;
                            const dz = z - p.z;
                            const distSq = dx*dx + dy*dy + dz*dz;
                            if (distSq < (minSeparation * minSeparation)) {
                                tooClose = true;
                                break;
                            }
                        }

                        if (!tooClose) {
                            validPosition = true;
                            }
                        attempts++;
                    }
                    
                    placedPositions.push({x, y, z}); 

                    const sprite = new THREE.Sprite(mat);
                    sprite.scale.set(baseSize * aspectRatio, baseSize, 1.0);
                    sprite.position.set(x, y, z);
                    
                    sprite.userData = {
                        radius: distance,
                        angle: angle,
                        y: y,
                        speed: (3.0 / distance) * 0.005
                    };

                    saturnGroup.add(sprite);
                    ringSprites.push(sprite);
                }
            });
        });
    }

    const dustCount = particleCount - bodyCount; 
    for (let i = 0; i < dustCount; i++) {
        const p = randomSpherePoint(55); 
        bodyPositions.push(p.x, p.y, p.z);
        physicsDataBody.push({
            type: 'dust',
            vx: (Math.random() - 0.5) * 0.01,
            vy: (Math.random() - 0.5) * 0.01,
            vz: (Math.random() - 0.5) * 0.01
        });
    }

    const bodyGeo = new THREE.BufferGeometry();
    bodyGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(bodyPositions), 3));
    const bodyMat = new THREE.PointsMaterial({
        size: 0.4,
        map: bodyTexture,
        transparent: true,
        opacity: 1.0, 
        color: initialBodyColor,
        blending: THREE.NormalBlending,
        depthWrite: false 
    });
    bodyParticles = new THREE.Points(bodyGeo, bodyMat);
    saturnGroup.add(bodyParticles);
}

createSaturn();

// Removed Color Picker Event Listener

let targetScale = 1;
let currentScale = 1;
let targetRotX = 0.4; 
let targetRotY = 0;
let currentRotX = 0.4;
let currentRotY = 0;

function animate() {
    requestAnimationFrame(animate);
    controls.update();

    ringSprites.forEach(sprite => {
        const data = sprite.userData;
        data.angle += data.speed;
        
        sprite.position.x = Math.cos(data.angle) * data.radius;
        sprite.position.z = Math.sin(data.angle) * data.radius;
        sprite.position.y = data.y;
    });

    if (bodyParticles) {
        const positions = bodyParticles.geometry.attributes.position.array;
        for (let i = 0; i < physicsDataBody.length; i++) {
            const i3 = i * 3;
            const data = physicsDataBody[i];

            if (data.type === 'body') {
                data.angle += data.speed;
                positions[i3] = Math.cos(data.angle) * data.radius;
                positions[i3 + 2] = Math.sin(data.angle) * data.radius;
                positions[i3 + 1] = data.y;
            } else if (data.type === 'dust') {
                positions[i3] += data.vx;
                positions[i3 + 1] += data.vy;
                positions[i3 + 2] += data.vz;
                if (Math.abs(positions[i3]) > 70) data.vx *= -1;
                if (Math.abs(positions[i3+1]) > 70) data.vy *= -1;
                if (Math.abs(positions[i3+2]) > 70) data.vz *= -1;
            }
        }
        bodyParticles.geometry.attributes.position.needsUpdate = true;
    }

    currentScale += (targetScale - currentScale) * 0.02;
    saturnGroup.scale.set(currentScale, currentScale, currentScale);

    currentRotX += (targetRotX - currentRotX) * 0.02;
    currentRotY += (targetRotY - currentRotY) * 0.02;
    
    saturnGroup.rotation.x = currentRotX;
    saturnGroup.rotation.y = currentRotY;

    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

const videoElement = document.getElementById('video-input');
const loader = document.getElementById('loader');

let isHandActive = false;
let lastHandX = 0.5;
let lastHandY = 0.5;

function onResults(results) {
    loader.style.display = 'none';
    // Removed Status Indicator Logic

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        
        const landmarks = results.multiHandLandmarks[0];
        const handCenter = landmarks[9]; 

        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        const dx = thumbTip.x - indexTip.x;
        const dy = thumbTip.y - indexTip.y;
        const distance = Math.sqrt(dx*dx + dy*dy);
        const minDist = 0.02;
        const maxDist = 0.3;
        let norm = (distance - minDist) / (maxDist - minDist);
        norm = Math.max(0, Math.min(1, norm));
        
        targetScale = 0.5 + (norm * 1.5);

        if (!isHandActive) {
            lastHandX = handCenter.x;
            lastHandY = handCenter.y;
            isHandActive = true;
        }

        const deltaX = handCenter.x - lastHandX;
        const deltaY = handCenter.y - lastHandY;

        targetRotY -= deltaX * 1.5; 
        targetRotX += deltaY * 1.5; 

        lastHandX = handCenter.x;
        lastHandY = handCenter.y;

    } else {
        isHandActive = false;
    }
}

const hands = new Hands({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`});
hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 0, 
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});
hands.onResults(onResults);

const cameraUtils = new Camera(videoElement, {
    onFrame: async () => {
        if (videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
            try {
                await hands.send({image: videoElement});
            } catch (error) {
                console.warn("Camera check: Waiting for valid frame...");
            }
        }
    },
    width: 640,
    height: 480
});
cameraUtils.start();