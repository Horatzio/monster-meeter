import { AnimationMixer, Camera, Clock, Scene } from 'three';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Ambiance } from './ambiance';
import { GameComponent } from './components/game-component';
import { Player } from './components/player';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Character } from './components/character';
import * as CANNON from 'cannon';

interface EngineSettings {
  container: HTMLElement,
}

class Engine {
    public static async run({ container }: EngineSettings) {
        const engine = new Engine();
        engine.container = container;
        return engine.run();
    }

    private async run() {
        await this.initialize();
        return this.gameLoop();
    }

    private container: HTMLElement;
    
    private camera: Camera;
    private scene: Scene;
    private renderer: THREE.WebGLRenderer;
    private clock: Clock;
    private animationMixers: AnimationMixer[] = [];
    private controls: OrbitControls;
    private components: GameComponent[] = [];
    private physicsWorld: CANNON.World;

    private async initialize() {
      this.clock = new THREE.Clock();

      const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 5000);
      camera.position.set(0, 10, 250);
      this.camera = camera;

      this.scene = Ambiance.create();

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.shadowMap.enabled = true;
      this.renderer = renderer;
      this.container.appendChild(renderer.domElement);

      const controls = new OrbitControls(this.camera, this.renderer.domElement);
      controls.minDistance = 5;
      controls.maxDistance = 200;
      controls.maxPolarAngle = Math.PI / 2;
      controls.enablePan = false;
      this.controls = controls;

      const world = new CANNON.World();
      world.gravity.set(0, 9.82, 0); // m/s²
      this.physicsWorld = world;

      const ground = new CANNON.Body({
        mass: 1000000000,
        shape: new CANNON.Plane(),
      });

      this.physicsWorld.addBody(ground);

      // event listeners
      window.addEventListener('resize', this.onWindowResize);

      const components = await this.createWorld();

      for(const component of components) {
        this.scene.add(component.getObject());
        this.physicsWorld.addBody(component.getBody());
        const animation = component.getAnimation();
        if (animation) {
          this.animationMixers.push(animation);
        }
      }

      this.components = components;
    }

    private onWindowResize() {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    private async gameLoop() {
      const delta = this.clock.getDelta();

      await this.update(delta);
      await this.render(delta);

      window.requestAnimationFrame(() => this.gameLoop());
    }

    private async update(delta: number) {
      this.physicsWorld.step(1 / 60, delta);
      await Promise.all(this.components.map((c) => c.update(delta)));
      this.controls.update();
    }
    
    private async render(delta: number) {
        for (const mixer of this.animationMixers) {
          mixer.update(delta);
        }
        this.renderer.render(this.scene, this.camera);
    }

    private async createWorld(): Promise<GameComponent[]> {
      const loader = new GLTFLoader();

      const player = await Player.create({
        loader,
        camera: this.camera,
        controls: this.controls
      });

      const world = await loader.loadAsync('models/gltf/world.gltf');
      const worldScale = 50;
      const worldScene = world.scene;
      worldScene.scale.set(worldScale, worldScale, worldScale)
      this.scene.add(worldScene);

      const characterNames = [
        'ninja',
        'pinkblob',
        'dog',
        'wizard',
        'mushroom',
      ];

      const characters = await Promise.all(characterNames.map(async (name) => {
        const placeholder = worldScene.children.find(child => child.name === `placeholder-${name}`);

        if (!placeholder) {
          throw new Error(`No placeholder for ${name}`);
        }

        const position = new THREE.Vector3();
        const rotation = new THREE.Euler();

        if (placeholder.rotation) {
          rotation.copy(placeholder.rotation);
        }

        if (placeholder.position) {
          position.copy(placeholder.position);
          position.multiplyScalar(worldScale);
        }

        const characterScale = 3;

        return await Character.create({
          name,
          rotation,
          position,
          loader,
          scale: characterScale,
          camera: this.camera,
        });
      }));

      return [
        player,
        ...characters,
      ]
    }
}

export default Engine;