import { useEffect, useRef, useState } from "react";
import * as THREE from 'three';
// Fix for TypeScript not finding OrbitControls module
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Sound effects interface
interface SoundEffects {
  [key: string]: HTMLAudioElement;
}

interface InteractiveBackgroundProps {
  className?: string;
}

const InteractiveBackground: React.FC<InteractiveBackgroundProps> = ({ className }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [sounds, setSounds] = useState<SoundEffects>({});
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showTutorial, setShowTutorial] = useState<boolean>(true);
  const blocksRef = useRef<THREE.Mesh[]>([]);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);

  // Object references for animations
  const animatedObjectsRef = useRef<{
    clouds: THREE.Group[];
    rainbow: THREE.Mesh | null;
    sun: THREE.Mesh | null;
    animals: THREE.Group[];
    particles: THREE.Points | null;
  }>({
    clouds: [],
    rainbow: null,
    sun: null,
    animals: [],
    particles: null
  });

  // Word showcases for child learning objectives
  const wordGroups = [
    { category: "Animals", words: ["Cat", "Dog", "Bird", "Fish", "Duck"] },
    { category: "Colors", words: ["Red", "Blue", "Green", "Yellow", "Pink"] },
    { category: "Shapes", words: ["Circle", "Square", "Star", "Heart", "Diamond"] },
    { category: "Emotions", words: ["Happy", "Sad", "Calm", "Excited", "Sleepy"] }
  ];

  const [currentWordGroup, setCurrentWordGroup] = useState(0);

  // Load sound effects
  useEffect(() => {
    const loadedSounds: SoundEffects = {};
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    // In a real implementation, you would use actual sound files for each letter
    // This is a placeholder - you'll need to add your own sound files
    for (let i = 0; i < alphabet.length; i++) {
      const letter = alphabet[i];
      // Create audio elements (in production, replace with actual file paths)
      const audio = new Audio();
      // audio.src = `/sounds/${letter.toLowerCase()}.mp3`;
      loadedSounds[letter] = audio;
    }

    // Add word category sounds
    wordGroups.forEach(group => {
      group.words.forEach(word => {
        const audio = new Audio();
        // audio.src = `/sounds/words/${word.toLowerCase()}.mp3`;
        loadedSounds[word] = audio;
      });
    });

    // Add effect sounds
    const effectSounds = ["click", "pop", "cheer", "correct", "switch"];
    effectSounds.forEach(effect => {
      const audio = new Audio();
      // audio.src = `/sounds/effects/${effect}.mp3`;
      loadedSounds[effect] = audio;
    });

    // Add background music
    const bgMusic = new Audio();
    // bgMusic.src = "/sounds/background-music.mp3";
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    loadedSounds["bgMusic"] = bgMusic;

    setSounds(loadedSounds);
    setIsLoaded(true);
  }, []);

  // Play background music when loaded
  useEffect(() => {
    if (isLoaded && sounds["bgMusic"] && !isMuted) {
      sounds["bgMusic"].play().catch(e => console.log("Background music play error:", e));
    }

    return () => {
      if (sounds["bgMusic"]) {
        sounds["bgMusic"].pause();
      }
    };
  }, [isLoaded, sounds, isMuted]);

  const playSound = (soundKey: string) => {
    if (sounds[soundKey] && !isMuted) {
      sounds[soundKey].currentTime = 0;
      sounds[soundKey].play().catch(e => console.log(`Sound play error for ${soundKey}:`, e));
    }
  };

  // Toggle background music
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (sounds["bgMusic"]) {
      if (isMuted) {
        sounds["bgMusic"].play().catch(e => console.log("Music play error:", e));
      } else {
        sounds["bgMusic"].pause();
      }
    }
  };

  // Switch between word categories
  const switchWordGroup = () => {
    setCurrentWordGroup((prev) => (prev + 1) % wordGroups.length);
    playSound("switch");
  };

  // Setup and handle Three.js scene
  useEffect(() => {
    if (!mountRef.current || !isLoaded) return;

    // Setup scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Create a gradient background
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 512;
    const context = canvas.getContext('2d');

    if (context) {
      const gradient = context.createLinearGradient(0, 0, 0, 512);
      gradient.addColorStop(0, '#87CEFA'); // Light sky blue at top
      gradient.addColorStop(0.5, '#E0F7FA'); // Very light cyan in middle
      gradient.addColorStop(1, '#B2EBF2'); // Light cyan at bottom

      context.fillStyle = gradient;
      context.fillRect(0, 0, 2, 512);

      const backgroundTexture = new THREE.CanvasTexture(canvas);
      scene.background = backgroundTexture;
    } else {
      scene.background = new THREE.Color(0xE6F7FF); // Fallback light blue
    }

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    cameraRef.current = camera;
    camera.position.z = 18;
    camera.position.y = 1;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    rendererRef.current = renderer;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    // Add OrbitControls with limitations for child-friendly experience
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.enableZoom = true;
    controls.minDistance = 10;
    controls.maxDistance = 30;
    controls.maxPolarAngle = Math.PI / 2; // Limit vertical rotation
    controls.autoRotate = true;  // Auto-rotate for more visual interest
    controls.autoRotateSpeed = 0.5; // Slow rotation

    // Lighting setup for better visuals
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.8);
    directionalLight.position.set(2, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    scene.add(directionalLight);

    // Add a soft point light to enhance depth
    const pointLight = new THREE.PointLight(0xFFE0B2, 0.6, 50);
    pointLight.position.set(0, 5, 10);
    scene.add(pointLight);

    // Particle system for a magical effect
    const createParticleSystem = () => {
      const particleCount = 500;
      const particles = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);

      const colorChoices = [
        new THREE.Color(0xFFD700), // Gold
        new THREE.Color(0xFF6AD5), // Pink
        new THREE.Color(0x00FFFF), // Cyan
        new THREE.Color(0xADFF2F), // Green
        new THREE.Color(0xFFA500), // Orange
      ];

      for (let i = 0; i < particleCount; i++) {
        // Position particles in a sphere
        const radius = 30;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi) - 20; // Behind everything

        // Random color from choices
        const color = colorChoices[Math.floor(Math.random() * colorChoices.length)];
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
      }

      particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const particleMaterial = new THREE.PointsMaterial({
        size: 0.3,
        vertexColors: true,
        transparent: true,
        opacity: 0.7,
      });

      const particleSystem = new THREE.Points(particles, particleMaterial);
      scene.add(particleSystem);

      return particleSystem;
    };

    const particles = createParticleSystem();
    particlesRef.current = particles;
    animatedObjectsRef.current.particles = particles;

    // Create block textures with letters
    const createTextTexture = (letter: string): THREE.Texture => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const context = canvas.getContext('2d');

      if (context) {
        // Background color for the block face
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, 256, 256);

        // Draw colorful border
        context.strokeStyle = '#FF9900';
        context.lineWidth = 16;
        context.strokeRect(8, 8, 240, 240);

        // Draw the letter
        context.font = 'bold 160px Comic Sans MS, cursive';
        context.textAlign = 'center';
        context.textBaseline = 'middle';

        // Choose a child-friendly color based on the letter
        const colors = [
          '#FF5252', // red
          '#FF9800', // orange
          '#FFEB3B', // yellow
          '#4CAF50', // green
          '#2196F3', // blue
          '#9C27B0', // purple
          '#FF4081', // pink
        ];

        context.fillStyle = colors[letter.charCodeAt(0) % colors.length];
        context.fillText(letter, 128, 128);

        // Add a cute little smiley or decoration based on letter
        if (letter === 'A') {
          drawSmallApple(context, 200, 200, 30);
        } else if (letter === 'B') {
          drawSmallBalloon(context, 200, 200, 30);
        } else {
          // Add a simple star for other letters
          drawSmallStar(context, 200, 200, 20);
        }
      }

      const texture = new THREE.CanvasTexture(canvas);
      return texture;
    };

    // Helper functions for drawing cute decorations
    function drawSmallApple(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
      ctx.fillStyle = '#FF0000';
      ctx.beginPath();
      ctx.arc(x, y, size/2, 0, Math.PI * 2);
      ctx.fill();

      // Stem
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(x - 2, y - size/2 - 10, 4, 10);

      // Leaf
      ctx.fillStyle = '#4CAF50';
      ctx.beginPath();
      ctx.ellipse(x + 5, y - size/2 - 5, 8, 5, Math.PI/4, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawSmallBalloon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
      ctx.fillStyle = '#FF4081';
      ctx.beginPath();
      ctx.arc(x, y - size/2, size/2, 0, Math.PI * 2);
      ctx.fill();

      // String
      ctx.strokeStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + size/2);
      ctx.stroke();
    }

    function drawSmallStar(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
      const spikes = 5;
      const outerRadius = size/2;
      const innerRadius = size/4;

      ctx.beginPath();
      ctx.fillStyle = '#FFD700';

      let rot = Math.PI / 2 * 3;
      let step = Math.PI / spikes;

      ctx.beginPath();
      ctx.moveTo(x, y - outerRadius);

      for (let i = 0; i < spikes; i++) {
        ctx.lineTo(x + Math.cos(rot) * outerRadius, y + Math.sin(rot) * outerRadius);
        rot += step;
        ctx.lineTo(x + Math.cos(rot) * innerRadius, y + Math.sin(rot) * innerRadius);
        rot += step;
      }

      ctx.lineTo(x, y - outerRadius);
      ctx.closePath();
      ctx.fill();
    }

    // Create ABC blocks
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const blockSize = 1.5;
    const blocks: THREE.Mesh[] = [];
    blocksRef.current = blocks;

    // Create blocks in a more dynamic 3D arrangement with better spacing
    const totalBlocks = alphabet.length;

    // Create a more organized but still playful arrangement
    for (let i = 0; i < totalBlocks; i++) {
      const letter = alphabet[i];

      // Create cube geometry
      const geometry = new THREE.BoxGeometry(blockSize, blockSize, blockSize);

      // Create materials for each face of cube - all faces have the letter
      const materials = [];

      // Create the letter texture
      const letterTexture = createTextTexture(letter);

      // Apply the letter texture to all 6 faces
      for (let j = 0; j < 6; j++) {
        // Rotate the texture for different faces to make it more interesting
        const material = new THREE.MeshLambertMaterial({ map: letterTexture });
        materials.push(material);
      }

      // Create cube with materials
      const cube = new THREE.Mesh(geometry, materials);

      // Position cubes in a more organized 3D space with better separation
      // Use multiple orbital rings with different heights to prevent excessive collisions
      const ringIndex = Math.floor(i / 9); // 9 blocks per ring (3 rings total)
      const blockInRing = i % 9;

      // Calculate position based on ring
      const angle = (blockInRing / 9) * Math.PI * 2; // Evenly space blocks in each ring
      const radius = 8 + ringIndex * 3; // Different radius for each ring
      const heightVariation = ringIndex * 2 - 2; // Different height for each ring

      cube.position.x = Math.cos(angle) * radius;
      cube.position.y = heightVariation;
      cube.position.z = Math.sin(angle) * radius - 5;

      // Add slight random rotation for playful look (but not too much)
      cube.rotation.x = Math.random() * Math.PI / 4;
      cube.rotation.y = Math.random() * Math.PI / 4;
      cube.rotation.z = Math.random() * Math.PI / 4;

      // Add physics and animation properties to each block
      cube.userData = {
        letter,
        animationPhase: Math.random() * Math.PI * 2,
        animationSpeed: 0.3 + Math.random() * 0.2, // Slower, more consistent speeds
        orbitRadius: radius,
        orbitAngle: angle,
        heightOffset: heightVariation,
        velocity: new THREE.Vector3(0, 0, 0), // For physics-based movement
        acceleration: new THREE.Vector3(0, 0, 0),
        mass: 1 + Math.random() * 0.5, // Slightly different masses
        damping: 0.98, // Damping factor to prevent excessive movement
        ringIndex: ringIndex, // Remember which ring this block belongs to
        targetY: heightVariation // Target height to return to after collisions
      };

      scene.add(cube);
      blocks.push(cube);
    }

    // Add some decorative elements to make the scene more kid-friendly

    // Create beautiful clouds
    const createBeautifulCloud = (x: number, y: number, z: number, scale: number) => {
      const cloudGroup = new THREE.Group();

      // Use more puffs for fuller clouds
      const puffCount = 8 + Math.floor(Math.random() * 5); // 8-12 puffs per cloud
      const puffGeometry = new THREE.SphereGeometry(1, 16, 16);
      const puffMaterial = new THREE.MeshLambertMaterial({
        color: 0xFFFFFF,
        emissive: 0x555555,
        emissiveIntensity: 0.1
      });

      // Create a more natural cloud shape
      for (let i = 0; i < puffCount; i++) {
        const puff = new THREE.Mesh(puffGeometry, puffMaterial);

        // Position puffs in a more natural cloud formation
        const angle = (i / puffCount) * Math.PI * 2;
        const radius = 0.8 + Math.random() * 0.4;

        puff.position.x = Math.cos(angle) * radius * 1.5;
        puff.position.y = Math.sin(angle) * radius * 0.5;
        puff.position.z = Math.random() * 0.5;

        // Vary the size of each puff
        const puffSize = 0.7 + Math.random() * 0.6;
        puff.scale.set(puffSize, puffSize, puffSize);

        cloudGroup.add(puff);
      }

      // Add a few more puffs on top for volume
      for (let i = 0; i < 3; i++) {
        const puff = new THREE.Mesh(puffGeometry, puffMaterial);
        puff.position.set(
          (Math.random() - 0.5) * 2,
          0.5 + Math.random() * 0.5,
          (Math.random() - 0.5) * 0.5
        );
        const puffSize = 0.8 + Math.random() * 0.4;
        puff.scale.set(puffSize, puffSize, puffSize);
        cloudGroup.add(puff);
      }

      cloudGroup.position.set(x, y, z);
      cloudGroup.scale.set(scale, scale, scale);
      scene.add(cloudGroup);
      return cloudGroup;
    };

    // Add beautiful clouds at different depths
    const clouds = [];
    for (let i = 0; i < 12; i++) { // 12 clouds for a fuller sky
      const depth = -15 - Math.random() * 10; // Vary the depth for parallax effect
      const cloud = createBeautifulCloud(
        Math.random() * 40 - 20,
        Math.random() * 10 + 5,
        depth,
        0.8 + Math.random() * 0.6 // Vary the size
      );

      // Add cloud movement data
      cloud.userData = {
        speed: 0.002 + Math.random() * 0.003, // Different speeds
        depth: depth
      };

      clouds.push(cloud);
    }



    // Handle window resizing
    const handleResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    // Handle mouse interactions
    const handleMouseMove = (event: MouseEvent) => {
      event.preventDefault();

      // Calculate mouse position in normalized device coordinates
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    const handleClick = () => {
      if (!cameraRef.current || !sceneRef.current) return;

      // Update the picking ray with the camera and mouse position
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

      // Calculate objects intersecting the picking ray
      const intersects = raycasterRef.current.intersectObjects(blocksRef.current);

      if (intersects.length > 0) {
        const selectedBlock = intersects[0].object as THREE.Mesh;
        const letter = selectedBlock.userData.letter as string;

        // Animate the block (spin)
        const currentRotationY = selectedBlock.rotation.y;

        // Create a smooth animation for the block
        const rotateBlock = () => {
          let progress = 0;
          const duration = 1000; // 1 second
          const startTime = Date.now();

          const animate = () => {
            const elapsed = Date.now() - startTime;
            progress = Math.min(elapsed / duration, 1);

            // Use easeInOutQuad easing function for smooth rotation
            const easeProgress = progress < 0.5
              ? 2 * progress * progress
              : 1 - Math.pow(-2 * progress + 2, 2) / 2;

            selectedBlock.rotation.y = currentRotationY + easeProgress * Math.PI * 2;

            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };

          animate();
        };

        rotateBlock();

        // Play the associated sound
        if (sounds[letter]) {
          sounds[letter].currentTime = 0;
          sounds[letter].play().catch(e => console.log("Sound play error:", e));
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Add more dynamic animations to blocks
      blocks.forEach((block, index) => {
        const userData = block.userData;

        // Orbital movement - each block follows its own path
        const time = Date.now() * 0.001;
        const orbitSpeed = userData.animationSpeed * 0.1;
        const newAngle = userData.orbitAngle + orbitSpeed * 0.05;
        userData.orbitAngle = newAngle;

        // Update position based on orbital path and floating motion
        block.position.x = Math.cos(newAngle) * userData.orbitRadius;
        block.position.z = Math.sin(newAngle) * userData.orbitRadius - 5;

        // Floating up and down with different phases
        block.position.y = userData.heightOffset + Math.sin(time + userData.animationPhase) * 0.5;

        // Gentle rotation on different axes
        block.rotation.x += 0.003 * (index % 3 + 1);
        block.rotation.y += 0.002 * (index % 3 + 1);

        // Store the current position for collision detection
        userData.prevPosition = { ...block.position };
      });

      // No collision detection or prevention - blocks can freely pass through each other
      // Just apply gentle, flowing animation to all blocks

      // No bounce animation handling - removed as requested

      // Move clouds slowly with parallax effect
      clouds.forEach(cloud => {
        const cloudData = cloud.userData;
        // Clouds at different depths move at different speeds (parallax)
        cloud.position.x -= cloudData.speed;
        if (cloud.position.x < -20) {
          cloud.position.x = 20;
        }
      });

      // Update controls
      controls.update();

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);

      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }

      // Dispose of geometries and materials
      blocks.forEach(block => {
        if (block.geometry) block.geometry.dispose();
        if (Array.isArray(block.material)) {
          block.material.forEach(material => material.dispose());
        } else if (block.material) {
          block.material.dispose();
        }
      });
    };
  }, [isLoaded, sounds]);

  return (
    <div
      ref={mountRef}
      className={`w-full h-full absolute inset-0 ${className || ''}`}
      style={{ zIndex: 0 }}
    />
  );
};

export default InteractiveBackground;
