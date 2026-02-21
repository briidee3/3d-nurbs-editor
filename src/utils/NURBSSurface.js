// BD 2026

/*
Wrapper/manager for NURBS surface objects in THREE js
*/

import * as THREE from 'three';
import { NURBSSurface } from 'three/addons/curves/NURBSSurface.js';
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';
import BasicScene from './BasicScene.js';
// import './SplitElements.js';


export default class SurfaceObject {

    constructor({
        nurbsParams = {
            degree1: 3,
            degree2: 3,
            knots1: [ 0, 0, 0, 0, 1, 1, 1, 1 ],
            knots2: [ 0, 0, 0, 0, 1, 1, 1, 1 ],
            weights: [
                [ 1, 1, 1, 1 ],
                [ 1, 1, 1, 1 ],
                [ 1, 1, 1, 1 ],
                [ 1, 1, 1, 1 ]
            ],
            // ctrlPts: [
            //     [
            //         new THREE.Vector4( - 200, - 200, 0, this.weights[0][0] ),
            //         new THREE.Vector4( - 200, - 100, 0, this.weights[0][1] ),
            //         new THREE.Vector4( - 200, 0, 0, this.weights[0][2] ),
            //         new THREE.Vector4( - 200, 100, 0, this.weights[0][3] )
            //     ],
            //     [
            //         new THREE.Vector4( -100, - 200, 0, this.weights[1][0] ),
            //         new THREE.Vector4( -100, - 100, 0, this.weights[1][1] ),
            //         new THREE.Vector4( -100, 0, 0, this.weights[1][2] ),
            //         new THREE.Vector4( -100, 100, 0, this.weights[1][3] )
            //     ],
            //     [
            //         new THREE.Vector4( 0, - 200, 0, this.weights[2][0] ),
            //         new THREE.Vector4( 0, - 100, 0, this.weights[2][1] ),
            //         new THREE.Vector4( 0, 0, 0, this.weights[2][2] ),
            //         new THREE.Vector4( 0, 100, 0, this.weights[2][3] )
            //     ],
            //     [
            //         new THREE.Vector4( 100, - 200, 0, this.weights[3][0] ),
            //         new THREE.Vector4( 100, - 100, 0, this.weights[3][1] ),
            //         new THREE.Vector4( 100, 0, 0, this.weights[3][2] ),
            //         new THREE.Vector4( 100, 100, 0, this.weights[3][3] )
            //     ]
            // ]
            ctrlPts: [
                [
                    new THREE.Vector4( - 200, - 200, 0, 1 ),
                    new THREE.Vector4( - 200, - 100, 0, 1 ),
                    new THREE.Vector4( - 200, 0, 0, 1 ),
                    new THREE.Vector4( - 200, 100, 0, 1 )
                ],
                [
                    new THREE.Vector4( -100, - 200, 0, 1 ),
                    new THREE.Vector4( -100, - 100, 0, 1 ),
                    new THREE.Vector4( -100, 0, 0, 1 ),
                    new THREE.Vector4( -100, 100, 0, 1 )
                ],
                [
                    new THREE.Vector4( 0, - 200, 0, 1 ),
                    new THREE.Vector4( 0, - 100, 0, 1 ),
                    new THREE.Vector4( 0, 0, 0, 1 ),
                    new THREE.Vector4( 0, 100, 0, 1 )
                ],
                [
                    new THREE.Vector4( 100, - 200, 0, 1 ),
                    new THREE.Vector4( 100, - 100, 0, 1 ),
                    new THREE.Vector4( 100, 0, 0, 1 ),
                    new THREE.Vector4( 100, 100, 0, 1 )
                ]
            ]
        },
        texturePath = '../img/uv_grid_opengl.jpg',
        geomResolution = 50,
        sizeOfCtrlPts = 10,
        nurbsName = 'nurbs',
        threeScene = new BasicScene()
    }) {
        this.texturePath = texturePath;
        this.geomResolution = geomResolution;
        this.sizeOfCtrlPts = sizeOfCtrlPts;
        this.threeScene = threeScene;
        this.nurbsParams = nurbsParams;

        this.nurbsSurface = new NURBSSurface( this.nurbsParams.degree1, this.nurbsParams.degree2, this.nurbsParams.knots1, this.nurbsParams.knots2, this.nurbsParams.ctrlPts );

        this.map = new THREE.TextureLoader().load(texturePath);
        this.map.wrapS = this.map.wrapT = THREE.RepeatWrapping;
        this.map.anisotropy = 16;
        this.map.colorSpace = THREE.SRGBColorSpace;

        this.nurbsMaterial = new THREE.MeshLambertMaterial( { map: this.map, side: THREE.DoubleSide, opacity: 0.7, transparent: true } );

        // https://javascript.info/bind "losing 'this' problem"
        // var testFunc = ;

        // var getSurfacePoint = (u, v, target) => { return this.nurbsSurface.getPoint(u, v, target); }
        this.nurbsGeometry = new ParametricGeometry( this.getSurfacePoint.bind(this), this.geomResolution, this.geomResolution );
        // this.nurbsGeometry = new ParametricGeometry( (u, v, target) => { testWorkaround(this.nurbsSurface, u, v, target) }, this.geomResolution, this.geomResolution );

        // note to self: ok so i think the problem here is that the function is changing overe time, i.e. the reference to this.nurbsSurfacePoint is dependent on the memory location of it, which may or may not change; same goes for the nurbsParams in this object oriented context. as such the ParametricGeometry is left with a function that is dependent on references to dynamic variables which may or may not change, and which it may or may not have access t, and which may or may not even exist. that is to say, they aren't globals or anything like that
        // this.nurbsGeometry = new ParametricGeometry( getSurfacePoint, this.geomResolution, this.geomResolution );
        this.nurbsGeometry.userData = { parentSurface: this };
        this.nurbsObj = new THREE.Mesh( this.nurbsGeometry, this.nurbsMaterial );

        this.nurbsObj.name = nurbsName;
        this.nurbsObj.position.set( this.threeScene.sceneObjects.canvas.clientWidth / 2, this.threeScene.sceneObjects.canvas.clientHeight / 2, 0 );
        this.nurbsObj.scale.multiplyScalar(1);

        this.ptsMaterial = new THREE.PointsMaterial({ color: 0xFFFFFF, size: sizeOfCtrlPts, opacity: 0.6, transparent: true });
        // this.updateNurbs(this.nurbsParams);     // Update weights references in ctrlPts

        this.makePointsObjsFromNURBS(this.nurbsParams, this.nurbsObj);

        this.updateEvent = new CustomEvent("nurbs-surface-updated", { detail: { name: this.nurbsObj.name, surfaceObj: this } })
    }

