import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { GameComponent } from "./game-component";
import * as THREE from "three";
import * as CANNON from "cannon";
import { CannonVec3ToThreeVector3, ThreeVector3ToCannonVec3 } from "../convert";

interface CharacterLoadSettings {
    name: string;
    rotation: THREE.Euler,
    position: THREE.Vector3,
    loader: GLTFLoader,
    scale: number,
    camera: THREE.Camera,
}

export class Character extends GameComponent {
    public static async create({ name, rotation, position, loader, scale, camera }: CharacterLoadSettings): Promise<Character> {
        const gltf = await loader.loadAsync(`models/gltf/${name}.gltf`);
        const obj = gltf.scene.children[0];

        obj.position.copy(position);
        obj.rotation.copy(rotation);
        obj.scale.set(scale, scale, scale);

        const mixer = new THREE.AnimationMixer(obj);
        mixer.clipAction(gltf.animations[1]).setDuration(1.5).play();

        // Compute the model's bounding box
        const bbox = new THREE.Box3().setFromObject(obj);
        // Compute the model's dimensions
        const size = new THREE.Vector3();
        bbox.getSize(size);
        size.multiply(obj.scale);
        // Create a Cannon.js box shape with the model's dimensions
        const boxHalfExtents = new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2);
        const boxShape = new CANNON.Box(boxHalfExtents);
        // Create a Cannon.js body with the box shape
        const boxBody = new CANNON.Body({ mass: 1 });
        boxBody.addShape(boxShape);
        // Set the body's position to match the model's position
        boxBody.position.copy(ThreeVector3ToCannonVec3(obj.position));

        // Set up an event listener for mouse movement

        const character = new Character();
        character.obj = obj;
        character.animation = mixer;
        character.body = boxBody;
        character.body.position.copy(new CANNON.Vec3(obj.position.x, obj.position.y, obj.position.z))
        character.camera = camera;
        window.addEventListener('mousemove', (event) => character.onMouseMove(event), false);
        return character;
    }

    private camera: THREE.Camera;
    private raycaster: THREE.Raycaster = new THREE.Raycaster();
    private mouse: THREE.Vector2 =  new THREE.Vector2();

    // Function to handle mouse movement
    public onMouseMove(event: MouseEvent) {
        // Calculate mouse position in normalized device coordinates (-1 to +1)
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
        // Update the raycaster's picking ray based on the current mouse position
        this.raycaster.setFromCamera(this.mouse, this.camera);
    
        // Calculate objects intersecting the picking ray
        const intersects = this.raycaster.intersectObject(this.obj);
    
        if (intersects.length > 0) {
            console.log('Mouse is hovering over the model');
        };
  }

    public update(delta: number): Promise<void> {
        // this.obj.position.copy(CannonVec3ToThreeVector3(this.body.position));
        return Promise.resolve();
    }

    public dispose(): Promise<void> {
        return Promise.resolve();
    }
}