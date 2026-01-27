// BD 2026

// Built from the base THREEjs tutorial @ https://threejs.org/manual/#en/installation

// For now, this is essentially just something for use testing misc packages and setups.

/*
TODO:
- Add switches to toggle between different perspectives via the GUI
- Set it up to only do within the dom element that it's baked into, rather than the entire window of the dom
- UI components: 
    - Allow dynamic control of scene and camera variables from a settings menu (e.g. FoV, cull planes)
    - Automatic aspect ratio adjustment whenever window is resized
*/

import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OutlineEffect } from 'three/addons/effects/OutlineEffect.js';
import { NURBSCurve } from 'three/addons/curves/NURBSCurve.js';
import { NURBSSurface } from 'three/addons/curves/NURBSSurface.js';
import { NURBSVolume } from 'three/addons/curves/NURBSVolume.js';
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';

//import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


// Scene setup
// ------------------------------------
export default class BasicScene {

    constructor(dimension, objects, canvas, renderer, scene, camera) {
        this.dimension = dimension;
        this.objects = objects;
        this.sceneObjects = {
            canvas: canvas, 
            scene: scene,
            renderer: renderer,
            camera: camera
        };
        this.sceneParams = {};
        this.viewportResizeObserver = {};
        
        // Handle if 2D or 3D
        if (dimension === 2) this.initAs2D();
        else this.initAs3D();
    }

    // getSceneObjects() {
    //     return this.sceneObjects;
    // }

    // setSceneObject(name, obj) {
    //     this.sceneObjects[name] = obj;

    //     return this.sceneObjects;
    // }

    // setSceneObjectParam(objName, paramName, value) {
    //     // Check if sub-properties in use
    //     if (! paramName.includes(".") ) {
    //         this.sceneObjects[objName[paramName]] = value;
    //     }
    //     else {
    //         const numSubs = (paramName.match(/\./g) || []).length;
    //         for (i in Range(numSubs)) {

    //         }
    //     }

    //     return this.sceneObjects[objName];
    // }

    // getSceneParams() {
    //     return this.sceneParams;
    // }

    // setSceneParam(name, param) {
    //     this.sceneParams[name] = param;

    //     return this.sceneParams;
    // }

    // getObjects() {
    //     return this.objects;
    // }

    // setObject(name, obj) {
    //     this.objects[name] = obj; scene

    //     return this.objects;
    // }

    // Handle window resizing (modified from THREEjs FAQ @ https://threejs.org/manual/#en/faq)
    onViewportResize(renderer) {
        //camera.aspect = window.innerWidth / window.innerHeight;
        const canvas = renderer.domElement;
        const height = canvas.clientHeight;
        const width = canvas.clientWidth;

        // renderer.setSize(window.innerWidth, window.innerHeight);
        //renderer.render(scene, camera);
        renderer.setSize(width, height, false);

        return (height / width) !== this.sceneObjects.camera.aspect;
    }

