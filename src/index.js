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

good to have:
- highlight place on sidebar w/ data for point/object being highlighted
- left click to select surface, and only show control points then
- selection box

*/

import * as THREE from 'three';
// import WebGL from 'three/addons/capabilities/WebGL.js'
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// import { OutlineEffect } from 'three/addons/effects/OutlineEffect.js';
// import { NURBSCurve } from 'three/addons/curves/NURBSCurve.js';
// import { NURBSSurface } from 'three/addons/curves/NURBSSurface.js';
// import { NURBSVolume } from 'three/addons/curves/NURBSVolume.js';
// import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';
// import { DragControls } from 'three/addons/controls/DragControls.js';

import BasicScene from './utils/BasicScene.js';
import './utils/SplitElements.js';
import SurfaceObject from './utils/NURBSSurface.js'

const showJsonEditor = false;

// Scene setup
// ------------------------------------
function main() {
    // Set up canvas HTML element for use containing the viewport, use in renderer definition

    // Initialize scene
    const canvas = document.querySelector("#viewport");
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    const scene = new THREE.Scene();
    const sceneSetup = new BasicScene({ dimension: 2, objects: [], canvas: canvas, renderer: renderer, scene: scene});//, document_: document });

    // Scene setup
    sceneSetup.sceneObjects.camera.position.z = 1000;

    const nurbsObj = new SurfaceObject({ threeScene: sceneSetup });

    // sceneSetup.sceneObjects.scene.add(nurbsObj);
    // sceneSetup.objects.push(nurbsObj);   // For keeping track
    sceneSetup.addObject(nurbsObj.nurbsObj);

    // Set up grid
    const grid = new THREE.GridHelper(10000, 250);
    grid.rotation.x = Math.PI * 0.5;
    grid.position.z = -1.1;
    // sceneSetup.sceneObjects.scene.add(grid);
    sceneSetup.addObject(grid);


    if (showJsonEditor) {
        const ctrlsDiv = document.querySelector("#controls");
        
        // Weights
        // {
        //     const weightsDiv = document.createElement("div");
        //     weightsDiv.setAttribute("id", "weights-div");
        //     ctrlsDiv.appendChild(weightsDiv);

        //     const weightsLbl = document.createElement("label");
        //     weightsLbl.setAttribute("id", "weights-label");
        //     weightsLbl.textContent = "Weights:";
        //     weightsDiv.appendChild(weightsLbl);

        //     const weightsForms
        // }"

        const objForm = document.createElement("form");
        // objForm.setAttribute("onsubmit", "this.action=update_nurbs();");
        objForm.setAttribute("id", "json-params-form");
        const button = document.createElement("button");
        button.innerText = "Update";
        button.setAttribute("type", "button");
        // button.setAttribute("text", "Update");
        // objForm.setAttribute("type", "text");
        // objForm.setAttribute("name", "object");
        // objForm.setAttribute("placeholder", `${JSON.stringify(nurbsJSON)}`);
        const textArea = document.createElement("textarea");
        textArea.innerText = `${JSON.stringify(nurbsObj.nurbsParams, null, 1)}`;

        objForm.appendChild(textArea);
        objForm.appendChild(button);
        ctrlsDiv.appendChild(objForm);

        button.addEventListener('click', (event) => {
            const ctrlPts = nurbsObj.nurbsParams.ctrlPts;  // save ctrl pts
            nurbsObj.nurbsParams = JSON.parse(textArea.value);
            nurbsObj.nurbsParams.ctrlPts = ctrlPts;
            nurbsObj.updateNurbs(nurbsObj.nurbsParams);//, nurbsObj);
        });
    }

    sceneSetup.runRenderLoop(document, sceneSetup.defaultAnimateLoop());//document, sceneSetup.defaultAnimateLoop());//document, render());//sceneSetup.defaultAnimateLoop());
}

// main();
