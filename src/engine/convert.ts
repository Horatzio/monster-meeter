import * as THREE from "three";
import * as CANNON from "cannon";

export const ThreeVector3ToCannonVec3: (vector: THREE.Vector3) => CANNON.Vec3 = (vector: THREE.Vector3) => {
    return new CANNON.Vec3(vector.x, vector.y, vector.z);
}

export const ThreeQuaternionToCannonQuaternion: (quaternion: THREE.Quaternion) => CANNON.Quaternion = (quaternion: THREE.Quaternion) => {
    return new CANNON.Quaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
}

export const CannonVec3ToThreeVector3: (vector: CANNON.Vec3) => THREE.Vector3 = (vector: CANNON.Vec3) => {
    return new THREE.Vector3(vector.x, vector.y, vector.z);
}

export const CannonQuaternionToThreeQuaternion: (quaternion: CANNON.Quaternion) => THREE.Quaternion = (quaternion: CANNON.Quaternion) => {
    return new THREE.Quaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
}