    initAs3D() {

        // Set up environment
        this.sceneObjects.renderer = this.sceneObjects.renderer || new THREE.WebGLRenderer({ antialias: true, canvas: this.sceneObjects.canvas });

        this.sceneParams.fov = 65;                                         // Field of vision
        this.sceneParams.aspect = this.sceneObjects.canvas.clientWidth / this.sceneObjects.canvas.clientHeight;// Aspect ratio
        this.sceneParams.cullNear = 0.1;                                   // Near cull plane
        this.sceneParams.cullFar = 1000;                                   // Far cull plane

        // Used for resizing window
        this.sceneParams.tanFov = Math.tan((Math.PI / 180) * this.sceneParams.fov / 2);
        this.sceneParams.initViewportHeight = this.sceneObjects.canvas.clientHeight;

        // Set up scene and camera.
        this.sceneObjects.scene = this.sceneObjects.scene || new THREE.Scene();
        this.sceneObjects.camera = this.sceneObjects.camera || new THREE.PerspectiveCamera(this.sceneParams.fov, this.sceneParams.aspect, this.sceneParams.cullNear, this.sceneParams.cullFar); // FoV, aspect ratio, near clipping plane, far clipping plane
        
        // Add outlines to objects
        var renderingOutline = false;
        this.sceneObjects.outlineEffect = new OutlineEffect( this.sceneObjects.renderer );
        this.sceneObjects.scene.onAfterRender = () => {
            if (renderingOutline) return;
            renderingOutline = true;
            this.sceneObjects.outlineEffect.renderOutline(this.sceneObjects.scene, this.sceneObjects.camera);
            renderingOutline = false;
        }

        //camera.position.set(0, 10, 20);     // Set camera position

        // this.sceneObjects.renderer.setSize(window.innerWidth, window.innerHeight);  

        // Add basic lighting
        this.sceneParams.ambientLightingColor = 0xFFFFFF;
        this.sceneParams.ambientLightingIntensity = 0.5;
        this.sceneObjects.ambientLight = new THREE.AmbientLight(this.sceneParams.ambientLightingColor, this.sceneParams.ambientLightingIntensity);
        this.sceneObjects.scene.add(this.sceneObjects.ambientLight);
        this.sceneParams.directionalLightingColor = 0xFFFFFF;
        this.sceneParams.directionalLightingIntensity = 2.5;
        this.sceneObjects.directionalLight = new THREE.DirectionalLight(this.sceneParams.directionalLightingColor, this.sceneParams.directionalLightingIntensity);
        this.sceneObjects.directionalLight.position.set(-1, 2, 4);
        this.sceneObjects.scene.add(this.sceneObjects.directionalLight);
        this.sceneParams.directionalLightingColor2 = 0xFFFFF0;
        this.sceneParams.directionalLightingIntensity2 = 1.5;
        this.sceneObjects.directionalLight2 = new THREE.DirectionalLight(this.sceneParams.directionalLightingColor2, this.sceneParams.directionalLightingIntensity2);
        this.sceneObjects.directionalLight2.position.set(5, -3, 1);
        this.sceneObjects.scene.add(this.sceneObjects.directionalLight2);

        // Adding axes
        this.sceneObjects.axes = new THREE.AxesHelper(1);
        this.sceneObjects.scene.add(this.sceneObjects.axes);

        // Set up orbital controls
        this.sceneObjects.controls = new OrbitControls(this.sceneObjects.camera, this.sceneObjects.renderer.domElement);

        this.setupViewportResizeObjserver();
    }

    setupViewportResizeObjserver() {

        // Create resize observer for viewport
        this.viewportResizeObserver = new ResizeObserver(entries => { 
            // Resize the viewport for the first element, assuming it is the viewport canvas. 
            for (let entry of entries) {
                //console.log(entry);
                switch (entry.target.id) {
                    case "viewport":
                        // Resize viewport
                        // onViewportResize(entry.target);
                        if (this.onViewportResize(this.sceneObjects.renderer)) {
                            // If viewport gets resized, update camera params
                            const width = this.sceneObjects.renderer.domElement.clientWidth;
                            const height = this.sceneObjects.renderer.domElement.clientHeight;
                            
                            // adjust the FOV
                            //camera.fov = (360 / Math.PI) * Math.atan(tanFov * (window.innerHeight / initWindowHeight));
                            
                            // Update aspect ratio and Field of View accordingly
                            this.sceneObjects.camera.aspect = width / height;
                            this.sceneObjects.camera.fov = (360 / Math.PI) * Math.atan(this.sceneParams.tanFov * (height / this.sceneParams.initViewportHeight));

                            this.sceneObjects.camera.updateProjectionMatrix();
                            this.sceneObjects.camera.lookAt(this.sceneObjects.scene.position);
                        }
                        break;
                    default:
                        // Do nothing
                }
            }
        });

        // Check for resizes of viewport
        this.viewportResizeObserver.observe(this.sceneObjects.renderer.domElement);
    }

    initAs2D() {
        //
    }

    defaultAnimateLoop() {
        this.sceneObjects.renderer.render(this.sceneObjects.scene, this.sceneObjects.camera);
        console.log("test");
    }

    runRenderLoop(doc, animateLoop) {
        // Animate the render loop, if WebGL is available
        if (WebGL.isWebGL2Available()) {
            this.sceneObjects.renderer.setAnimationLoop(animateLoop || (() => {
                this.sceneObjects.renderer.render(this.sceneObjects.scene, this.sceneObjects.camera);
            }));
        } else {
            const warning = WebGL.getWebGL2ErrorMessage();
            (doc || document).getElementById('container').appendChild(warning);
        }
    }

    getScene() {
        return {
            dimension: this.dimension,
            objects: this.objects,
            sceneObjects: this.sceneObjects,
            sceneParams: this.sceneParams,
            viewportResizeObserver: this.viewportResizeObserver,
        }
    }
}
