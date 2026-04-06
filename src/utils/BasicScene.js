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
import { DragControls } from 'three/addons/controls/DragControls.js';
// import { ArcballControls } from 'three/addons/controls/ArcballControls.js';
// import { OutlineEffect } from 'three/addons/effects/OutlineEffect.js';
// import { NURBSCurve } from 'three/addons/curves/NURBSCurve.js';
// import { NURBSSurface } from 'three/addons/curves/NURBSSurface.js';
// import { NURBSVolume } from 'three/addons/curves/NURBSVolume.js';
// import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';

//import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


// Scene setup
// ------------------------------------
export default class BasicScene {

    constructor({
        dimension = 2, 
        objects = [], 
        canvas = document.createElement("canvas"), 
        renderer = new THREE.WebGLRenderer({ antialias: true }), 
        scene = new THREE.Scene(), 
        camera, 
        document_ = document
    }) {
        this.dimension = dimension || 2;
        this.objects = objects || [];
        this.sceneObjects = {
            canvas: canvas, 
            scene: scene,
            renderer: renderer || new THREE.WebGLRenderer({antialias: true, canvas}),
            camera: camera
        };
        this.sceneParams = {};
        this.viewportResizeObserver = {};
        
        // Handle if 2D or 3D
        if (this.dimension === 2) 
            this.initAs2D();
        else 
            this.initAs3D();

        this.mouse = new THREE.Vector2(0, 0);

        // For undo/redo functionality
        this.prevStates = [];
        this.nextStates = [];

        this.ctrlKeyPressed = false;

        this.document = document_ || document;

        // this.document.addEventListener('click', this.onClick);
        // // document.addEventListener('mousemove', onMouseMove);
        // this.document.addEventListener('keydown', this.handleKeyDown);
        // this.document.addEventListener('keyup', this.handleKeyUp);

        this.document.addEventListener('click', this.onClick.bind(this));
        // document.addEventListener('mousemove', onMouseMove);
        this.document.addEventListener('keydown', this.handleKeyDown.bind(this));
        this.document.addEventListener('keyup', this.handleKeyUp.bind(this));

        // this.needsUpdate = false
    }

    // Add a THREE object to the scene
    addObject(object) {
        this.sceneObjects.scene.add(object);
        this.objects.push(object);
    }

    removeObject(object) {
        this.sceneObjects.scene.remove(object);
        

        // Remove object from array without changing address of array (i.e. in-place operations here)
        const index = this.objects.indexOf(object);
        
        // Bring index to end of array
        let tmp;
        for (let i = index; i < this.objects.length - 1; i++) {
            tmp = this.objects[i];
            this.objects[i] = this.objects[i + 1];
            this.objects[i + 1] = tmp;
        }
        // then pop it
        this.objects.pop();
    }

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
        this.sceneParams.cullFar = 50000;                                   // Far cull plane

        // Used for resizing window
        this.sceneParams.tanFov = Math.tan((Math.PI / 180) * this.sceneParams.fov / 2);
        this.sceneParams.initViewportHeight = this.sceneObjects.canvas.clientHeight;

        // Set up scene and camera.
        this.sceneObjects.scene = this.sceneObjects.scene || new THREE.Scene();
        this.sceneObjects.camera = this.sceneObjects.camera || new THREE.PerspectiveCamera(this.sceneParams.fov, this.sceneParams.aspect, this.sceneParams.cullNear, this.sceneParams.cullFar); // FoV, aspect ratio, near clipping plane, far clipping plane
        
        // Add outlines to objects
        // const renderingOutline = false;
        // this.sceneObjects.outlineEffect = new OutlineEffect( this.sceneObjects.renderer );
        // this.sceneObjects.scene.onAfterRender(() => {
        //     if (renderingOutline) return;
        //     renderingOutline = true;
        //     this.sceneObjects.outlineEffect.renderOutline(this.sceneObjects.scene, this.sceneObjects.camera);
        //     renderingOutline = false;
        // });

        //camera.position.set(0, 10, 20);     // Set camera position

