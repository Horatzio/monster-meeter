// @ts-ignore ts(2307)
import vertexShader from './vertexShader.vert?raw';
// @ts-ignore ts(2307)
import fragmentShader from './fragmentShader.frag?raw';

export class ShaderLoader {
    public static loadShaders() {
        return {
            vertexShader: vertexShader,
            fragmentShader: fragmentShader
        }
    }    
}