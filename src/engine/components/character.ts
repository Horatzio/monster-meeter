import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { GameComponent } from "./game-component";
import * as THREE from "three";

interface CharacterLoadSettings {
    name: string;
    rotation: THREE.Euler,
    position: THREE.Vector3,
    loader: GLTFLoader,
    scale: number,
}

export class Character extends GameComponent {
    public static async create({ name, rotation, position, loader, scale }: CharacterLoadSettings): Promise<Character> {
        const gltf = await loader.loadAsync(`models/gltf/${name}.gltf`);
        const obj = gltf.scene.children[0];

        obj.position.copy(position);
        obj.rotation.copy(rotation);
        obj.scale.set(scale, scale, scale);

        const mixer = new THREE.AnimationMixer(obj);
        mixer.clipAction(gltf.animations[1]).setDuration(1.5).play();

        const character = new Character();
        character.obj = obj;
        character.animation = mixer;
        return character;
    }

    public update(delta: number): Promise<void> {
        return Promise.resolve();
    }

    public dispose(): Promise<void> {
        return Promise.resolve();
    }
}