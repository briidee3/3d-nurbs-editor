// BD 2026

// Built from the base THREEjs tutorial @ https://threejs.org/manual/#en/installation

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
//import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


// Scene setup
// ------------------------------------
function main() {
    // Set up canvas HTML element for use containing the viewport, use in renderer definition
    const canvas = document.querySelector("#viewport");
    // const canvas = document.createElement("canvas", { 
    //     is: "primary-viewport", 
    //     width: window.innerWidth, 
    //     height: window.innerHeight 
    // });


    // Set up 3D environment
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    //renderer.setSize(canvas.clientWidth, canvas.clientHeight);  
    //document.body.appendChild(renderer.domElement);

    var fov = 65;                                         // Field of vision
    //var aspect = window.innerWidth / window.innerHeight   // Aspect ratio
    var aspect = canvas.clientWidth / canvas.clientHeight;// Aspect ratio
    var cullNear = 0.1;                                   // Near cull plane
    var cullFar = 1000;                                   // Far cull plane

    // Used for resizing window
    var tanFov = Math.tan(((Math.PI / 180) ** fov / 2));
    //var initWindowHeight = window.innerHeight;
    var initViewportHeight = canvas.clientHeight;

    // Set up scene and camera.
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(fov, aspect, cullNear, cullFar); // FoV, aspect ratio, near clipping plane, far clipping plane
    //const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000); // FoV, aspect ratio, near clipping plane, far clipping plane

    //camera.position.set(0, 10, 20);     // Set camera position

    // renderer.setSize(window.innerWidth, window.innerHeight);  

    // Add basic lighting
    const ambientLightingColor = 0xFFFFFF;
    const ambientLightingIntensity = 0.5;
    const ambientLight = new THREE.AmbientLight(ambientLightingColor, ambientLightingIntensity);
    scene.add(ambientLight);
    const directionalLightingColor = 0xFFFFFF;
    const directionalLightingIntensity = 3;
    const directionalLight = new THREE.DirectionalLight(directionalLightingColor, directionalLightingIntensity);
    directionalLight.position.set(-1, 2, 4);
    scene.add(directionalLight);

    // Adding axes
    //var axes

    // Adding a cube, bc oc
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    camera.position.z = 5;

    // Set up orbital controls
    const controls = new OrbitControls(camera, renderer.domElement);


    // Event listeners
    // ------------------------------------

    // Handle window resizing (taken from THREEjs FAQ @ https://threejs.org/manual/#en/faq)
    //window.addEventListener('resize', onWindowResize, false);

    //function onWindowResize(event) {
    function onViewportResize(renderer) {
        //camera.aspect = window.innerWidth / window.innerHeight;
        const canvas = renderer.domElement;
        const height = canvas.clientHeight;
        const width = canvas.clientWidth;
        camera.lookAt(scene.position);

        // renderer.setSize(window.innerWidth, window.innerHeight);
        //renderer.render(scene, camera);
        renderer.setSize(width, height, false);

        return (height / width) !== camera.aspect;
    }

    // Create resize observer for viewport
    const viewportResizeObserver = new ResizeObserver(entries => { 
        // Resize the viewport for the first element, assuming it is the viewport canvas. 
        for (let entry of entries) {
            //console.log(entry);
            switch (entry.target.id) {
                case "viewport":
                    // Resize viewport
                    // onViewportResize(entry.target);
                    if (onViewportResize(renderer)) {
                        // If viewport gets resized, update camera params
                        const width = renderer.domElement.clientWidth;
                        const height = renderer.domElement.clientHeight;
                        
                        // adjust the FOV
                        //camera.fov = (360 / Math.PI) * Math.atan(tanFov * (window.innerHeight / initWindowHeight));
                        //camera.fov = (360 / Math.PI) * Math.atan(tanFov * (height / initViewportHeight));
                        
                        camera.aspect = width / height;
                        camera.updateProjectionMatrix();
                    }
                    break;
                default:
                    // Do nothing
            }
        }
    });


    // Functions
    // ------------------------------------

    // Check for resizes of viewport
    viewportResizeObserver.observe(renderer.domElement);

    // Render loop
    function animate() {
        // Slowly rotate the cube
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;

        renderer.render(scene, camera);
    }
    

    // Animate the render loop, if WebGL is available
    if (WebGL.isWebGL2Available()) {
        renderer.setAnimationLoop(animate);
    } else {
        const warning = WebGL.getWebGL2ErrorMessage();
        document.getElementById('container').appendChild(warning);
    }
}
main();
