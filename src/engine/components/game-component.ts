import { AnimationMixer } from "three/src/animation/AnimationMixer";

export type ThreeObject = THREE.Object3D<THREE.Event>;
export abstract class GameComponent {

    protected obj: ThreeObject;
    protected animation: AnimationMixer | null = null;

    public getObject(): ThreeObject {
        return this.obj;
    }
    public getAnimation(): AnimationMixer | null {
        return this.animation;
    }

    public abstract update(delta: number): Promise<void>;
    public abstract dispose(): Promise<void>;
}