        // this.sceneObjects.renderer.setSize(window.innerWidth, window.innerHeight);  

        // Add basic lighting
        this.sceneParams.lighting = {};
        this.sceneObjects.lighting = {};
        this.sceneParams.lighting.ambientLightingColor = 0xFFFFFF;
        this.sceneParams.lighting.ambientLightingIntensity = 0.5;
        this.sceneObjects.lighting.ambientLight = new THREE.AmbientLight(this.sceneParams.lighting.ambientLightingColor, this.sceneParams.lighting.ambientLightingIntensity);
        this.sceneObjects.scene.add(this.sceneObjects.lighting.ambientLight);
        this.sceneParams.lighting.directionalLightingColor = 0xFFFFFF;
        this.sceneParams.lighting.directionalLightingIntensity = 2.5;
        this.sceneObjects.lighting.directionalLight = new THREE.DirectionalLight(this.sceneParams.lighting.directionalLightingColor, this.sceneParams.lighting.directionalLightingIntensity);
        this.sceneObjects.lighting.directionalLight.position.set(-1, 2, 4);
        this.sceneObjects.scene.add(this.sceneObjects.lighting.directionalLight);
        this.sceneParams.lighting.directionalLightingColor2 = 0xFFFFF0;
        this.sceneParams.lighting.directionalLightingIntensity2 = 1.5;
        this.sceneObjects.lighting.directionalLight2 = new THREE.DirectionalLight(this.sceneParams.lighting.directionalLightingColor2, this.sceneParams.lighting.directionalLightingIntensity2);
        this.sceneObjects.lighting.directionalLight2.position.set(5, -3, 1);
        this.sceneObjects.scene.add(this.sceneObjects.lighting.directionalLight2);

        // Adding axes
        this.sceneObjects.axes = new THREE.AxesHelper(1);
        this.sceneObjects.scene.add(this.sceneObjects.axes);

        // Set up orbital controls
        this.sceneObjects.controls = new OrbitControls(this.sceneObjects.camera, this.sceneObjects.renderer.domElement);
        this.sceneObjects.controls.cursorZoom = true;
        this.sceneObjects.controls.mouseButtons.LEFT = null;

