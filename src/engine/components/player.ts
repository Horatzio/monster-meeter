import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { GameComponent } from "./game-component";
import * as THREE from "three";
import * as CANNON from "cannon";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { ThreeVector3ToCannonVec3 } from "../convert";

interface PlayerLoadSettings {
    loader: GLTFLoader,
    controls: OrbitControls,
    camera: THREE.Camera,
}

export class Player extends GameComponent {

    private static modelPath = 'models/gltf/Cat.gltf';

    public static async create({ loader, controls, camera }: PlayerLoadSettings): Promise<Player> {
        const gltf = await loader.loadAsync(Player.modelPath);
        const obj = gltf.scene.children[0];

        const scale = 4;
        obj.scale.set(scale, scale, scale);
        obj.position.set(0, 0, 0);

        obj.castShadow = true;
        obj.receiveShadow = true;

        controls.target = obj.position;
        controls.update();

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
        const boxBody = new CANNON.Body({ mass: 1000000 });
        boxBody.addShape(boxShape);
        // Set the body's position to match the model's position
        boxBody.position.copy(ThreeVector3ToCannonVec3(obj.position));

        const player = new Player();
        player.obj = obj;
        player.animation = mixer;
        player.camera = camera;
        player.body = boxBody;
        player.body.position.copy(new CANNON.Vec3(obj.position.x, obj.position.y, obj.position.z))
        window.addEventListener('keydown', (event) => player.onKeyDown(event));
        window.addEventListener('keyup', (event) => player.onKeyUp(event));

        return player;
    }

    private camera: THREE.Camera;
    private speed: number = 50;
    private keysPressed: Set<string> = new Set();
    private targetPosition: THREE.Vector3 = new THREE.Vector3();

    private onKeyDown(event: KeyboardEvent): void {
        this.keysPressed.add(event.code);
      }
    
    private onKeyUp(event: KeyboardEvent): void {
        this.keysPressed.delete(event.code);
    }

    public async update(delta: number): Promise<void> {
        // this.obj.position.copy(CannonVec3ToThreeVector3(this.body.position));
        // this.obj.quaternion.copy(CannonQuaternionToThreeQuaternion(this.body.quaternion));

        const transform = this.obj;
    
        const movementSpeed = this.speed * delta;
        const rotationSpeed = 5 * delta; // Adjust the rotation speed as needed

        const direction = new THREE.Vector3();
    
        if (this.keysPressed.has('KeyW')) {
            direction.z -= 1;
        }
    
        if (this.keysPressed.has('KeyS')) {
            direction.z += 1;
        }
    
        if (this.keysPressed.has('KeyA')) {
            direction.x += 1;
        }
    
        if (this.keysPressed.has('KeyD')) {
            direction.x -= 1;
        }
    
        if (direction.length() > 0) {
            // Normalize the direction vector
            direction.normalize();

            // Calculate the camera's forward and right vectors
            const forward = new THREE.Vector3();
            const right = new THREE.Vector3();
            this.camera.getWorldDirection(forward);
            right.crossVectors(this.camera.up, forward);

            // Adjust the movement direction based on the camera's forward and right vectors
            const adjustedDirection = new THREE.Vector3();
            adjustedDirection.addScaledVector(forward, -direction.z);
            adjustedDirection.addScaledVector(right, direction.x);

            // Set the Y component to zero to ensure movement along the X and Z axes
            adjustedDirection.y = 0;

            // Calculate the new position
            const newPosition = adjustedDirection.multiplyScalar(movementSpeed).add(transform.position);

            // Rotate the player towards the direction of movement
            this.targetPosition.copy(newPosition);
            this.targetPosition.y = transform.position.y; // Keep the same height
            const targetQuaternion = new THREE.Quaternion().setFromRotationMatrix(
                new THREE.Matrix4().lookAt(this.targetPosition, transform.position, transform.up)
              );
            transform.quaternion.slerp(targetQuaternion, rotationSpeed);

            // Update the player's position
            transform.position.copy(newPosition);
        }
    }

    public dispose(): Promise<void> {
        return Promise.resolve();
    }
}