import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { GameComponent } from "./game-component";

interface GroundTileLoadSettings {
    loader: GLTFLoader,
}

export class GroundTile extends GameComponent {

    private static modelPath = 'all-assets/kenney_platformer-kit/blockHexagonLow.glb';

    public static async create({ loader }: GroundTileLoadSettings): Promise<GroundTile> {
        const gltf = await loader.loadAsync(GroundTile.modelPath);
        const obj = gltf.scene.children[0];

        const scale = 100;
        obj.scale.set(500, scale, 500);
        obj.position.set(0, -30, 0);

        obj.castShadow = true;
        obj.receiveShadow = true;

        const tile = new GroundTile();
        tile.obj = obj;
        return tile;
    }

    public update(delta: number): Promise<void> {
        return Promise.resolve();
    }

    public dispose(): Promise<void> {
        return Promise.resolve();
    }
}