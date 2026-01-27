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
    var aspect = canvas.clientWidth / canvas.clientHeight;// Aspect ratio
    var cullNear = 0.1;                                   // Near cull plane
    var cullFar = 1000;                                   // Far cull plane

    // Used for resizing window
    var tanFov = Math.tan((Math.PI / 180) * fov / 2);
    var initViewportHeight = canvas.clientHeight;

    // Set up scene and camera.
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(fov, aspect, cullNear, cullFar); // FoV, aspect ratio, near clipping plane, far clipping plane
    
    // Add outlines to objects
    var renderingOutline = false;
    const outlineEffect = new OutlineEffect( renderer );
    scene.onAfterRender = () => {
        if (renderingOutline) return;
        renderingOutline = true;
        outlineEffect.renderOutline(scene, camera);
        renderingOutline = false;
    }

    //camera.position.set(0, 10, 20);     // Set camera position

    // renderer.setSize(window.innerWidth, window.innerHeight);  

    // Add basic lighting
    const ambientLightingColor = 0xFFFFFF;
    const ambientLightingIntensity = 0.5;
    const ambientLight = new THREE.AmbientLight(ambientLightingColor, ambientLightingIntensity);
    scene.add(ambientLight);
    const directionalLightingColor = 0xFFFFFF;
    const directionalLightingIntensity = 2.5;
    const directionalLight = new THREE.DirectionalLight(directionalLightingColor, directionalLightingIntensity);
    directionalLight.position.set(-1, 2, 4);
    scene.add(directionalLight);
    const directionalLightingColor2 = 0xFFFFF0;
    const directionalLightingIntensity2 = 1.5;
    const directionalLight2 = new THREE.DirectionalLight(directionalLightingColor2, directionalLightingIntensity2);
    directionalLight2.position.set(5, -3, 1);
    scene.add(directionalLight2);

    // Adding axes
    const axes = new THREE.AxesHelper(1);
    scene.add(axes);

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
                        
                        // Update aspect ratio and Field of View accordingly
                        camera.aspect = width / height;
                        camera.fov = (360 / Math.PI) * Math.atan(tanFov * (height / initViewportHeight));

                        camera.updateProjectionMatrix();
                        camera.lookAt(scene.position);
                    }
                    break;
                default:
                    // Do nothing
            }
        }
    });

    // Check for resizes of viewport
    viewportResizeObserver.observe(renderer.domElement);

    

    // Scene setup
    // ------------------------------------    
    // Adding a cube, bc oc
    camera.position.z = 5;

    // const geometry = new THREE.BoxGeometry(1, 1, 1);
    // const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    // const cube = new THREE.Mesh(geometry, material);
    // scene.add(cube);

    // NURBS surface (example taken from https://threejs.org/examples/webgl_geometry_nurbs.html)
    {

        const nsControlPoints = [
        [
            new THREE.Vector4( - 200, - 200, 100, 1 ),
            new THREE.Vector4( - 200, - 100, - 200, 1 ),
            new THREE.Vector4( - 200, 100, 250, 1 ),
            new THREE.Vector4( - 200, 200, - 100, 1 )
        ],
        [
            new THREE.Vector4( 0, - 200, 0, 1 ),
            new THREE.Vector4( 0, - 100, - 100, 5 ),
            new THREE.Vector4( 0, 100, 150, 5 ),
            new THREE.Vector4( 0, 200, 0, 1 )
        ],
        [
            new THREE.Vector4( 200, - 200, - 100, 1 ),
            new THREE.Vector4( 200, - 100, 200, 1 ),
            new THREE.Vector4( 200, 100, - 250, 1 ),
            new THREE.Vector4( 200, 200, 100, 1 )
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
        object.position.set( - 400, 100, 0 );
        object.scale.multiplyScalar( 1 );
        scene.add( object );

    }



    // Functions
    // ------------------------------------    
    // Render loop
    function animate() {
        // Slowly rotate the cube
        //cube.rotation.x += 0.01;
        //cube.rotation.y += 0.01;

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