        // this.setupViewportResizeObjserver();
    }

    initAs2D() {

        // Set up environment
        this.sceneObjects.renderer = this.sceneObjects.renderer || new THREE.WebGLRenderer({ antialias: true, canvas: this.sceneObjects.canvas });
        
        this.sceneParams.cullNear = -1000;//0.1;                                   // Near cull plane
        this.sceneParams.cullFar = 2000;                                   // Far cull plane

        // Used for resizing window
        this.sceneParams.tanFov = Math.tan((Math.PI / 180) * this.sceneParams.fov / 2);
        this.sceneParams.initViewportHeight = this.sceneObjects.canvas.clientHeight;

        // Set up scene and camera.
        this.sceneObjects.scene = this.sceneObjects.scene || new THREE.Scene();
        // this.sceneObjects.camera = this.sceneObjects.camera || new THREE.OrthographicCamera(
        //     this.sceneObjects.canvas.clientWidth / -2, this.sceneObjects.canvas.clientWidth / 2, 
        //     this.sceneObjects.canvas.clientHeight / -2, this.sceneObjects.canvas.clientHeight / 2,
        //     this.sceneParams.cullNear, this.sceneParams.cullFar
        // );
        this.sceneObjects.camera = this.sceneObjects.camera || new THREE.OrthographicCamera(
            0, this.sceneObjects.canvas.clientWidth, 
            this.sceneObjects.canvas.clientHeight, 0,
            this.sceneParams.cullNear, this.sceneParams.cullFar
        );
        
        // Add outlines to objects
        // var renderingOutline = false;
        // this.sceneObjects.outlineEffect = new OutlineEffect( this.sceneObjects.renderer );
        // this.sceneObjects.scene.onAfterRender(() => {
        //     if (renderingOutline) return;
        //     renderingOutline = true;
        //     this.sceneObjects.outlineEffect.renderOutline(this.sceneObjects.scene, this.sceneObjects.camera);
        //     renderingOutline = false;
        // });

        //camera.position.set(0, 10, 20);     // Set camera position

        // this.sceneObjects.renderer.setSize(window.innerWidth, window.innerHeight);  

        // Add basic lighting
        this.sceneParams.lighting = {};
        this.sceneObjects.lighting = {};
        this.sceneParams.lighting.ambientLightingColor = 0xFFFFFF;
        this.sceneParams.lighting.ambientLightingIntensity = 2;
        this.sceneObjects.lighting.ambientLight = new THREE.AmbientLight(this.sceneParams.lighting.ambientLightingColor, this.sceneParams.lighting.ambientLightingIntensity);
        this.sceneObjects.scene.add(this.sceneObjects.lighting.ambientLight);

        // Adding axes
        // this.sceneObjects.axes = new THREE.AxesHelper(1);
        // this.sceneObjects.scene.add(this.sceneObjects.axes);

        // Set up controls
        this.sceneObjects.controls = new OrbitControls(this.sceneObjects.camera, this.sceneObjects.renderer.domElement);
        this.sceneObjects.controls.cursorZoom = true;
        this.sceneObjects.controls.mouseButtons.LEFT = null;
        this.sceneObjects.controls.enableRotate = false;

        // this.setupViewportResizeObjserver();
        // this.setupDragControls();
    }

    setupViewportResizeObserver(id) {
        // Create resize observer for viewport
        this.viewportResizeObserver = new ResizeObserver(entries => { 
            // Resize the viewport for the first element, assuming it is the viewport canvas. 
            for (let entry of entries) {
                //console.log(entry);
                switch (entry.target.id) {
                    case "viewport" || "canvas" || "surfaceEditorCanvas" || id:
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
                            if (this.sceneObjects.camera instanceof THREE.PerspectiveCamera) {
                                this.sceneObjects.camera.fov = (360 / Math.PI) * Math.atan(this.sceneParams.tanFov * (height / this.sceneParams.initViewportHeight));
                                this.sceneObjects.camera.lookAt(this.sceneObjects.scene.position);
                            }
                            else { //assuming only alternative is orthographic
                                this.sceneObjects.camera.right = width;
                                this.sceneObjects.camera.top = height;
                            }

                            this.sceneObjects.camera.updateProjectionMatrix();
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

    setupDragControls() {


        // Group to hold objects being moved
        this.dragGroup = new THREE.Group();
        this.sceneObjects.scene.add(this.dragGroup);

        console.log(this.objects)
        // Initialize drag controls
        // this.dragControls = new DragControls([ ... this.objects ], this.sceneObjects.camera, this.sceneObjects.renderer.domElement);
        this.dragControls = new DragControls(this.objects, this.sceneObjects.camera, this.sceneObjects.renderer.domElement);
        this.dragControls.rotateSpeed = 0;   // Effectively disable rotation
        // this.dragControls.addEventListener('dragstart', this.onDragStart);
        // this.dragControls.addEventListener('drag', this.onDrag);
        // this.dragControls.addEventListener('dragend', this.onDragEnd);
        // this.dragControls.addEventListener('hoveron', this.onHoverOn);
        // this.dragControls.addEventListener('hoveroff', this.onHoverOff);
        // use bind if vue
        this.dragControls.addEventListener('dragstart', this.onDragStart.bind(this));
        this.dragControls.addEventListener('drag', this.onDragVue.bind(this));
        this.dragControls.addEventListener('dragend', this.onDragEnd.bind(this));
        this.dragControls.addEventListener('hoveron', this.onHoverOn.bind(this));
        this.dragControls.addEventListener('hoveroff', this.onHoverOff.bind(this));
    }

    onDragStart(event) {
        // Change look of object when dragging
        if (typeof event.object.material.emissive !== 'undefined') {event.object.material.emissive.set(0xaaaaaa);}

        if (typeof event.object !== 'undefined' && event.object.hasOwnProperty("position")) {
            const curObj = event.object;
            this.prevStates.push({ object: curObj, position: JSON.parse(JSON.stringify(curObj.position)) });     // Add to undo stack, only position though to prevent stack from getting too big w/ copies of objects
            this.nextStates.length = 0;                                                                          // Wipe nextStates
        }
    }

    // onDragStartVue(event) {
    //     // Change look of object when dragging
    //     if (typeof event.object.target.material.emissive !== 'undefined') {event.object.target.material.emissive.set(0xaaaaaa);}

    //     if (typeof event.object !== 'undefined') {
    //         const curObj = event.object;
    //         this.prevStates.push({ object: curObj, position: JSON.parse(JSON.stringify(curObj.position)) });     // Add to undo stack, only position though to prevent stack from getting too big w/ copies of objects
    //         this.nextStates.length = 0;                                                                          // Wipe nextStates
    //     }
    //     console.log("Drag start!");
    // }
    
    onDragEnd(event) {
        // if (typeof event.object.material.emissive !== 'undefined') {event.object.material.emissive.set(0x000000);}

        if (typeof event.object !== 'undefined' && event.object.hasOwnProperty("parent") && event.object.hasOwnProperty("geometry") && event.object.parent !== null && event.object.parent.hasOwnProperty("geometry") && event.object.parent.hasOwnProperty("name") && event.object.parent.name.includes('nurbs') || event.object.geometry.type === "SphereGeometry" && event.object.parent.geometry.type === "ParametricGeometry") {
            // Regen NURBS mesh upon release if is ctrl pts of nurbs
            const done = event.object.parent.geometry.userData.parentSurface.handleDragEnd(event);  // send to NURBS object

            if (done) {
                this.sceneObjects.canvas.dispatchEvent(event.object.parent.geometry.userData.parentSurface.updateEvent)
            }

            // Let others know about the update
            // this.needsUpdate = true
            
            // const curId = event.object.name.split(","); // ID contains location in ctrlPts
            // nurbsParams.ctrlPts[Number(curId[0])][Number(curId[1])].x = event.object.position.x;
            // nurbsParams.ctrlPts[Number(curId[0])][Number(curId[1])].y = event.object.position.y;
            // nurbsParams.ctrlPts[Number(curId[0])][Number(curId[1])].z = event.object.position.z;

            // // Replace the geometry
            // updateNurbs(nurbsParams, nurbsObj);
        }
    }
    
    // onDragEndVue(event) {
    //     if (typeof event.object.material.emissive !== 'undefined') {event.object.material.emissive.set(0x000000);}

    //     if (typeof event.object !== 'undefined') {
    //         // Regen NURBS mesh upon release
    //         if (event.object.parent.name.includes('nurbs') || event.object.geometry.type === "SphereGeometry" && event.object.parent.geometry.type === "ParametricGeometry") {
    //             console.log(event)
    //             event.object.parent.geometry.userData.parentSurface.handleDragEnd(event);  // send to NURBS object
    // 
    //              if (dragEnd) {
    //                  this.sceneObjects.canvas.dispatchEvent(event.object.parent.geometry.userData.parentSurface.updateEvent)
    //              }
                
    //             // const curId = event.object.name.split(","); // ID contains location in ctrlPts
    //             // nurbsParams.ctrlPts[Number(curId[0])][Number(curId[1])].x = event.object.position.x;
    //             // nurbsParams.ctrlPts[Number(curId[0])][Number(curId[1])].y = event.object.position.y;
    //             // nurbsParams.ctrlPts[Number(curId[0])][Number(curId[1])].z = event.object.position.z;

    //             // // Replace the geometry
    //             // updateNurbs(nurbsParams, nurbsObj);
    //         }
    //     }
    // }

    onDrag(event) {
        if (typeof event.object !== 'undefined' && event.object.hasOwnProperty("position")) {
            // Apply movement constraints (if any)
            {
                // Prevent changes to z axis position
                event.object.position.z = this.prevStates.at(this.prevStates.length - 1).position.z;
            }
        }
    }

    onDragVue(event) {
        if (typeof event.object !== 'undefined' && typeof event.object.target !== 'undefined' && event.object.hasOwnProperty("position")) {
            // Apply movement constraints (if any)
            {
                // Prevent changes to z axis position
                event.object.target.position.z = this.prevStates.at(this.prevStates.length - 1).position.z;
            }
        }
    }
    
    onHoverOn(event) {
        if (typeof event.object !== 'undefined' && event.object.hasOwnProperty("material") && typeof event.object.material.color !== 'undefined') {
            event.object.material.color.set(0xA0A0A0);
        }
    }
    
    // onHoverOnVue(event) {
    //     console.log("TEST")
    //     if (typeof event.object.target.material.color !== 'undefined') {
    //         event.object.target.material.color.set(0xA0A0A0);
    //     }
    // }
    
    onHoverOff(event) {
        if (typeof event.object !== 'undefined' && event.object.hasOwnProperty("material") && typeof event.object.material.color !== 'undefined') {
            event.object.material.color.set(0xFFFFFF);
        }
    }
    
    // onHoverOffVue(event) {
    //     if (typeof event.object.target.material.color !== 'undefined') {
    //         event.object.target.material.color.set(0xFFFFFF);
    //     }
    //     console.log("TEST")
    // }
    
    onClick(event) {
        this.mouse.x = (event.clientX / this.sceneObjects.renderer.domElement.clientWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / this.sceneObjects.renderer.domElement.clientHeight) * 2 + 1;
    }
    
    onUndo(event) {
        if (this.prevStates.length > 0) {
            const state = this.prevStates.pop();
            this.nextStates.push({ object: state.object, position: JSON.parse(JSON.stringify(state.object.position))}); // Add current position to redo stack
            state.object.position.copy(state.position);
            console.log(state)

            // Update NURBS geometry if necessary
            if (typeof state.object !== 'undefined') {
                if (state.object.parent.name.includes('nurbs') || state.object.geometry.type === "SphereGeometry" && state.object.parent.geometry.type === "ParametricGeometry") {
                    const done = state.object.parent.geometry.userData.parentSurface.updateNurbsPoint(state.object.name.split(","), state.object.position);

                    if (done) {
                        this.sceneObjects.canvas.dispatchEvent(state.object.parent.geometry.userData.parentSurface.updateEvent);
                    }
                }
            }

        } else {
            console.warn("nurbs-editor.BasicScene.onUndo: Undo event triggered. Nothing to undo!"); 
        }
    }
    
    onUndoVue(event) {
        if (this.prevStates.length > 0) {
            const state = this.prevStates.pop();
            this.nextStates.push({ object: state.object, position: JSON.parse(JSON.stringify(state.object.position))}); // Add current position to redo stack
            state.object.position.copy(state.position);         // Only restoring position for now


            // Update NURBS geometry if necessary
            if (typeof state.object !== 'undefined') {
                if (state.object.parent.name.includes('nurbs') || event.object.target.geometry.type === "SphereGeometry" && event.object.target.parent.geometry.type === "ParametricGeometry") {
                    const done = state.object.target.parent.geometry.userData.parentSurface.updateNurbsPoint(state.object.name.split(","), state.object.position);

                    if (done) {
                        this.sceneObjects.canvas.dispatchEvent(state.object.parent.geometry.userData.parentSurface.updateEvent);
                    }
                }
            }

        } else {
            console.warn("nurbs-editor.BasicScene.onUndoVue: Undo event triggered. Nothing to undo!"); 
        }
    }

    onRedo(event) {
        if (this.nextStates.length > 0) {
            const state = this.nextStates.pop();
            this.prevStates.push({ object: state.object, position: JSON.parse(JSON.stringify(state.object.position))}); // Add current position to redo stack
            state.object.position.copy(state.position);         // Only restoring position for now


            // Update NURBS geometry if necessary
            if (typeof state.object !== 'undefined') {
                if (state.object.parent.name === 'nurbs' || state.object.geometry.type === "SphereGeometry" && state.object.parent.geometry.type === "ParametricGeometry") {
                    const done = state.object.parent.geometry.userData.parentSurface.updateNurbsPoint(state.object.name.split(","), state.object.position);

                    if (done) {
                        this.sceneObjects.canvas.dispatchEvent(state.object.parent.geometry.userData.parentSurface.updateEvent)
                    }
                }
            }
        } else {
            console.warn("nurbs-editor.BasicScene.onRedo: Redo event triggered. Nothing to redo!");
        }
    }

    onRedoVue(event) {
        if (this.nextStates.length > 0) {
            const state = this.nextStates.pop();
            this.prevStates.push({ object: state.object, position: JSON.parse(JSON.stringify(state.object.position))}); // Add current position to redo stack
            state.object.position.copy(state.position);         // Only restoring position for now


            // Update NURBS geometry if necessary
            if (typeof state.object !== 'undefined') {
                if (state.object.parent.name === 'nurbs' || event.object.target.geometry.type === "SphereGeometry" && event.object.target.parent.geometry.type === "ParametricGeometry") {
                    const done = state.object.target.parent.geometry.userData.parentSurface.updateNurbsPoint(state.object.name.split(","), state.object.position);

                    if (done) {
                        this.sceneObjects.canvas.dispatchEvent(state.object.parent.geometry.userData.parentSurface.updateEvent)
                    }
                }
            }
        } else {
            console.warn("nurbs-editor.BasicScene.onRedoVue: Redo event triggered. Nothing to redo!");
        }
    }


    handleKeyDown(event) {
        if (event instanceof KeyboardEvent) {
            if (event.repeat) {return;} // Prevent holding down to undo or redo
            switch (event.key) {
                case "z":
                    if (event.ctrlKey) {
                        this.onUndo(event);
                    }
                    break;
                case "y":
                    if (event.ctrlKey) {
                        this.onRedo(event);
                    }
                    break;
                default:
            }
            // Hold ctrl to move around parent + children together
            if (event.ctrlKey) {
                this.ctrlKeyPressed = true;
            } else {
                this.ctrlKeyPressed = false;
            }
        }
    }
    handleKeyDownVue(event) {
        if (event instanceof KeyboardEvent) {
            if (event.repeat) {return;} // Prevent holding down to undo or redo
            switch (event.key) {
                case "z":
                    if (event.ctrlKey) {
                        this.onUndoVue(event);
                    }
                    break;
                case "y":
                    if (event.ctrlKey) {
                        this.onRedoVue(event);
                    }
                    break;
                default:
            }
            // Hold ctrl to move around parent + children together
            if (event.ctrlKey) {
                this.ctrlKeyPressed = true;
            } else {
                this.ctrlKeyPressed = false;
            }
        }
    }
    handleKeyUp(event) {
        if (event instanceof KeyboardEvent) {
            switch (event.key) {
                default:
            }
            // Hold ctrl to move around parent + children together
            if (event.ctrlKey) {
                this.ctrlKeyPressed = false;
            }
        }
    }


    defaultAnimateLoop() {
        if (this.ctrlKeyPressed) {
            this.dragControls.transformGroup = false;
        }
        this.sceneObjects.renderer.render(this.sceneObjects.scene, this.sceneObjects.camera);
    }

    runRenderLoop(doc, animateLoop) {
        // Animate the render loop, if WebGL is available
        if (WebGL.isWebGL2Available()) {
            this.sceneObjects.renderer.setAnimationLoop(animateLoop || (() => {
                // this.sceneObjects.renderer.render(this.sceneObjects.scene, this.sceneObjects.camera);
                if (this.ctrlKeyPressed) {
                    this.dragControls.transformGroup = false;
                }
                this.sceneObjects.renderer.render(this.sceneObjects.scene, this.sceneObjects.camera);
            }));
        } else {
            const warning = WebGL.getWebGL2ErrorMessage();
            (doc || this.document).getElementById('container').appendChild(warning);
            console.warn(warning);
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