    getSurfacePoint(u, v, target) {
        return this.nurbsSurface.getPoint(u, v, target);
    }

    getThreeObject() {
        return this.nurbsObj;
    }

    setSurfaceMaterial(material) {
        this.nurbsMaterial = material;

        return this.nurbsMaterial;
    }

    setPointsMaterial(material) {
        this.ptsMaterial = material

        return this.ptsMaterial;
    }

    makePointsObjsFromNURBS(nurbsParams, nurbsObj) {
        var curRow = 0;
        var curCol = 0;
        nurbsParams.ctrlPts.forEach((row) => {
            row.forEach( (vec4) => {
                var pt = new THREE.Mesh(
                    new THREE.SphereGeometry(this.sizeOfCtrlPts, 10, 10),
                    new THREE.MeshBasicMaterial({
                        color: 0xFFFFFF
                    })
                );
                pt.position.set(vec4.x, vec4.y, vec4.z);
                pt.name = `${curRow},${curCol}`;
                nurbsParams.ctrlPts[curRow][curCol] = new THREE.Vector4(...pt.position, nurbsParams.weights[curRow][curCol]);

                nurbsObj.add(pt); // Make current point child of parent
                this.threeScene.objects.push(pt);   // For keeping track

                curCol += 1;
            }); 
            curRow += 1;
            curCol = 0;
        });
    }

    updateNurbs(nurbsParams) {//, nurbsObj) {
        try {
            // Update weights
            var curRow = 0;
            var curCol = 0;
            nurbsParams.weights.forEach( (row) => {
                row.forEach(() => {
                    nurbsParams.ctrlPts[curRow][curCol].w = nurbsParams.weights[curRow][curCol];

                    curCol++;
                });
                curRow++;
                curCol = 0;
            });

            this.nurbsSurface = new NURBSSurface( nurbsParams.degree1, nurbsParams.degree2, nurbsParams.knots1, nurbsParams.knots2, nurbsParams.ctrlPts );
            if (this.nurbsObj.geometry !== 'undefined') { this.nurbsObj.geometry.dispose(); }
            this.nurbsObj.geometry = new ParametricGeometry( this.getSurfacePoint.bind(this), this.geomResolution, this.geomResolution );
            this.nurbsObj.geometry.userData = { parentSurface: this };

            return true;
        } catch (e) {
            console.error("nurbs-editor.SurfaceObject.updateNurbs: Could not update NURBS!", String(e));
            return false;
        }
    }

    updateNurbsPoint(indices, position) {
        this.nurbsParams.ctrlPts[Number(indices[0])][Number(indices[1])].x = position.x;
        this.nurbsParams.ctrlPts[Number(indices[0])][Number(indices[1])].y = position.y;
        this.nurbsParams.ctrlPts[Number(indices[0])][Number(indices[1])].z = position.z;

        return this.updateNurbs(this.nurbsParams);
    }

    // Handler for dragging functionality (more of that in BasicScene.js)
    handleDragEnd(event) {
        const curId = event.object.name.split(","); // ID contains location in ctrlPts
        this.nurbsParams.ctrlPts[Number(curId[0])][Number(curId[1])].x = event.object.position.x;
        this.nurbsParams.ctrlPts[Number(curId[0])][Number(curId[1])].y = event.object.position.y;
        this.nurbsParams.ctrlPts[Number(curId[0])][Number(curId[1])].z = event.object.position.z;

        // Replace the geometry
        return this.updateNurbs(this.nurbsParams);//, this.nurbsObj);
    }

};
