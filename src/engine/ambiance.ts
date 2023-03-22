import { Scene } from "three";
import * as THREE from 'three';
import { ShaderLoader } from "./shaders/shader-loader";

export class Ambiance {
    public static create(): Scene {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color().setHSL(0.6, 0, 1);
        scene.fog = new THREE.Fog(scene.background, 1, 5000);

        // LIGHTS
        const { hemiLight, dirLight } = Ambiance.createLights();
        scene.add(hemiLight, dirLight);

        // GROUND
        const ground = Ambiance.createGround();
        scene.add(ground);

        // SKYDOME
        const { sky, fog } = Ambiance.createSky(hemiLight);
        scene.add(sky);
        scene.fog = fog;

        return scene;
    }
    
    private static createSky(hemiLight: THREE.HemisphereLight) {
        const uniforms = {
            'topColor': { value: new THREE.Color(0x0077ff) },
            'bottomColor': { value: new THREE.Color(0xffffff) },
            'offset': { value: 33 },
            'exponent': { value: 0.6 }
        };
        uniforms['topColor'].value.copy(hemiLight.color);

        const fog = new THREE.Fog(uniforms['bottomColor'].value);
        const { vertexShader, fragmentShader } = ShaderLoader.loadShaders();

        const skyGeo = new THREE.SphereGeometry(4000, 32, 15);
        const skyMat = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            side: THREE.BackSide
        });

        const sky = new THREE.Mesh(skyGeo, skyMat);
        return { sky, fog };
    }

    private static createGround() {
        const groundGeo = new THREE.PlaneGeometry(10000, 10000);
        const groundMat = new THREE.MeshLambertMaterial({ color: "0xffffff" });
        groundMat.color.setHSL(0.3, 1, 0.75);

        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.position.y = -10;
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        return ground;
    }

    private static createLights() {
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
        hemiLight.color.setHSL(0.6, 1, 0.6);
        hemiLight.groundColor.setHSL(0.095, 1, 0.75);
        hemiLight.position.set(0, 50, 0);
  
        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.color.setHSL(0.1, 1, 0.95);
        dirLight.position.set(- 1, 1.75, 1);
        dirLight.position.multiplyScalar(30);
  
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
  
        return { hemiLight, dirLight };
      }
}