// BD 2026

// For now, this is essentially just something for use testing misc packages and setups.

/*
TODO:
- Add switches to toggle between different perspectives via the GUI
- Set it up to only do within the dom element that it's baked into, rather than the entire window of the dom
- UI components: 
    - Allow dynamic control of scene and camera variables from a settings menu (e.g. FoV, cull planes)
    - Automatic aspect ratio adjustment whenever window is resized
- Add functions to allow manipulation of NURBS surface texture grid density via a slider
Mandatory:
- check if all of each lens bound is entirely intersected by the grid. otherwise, no dice. if it's less than a threshold value of a difference, use nearest neighbor to get values for axes directions
- figure out how to maintain constraints on NURBS surface, e.g. Conformal Mapping

*/

import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OutlineEffect } from 'three/addons/effects/OutlineEffect.js';
import { NURBSCurve } from 'three/addons/curves/NURBSCurve.js';
import { NURBSSurface } from 'three/addons/curves/NURBSSurface.js';
import { NURBSVolume } from 'three/addons/curves/NURBSVolume.js';
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';

import BasicScene from './utils/BasicScene.js';

//import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


// Scene setup
// ------------------------------------
function main() {
    // Set up canvas HTML element for use containing the viewport, use in renderer definition

    // Initialize scene
    const canvas = document.querySelector("#viewport");
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    const scene = new THREE.Scene();
    const sceneSetup = new BasicScene(2, {}, canvas, renderer, scene);


    // Scene setup
    sceneSetup.sceneObjects.camera.position.z = 5;

    // const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    // const boxMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    // const cube = new THREE.Mesh(boxGeometry, boxMaterial);
    // sceneSetup.sceneObjects.scene.add(cube);

    // NURBS surface (example taken from https://threejs.org/examples/webgl_geometry_nurbs.html)
    {
        const nsControlPoints = [
            [
                new THREE.Vector4( - 200, - 200, 0, 1 ),
                new THREE.Vector4( - 200, - 100, 0, 1 ),
                new THREE.Vector4( - 200, 100, 0, 1 ),
                new THREE.Vector4( - 200, 200, 0, 1 )
            ],
            [
                new THREE.Vector4( 0, - 200, 0, 1 ),
                new THREE.Vector4( 0, - 100, 0, 5 ),
                new THREE.Vector4( 0, 100, 0, 5 ),
                new THREE.Vector4( 0, 200, 0, 1 )
            ],
            [
                new THREE.Vector4( 200, - 200, 0, 1 ),
                new THREE.Vector4( 200, - 100, 0, 1 ),
                new THREE.Vector4( 200, 100, 0, 1 ),
                new THREE.Vector4( 200, 200, 0, 1 )
            ]
        ];
        const degree1 = 2;
        const degree2 = 3;
        const knots1 = [ 0, 0, 0, 1, 1, 1 ];
        const knots2 = [ 0, 0, 0, 0, 1, 1, 1, 1 ];
        const nurbsSurface = new NURBSSurface( degree1, degree2, knots1, knots2, nsControlPoints );

        const map = new THREE.TextureLoader().load( '../img/uv_grid_opengl.jpg' );
        map.wrapS = map.wrapT = THREE.RepeatWrapping;
        map.anisotropy = 16;
        map.colorSpace = THREE.SRGBColorSpace;

        function getSurfacePoint( u, v, target ) {
            return nurbsSurface.getPoint( u, v, target );
        }

        const geometry = new ParametricGeometry( getSurfacePoint, 20, 20 );
        const material = new THREE.MeshLambertMaterial( { map: map, side: THREE.DoubleSide } );
        const object = new THREE.Mesh( geometry, material );
        object.position.set( 0, 0, 0 );
        object.scale.multiplyScalar( 1 );

        sceneSetup.sceneObjects.scene.add( object );

    }
    
    sceneSetup.runRenderLoop(document, sceneSetup.defaultAnimateLoop());
    console.log(sceneSetup.sceneObjects.scene);
}

main();
