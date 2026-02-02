// BD 2026

// For now, this is essentially just something for use testing misc packages and setups.

/*
CONTROLS:
- CTRL + Left Click + Drag: Move entire body with children when dragging
- Left click + Drag: Move individual children of body
- Right click + Drag: Pan
*/


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
- left click to select surface, and only show control points then
- selection box

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

    var ctrlKeyPressed = false;


    // Scene setup
    sceneSetup.sceneObjects.camera.position.z = 1000;

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

    const ptsMaterial = new THREE.PointsMaterial({
                            color: 0xFFFFFF,
                            size: sizeOfCtrlPts
                        })

    // Make points objects (one for each point) in scene based on controlPoints of parent, assuming the object has control points
    function makePointsObjsFromNURBS(nurbs, nurbsObj) {
        // const pts = [];
        // nsControlPoints.forEach((row) => { row.forEach( (vec4) => {
        //     pts.push(new THREE.Vector3(vec4.x + nurbsObj.position.x, vec4.y + nurbsObj.position.y, vec4.z + nurbsObj.position.z));
        // })});
        
        // const ptsMaterial = new THREE.PointsMaterial({
        //                         color: 0xFFFFFF,
        //                         size: sizeOfCtrlPts
        //                     })
        // const ptsGeom = new THREE.BufferGeometry().setFromPoints(pts);// + nurbsObj.position);  // Also adding nurbsObj position as offset
        // const ptsObj = new THREE.Points(ptsGeom, ptsMaterial);
        // //ptsObj.position.set(nurbsObj.position);
        // ptsObj.scale.multiplyScalar(1);

        // sceneSetup.sceneObjects.scene.add(ptsObj);
        // sceneSetup.objects.push(ptsObj);   // For keeping track

        // var pts = [];
        // var ptsObjs = [];
        // var ptsGeoms = [];
        nurbs.controlPoints.forEach((row) => { row.forEach( (vec4) => {
            // pts.push(new THREE.Vector3(vec4.x + nurbsObj.position.x, vec4.y + nurbsObj.position.y, vec4.z + nurbsObj.position.z));

            // const i = pts.length - 1;
            // ptsGeoms.push(new THREE.BufferGeometry().setFromPoints(pts[i]));
            // ptsObjs.push(new THREE.Points(ptsGeoms[i], ptsMaterial));
            // var pt = new THREE.Points(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(vec4.x, vec4.y, vec4.z)]), ptsMaterial);
            // // var pt = new THREE.Vector3(vec4.x, vec4.y, vec4.z);
            // pt.scale.multiplyScalar(1);
            // // var point = new THREE.Sphere(pt, 100);
            // // console.log(pt.geometry);
            // pt.geometry.computeBoundingSphere();
            // pt.geometry.boundingSphere.set(pt.position, 1000);
            // // pt.geometry.boundingSphere = point;
            // // pt.geometry.computeBoundingBox();
            // console.log(pt.geometry.boundingSphere);
            // pt.addEventListener('mouseover', onMouseOver);
            // pt.addEventListener('mouseleave', onMouseLeave);

            var pt = new THREE.Mesh(
                new THREE.SphereGeometry(sizeOfCtrlPts, 10, 10),
                new THREE.MeshBasicMaterial({
                    color: 0xFFFFFF
                })
            );
            pt.position.set(vec4.x, vec4.y, vec4.z);

            nurbsObj.add(pt); // Make current point child of parent

            // sceneSetup.sceneObjects.scene.add(ptsObjs[i]);
            sceneSetup.objects.push(pt);   // For keeping track
        })});
        
        // + nurbsObj.position);  // Also adding nurbsObj position as offset
        //ptsObj.position.set(nurbsObj.position);

        // sceneSetup.sceneObjects.scene.add(ptsObj);
        // sceneSetup.objects.push(ptsObj);   // For keeping track

        // return { pts: pts, ptsObjs: ptsObjs, ptsGeoms: ptsGeoms };
    }


    // Add NURBS after its pts so pts get checked for intersection first
    makePointsObjsFromNURBS(nurbsSurface, nurbsObj);

    sceneSetup.sceneObjects.scene.add(nurbsObj);
    sceneSetup.objects.push(nurbsObj);   // For keeping track

    // Set up grid
    const grid = new THREE.GridHelper(10000, 250);
    grid.rotation.x = Math.PI * 0.5;
    grid.position.z = -1.1;
    sceneSetup.sceneObjects.scene.add(grid);


    // Handle mouse movement (ref: https://sbcode.net/threejs/mousepick/)
    const mouse = new THREE.Vector2(0,0);

    // Group to hold objects being moved
    const dragGroup = new THREE.Group();
    sceneSetup.sceneObjects.scene.add(dragGroup);

    // Initialize drag controls
    const dragControls = new DragControls([ ... sceneSetup.objects ], sceneSetup.sceneObjects.camera, sceneSetup.sceneObjects.renderer.domElement);
    dragControls.addEventListener('dragstart', onDragStart);
    dragControls.addEventListener('drag', onDrag);
    dragControls.addEventListener('dragend', onDragEnd);
    dragControls.addEventListener('hoveron', onHoverOn);
    dragControls.addEventListener('hoveroff', onHoverOff);
    dragControls.rotateSpeed = 0;   // Effectively disable rotation

    // Set up drag controls (ref: https://github.com/mrdoob/three.js/blob/master/examples/misc_controls_drag.html)
    var prevStates = [];
    var nextStates = [];
    function onDragStart(event) {
        // Change look of object when dragging
        if (typeof event.object.material.emissive !== 'undefined') {event.object.material.emissive.set(0xaaaaaa);}

        if (typeof event.object !== 'undefined') {
            console.log(event.object);

            // console.log(event.pageX);
            // console.log(sceneSetup.sceneObjects.renderer.domElement.clientWidth);
            // raycaster.setFromCamera(mouse, sceneSetup.sceneObjects.camera);
            // raycaster.intersectObject(event.object);
            // console.log(event.object.parent.raycast(raycaster));
            // // console.log(event.object.position);
            // console.log(mouse.x);
            // console.log(mouse.manhattanDistanceTo(event.object.position));
            // console.log(Math.sqrt(Math.pow(Math.abs(event.object.position.x - mouse.x), 2), Math.pow(Math.abs(event.object.position.y - mouse.y), 2)));

            const curObj = event.object;
            prevStates.push({ object: curObj, position: JSON.parse(JSON.stringify(curObj.position)) });     // Add to undo stack, only position though to prevent stack from getting too big w/ copies of objects
            nextStates.length = 0;                                                                          // Wipe nextStates
        }
    }
    function onDragEnd(event) {
        if (typeof event.object.material.emissive !== 'undefined') {event.object.material.emissive.set(0x000000);}

        if (typeof event.object !== 'undefined') {
        }

    }
    function onDrag(event) {
        if (typeof event.object !== 'undefined') {
            // Apply movement constraints (if any)
            {
                // Prevent changes to z axis position
                event.object.position.z = prevStates.at(prevStates.length - 1).position.z;
            }
        }
    }
    // Handle hovering over and leaving
    function onHoverOn(event) {
        if (event.object.isPoints) {
            event.object.material.color.set(0x111111);
        }
    }
    function onHoverOff(event) {
        if (event.object.isPoints) {
            event.object.material.color.set(0xFFFFFF);
        }
    }


    function onClick(event) {
        mouse.x = (event.clientX / sceneSetup.sceneObjects.renderer.domElement.clientWidth) * 2 - 1;
        mouse.y = -(event.clientY / sceneSetup.sceneObjects.renderer.domElement.clientWidth) * 2 + 1;
    }

    // Undo-ing functionality
    function onUndo(event) {
        if (prevStates.length > 0) {
            const state = prevStates.pop();
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
    function handleKeyDown(event) {
        if (event instanceof KeyboardEvent) {
            if (event.repeat) {return;} // Prevent holding down to undo or redo
            switch (event.key) {
                case "z":
                    if (event.ctrlKey) {
                        onUndo(event);
                    }
                    break;
                case "y":
                    if (event.ctrlKey) {
                        onRedo(event);
                    }
                    break;
                default:
            }
            // Hold ctrl to move around parent + children together
            if (event.ctrlKey) {
                ctrlKeyPressed = true;
            } else {
                ctrlKeyPressed = false;
            }
        }
    }
    function handleKeyUp(event) {
        if (event instanceof KeyboardEvent) {
            switch (event.key) {
                default:
            }
            // Hold ctrl to move around parent + children together
            if (event.ctrlKey) {
                ctrlKeyPressed = false;
            }
        }
    }


    function render() {
        // Update things for scene
        if (ctrlKeyPressed) {
            dragControls.transformGroup = false;
        }
        console.log(ctrlKeyPressed);

        // Render
        sceneSetup.sceneObjects.renderer.render(sceneSetup.sceneObjects.scene, sceneSetup.sceneObjects.camera);
    }

    document.addEventListener('click', onClick);
    // document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    sceneSetup.runRenderLoop(document, render());//sceneSetup.defaultAnimateLoop());
}

main();
