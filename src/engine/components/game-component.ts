import { AnimationMixer } from "three/src/animation/AnimationMixer";
import * as CANNON from "cannon";

export type ThreeObject = THREE.Object3D<THREE.Event>;
export type CannonBody = CANNON.Body;
export abstract class GameComponent {

    protected obj: ThreeObject;
    protected animation: AnimationMixer | null = null;
    protected body: CannonBody;

    public getObject(): ThreeObject {
        return this.obj;
    }

    public getBody(): CannonBody {
        return this.body;
    }

    public getAnimation(): AnimationMixer | null {
        return this.animation;
    }

    public abstract update(delta: number): Promise<void>;
    public abstract dispose(): Promise<void>;
}