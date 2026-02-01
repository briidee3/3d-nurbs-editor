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

- # ctrl pts x
- # ctrl pts y]
- ensure NURBS surface in xy plane
- make movement of NURBS take its control points with it 

good to have:
- highlight place on sidebar w/ data for point/object being highlighted

*/

import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OutlineEffect } from 'three/addons/effects/OutlineEffect.js';
import { NURBSCurve } from 'three/addons/curves/NURBSCurve.js';
import { NURBSSurface } from 'three/addons/curves/NURBSSurface.js';
import { NURBSVolume } from 'three/addons/curves/NURBSVolume.js';
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';
import { DragControls } from 'three/addons/controls/DragControls.js';

import BasicScene from './utils/BasicScene.js';
import './utils/SplitElements.js';

//import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const geomResolution = 20;          // Set num slices for NURBS parametric geometry
const sizeOfCtrlPts = 10;           // Size of ctrl pts


// Scene setup
// ------------------------------------
function main() {
    // Set up canvas HTML element for use containing the viewport, use in renderer definition

    // Initialize scene
    const canvas = document.querySelector("#viewport");
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    const scene = new THREE.Scene();
    const sceneSetup = new BasicScene(2, [], canvas, renderer, scene);
    const raycaster = new THREE.Raycaster();


    // Scene setup
    sceneSetup.sceneObjects.camera.position.z = 5;

    // const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    // const boxMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    // const cube = new THREE.Mesh(boxGeometry, boxMaterial);
    // sceneSetup.sceneObjects.scene.add(cube);

    // NURBS surface (example taken from https://threejs.org/examples/webgl_geometry_nurbs.html)
    // Object
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

    // Display control points of NURBS surface, and set nsControlPoints to point to these new ones for use by NURBS surface
    // const ctrlPts = [
    //     [
    //         new THREE.Vector3( -200, - 200, 0),
    //         new THREE.Vector3( - 200, - 100, 0),
    //         new THREE.Vector3( - 200, 100, 0),
    //         new THREE.Vector3( - 200, 200, 0),
    //     // ],
    //     // [
    //         new THREE.Vector3( 0, - 200, 0),
    //         new THREE.Vector3( 0, - 100, 0),
    //         new THREE.Vector3( 0, 100, 0),
    //         new THREE.Vector3( 0, 200, 0),
    //     // ],
    //     // [
    //         new THREE.Vector3( 200, - 200, 0),
    //         new THREE.Vector3( 200, - 100, 0),
    //         new THREE.Vector3( 200, 100, 0),
    //         new THREE.Vector3( 200, 200, 0)
    //     ]
    // ];
    // const weights = [
    //     1, 1, 1, 1, 
    //     1, 5, 5, 1,
    //     1, 1, 1, 1
    // ];

    // const nurbsCtrlPts = [];
    // for (row in nsControlPoints.length) {
    //     nurbsCtrlPts.push([]);
    //     for (col in nsControlPoints[row].length) {
    //         nurbsCtrlPts[row].push(new THREE.Points(
    //             new THREE.BufferGeometry().setFromPoints(nsControlPoints[0], nsControlPoints[1], nsControlPoints[2]),
    //             ptsMaterial
    //         ));
    //         sceneSetup.sceneObjects.scene.add(nurbsCtrlPts[row][col]);
    //         nsControlPoints[row][col] = new THREE.Vector4(nurbsCtrlPts[row][col].position.getX(0), nurbsCtrlPts[row][col].position.getY(0), 1, nsControlPoints[row][col].getW(0));
    //     }
    // }
    // const pts = new THREE.Points(
    //                 new THREE.BufferGeometry().setFromPoints(ctrlPts),
    //                 ptsMaterial
    //             );
    // pts.position.needsUpdate = true;
    // sceneSetup.sceneObjects.scene.add(pts);

    // for (row in nsControlPoints.length) {
    //     nurbsCtrlPts.push([]);
    //     for (col in nsControlPoints[row].length) {
    //         nurbsCtrlPts[row].push(new THREE.Points(
    //             new THREE.BufferGeometry().setFromPoints(nsControlPoints[0], nsControlPoints[1], nsControlPoints[2]),
    //             ptsMaterial
    //         ));
    //         sceneSetup.sceneObjects.scene.add(nurbsCtrlPts[row][col]);
    //         nsControlPoints[row][col] = new THREE.Vector4(nurbsCtrlPts[row][col].position.getX(0), nurbsCtrlPts[row][col].position.getY(0), 1, weights[row * nsPoints[row].length + col]);
    //     }
    // }
    
    const degree1 = 2;
    const degree2 = 3;
    const knots1 = [ 0, 0, 0, 1, 1, 1 ];
    const knots2 = [ 0, 0, 0, 0, 1, 1, 1, 1 ];
    const nurbsSurface = new NURBSSurface( degree1, degree2, knots1, knots2, nsControlPoints );

    // Material
    const map = new THREE.TextureLoader().load( '../img/uv_grid_opengl.jpg' );
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.anisotropy = 16;
    map.colorSpace = THREE.SRGBColorSpace;

    function getSurfacePoint( u, v, target ) {
        return nurbsSurface.getPoint( u, v, target );
    }

    const geometry = new ParametricGeometry( getSurfacePoint, geomResolution, geomResolution );
    const material = new THREE.MeshLambertMaterial( { map: map, side: THREE.DoubleSide } );
    const nurbsObj = new THREE.Mesh( geometry, material );
    nurbsObj.position.set( sceneSetup.sceneObjects.canvas.clientWidth / 2, sceneSetup.sceneObjects.canvas.clientHeight / 2, 0 );
    nurbsObj.scale.multiplyScalar( 1 );

    sceneSetup.sceneObjects.scene.add(nurbsObj);
    sceneSetup.objects.push(nurbsObj);   // For keeping track

    // Set up points stuffs
    const pts = [];
    nsControlPoints.forEach((row) => { row.forEach( (vec4) => {
        pts.push(new THREE.Vector3(vec4.x + nurbsObj.position.x, vec4.y + nurbsObj.position.y, vec4.z + nurbsObj.position.z));
    })});
    const ptsMaterial = new THREE.PointsMaterial({
                            color: 0xFFFFFF,
                            size: sizeOfCtrlPts
                        })
    const ptsGeom = new THREE.BufferGeometry().setFromPoints(pts);// + nurbsObj.position);  // Also adding nurbsObj position as offset
    const ptsObj = new THREE.Points(ptsGeom, ptsMaterial);
    //ptsObj.position.set(nurbsObj.position);
    ptsObj.scale.multiplyScalar(1);

    sceneSetup.sceneObjects.scene.add(ptsObj);
    sceneSetup.objects.push(ptsObj);   // For keeping track




    // Handle mouse movement (ref: https://sbcode.net/threejs/mousepick/)
    const mouse = new THREE.Vector2();

    // Group to hold objects being moved
    const dragGroup = new THREE.Group();
    sceneSetup.sceneObjects.scene.add(dragGroup);

    // Initialize drag controls
    const dragControls = new DragControls([ ... sceneSetup.objects ], sceneSetup.sceneObjects.camera, sceneSetup.sceneObjects.renderer.domElement);
    // dragControls.addEventListener('drag', render);//onDrag);
    dragControls.addEventListener('dragstart', onDragStart);
    dragControls.addEventListener('dragend', onDragEnd);

    // Set up drag controls (ref: https://github.com/mrdoob/three.js/blob/master/examples/misc_controls_drag.html)
    var prevStates = [];
    var nextStates = [];
    // function onClick(event) {
    //     event.preventDefault();
    //     console.log("c");

    //     // mouse.set((event.clientX / sceneSetup.sceneObjects.renderer.domElement.clientWidth) * 2 - 1, -(event.clientY / sceneSetup.sceneObjects.renderer.domElement.clientWidth) * 2 + 1);
    //     // raycaster.setFromCamera(new THREE.Vector2(event.screenX, event.screenY), sceneSetup.sceneObjects.camera);

    //     // const intersections = raycaster.intersectObjects(sceneSetup.objects, true);

    //     const draggableObjects = dragControls.objects;

    //     // if (intersections.length > 0) {
    //     //     const curObj = intersections[0].object;

    //     //     if (dragGroup.children.includes(curObj)) {
    //     //         object.material.emissive.set(0x000000);
    //     //         scene.attach(curObj);
    //     //     } else {
    //     //         object.material.emissive.set(0xaaaaaa);
    //     //         scene.attach(curObj);
    //     //     }
    //     //     dragControls.transformGroup = true;
    //     //     draggableObjects.push(group);
    //     // }

    //     if (dragGroup.children.length === 0) {
    //         dragControls.transformGroup = false;
    //         draggableObjects.push( ... sceneSetup.objects);
    //     }

    //     // render();
    // }


    // Set up callbacks for on drag in order to enable undo (CTRL+Z) functionality

    // var wasDragging = false;

    function onDragStart(event) {
        // raycaster.setFromCamera(new THREE.Vector2(event.screenX, event.screenY), sceneSetup.sceneObjects.camera);

        // const intersections = raycaster.intersectObjects(sceneSetup.objects, true);
        // // Undo functionality implementation with drag
        // console.log("A");
        // console.log(event);
        
        // // if (event instanceof DragControls && !wasDragging) {
        // // Reset check var so this code only procs once per drag

        // if (intersections.length > 0) {
        //     const curObj = intersections[0].object;
        //     mouse.set((event.clientX / sceneSetup.sceneObjects.renderer.domElement.clientWidth) * 2 - 1, -(event.clientY / sceneSetup.sceneObjects.renderer.domElement.clientWidth) * 2 + 1);
            
        //     // prevStates.push({ object: intersections[0].object, position: intersections[0].object.position });     // Add to undo stack, only position though to prevent stack from getting too big w/ copies of objects
        //     if (!wasDragging) {
        //         wasDragging = true;
        //         prevStates.push({ object: curObj, position: JSON.parse(JSON.stringify(curObj.position)) });     // Add to undo stack, only position though to prevent stack from getting too big w/ copies of objects
        //         nextStates.length = 0;                                                  // Wipe redo stack. NOTE: Should probably explicitly wipe the relevant memory, instead of depending on garbage collection (as is done currently)
        //         console.log(prevStates);
        //         console.log("B");
        //     }

        //     // if (dragGroup.children.includes(curObj)) {
        //     //     object.material.emissive.set(0x000000);
        //     //     scene.attach(curObj);
        //     // } else {
        //     //     object.material.emissive.set(0xaaaaaa);
        //     //     scene.attach(curObj);
        //     // }
        //     // dragControls.transformGroup = true;
        //     // draggableObjects.push(group);
        // }
        

        // render();
        // }
        if (typeof event.object.material.emissive !== 'undefined') {event.object.material.emissive.set(0xaaaaaa);}

        const curObj = event.object;
        mouse.set((event.clientX / sceneSetup.sceneObjects.renderer.domElement.clientWidth) * 2 - 1, -(event.clientY / sceneSetup.sceneObjects.renderer.domElement.clientWidth) * 2 + 1);

        prevStates.push({ object: curObj, position: JSON.parse(JSON.stringify(curObj.position)) });     // Add to undo stack, only position though to prevent stack from getting too big w/ copies of objects
        nextStates.length = 0;                                                  // Wipe redo stack. NOTE: Should probably explicitly wipe the relevant memory, instead of depending on garbage collection (as is done currently)
        console.log(prevStates);
        console.log("B");
    }

    function onDragEnd(event) {
        if (typeof event.object.material.emissive !== 'undefined') {event.object.material.emissive.set(0x000000);}
        // wasDragging = false;
    }

    
    // Have points listen to mouse movement events
    var ptsObjMousedown = false;
    // ptsObj.addEventListener('mousedown', (event) => {
    //     ptsObjMousedown = true;
    // });
    // ptsObj.addEventListener('mouseup', (event) => {
    //     ptsObjMousedown = false;
    // });    
    // sceneSetup.sceneObjects.interactionManager.add(ptsObj);

    // Undo-ing functionality
    function onUndo(event) {
        if (prevStates.length > 0) {
            const state = prevStates.pop();
            console.log(state);
            nextStates.push({ object: state.object, position: JSON.parse(JSON.stringify(state.object.position))}); // Add current position to redo stack
            state.object.position.copy(state.position);         // Only restoring position for now
        } else {
            console.warn("Undo event triggered. Nothing to undo!");
        }
    }
    // Redo-ing functionality
    function onRedo(event) {
        if (nextStates.length > 0) {
            const state = nextStates.pop();
            prevStates.push({ object: state.object, position: JSON.parse(JSON.stringify(state.object.position))}); // Add current position to redo stack
            state.object.position.copy(state.position);         // Only restoring position for now

        } else {
            console.warn("Redo event triggered. Nothing to redo!");
        }
    }

    // Handle keyboard events
    function handleKeys(event) {
        if (event instanceof KeyboardEvent) {
            if (event.repeat) {return;} // Prevent holding down to undo or redo
            switch (event.key) {
                case "z":
                    if (event.ctrlKey) {
                        onUndo(event);
                        console.log("Undone");
                    }
                    break;
                case "y":
                    if (event.ctrlKey) {
                        onRedo(event);
                        console.log("Redone");
                    }
                    break;
                default:
                    //
                // case "Undo":
    // var wasDragging = false;

    // function onDrag(event) {
    //     // Undo functionality implementation with drag
    //     if (event instanceof DragControls && !wasDragging) {
    //         console.log("test");
    //         // Reset check var so this code only procs once per drag
    //         wasDragging = true;

    //         render();
    //     }
    // }

    // function onDragEnd(event) {
    //     wasDragging = false;
    // }
                //     onUndo(event);
                // case "Redo":
                //     onRedo(event);
            }
        }
    }

    // function mouseEvents() {

    // }


    function render() {
        // console.log(wasDragging);
        // Handle mouse events
        // mouseEvents();

        // sceneSetup.sceneObjects.interactionManager.update();
        sceneSetup.sceneObjects.renderer.render(sceneSetup.sceneObjects.scene, sceneSetup.sceneObjects.camera);
    }

    // document.addEventListener('click', onClick);
    document.addEventListener('keydown', handleKeys);

    sceneSetup.runRenderLoop(document, render());//sceneSetup.defaultAnimateLoop());
}

main();
