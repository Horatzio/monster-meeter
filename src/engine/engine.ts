import { AnimationMixer, Camera, Clock, Scene } from 'three';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Ambiance } from './ambiance';
import { GameComponent } from './components/game-component';
import { Player } from './components/player';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { GroundTile } from './components/ground-tile';

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
      controls.minDistance = 200;
      controls.maxDistance = 500;
      controls.maxPolarAngle = Math.PI / 2;
      this.controls = controls;

      // event listeners
      window.addEventListener('resize', this.onWindowResize);

      const components = await this.createWorld();

      for(const component of components) {
        this.scene.add(component.getObject());
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

      const ground = await GroundTile.create({
        loader
      })
      
      return [
        player,
        ground
      ]
    }
}

export default Engine;