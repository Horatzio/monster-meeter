import { AnimationMixer, Camera, Clock, Scene } from 'three';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

class Engine {
    public static async run(container: HTMLElement, vertexShader: string, fragmentShader: string) {
        const engine = new Engine();
        engine.container = container;
        engine.vertexShader = vertexShader;
        engine.fragmentShader = fragmentShader;
        return engine.run();
    }

    private async run() {
        await this.initialize();
        return this.animate();
    }

    private container!: HTMLElement;
    private vertexShader!: string;
    private fragmentShader!: string;
    
    private camera!: Camera;
    private scene!: Scene;
    private renderer: any;
    private clock!: Clock;
    private mixers: AnimationMixer[] = [];
    private controls!: OrbitControls;

    private async initialize() {
        this.clock = new THREE.Clock();

        const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 5000);
        camera.position.set(0, 10, 250);
        this.camera = camera;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color().setHSL(0.6, 0, 1);
        scene.fog = new THREE.Fog(scene.background, 1, 5000);
        this.scene = scene;

      const { hemiLight } = this.setupLights();

              // GROUND

      const groundGeo = new THREE.PlaneGeometry(10000, 10000);
      const groundMat = new THREE.MeshLambertMaterial({ color: "0xffffff" });
      groundMat.color.setHSL(0.3, 1, 0.75);

      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.position.y = -10;
      ground.rotation.x = - Math.PI / 2;
      ground.receiveShadow = true;
      scene.add(ground);

      // SKYDOME

      const uniforms = {
        'topColor': { value: new THREE.Color(0x0077ff) },
        'bottomColor': { value: new THREE.Color(0xffffff) },
        'offset': { value: 33 },
        'exponent': { value: 0.6 }
      };
      uniforms['topColor'].value.copy(hemiLight.color);

      scene.fog.color.copy(uniforms['bottomColor'].value);

      const skyGeo = new THREE.SphereGeometry(4000, 32, 15);
      const skyMat = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: this.vertexShader,
        fragmentShader: this.fragmentShader,
        side: THREE.BackSide
      });

      const sky = new THREE.Mesh(skyGeo, skyMat);
      scene.add(sky);

        // MODEL

      const loader = new GLTFLoader();

        const gltf = await loader.loadAsync('models/gltf/Chicken.gltf');

        const mesh = gltf.scene.children[0];

        const s = 10;
        mesh.scale.set(s, s, s);
        mesh.position.y = -10;

        mesh.castShadow = true;
        mesh.receiveShadow = true;

        scene.add(mesh);

        const mixer = new THREE.AnimationMixer(mesh);
        mixer.clipAction(gltf.animations[1]).setDuration(1).play();
        this.mixers.push(mixer);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        this.container.appendChild(renderer.domElement);
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.shadowMap.enabled = true;
        this.renderer = renderer;
  
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.minDistance = 200;
        controls.maxDistance = 500;
        controls.maxPolarAngle = Math.PI / 2;
        controls.target.set(0, 0, 0);
        controls.update();
        this.controls = controls;

        window.addEventListener('resize', this.onWindowResize);
    }

    private onWindowResize() {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    private animate() {
        window.requestAnimationFrame(this.animate.bind(this));
        this.render();
    }

    private render() {
      const delta = this.clock.getDelta();

    //   velocity.x -= velocity.x * 10.0 * delta;
    //   velocity.z -= velocity.z * 10.0 * delta;

    //   velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

    //   direction.z = Number(moveForward) - Number(moveBackward);
    //   direction.x = Number(moveRight) - Number(moveLeft);
    //   direction.normalize(); // this ensures consistent movements in all directions

    //   if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
    //   if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

    //   flamingo.position.x += -velocity.x * delta;
    //   flamingo.position.z += -velocity.z * delta;

      for (let i = 0; i < this.mixers.length; i++) {
        this.mixers[i].update(delta);
      }
      this.renderer.render(this.scene, this.camera);
    }

    private setupLights() {
      const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
      hemiLight.color.setHSL(0.6, 1, 0.6);
      hemiLight.groundColor.setHSL(0.095, 1, 0.75);
      hemiLight.position.set(0, 50, 0);
      this.scene.add(hemiLight);

      const dirLight = new THREE.DirectionalLight(0xffffff, 1);
      dirLight.color.setHSL(0.1, 1, 0.95);
      dirLight.position.set(- 1, 1.75, 1);
      dirLight.position.multiplyScalar(30);
      this.scene.add(dirLight);

      dirLight.castShadow = true;

      dirLight.shadow.mapSize.width = 2048;
      dirLight.shadow.mapSize.height = 2048;

      const d = 50;
      dirLight.shadow.camera.left = - d;
      dirLight.shadow.camera.right = d;
      dirLight.shadow.camera.top = d;
      dirLight.shadow.camera.bottom = - d;

      dirLight.shadow.camera.far = 3500;
      dirLight.shadow.bias = - 0.0001;

      return { hemiLight };
    }
}

export default Engine;