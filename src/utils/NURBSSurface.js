// BD 2026

/*
Wrapper/manager for NURBS surface objects in THREE js
TODO:
- Add algorithm A9.4 from TNB, modify to handle partial derivatives at data points as described pg. 382
*/

import * as THREE from 'three';
import { NURBSSurface } from 'three/addons/curves/NURBSSurface.js';
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';
import BasicScene from './BasicScene.js';
import { calcBasisFunctionDerivatives, findSpan, calcKoverI, calcBasisFunctions } from 'three/examples/jsm/curves/NURBSUtils.js';
import { distance, max } from 'three/src/nodes/math/MathNode.js';
import { int } from 'three/tsl';
import * as math from 'mathjs';
import { exponentialHeightFogFactor } from 'three/tsl';
// import './SplitElements.js';







// export default class SurfaceObject {
class SurfaceObject {

    constructor({
        nurbsParams = {
            degree1: 4,
            degree2: 4,
            knots1: [ 0, 0, 0, 0, 0, 1, 1, 1, 1, 1 ],
            knots2: [ 0, 0, 0, 0, 0, 1, 1, 1, 1, 1 ],
            weights: [
                [ 1, 1, 1, 1, 1 ],
                [ 1, 1, 1, 1, 1 ],
                [ 1, 1, 1, 1, 1 ],
                [ 1, 1, 1, 1, 1 ],
                [ 1, 1, 1, 1, 1 ],
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
                    new THREE.Vector4( 0, 0, 0, 1 ),
                    new THREE.Vector4( 0, 100, 0, 1 ),
                    new THREE.Vector4( 0, 200, 0, 1 ),
                    new THREE.Vector4( 0, 300, 0, 1 ),
                    new THREE.Vector4( 0, 400, 0, 1 ),
                ],
                [
                    new THREE.Vector4( 100, 0, 0, 1 ),
                    new THREE.Vector4( 100, 100, 0, 1 ),
                    new THREE.Vector4( 100, 200, 0, 1 ),
                    new THREE.Vector4( 100, 300, 0, 1 ),
                    new THREE.Vector4( 100, 400, 0, 1 ),
                ],
                [
                    new THREE.Vector4( 200, 0, 0, 1 ),
                    new THREE.Vector4( 200, 100, 0, 1 ),
                    new THREE.Vector4( 200, 200, 0, 1 ),
                    new THREE.Vector4( 200, 300, 0, 1 ),
                    new THREE.Vector4( 200, 400, 0, 1 ),
                ],
                [
                    new THREE.Vector4( 300, 0, 0, 1 ),
                    new THREE.Vector4( 300, 100, 0, 1 ),
                    new THREE.Vector4( 300, 200, 0, 1 ),
                    new THREE.Vector4( 300, 300, 0, 1 ),
                    new THREE.Vector4( 300, 400, 0, 1 ),
                ],
                [
                    new THREE.Vector4( 400, 0, 0, 1 ),
                    new THREE.Vector4( 400, 100, 0, 1 ),
                    new THREE.Vector4( 400, 200, 0, 1 ),
                    new THREE.Vector4( 400, 300, 0, 1 ),
                    new THREE.Vector4( 400, 400, 0, 1 ),
                ],
            ]
        },
        texturePath = '../img/uv_grid_opengl.jpg',
        geomResolution = 50,
        sizeOfCtrlPts = 10,
        nurbsName = 'nurbs',
        threeScene = new BasicScene(),
        position = null
    }) {
        this.texturePath = texturePath;
        this.geomResolution = geomResolution;
        this.sizeOfCtrlPts = sizeOfCtrlPts;
        this.threeScene = threeScene;
        this.nurbsParams = nurbsParams;

        // console.log(calcNURBSDerivatives(this.nurbsParams.degree1, this.nurbsParams.knots1, this.nurbsParams.ctrlPts[0], 0, 1));
        // console.log(calcNURBSDerivatives(this.nurbsParams.degree1, this.nurbsParams.knots1, this.nurbsParams.ctrlPts[0], 0.5, 1));
        // console.log(calcNURBSDerivatives(this.nurbsParams.degree1, this.nurbsParams.knots1, this.nurbsParams.ctrlPts[0], 0.666666, 1));
        // console.log(calcNURBSDerivatives(this.nurbsParams.degree1, this.nurbsParams.knots1, this.nurbsParams.ctrlPts[0], 1, 1));

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
        if (!position) this.nurbsObj.position.set( this.threeScene.sceneObjects.canvas.clientWidth / 2, this.threeScene.sceneObjects.canvas.clientHeight / 2, 0 );
        else this.nurbsObj.position.set( position );
        this.nurbsObj.scale.multiplyScalar(1);

        this.ptsMaterial = new THREE.PointsMaterial({ color: 0xFFFFFF, size: sizeOfCtrlPts, opacity: 0.6, transparent: true });
        // this.updateNurbs(this.nurbsParams);     // Update weights references in ctrlPts

        this.makePointsObjsFromNURBS(this.nurbsParams, this.nurbsObj);

        this.updateEvent = new CustomEvent("nurbs-surface-updated", { detail: { name: this.nurbsObj.name, surfaceObj: this } })

        console.log(this.nurbsParams);
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
                    // new THREE.MeshBasicMaterial({
                    //     color: 0xFFFFFF
                    // })
                    new THREE.MeshPhongMaterial({
                        color: 0xFFFFFF,
                        opacity: 0.4,
                        transparent: true
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
        indices[0] = Number(indices[0]);
        indices[1] = Number(indices[1]);

        this.nurbsParams.ctrlPts[indices[0]][indices[1]].x = position.x;
        this.nurbsParams.ctrlPts[indices[0]][indices[1]].y = position.y;
        this.nurbsParams.ctrlPts[indices[0]][indices[1]].z = position.z;
        // this.nurbsParams.ctrlPts[indices[0]][indices[1]].w = this.nurbsParams.weights[indices[0]][indices[1]];
        // this.nurbsParams.ctrlPts[indices[0]][indices[1]].set(position);

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
        // return this.updateNurbsPoint([Number(curId[0]), Number(curId[1])], event.object);
    }

    calcNURBSSurfaceDerivativesXYZ(point, d, tol, maxIt) {
        calcNURBSSurfaceDerivativesXYZ(point, d, tol, maxIt, this.nurbsObj.position, this.nurbsParams, this.nurbsSurface);
    }

    scaleNURBSSurface(scaleFactor) {
        // this.updateNurbs(scaleNURBSSurface(scaleFactor, this.nurbsParams, this.nurbsObj.position));
        // this.nurbsParams.ctrlPts.forEach((point) => {
        //     point.x = (point.x - this.nurbsObj.position.x) * scaleFactor + this.nurbsObj.position.x;
        //     point.y = (point.y - this.nurbsObj.position.y) * scaleFactor + this.nurbsObj.position.y;
        //     point.z = (point.z - this.nurbsObj.position.z) * scaleFactor + this.nurbsObj.position.z;
        //     // Leave weights alone
        // })
        for (var i = 0; i < this.nurbsParams.ctrlPts.length; i++) {
            for (var j = 0; j < this.nurbsParams.ctrlPts[i].length; j++) {
                this.nurbsParams.ctrlPts[i][j] = new THREE.Vector4((this.nurbsParams.ctrlPts[i][j].x - this.nurbsObj.position.x) * scaleFactor + this.nurbsObj.position.x, (this.nurbsParams.ctrlPts[i][j].y - this.nurbsObj.position.y) * scaleFactor + this.nurbsObj.position.y, 0, 1);
            }
        }
        this.updateNurbs(this.nurbsParams);
    }
};

    // Algorithm A2.3 from The NURBS Book
    // calcSurfaceBasisFunctionsDerivatives(i, u, p, n, U) {
    //     const ndu = [];
    //     const left = [];
    //     const right = [];
    //     const ders = [];
    //     var saved = 0.0;
    //     var tmp = 0;
    //     var s1 = 0;
    //     var s2 = 0;
    //     var d = 0;
    //     var rk = 0;
    //     var pk = 0;
    //     var j1 = 0;
    //     var j2 = 0;

    //     ndu[0][0] = 1.0;

    //     for (var j = 1; j <= p; j++) {
    //         left[j] = u - U[i + 1 - j];
    //         right[j] = U[i + j] - u;
    //         saved = 0;
    //         for (var r = 0; r < j; r++) {
    //             // Lower triangle (of basis function matrix, see pg 70 The NURBS Book)
    //             ndu[j][r] = right[r + 1] + left[j - r];
    //             tmp = ndu[r][j - 1] / ndu[j][r];

    //             // Upper triangle (of basis function matrix, see pg 70 The NURBS Book)
    //             ndu[r][j] = saved + right[r+1] * tmp;
    //             saved = left[j - r] * tmp;
    //         }
    //         ndu[j][j] = saved;
    //     }
    //     // Load basis funcs
    //     for (var j = 0; j <= p; j++) {
    //         ders[0][j] = ndu[j][p];
    //     }
    //     // Computes derivs (eq. 2.9 The NURBS Book)
    //     for (var r = 0; r <= p; r++) {  // Loop over function index
    //         // Alternate rows in array a
    //         s1 = 0;
    //         s2 = 1;
    //         a[0][0] = 1;
    //         // Loop to compute kth derivative
    //         for (var k = 1; k <= n; k++) {
    //             d = 0;
    //             rk = r - k;
    //             pk = p - k;
    //             if (r >= k) {
    //                 a[s2][0] = a[s1][0] / ndu[pk + 1][rk];
    //                 d = a[s2][0] * ndu[rk][pk];
    //             }
    //             if (rk >= -1) {
    //                 j1 = 1;
    //             } else {
    //                 j1 = -rk;
    //             }
    //             if (r - 1 <= pk) {
    //                 j2 = k - 1;
    //             } else {
    //                 j2 = p - r;
    //             }
    //             for (var j = j1; j <= j2; j++) {
    //                 a[s2][j] = (a[s1][j] - a[s1][j-1]) / ndu[pk + 1][rk + j];
    //                 d += a[s2][j] * ndu[rk + j][pk];
    //             }
    //             if (r <= pk) {
    //                 a[s2][k] = -a[s1][k-1] / ndu[pk + 1][r];
    //                 d += a[s2][k] * ndu[r][pk];
    //             }
    //             ders[k][r] = d;
    //             tmp = s1;
    //             s1 = s2;
    //             s2 = tmp;
    //         }
    //     }
    //     // Multiply thru by the correct factors (Eq. 2.9, The NURBS Book)
    //     tmp = p;
    //     for (var k = 1; k <= n; k++) {
    //         for (var j = 0; j <= p; j++) {
    //             ders[k][j] *= r;
    //         }
    //         r *= (p - k);
    //     }

    //     return ders;
    // }

// Algorithm A3.6 from The NURBS Book
function calcBSplineSurfaceDerivatives(p, U, q, V, P, u, v, d) {
    const SKL = [];
    // for (var i = 0; i <= p + 1; i++) {
    //     for (var j = 0; j <= q + 1; j++) {
    //         SKL[i] = [];
    //         SKL[i][j] = null;
    //     }
    // }

    const du = Math.min(d, p);
    for (var k = p + 1; k <= d; k++) {
        SKL[k] = [];
        for (var l = 0; l <= d - k; l++) {
            // SKL[k][l] = 0.0;
            SKL[k][l] = new THREE.Vector4();
        }
    }

    const dv = Math.min(d, q);
    for (var l = q + 1; l <= d; l++) {
        for (var k = 0; k <= d - l; k++) {
            // SKL[k][l] = 0.0;
            SKL[k] = [];
            SKL[k][l] = new THREE.Vector4();
        }
    }
    
    const uspan = findSpan(p, u, U);
    const Nu = calcBasisFunctionDerivatives(uspan, u, p, du, U);
    const vspan = findSpan(q, v, V);
    const Nv = calcBasisFunctionDerivatives(vspan, v, q, dv, V);

    var tmp = [];
    var dd = 0;
    for (var k = 0; k <= du; k++) {
        if (typeof SKL[k] === 'undefined') { SKL[k] = []; }
        for (var s = 0; s <= q; s++) {
            // tmp[s] = 0;
            tmp[s] = new THREE.Vector4();
            for (var r = 0; r <= p; r++) {
                // tmp[s] += Nu[k][r] * P[uspan - p + r][vspan - q + s];
                // tmp[s].add(P[uspan - p + r][vspan - q + s].clone().multiplyScalar(Nu[k][r]));
                tmp[s].add(new THREE.Vector4(P[uspan - p + r][vspan - q + s].x, P[uspan - p + r][vspan - q + s].y).multiplyScalar(Nu[k][r]));
            }
        }
        dd = Math.min(d - k, dv);
        for (var l = 0; l <= dd; l++) {
            // SKL[k][l] = 0;
            SKL[k][l] = new THREE.Vector4();
            for (var s = 0; s <= q; s++) {
                // SKL[k][l] = SKL[k][l] + Nv[l][s] * tmp[s];
                SKL[k][l].add(tmp[s].clone().multiplyScalar(Nv[l][s]));
            }
        }
    }

    return SKL;
}

// Modification of A2.2 (The NURBS Book) to return all nonzero basis funcs of degrees 0 to p
// calcAllBasisFuns(span, u, p, U) {

//     const N = [];
//     var index = 0;
//     const left = [];
//     const right = [];

//     for (var i = 1; i <= p; i++) {
//         N[j][0] = THREE.Vector3(1,1,1);
//         for (var j = 0; j <= i; j++) {
//             // index = span - i + j;
//             // N[index] = [];
//             // N[index][0] = 1;
//             // if (typeof N[j].concat !== 'function') { // check if array
//             //     N[j] = [];
//             // }
//             // N[j][i] = 

//             left[i] = u - U[span - i + j][i] = 

//             // Value of the ith-degree basis function, N_{span-i+j,i}(u)
//             N[j][i] = 
//         }
//     }
//     calcBasisFunctions();


//     for (var i = 0; i <= p; i++) {
//         N[i] = calcBasisFunctions(i, U, p, U);;
//     }
// }

// Algorithm A3.8 from The NURBS Book
// calcBSplineSurfaceDerivativesAlt(p, U, q, V, P, u, v, d) {
//     const SKL = [];
//     // for (var i = 0; i <= p + 1; i++) {
//     //     for (var j = 0; j <= q + 1; j++) {
//     //         SKL[i] = [];
//     //         SKL[i][j] = null;
//     //     }
//     // }

//     const du = Math.min(d, p);
//     for (var k = p + 1; k <= d; k++) {
//         SKL[k] = [];
//         for (var l = 0; l <= d - k; l++) {
//             // SKL[k][l] = 0.0;
//             SKL[k][l] = new THREE.Vector4();
//         }
//     }

//     const dv = Math.min(d, q);
//     for (var l = q + 1; l <= d; l++) {
//         for (var k = 0; k <= d - l; k++) {
//             // SKL[k][l] = 0.0;
//             SKL[k] = [];
//             SKL[k][l] = new THREE.Vector4();
//         }
//     }
    
//     const uspan = findSpan(p, u, U);
//     // const Nu = AllBasisFuns(uspan, u, p, du, U);
//     // const vspan = findSpan(q, v, V);
//     // const Nv = AllBasisFuns(vspan, v, q, dv, V);
//     // PKL = SurfaceDerivCpts;

//     var tmp = [];
//     var dd = 0;
//     for (var k = 0; k <= du; k++) {
//         if (typeof SKL[k] === 'undefined') { SKL[k] = []; }
//         for (var s = 0; s <= q; s++) {
//             // tmp[s] = 0;
//             tmp[s] = new THREE.Vector4();
//             for (var r = 0; r <= p; r++) {
//                 // tmp[s] += Nu[k][r] * P[uspan - p + r][vspan - q + s];
//                 tmp[s].add(P[uspan - p + r][vspan - q + s].clone().multiplyScalar(Nu[k][r]));
//             }
//         }
//         dd = Math.min(d - k, dv);
//         for (var l = 0; l <= dd; l++) {
//             // SKL[k][l] = 0;
//             SKL[k][l] = new THREE.Vector4();
//             for (var s = 0; s <= q; s++) {
//                 // SKL[k][l] = SKL[k][l] + Nv[l][s] * tmp[s];
//                 SKL[k][l].add(tmp[s].clone().multiplyScalar(Nv[l][s]));
//             }
//         }
//     }

//     return SKL;
// }

// Algorithm A4.4 from The NURBS Book. Uses some bits from three.js/examples/jsm/curves/NURBSUtils.js
function calcRationalSurfaceDerivatives(Pders) {
    const nd = Pders.length - 1;
    var v = null;
    var v2 = null;

    const SKL = [];

    const Aders = [];
    const wders = [];

    // for (var i = 0; i < nd; i++) {
    //     Aders[i] = [];
    //     wders[i] = [];
    //     for (var j = 0; j < nd - i; j++) {
    //         const point = Pders[i][j];
    //         Aders[i][j] = new THREE.Vector3(point.x, point.y, point.z);
    //         wders[i][j] = point.w;
    //     }
    // }

    for (var k = 0; k <= nd; k++) {
        Aders[k] = [];
        wders[k] = [];
        SKL[k] = [];
        for (var l = 0; l <= nd - k; l++) {
            const point = Pders[k][l];
            Aders[k][l] = new THREE.Vector3(point.x, point.y, point.z);
            wders[k][l] = point.w;

            // v = Aders[k][l];
            v = Aders[k][l].clone();
            for (var j = 1; j <= l; j++) {
                // v = v - calcKoverI(l, j) * wders[0][j] * Pders[k][l - j];
                v.sub(Pders[k][l - j].clone().multiplyScalar(calcKoverI(l, j) * wders[0][j]));
            }
            for (var i = 1; i <= k; i++) {
                // v = v - calcKoverI(k, i) * wders[i][0] * Pders[k - i][1];
                v.sub(Pders[k - i][l].clone().multiplyScalar(calcKoverI(k, i) * wders[i][0]));
                // v2 = 0.0;
                v2 = new THREE.Vector3();
                for (var j = 1; j <= l; j++) {
                    // v2 = v2 + calcKoverI(l, j) * wders[i][j] * Pders[k-i][l-j];
                    v2.add(Pders[k - i][l - j].clone().multiplyScalar(calcKoverI(l, j) * wders[i][j]));
                }
                // v = v - calcKoverI(k, i) * v2;
                v.sub(v2.clone().multiplyScalar(calcKoverI(k, i)));
            }
            // Pders[k][l] = v / wders[0][0];
            SKL[k][l] = v.clone().multiplyScalar(1 / wders[0][0]);
        }
    }

    return Pders;
}

// calcNURBSSurfaceDerivatives(p, U, q, V, P, u, v, d) {
function calcNURBSSurfaceDerivatives(u, v, d, nurbsParams) {
    // // const Pders = this.calcBSplineSurfaceDerivatives(p, U, q, V, P, u, v, d);
    // // Handle if ctrlPts not given as THREE Vector4 objects
    // const ctrlPts = JSON.parse(JSON.stringify(nurbsParams.ctrlPts));
    // if (typeof nurbsParams.ctrlPts[0][0].dot === "undefined") {
    //     for (var i = 0; i < ctrlPts.length; i++) {
    //         for (var j = 0; j < ctrlPts[i].length; j++) {
    //             ctrlPts[i][j] = new THREE.Vector4(ctrlPts[i][j].x, ctrlPts[i][j].y, ctrlPts[i][j].z, ctrlPts[i][j].w);
    //         }
    //     }
    // }

    const Pders = calcBSplineSurfaceDerivatives(
        nurbsParams.degree1,
        nurbsParams.knots1,
        nurbsParams.degree2,
        nurbsParams.knots2,
        // ctrlPts, 
        nurbsParams.ctrlPts, 
        u, v, d
    );
    // console.log("Pders:");
    // console.log(Pders);

    return calcRationalSurfaceDerivatives(Pders);
}

/**
 * Iteratively approximate the nearest point on a NURBS surface (u,v) to a given point (x,y,z). Modified version of algorithm 2 from https://arxiv.org/pdf/2210.13160
 * @param {Number} dn  - Minimum distance traveled each iteration. Also serves to find the basis vectors for u and v
 * @param {Number} tol - Maximum deviation between output of f(u, v) and point p, unless maxIt is reached first.
 * @param {Number} maxIt - Maximum number of iterations
 * @param {THREE.Vector3} p - Point in world space for which the nearest point on the NURBS surface will be approximated
 * @param {Number} damp - Multiplier for dampCur when decreasing distance along u and v traveled per iteration 
 * @param {THREE.NURBSSurface} - THREE js NURBS surface object
 * @returns 
 */
function calcNearestSurfacePointFromPoint(dn, tol, maxIt, p, damp, threeSurfaceObj) {
    // const uDampInit = 0.5;    // Initialize dampers to uMax and vMax
    // const vDampInit = 0.5;
    // const fixedDecimal = 10;

    var damp = damp || 0.7;
    var dampCur = 1;
    var uCur = 0;
    var du = 0;
    var vCur = 0;
    var dv = 0;
    const pCur = new THREE.Vector3();
    var uHatCur = new THREE.Vector3();
    var uHatLen = 0;
    var vHatCur = new THREE.Vector3();
    var vHatLen = 0;

    threeSurfaceObj.getPoint(uCur, vCur, pCur);
    var rVecCur = p.clone();
    rVecCur.sub(pCur.clone());
    var rCur = pCur.distanceTo(p);
    // var rVecUnitVec = rVecCur.multiplyScalar(1 / rCur);

    var uCurPrev = uCur;
    var vCurPrev = vCur;
    var uCheck = false;
    var vCheck = false;

    // Iteratively move towards the nearest point
    for (var i = 0; i < maxIt + 1; i++) {
        // Get u and v unit vectors
        threeSurfaceObj.getPoint(uCur + dn, vCur, uHatCur);
        uHatCur.sub(pCur.clone());
        du = uHatCur.normalize().dot(rVecCur.normalize().multiplyScalar(2 / Math.sqrt(2)));//Math.sqrt(2) / 2));// / (rCur);
        threeSurfaceObj.getPoint(uCur, vCur + dn, vHatCur);
        vHatCur.sub(pCur.clone());
        dv = vHatCur.normalize().dot(rVecCur.normalize().multiplyScalar(2 / Math.sqrt(2)));// / (rCur);
        // Multiplying by 2/sqrt(2) here so that 1,1 can be reached. otherwise the limit when u=v is sqrt(2)/2, sqrt(2) / 2
        
        uCur += dampCur * du;
        vCur += dampCur * dv;

        if (uCur > 1 || uCur < 0) { uCheck = true; } else { uCheck = false; }
        if (vCur > 1 || vCur < 0) { vCheck = true; } else { vCheck = false; }

        // Break if going back and forth or if latest difference less than tol
        // if (Math.abs(uCur - uCurPrev) < tol && Math.abs(vCur - vCurPrev) < tol || (uCheck && vCheck)) {
        // if ((uCur === uCurPrev && vCur === vCurPrev) || (uCheck && vCheck)) {
        //     break;
        // } else {
        //     uCurPrev = uCur - dampCur * du;
        //     vCurPrev = vCur - dampCur * dv;
        // }

        // Update vector pointing from point at S(uCur, vCur) to point p
        threeSurfaceObj.getPoint(uCur, vCur, pCur);
        rVecCur = p.clone();
        rVecCur.sub(pCur.clone());
        rCur = pCur.distanceTo(p);

        if (rCur < tol) {
            break;
        }

        dampCur = Math.max(dn, dampCur * damp);    // Essentially doing a binary search
    }

    if (uCur > 1) {
        uCur = 1;
    } else if (uCur < 0) {
        uCur = 0;
    }

    if (vCur > 1) {
        vCur = 1;
    } else if (vCur < 0) {
        vCur = 0;
    }

    return [ uCur, vCur, rCur ];
}

// Get surface derivatives given xyz point in world coordinates. Tol must be > minDistForUnitVectors.
function calcNURBSSurfaceDerivativesXYZ(point, d, tol, maxIt, nurbsPosition, nurbsParams, threeSurfaceObj) {
    const surfaceObj = {};
    if (!threeSurfaceObj) surfaceObj["obj"] = new NURBSSurface( nurbsParams.degree1, nurbsParams.degree2, nurbsParams.knots1, nurbsParams.knots2, nurbsParams.ctrlPts );
    else surfaceObj["obj"] = threeSurfaceObj;

    // Offset p by the nurbsObj's position
    // const p = point.clone();
    const p = new THREE.Vector3(point.x, point.y, point.z?point.z:0);//.clone();
    p.sub(nurbsPosition);
    // console.log(p);

    const tol_ = tol || 0.000001;
    const minDistForUnitVectors = tol_ / 10;
    const maxIterations = maxIt || 60;
    const uvCoords = calcNearestSurfacePointFromPoint(minDistForUnitVectors, tol_, maxIterations, p, 0.707, threeSurfaceObj );

    // console.log(uvCoords);
    const test = new THREE.Vector3();
    threeSurfaceObj.getPoint(uvCoords[0], uvCoords[1], test);
    // console.log(test);

    return { derivs: calcNURBSSurfaceDerivatives(uvCoords[0], uvCoords[1], d, nurbsParams), uvCoords: uvCoords };
}

// Check if another THREE object is colliding with the mesh of the surface object, to ensure a transformation definition for all edges of a lens
function isColliding() {

}

// Convert control points from JSON back to THREEjs vectors
function convertCtrlPtsToThree(P) {
    P.forEach((point) => {
        return new THREE.Vector4(point.x, point.y, point.z, point.w);
    });
    
    return P;
}


// TNB pg 369
// "Decompose the q x q coefficient matrix with semibandwidth sbw into lower and upper triangular components, assuming A is a qxq square array"
// Note to self: gonna wanna do this *with* pivoting (prevents divide by zero)
// Presumably, should replace the upper triangular part of A with U and the "strictly" lower triangular part of A with U (check ALAFF for more info)
// note to self: consider using weblas for WebGPU BLAS stuff in the future
// note to self: should only store the nonzero band, when given sbw
/*
* returns d, which is +/-1 depending on if num of row interchanges was even or odd respectively
* takes in A, q, sbw in accordance with TNB
* also takes indx as per NRC2, WHPress et al.
*/
// Note to self: implement the SBW consideration when time allows
/**
 * 
 * @param {*} A - Matrix to be decomposed in place
 * @param {*} q - Size of the qxq matrix A
 * @param {*} sbw - Semibandwidth of A (if none, ignored)
 * @param {*} indx - Store indices of permutations
 * @returns 
 */
function LUDecomposition(A, q, sbw, indx) {
    // we get upper from forward substitution phase of gaussian elimination
    // good resource https://graphics.stanford.edu/courses/cs205a-13-fall/assets/notes/chapter2.pdf pg 11
    //  resource for this https://www.cs.princeton.edu/courses/archive/fall20/cos302/notes/cos302_f20_precept5_lu_cholesky.pdf involves consideration of tridiagonal systems, i.e. sbw = 1

    // note to self: actually, all u gotta do is the standford algorithm but add pivoting then to consider sbw, instead of going n times for the thing, just go sbw indices from the main diagonal, that's all u gotta do for now
    // upper triangular --> solve by backsubstitution [ is O(n^2) ]
    // lower triangular --> forward substitution [ is O(n^2) ]
    // get both s.t. diag is 1s then store in A
    // that's all she wrote

                // tmp[k][j][i] = sol_u[j][k - 1][i];
    // is good that is O(n^2) b/c Gaussian elimination is O(n^3) also triangular matrices are generally more efficient to work with a lot of the time and so decomposing a regular ol matrix into a couple of 3-agons is bestest for optimizinations (hence its use by TNB, hence its use here, hence my consequent illumination on various highly consequential matters of ALAFF advanced linear algebra foundations to frontiers (Geijn, Myers, 19xx/20xx) anyways yehaw im gonna go take a nap adios for now)

    // var sbw_ = sbw;
    // if (!sbw) { // set default sbw to be for the entire matrix
    //     sbw_ = q - 1;
    // }
    
    // var curSum = 0;
    // var curA
    // // for (var j = 0; j < q; j++) {
    // for (var j = 0; j < q; j++) {
    // // for (var i = 0; i < j; i++) {
    //     for (var i = 0; i < j; i++) {
    //         curSum = 0;
    //         for (var k = 0; k < i - 1; k++) {
    //             curSum += A[i][k] * A[k][j];
    //         }
    //         A[i][j] -= curSum;
    //     }
    //     for (var i = j + 1; i < q; i++) {
    //         curSum = 0;
    //         for (var k = 0; k < j - 1; k++) {
    //             curSum += A[i][k] * A[k][j];
    //         }
    //         A[i][j] = (1 / A[j][j]) * (A[i][j] - curSum);
    //     }
    // }

    // console.log(A);


    // Crout's method with partial pivoting as described in chapter 2 of Numerical recipes in C, 2nd edition, W. H. Press et al. to account for semibandwidth.
    // Note to self: When time allows, implement consideration of the semibandwidth (sbw)
    var i, imax, j, k, big, dum, sum, tmp, vv = [], d = 1;
    // vv stores implicit scaling of each row

    for (i = 0; i < q; i++) {
        big = 0;
        for (j = 0; j < q; j++) {

            if ((tmp = Math.abs(A[i][j])) > big) big = tmp;
        }
        if (big == 0) console.error("Singular matrix in function LUDecomposition.");
        // No nonzero largest element
        vv[i] = 1 / big; // save scaling
    }
    for (j = 0; j < q; j++) {
        for (i = 0; i < j; i++) {
            sum = A[i][j];
            for (k = 0; k < i; k++) sum -= A[i][k] * A[k][j];
            A[i][j] = sum;
        }
        big = 0;        // initialize search for largest pivot element
        for (i = j; i < q; i++) {
            sum = A[i][j];
            for (k = 0; k < j; k++) sum -= A[i][k] * A[k][j];
            A[i][j] = sum;
            if ((dum = vv[i] * Math.abs(sum)) >= big) {
                // Is the (figure of merit) for the pivot better than the current best?
                big = dum;
                imax = i;
            }
        }
        // Interchange rows?
        if (j != imax) {
            for (k = 0; k < q; k++) {
                dum = A[imax][k];
                A[imax][k] = A[j][k];
                A[j][k] = dum;
            }
            d = -d; // change parity of d
            vv[imax] = vv[j];   // also interchange scale factor
        }
        indx[j] = imax;
        if (A[j][j] == 0) A[j][j] = 10 ** -20;      // If 0, make small instead. Some situations w/ singular matrices may be better to replace this w/ zero though
        
        // Divide by the pivot
        if (j != q) {
            dum = 1 / A[j][j];
            for (i = j+1; i < q; i++) A[i][j] *= dum;
        }
        // delete vv;
    }
    console.log(A);
    console.log(d)

    return d;

}


// TNB pg 369
// Perform forward/backward substitution
// Chapter 2 of Numerical recipes in C, 2nd edition, W.H. Press et al.
// Assumes A is LU decomposition of some matrix
function ForwardBackward(A, q, sbw, rhs, sol_, indx) {
    // rhs[] is right hand side of system (coords of Q[k])
    // const rhs = [];

    // sol[] is the solution vector (coords of P[i])
    // const sol = [];
    
    const sol = JSON.parse(JSON.stringify(rhs));  // Copy RHS into sol

    var i, ii = 0, ip, j, sum;

    // Forward substitution
    for (i = 0; i < q; i++) {
        ip = indx[i];
        sum = sol[ip];
        sol[ip] = sol[i];
        if (ii) for (j = ii; j < i; j++) sum -= A[i][j] * sol[j]; // when ii > 0, becomes first nonvanishing element of rhs. now doing forward substitution; gotta unscramble permutation as we go tho
        else if (sum) ii = i;       // nonzero element encountered, so now on we'll have to do the sums in the above loop
        sol[i] = sum;
    }
    // Backsubstitution
    for (i = q - 1; i > 0; i--) {
        sum = sol[i];
        for (j = i; j < q; j++) sum -= A[i][j] * sol[j];
        sol[i] = sum / A[i][i]; // Store component of solution vector X
    }

    console.log(rhs)
    console.log(sol)
    sol_.sol = sol;
    
    return { rhs: rhs, sol: sol };
}



// Solve from https://numerical.recipes/book.html 2.3
/**
 * 
 * @param {*} lu - LU decomposerd matrix
 * @param {*} b - RHS
 * @param {*} x - Sol
 * @param {*} n - Size
 * @param {*} indx - Permutation indices
 */
function solveLURow(lu, b, x, n, indx) {
    var i, ii = 0, ip, j, sum;


    if (b.length != n || x.length != n) {
        throw new Error(`Bad sizes when solving system of linear equations. b: ${b.length}; x: ${x.length}; n: ${n}`);
    }
    for (i = 0; i < n; i++) x[i] = b[i];
    // When ii > 0, will beocome index of first nonvanishing element of b. now doing forward substitution
    for (i = 0; i < n; i++) {
        ip = indx[i];
        sum = x[ip];
        x[ip] = x[i];
        if (ii != 0)
            for (j = ii - 1; j < i; j++) sum -= lu[i][j] * x[j];
        else if (sum != 0)  // Nonzero element encountered
            ii = i + 1;
        x[i] = sum;
    }
    // Now backward substitution
    for (i = n - 1; i >= 0; i--) {
        sum = x[i];
        for (j = i + 1; j < n; j++) sum -= lu[i][j] * x[j];
        // console.log(sum)
        x[i] = sum / lu[i][i]   // store compoonent of solution vector
        // console.log(lu[i][i])
    }

    // done
}

// Solve m sets of n linear equations using sstored LU decomp of A. b matrix for rhs, x matrix for solution.
// b and x may recference the same matrix, in which case the solution overwrites the input.
//https://numerical.recipes/book.html
function solveLU(lu, b, x, n, indx) {
    // console.log(b)
    var i, j, m = b[0].length;
    if (b.length != n || x.length != n || b.length != x.length)
        throw new Error(`Bad sizes when solving system of linear equations. b: ${b.length}; x: ${x.length}; n: ${n}`);
    
    // I think this is right?
    const xx = [];
    for (i = 0; i < n; i++) {
        xx.push(0);
    }

    // Copy and solve each column
    for (j = 0; j < m; j++) {
        for (i = 0; i < n; i++) xx[i] = b[i][j];
        solveLURow(lu, xx, xx, n, indx);
        for (i = 0; i < n; i++) x[i][j] = xx[i];
    }
}



//https://numerical.recipes/book.html
// LU decomposition 
function LUdcmp(lu, indx) {
    // const tiny = 1 * 10**-40;   // v small num
    const tiny = 0;   // v small num
    const n = lu.length;
    
    var i, imax, j, k, big, temp, vv = [], d;
    vv.length = n; vv.fill(0);
    d = 1;
    for (i = 0; i < n; i++) {
        big = 0;
        for (j = 0; j < n; j++)
            if ((temp = Math.abs(lu[i][j])) > big) big = temp;
        if (big == 0) throw new Error("Singular matrix in LUdcmp");
        // No nonzero largest element
        vv[i] = 1 / big;    // save scaling
    }
    for (k = 0; k < n; k++) {
        big = 0;
        imax = k;
        for (i = k; i < n; i++) {
            temp = vv[i] * Math.abs(lu[i][k]);
            if (temp > big) {   // Is best pivot so far?
                big = temp;
                imax = i;
            }
        }
        if (k != imax) {    // Need to interchange rows?
            for (j = 0; j < n; j++) {
                temp = lu[imax][j];
                lu[imax][j] = lu[k][j];
                lu[k][j] = temp;
            }
            d = -d;
            vv[imax] = vv[k];
        }
        indx[k] = imax;
        if (lu[k][k] == 0) lu[k][k] = tiny; // if pivot is 0, matrix is singular. sometimes is good for tiny to be 0
        for (i = k + 1; i < n; i++) {
            temp = lu[i][k] /= lu[k][k];    // divide by pivot
            for (j = k + 1; j < n; j++) 
                lu[i][j] -= temp * lu[k][j];
        }
    }
    console.log(d);

    return d;
}



// 3D distance
function distance3D(p1, p2, asArray = true) {

    // Handle as arrays if arrays
    if (asArray) {
        const val = Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2)
        if (p1.length == 3) return Math.sqrt(val + Math.pow(p2[2] - p1[2], 2));
        else return Math.sqrt(val);
    }
    // Else handle as objects with x,y,z properties
    else {
        const val = Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2);
        if (p1.length == 3) return Math.sqrt(val + Math.pow(p2.z - p1.z, 2));
        else return Math.sqrt(val);
    }
}

// TNB 9.4, 9.5, 9.6 + https://github.com/orbingol/NURBS-Python/blob/5.x/geomdl/fitting.py#L457
function curvParams(Q) {
    const cds = [];
    cds.length = Q.length + 1;
    cds.fill(0);
    cds[cds.length - 1] = 1;

    var i, j, d, sum;

    const uk = [];

    // Calc chord lenfgths
    for (i = 1; i < Q.length; i++) {
        d = distance3D(Q[i], Q[i - 1]);
        cds[i] = Math.sqrt(d);
    }

    // Find total chord length
    d = 0;
    for (i = 1; i < cds.length - 1; i++) d += cds[i];

    for (i = 0; i < Q.length; i++) uk.push(0);

    // Divide each chord length by total chord len
    for (i = 0; i < Q.length; i++) {
        sum = 0;
        for (j = 0; j < i + 1; j++) sum += cds[j];
        uk[i] = sum / d;
    }
    return uk;
}


// Version of surfMeshParams from https://github.com/orbingol/NURBS-Python/blob/5.x/geomdl/fitting.py#L457
/**
 * @param {*} n - Num data points along u
 * @param {*} m - Num data points along v
 * @param {*} Q - Data points to fit to
 * @param {*} uk - Output for uk
 * @param {*} vl - Output for vl
 */
// function surfParams(n, m, Q, uk, vl) {
//     uk.length = n;
//     uk.fill[0];

//     const uk_tmp = [], vl_tmp = [];
//     var uk_tmp2 = [], vl_tmp2 = [];

//     var i, u, v, pts_u, knots_v, pts_v, knots_u;

//     uk_tmp.length = m;
//     uk_tmp.fill(0)

//     for (v = 0; v < m; v++) {
//         pts_u = [];
//         for (u = 0; u < n; u++) pts_u.push([...Q[u][v]]);

//         uk_tmp2 = curvParams(pts_u);

//         for (u = 0; u < uk_tmp2.length; u++) uk_tmp[u] += uk_tmp2[u];
//     }

//     // Avging in u dir
//     for (u = 0; u < n; u++) {
//         knots_v = [];
//         for (v = 0; v < m; v++) knots_v.push(uk_tmp[v][u]);
//         uk[u] = 0;
//         for (v = 0; v < knots_v.length; v++) uk[u] += knots_v[v];
//         uk[u] /= m;
//     }

//     vl.length = m;
//     vl.fill(0);
    
//     for (v = 0; v < m; v++) {
//         vl_tmp.push([])
//         vl_tmp[v].length = u;
//         vl_tmp[v].fill(0);
//     }
    
//     for (u = 0; u < n; u++) {
//         pts_v = [];
//         for (v = 0; v < m; v++) pts_v.push([...Q[u][v]]);
//         // vl_tmp += curvParams(pts_v);

//         vl_tmp2 = curvParams(pts_v);

//         for (v = 0; v < vl_tmp2.length; v++) {
//             for (i = 0; i < u; i++)
//                 vl_tmp[v][i] += vl_tmp2[v][i];
//         }
//     }

//     // Avging in v dir
//     for (v = 0; v < m; v++) {
//         knots_u = [];
//         for (u = 0; u < n; u++) knots_u.push(vl_tmp[u][v]);
//         vl[v] = 0;
//         for (u = 0; u < knots_u.length; u++) vl[v] += knots_u[u];
//         vl[v] /= n;
//     }

//     console.log(uk)
//     console.log(vl)

//     return uk, vl
// }


// TNB Algorithm A9.3
/**
 * Compute parameters for global surface interpolation
 * @param {*} n - Num data points along u
 * @param {*} m - Num data points along v
 * @param {*} Q - Data points to fit to
 * @param {*} uk - Output for uk
 * @param {*} vl - Output for vl
 */
function surfMeshParams(n, m, Q, uk, vl) {

    // n -= 1;
    // m -= 1;

    // uk.length = n;
    uk.length = n + 1;
    uk.fill(0)
    // vl.length = m;
    vl.length = m + 1;
    vl.fill(0)

    var num = m + 1;    // Num of nondegenerate rows
    uk[0] = 0; uk[n] = 1;
    // uk[0] = 0; uk[n - 1] = 1;
    vl[0] = 0; vl[m] = 1;
    // vl[0] = 0; vl[m - 1] = 1;
    var k, l, d;
    var total;

    // Create and fill empty array for holding tmp vals
    const cds_u = [], cds_v = [];
    // cds.length = n + 1;
    // cds.length = math.max(n + 1, m + 1);
    // cds.length = math.max(n, m);
    cds_u.length = n+1;
    cds_u.fill(0);

    // // Initialize out vecs
    // for (k = 1; k < n - 1; k++) {
    //     uk[k] = 0;
    //     vl[k] = 0;
    // }
    console.log(Q)


    // Handle uk
    // for (l = 0; l <= m; l++) {
    for (l = 0; l < m; l++) {
        total = 0; // total chord length of row
        for (k = 1; k < n ; k++) {
        // for (k = 1; k <= n; k++) {
            cds_u[k] = distance3D(Q[k][l], Q[k-1][l]);
            total += cds_u[k];
        }
        if (total == 0) num -= 1;
        else {
            d = 0;
            // for (k = 1; k < n - 1; k++) {
            for (k = 1; k < n; k++) {
                d += cds_u[k];
                uk[k] += d / total;
            }
        }
    }
    if (num == 0) {
        console.error("0 nondegenerate rows in surfMeshParams()");
        return -1;
    }
    // for (k = 1; k < n - 1; k++) uk[k] /= num;
    for (k = 1; k < n; k++) uk[k] /= num;



    // num = n + 1;

    // // Handle vl
    // // for (k = 0; k < m; k++) {
    // for (k = 0; k < n; k++) {
    //     total = 0; // total chord length of column
    //     // for (l = 1; l < n - 1; l++) {
    //     for (l = 1; l < m - 1; l++) {
    //         cds[l] = distance3D(Q[k][l], Q[k][l - 1]);
    //         total += cds[l];
    //     }
    //     if (total == 0) num -= 1;
    //     else {
    //         d = 0;
    //         for (l = 1; l < n; l++) {
    //             d += cds[l];
    //             vl[l] += d / total;
    //         }
    //     }
    // }
    // if (num == 0) {
    //     console.error("0 nondegenerate rows in surfMeshParams()");
    //     return -1;
    // }
    // for (l = 1; l < n; l++) vl[l] /= num;


    num = n + 1;
    cds_v.length = m + 1;
    cds_v.fill(0);

    // for (l = 0; l <= n; l++) {
    for (l = 0; l < n; l++) {
        total = 0;
        for (k = 1; k < m; k++) {
        // for (k = 1; k <= m; k++) {
            // cds_v[k] = distance3D(Q[k][l], Q[k - 1][l]);
            cds_v[k] = distance3D(Q[l][k], Q[l][k - 1]);
            total += cds_v[k]
        }
        if (total == 0) num -= 1;
        else {
            d = 0;
            for (k = 1; k < m; k++) {
                d += cds_v[k];
                vl[k] += d / total;
            }
        }
    }    
    if (num == 0) {
        console.error("0 nondegenerate cols in surfMeshParams()");
        return -1;
    }
    for (k = 1; k < m; k++) vl[k] /= num;
}


// TNB Compute knots U by Eqs. 9.68 and 9.69
/**
 * @param {Number} numPts - Number of data points being used for the fit
 * @param {Number} deg - Degree of nonrational curve (>= 1)
 * @param {Number} numCtrlPts - Number of control points desired
 * @param {*} U - Array to write knot vecs to
 * @param {*} ub - ubar (can be acquired from surfMeshParams)
 */
// function computeKnots(p, n, m, r, U, ub) {
function computeKnots(numPts, deg, numCtrlPts, U, ub) {
    var i, j, alpha;
    // const d = (numPts + 1) / (numCtrlPts - deg + 1);
    const d = (numPts) / (numCtrlPts - deg);

    // Initialize with all zeros
    // U.length = deg + 1;
    U.length = deg + 1;
    U.fill(0);

    for (j = 1; j < numCtrlPts - deg; j++) {
        i = Math.floor(j*d);
        alpha = j * d - i;
        U.push((1 - alpha) * ub[i - 1] + alpha * ub[i]);
    }

    // End knot vector
    for (i = 0; i < deg + 1; i++) U.push(1);

    return U;
}


// TNB A2.4 & https://github.com/orbingol/NURBS-Python/blob/5.x/geomdl/helpers.py
/**
 * 
 * @param {*} p - Degree
 * @param {*} U - Knot vector
 * @param {*} i - Span
 * @param {*} u - Knot
 * @returns 
 */
function calcBasisFuncOne(p, U, i, u) {
    var j, k, tmp, saved, Uleft, Uright;

    if ((i == 0 && u == U[0]) || (i == U.length - p - 1 && u == U[U.length])) { // Special cases
        return 1;
    }
    if (u < U[i] || u >= U[i + p + 1]) { 
        return 0;
    }

    const N = [];
    N.length = p + i + 1;
    N.fill(0);

    // Initialize zeroth-degree functs
    for (j = 0; j <= p; j++) {
        if (u >= U[i + j] && u < U[i + j + 1]) N[j] = 1;
        else N[j] = 0;
    }
    // Compute triangular table
    for (k = 1; k <= p; k++) {
        if (N[0] == 0) saved = 0;
        else saved = ((u - U[i]) * N[0]) / (U[i + k] - U[i]);
        for (j = 0; j < p - k + 1; j++) {
            Uleft = U[i + j + 1];
            Uright = U[i + j + k + 1];
            if (N[j + 1] == 0) {
                N[j] = saved;
                saved = 0;
            }
            else {
                tmp = N[j + 1] / (Uright - Uleft);
                N[j] = saved + (Uright - u) * tmp;
                saved = (u - Uleft) * tmp;
            }

        }
    }

    // console.log(N)

    return N[0];
}


// TNB compute N by Eq. 9.66 and https://github.com/orbingol/NURBS-Python/blob/5.x/geomdl/fitting.py
/**
 * @param {*} p - Degree of nonrational curve (>= 1)
 * @param {*} n - Number of control points in U direction
 * @param {*} r - number of data points in U direction
 * @param {*} N - Output matrix
 * @param {*} U - Knot vector
 * @param {*} ub - Us to use
 */
function computeN(p, n, r, N, U, ub) {
    var i, j, m_tmp = [];

    // for (j = 0; j < m - 1; j++) {
    //     // for (i = 0; i < n - 1; i ++) {
    //     N[i][j] = calcBasisFunctions(n - 1, ub[j], p, U);           // NOTE TO SELF: DOUBLE CHECK THIS ASAP
    //     // }
    // }
    

    for (i = 1; i < r; i++) {
    // for (i = 1; i < n; i++) {
        m_tmp = [];
        for (j = 1; j < n; j++) {
        // for (j = 1; j < r; j++) {
            m_tmp.push(calcBasisFuncOne(p, U, j, ub[i]));
        }
        // console.log(m_tmp);
        N.push(m_tmp);
    }

    // console.log(N);

    return N;
}



// TNB 9.63
// Fr least squares curve approximation
/**
 * 
 * @param {*} dataPts - Data points being fit by curve
 * @param {*} ub 
//  * @param {*} N - pre-computed N matrix (9.66)
 * @param {*} Rku - output vector. assumed to be initially an empty array.
 */
function computeRku(deg, dataPts, Rku, ub) {
    // k \in 1, ..., m - 1
    // const m = dataPts.length;
    
    var k, i, a, b;
    const dim = dataPts[0].length;
    const filler = [];
    for (i = 0; i < dim; i++) filler.push(0);

    for (k = 1; k < dataPts.length - 1; k++) {
        a = calcBasisFuncOne(deg, U, 0, ub[k]);
        b = calcBasisFuncOne(deg, U, n, ub[k]);
        Rku.push([...filler])

        for (i = 0; i < dim; i++) {
            // Rku[k - 1][i] = dataPts[k][i] - a * dataPts[0][i] - b * dataPts[dataPts.length][i];
            Rku[k - 1][i] = dataPts[k][i] - a * dataPts[0][i] - b * dataPts[dataPts.length][i];
        }
    }

    return Rku;
}



// TNB Algorithm A9.7
// Global surface approx with fixed num of ctrl pts
// Input: r, s, Q, p, q, n, m
// Output: U, V, P
/**
 * 
 * @param {Number} r - Number of points to be approximated in U direction
 * @param {Number} s - Number of points to be approximated in V direction
 * @param {Number[][][]} Q - Points to fit
 * @param {Number} p - Degree of curve in U direction (>= 1)
 * @param {Number} q - Degree of curve in V direction (>= 1)
 * @param {Number} n - Number of control points in U direction
 * @param {Number} m - Number of control points in V direction
 * @param {Number[]} U - Array to store outut knot vector in U direction in
 * @param {Number[]} V - Array to store output knot vector in V direction in
 * @param {Number[][][]} P - Array to store output control points in
 * @param {Number[][][]} Q2 - Weights for points, as well as their indices within the dataset
 * @returns U, V, P
 */
function globalSurfApproxFixednm(r, s, Q, p, q, n, m, U, V, P, Q2) {
    console.log(r)
    console.log(s)

    // n -= 1;
    // m -= 1;
    // r -= 1;
    // s -= 1;

    var i, j, k, l, tmp_1, Rku, Ru, Rkv, Rv, R_tmp, n0p, nnp, elem2, elem3;
    // const ud = (m + 1) / (n - q + 1);
    // const vd = (m + 1) / (n - q + 1);

    const ub = [], vb = [];
    
    surfMeshParams(r, s, Q, ub, vb);
    // surfParams(r, s, Q, ub, vb);

    // Compute knots U by Eqs. (9.68), (9.69)
    // U = [];
    computeKnots(r, p, n, U, ub);
    // computeKnots(r, p, n + 1, U, ub);

    // Compute knots V by Eqs. (9.68), (9.69)
    // V = [];
    computeKnots(s, q, m, V, vb);
    // computeKnots(s, q, m + 1, V, vb);
    // n -= 1;
    // m -= 1;
    // const r_ = r - 1;
    // const s_ = s - 1;


    const r_ = r;
    const s_ = s;

    const dim = Q[0][0].length;
    const tmp_fill = [];
    for (i = 0; i < dim; i++) {
        tmp_fill.push(0);
    }

    const tmp = [];
    // tmp.length = n + 1;
    // tmp.fill([]);
    // for (j = 0; j < n + 1; j++) {
    for (j = 0; j < n; j++) {
        tmp.push([])
        // tmp[j].length = s + 1;
        // for (k = 0; k < s + 1; k++) {
        for (k = 0; k < s; k++) {
            // tmp[j][k] = [...tmp_fill];
            tmp[j].push([...tmp_fill]);
        }
    }
    
    

    console.log(U);
    console.log(ub);
    console.log(V);
    console.log(vb);

    
    // Compute Nu[][] and NTNu[][] using Eq. (9.66)
    const Nu = [];
    // computeN(p, n, r, Nu, U, ub)
    computeN(p, n - 1, r - 1, Nu, U, ub)    // previously subbed 1 from n and r

    const NuT = math.transpose(Nu);
    const NuTNu = math.multiply(NuT, Nu);

    console.log(Nu)
    console.log(NuT)
    console.log(NuTNu)
    
    const indxu = [], rhsu = [], sol_u = [];

    // for (i = 0; i < NuTNu.length; i++) {
    for (i = 0; i < s; i++) {
        rhsu.push([]);
        sol_u.push([]);
        indxu.push(0);
        // for (j = 0; j < NuTNu[0].length; j++) {
        for (j = 0; j < NuTNu.length; j++) {
            // rhsu[i].push(0);
            // sol_u[i].push(0);
            rhsu[i].push([...tmp_fill]);
            sol_u[i].push([...tmp_fill]);
            // indxu[i].push(0);
        }
    }



    // LUDecomposition(NuTNu, NuTNu.length, p, indxu);
    // LUDecomposition(NuTNu, n - 1, p, indxu);
    // LUDecomposition(NuTNu, n - 1, p, indxu);
    const d = LUdcmp(NuTNu, indxu);
    console.log(NuTNu)
    console.log(indxu)


    // Fit in u direction
    for (j = 0; j < s; j++) {
    // for (j = 0; j <= s; j++) {
        tmp[0][j] = [...Q[0][j]];
        // tmp[n][j] = [...Q[r_][j]];
        tmp[n - 1][j] = [...Q[r_ - 1][j]];

        // Compute and load Ru[] (Eqs. [9.63] and [9.67])
        // Compute Rku (Eq. 9.63)
        Rku = [];
        // for (i = 1; i < r + 1; i++) {   // r+1 when previously subtracting 1 from r
        for (i = 1; i < r - 1; i++) {
        // for (i = 1; i < r - 1; i++) {
            n0p = calcBasisFuncOne(p, U, 0, ub[i]);
            // nnp = calcBasisFuncOne(p, U, n, ub[i]);
            nnp = calcBasisFuncOne(p, U, n - 1, ub[i]);
            // console.log(n0p)
            // console.log(nnp)
            elem2 = [];
            elem3 = [];
            Rku.push([...tmp_fill]);
            for (k = 0; k < dim; k++) {
                // elem2.push(tmp[0][j][k] * n0p);
                elem2.push(Q[0][j][k] * n0p);
                // elem3.push(tmp[n][j][0] * nnp);
                // elem3.push(tmp[n - 1][j][0] * nnp);
                elem3.push(Q[r - 1][j][0] * nnp);
                Rku[i - 1][k] = Q[i][j][k] - elem2[k] - elem3[k];
            }
            // for (k = 0; k < dim; k++) {
            //     Rku[i - 1][k] = Q[i][k] - n0p * Q[0][k] - nnp * Q[Q.length - 1][k];
            // }
        }
        console.log(Rku);

        // computeRku(P, Q[i][j])

        // Compute Ru (Eq. 9.67)
        // Ru = [];
        // Ru.length = n;
        // Ru.fill([]);
        // // for (i = 1; i < n; i++) {
        // //     Ru[i].length = dim;
        // //     Ru[i].fill(0);
        // // }
        // for (i = 1; i < n; i++) {
        //     Ru[i].length = dim;
        //     Ru[i].fill(0);
            
        //     R_tmp = [];
        //     for (k = 0; k < Rku.length; k++) {
        //         tmp_1 = calcBasisFuncOne(p, U, i, ub[k + 1]);
        //         R_tmp.push([]);
        //         for (l = 0; l < dim; l++)
        //             R_tmp[R_tmp.length - 1].push(Rku[k][l] * tmp_1);
        //     }
        //     for (k = 0; k < dim; k++) {
        //         for (l = 0; l < R_tmp.length; l++) {
        //             Ru[i - 1][k] += R_tmp[l][k];
        //         }
        //     }
        // }
        Ru = [];
        for (i = 1; i < n - 1; i++) {
        // for (i = 1; i < n - 1; i++) {
            // Ru.push([]);
            // for (l = 0; l < dim; l++) {
            //     Ru[Ru.length - 1].push(0);
            // }
            Ru.push([...tmp_fill]);
            R_tmp = [];
            for (k = 0; k < Rku.length; k++) {
                tmp_1 = calcBasisFuncOne(p, U, i, ub[k + 1]);
                R_tmp.push([])
                for (l = 0; l < dim; l++) {
                    R_tmp[k].push(Rku[k][l] * tmp_1);
                }
            }                
            for (l = 0; l < dim; l++) {
                for (k = 0; k < R_tmp.length; k++) {
                    Ru[i - 1][l] += R_tmp[k][l];
                }
            }
            // for (l = 0; l < dim; l++) {
            //     // Ru[i - 1][l] += Rku[k][l] * Nu[k][i - 1];
            //         Ru[i - 1][l] += Rku[k][l] * tmp_1;
            // }
        }
        console.log(Ru);

        // Call ForwardBackward() to get intermediate control points
        // tmp[1][j], ..., tmp[n-1][j];
        // for (i = 0; i < dim; i++) {
        //     tmp_1 = [];
        //     for (k = 0; k < Ru.length; k++) {
        //         tmp_1.push(Ru[k][i]);
        //     }

        //     ForwardBackward(NuTNu, NuTNu.length, -1, tmp_1, sol_u, indxu);
        //     console.log(sol_u)
        //     for (k = 1; k < n; k++) {
        //         tmp[k][j][i] = sol_u.sol[k - 1];
        //     }
        // }
        // console.log(tmp)
        // rhsu[j] = [...tmp_fill];
        // for (k = 0; k < Ru.length; k++) {
        //     // rhsu[j].push([...Ru[k]]);
        //     rhsu[j][k] = [...Ru[k]];
        //     // rhsu[k][j] = [...Ru[k]];
        //     // for (i = 0; i < dim; i++) {
        //     //     // tmp_1.push(Ru[k][i]);
        //     //     rhsu[j].push(Ru[k][i]);
        //     // }
        // }
        // // for (k = 1; k < n; k++) {
        // for (k = 1; k < n; k++) {
        //     tmp[k][j] = [...tmp_fill];
        //     // ForwardBackward(NuTNu, NuTNu.length, -1, tmp_1, sol_u, indxu);
        //     // solveLURow(NuTNu, rhsu[j], sol_u[j], n - 1, indxu);
        //     // solveLU(NuTNu, rhsu[j], sol_u[j], n - 1, indxu);

        //     console.log(rhsu[j])
        //     console.log(sol_u[j]);

        //     for (i = 0; i < dim; i++) {
        //         tmp_1 = [];
        //         for (l = 0; l < rhsu[j].length; l++) tmp_1.push(rhsu[j][l][i]);
        //         console.log(tmp_1);
        //         solveLURow(NuTNu, tmp_1, sol_u[j], n - 1, indxu);
        //         console.log(sol_u)
        //         // tmp[k][j][i] = sol_u[j][k - 1][i];
        //         tmp[k][j][i] = sol_u[j][k - 1];
        //         // tmp[k][j] = [...sol_u[j][k - 1]];
        //     }
        // }

        for (l = 0; l < dim; l++) {
            tmp_1 = [];
            for (k = 0; k < Ru.length; k++) {
                tmp_1.push(Ru[k][l]);
            }
            solveLURow(NuTNu, tmp_1, sol_u[j], NuTNu.length, indxu);
            for (k = 1; k < n - 1; k++) {
                tmp[k][j][l] = tmp_1[k - 1];
            }
            // console.log(tmp_1)
        }
    }
    // solveLU(NuTNu, rhsu, sol_u, n - 1, indxu);
    // for (j = 0; j <= s; j++) {
    //     for 
    // }
    console.log(tmp)
    // return;


    // Compute Nv[][] and NvTNv[][] using Eq. (9.66)
    // const Nv = [];
    // computeN(q, m, s, Nv, V, vb)

    // const NvT = math.transpose(Nv);
    // const NvTNv = math.multiply(NvT, Nv);
    
    // const indxv = [], rhsv = [], sol_v = [];
    // LUDecomposition(NvTNv, NvTNv.length, q, indxv);

    // const ctrlPts = [];
    // // ctrlPts.length = n + 1;
    // // ctrlPts.fill([]);
    // for (j = 0; j < n + 1; j++) {
    //     // ctrlPts[j].length = m + 1;
    //     ctrlPts.push([]);
    //     for (k = 0; k < m + 1; k++) {
    //         ctrlPts[j].push([...tmp_fill]);
    //         // ctrlPts[j][k] = [...tmp_fill];
    //     }
    //     // console.log(ctrlPts[j])
    //     // console.log(tmp_fill)
    // }

    // // const m_ = m - 1;
    
    // // console.log(ctrlPts)
    // // Fit in v direction
    // for (j = 0; j <= n; j++) {
    //     ctrlPts[j][0] = [...tmp[j][0]];
    //     ctrlPts[j][m] = [...tmp[j][s_]];

    //     // Compute and load Rv[] (Eqs. [9.63] and [9.67])
    //     // Compute Rkv (Eq. 9.63)
    //     Rkv = [];
    //     for (i = 1; i < m; i++) {
    //         n0p = calcBasisFuncOne(q, V, 0, vb[i]);
    //         nnp = calcBasisFuncOne(q, V, m, vb[i]);
    //         elem2 = [];
    //         elem3 = [];
    //         Rkv.push([]);
    //         for (k = 0; k < dim; k++) {
    //             elem2.push(tmp[j][0][k] * n0p);
    //             elem3.push(tmp[j][s_][k] * nnp);
    //             Rkv[Rkv.length - 1].push(tmp[i][j][k] - elem2[k] - elem3[k]);
    //         }
    //     }

    //     // Compute Rv (Eq. 9.67)
    //     // Rv = [];
    //     // Rv.length = m;
    //     // Rv.fill([]);
    //     // for (i = 0; i < m; i++) {
    //     //     Rv[i].length = dim;
    //     //     Rv[i].fill(0);
    //     // }

    //     // for (i = 1; i < m; i++) {
    //     //     R_tmp = [];
    //     //     for (k = 0; k < Rkv.length; k++) {
    //     //         tmp_1 = calcBasisFuncOne(q, V, i, vb[k + 1]);
    //     //         R_tmp.push([]);
    //     //         for (l = 0; l < dim; l++)
    //     //             R_tmp[R_tmp.length - 1].push(Rkv[k][l] * tmp_1);
    //     //     }
    //     //     for (k = 0; k < dim; k++) {
    //     //         for (l = 0; l < R_tmp.length; l++) {
    //     //             Rv[i - 1][k] += R_tmp[l][k];
    //     //         }
    //     //     }
    //     // }
    //     Rv = [];
    //     for (i = 1; i < m; i++) {
    //         Rv.push([]);
    //         for (l = 0; l < dim; l++) {
    //             Rv[Rv.length - 1].push(0);
    //         }
    //         for (k = 0; k < Rkv.length; k++) {
    //             for (l = 0; l < dim; l++) {
    //                 Rv[i - 1][l] += Rkv[k][l] * Nv[k][i - 1];
    //             }
    //         }
    //     }
        
    //     // Call ForwardBackward() to get intermediate control points
    //     // tmp[1][j], ..., tmp[n-1][j];
    //     for (i = 0; i < dim; i++) {
    //         tmp_1 = [];
    //         for (k = 0; k < Rv.length; k++) {
    //             tmp_1.push(Rv[k][i]);
    //         }

    //         ForwardBackward(NvTNv, NvTNv.length, -1, tmp_1, sol_v, indxv);
    //         console.log(sol_v)
    //         for (k = 1; k < m; k++) {
    //             ctrlPts[j][k][i] = sol_v.sol[k - 1];
    //         }
    //     }
    //     // tmp_1 = [];
    //     // for (k = 0; k < Rv.length; k++) {
    //     //     for (i = 0; i < dim; i++) {
    //     //         tmp_1.push(Rv[k][i]);
    //     //     }
    //     // }
    //     // for (k = 1; k < m; k++) {
    //     //     ctrlPts[j][k] = [];
    //     //     ForwardBackward(NvTNv, NvTNv.length, -1, tmp_1, sol_v, indxv);
    //     //     console.log(sol_v);Z
    //     //     for (i = 0; i < dim; i++) {
    //     //         ctrlPts[j][k][i] = sol_v.sol[k - 1];
    //     //     }
    //     // }
    // }

    const Nv = [];
    computeN(q, m - 1, s - 1, Nv, V, vb)
    // computeN(q, m + 1, s + 1, Nv, V, vb)

    const NvT = math.transpose(Nv);
    const NvTNv = math.multiply(NvT, Nv);
    console.log(Nv)
    // console.log(NvT)
    
    const indxv = [], rhsv = [], sol_v = [];
    // LUDecomposition(NvTNv, NvTNv.length, q, indxv);

    // for (i = 0; i < NuTNu.length; i++) {
    for (i = 0; i <= r; i++) {
        rhsv.push([]);
        sol_v.push([]);
        indxv.push(0);
        // for (j = 0; j < NuTNu[0].length; j++) {
        for (j = 0; j < NvTNv.length; j++) {
            // rhsu[i].push(0);
            // sol_u[i].push(0);
            rhsv[i].push([...tmp_fill]);
            sol_v[i].push([...tmp_fill]);
            // indxu[i].push(0);
        }
    }
    // console.log(NvTNv)

    const dv = LUdcmp(NvTNv, indxv);
    console.log(NvTNv)


    const ctrlPts = [];
    // ctrlPts.length = n + 1;
    // ctrlPts.fill([]);
    // for (j = 0; j < n + 1; j++) {
    for (j = 0; j < n; j++) {
        // ctrlPts[j].length = m + 1;
        ctrlPts.push([]);
        for (k = 0; k < m; k++) {
        // for (k = 0; k < m + 1; k++) {
            ctrlPts[j].push([...tmp_fill]);
            // ctrlPts[j][k] = [...tmp_fill];
        }
        // console.log(ctrlPts[j])
        // console.log(tmp_fill)
    }

    // const m_ = m - 1;
    
    // console.log(ctrlPts)
    // Fit in v direction
    // for (j = 0; j <= n; j++) {
    for (j = 0; j < n; j++) {
        ctrlPts[j][0] = [...tmp[j][0]];
        // ctrlPts[j][m] = [...tmp[j][s_]];
        ctrlPts[j][m - 1] = [...tmp[j][s_ - 1]];

        // Compute and load Rv[] (Eqs. [9.63] and [9.67])
        // Compute Rkv (Eq. 9.63)
        Rkv = [];
        // for (i = 1; i < m; i++) {
        // for (i = 1; i < m + 1; i++) {
        // for (i = 1; i < m; i++) {
        // for (i = 1; i < m - 1; i++) {
        for (i = 1; i < s - 1; i++) {
            n0p = calcBasisFuncOne(q, V, 0, vb[i]);
            // nnp = calcBasisFuncOne(q, V, m, vb[i]);
            nnp = calcBasisFuncOne(q, V, m - 1, vb[i]);
            // console.log(n0p)
            // console.log(nnp)
            elem2 = [];
            elem3 = [];
            Rkv.push([...tmp_fill]);
            for (k = 0; k < dim; k++) {
                elem2.push(tmp[j][0][k] * n0p);
                elem3.push(tmp[j][s_ - 1][k] * nnp);
                // elem3.push(tmp[j][s_ - 1][k] * nnp);
                // Rkv[i - 1][k] = tmp[i][j][k] - elem2[k] - elem3[k];
                // Rkv[i - 1][k] = tmp[j][i - 1][k] - elem2[k] - elem3[k];
                Rkv[i - 1][k] = tmp[j][i][k] - elem2[k] - elem3[k];
                // console.log(elem2)
                // console.log(elem3)
                // console.log(tmp[j][i][k])
            }
        }
        console.log(Rkv);

        // Compute Rv (Eq. 9.67)
        // Rv = [];
        // Rv.length = m;
        // Rv.fill([]);
        // for (i = 0; i < m; i++) {
        //     Rv[i].length = dim;
        //     Rv[i].fill(0);
        // }

        // for (i = 1; i < m; i++) {
        //     R_tmp = [];
        //     for (k = 0; k < Rkv.length; k++) {
        //         tmp_1 = calcBasisFuncOne(q, V, i, vb[k + 1]);
        //         R_tmp.push([]);
        //         for (l = 0; l < dim; l++)
        //             R_tmp[R_tmp.length - 1].push(Rkv[k][l] * tmp_1);
        //     }
        //     for (k = 0; k < dim; k++) {
        //         for (l = 0; l < R_tmp.length; l++) {
        //             Rv[i - 1][k] += R_tmp[l][k];
        //         }
        //     }
        // }
        Rv = [];
        // for (i = 1; i < m; i++) {
        // for (i = 1; i < m - 1; i++) {
        //     Rv.push([...tmp_fill]);
        //     // for (l = 0; l < dim; l++) {
        //     //     Rv[Rv.length - 1].push(0);
        //     // }
        //     for (k = 0; k < Rkv.length; k++) {
        //         for (l = 0; l < dim; l++) {
        //             Rv[i - 1][l] += Rkv[k][l] * Nv[k][i - 1];
        //         }
        //     }
        // }
        for (i = 1; i < m - 1; i++) {
        // for (i = 1; i < m; i++) {
            Rv.push([...tmp_fill]);
            R_tmp = [];
            for (k = 0; k < Rkv.length; k++) {
                tmp_1 = calcBasisFuncOne(q, V, i, vb[k + 1]);
                // R_tmp.push([...tmp_fill]);
                R_tmp.push([]);
                for (l = 0; l < dim; l++) {
                    // R_tmp[k] = Rkv[k][l] * tmp_1;
                    R_tmp[k].push(Rkv[k][l] * tmp_1);
                }
            }
            for (l = 0; l < dim; l++) {
                for (k = 0; k < R_tmp.length; k++) {
                    Rv[i - 1][l] += R_tmp[k][l];
                }
            }
        }
        console.log(Rv);


        for (l = 0; l < dim; l++) {
            tmp_1 = [];
            for (k = 0; k < Rv.length; k++) {
                tmp_1.push(Rv[k][l]);
            }
            solveLURow(NvTNv, tmp_1, sol_v[j], NvTNv.length, indxv);
            // console.log(tmp_1)
            for (k = 1; k < m - 1; k++) {
                // ctrlPts[j][i][l] = tmp_1[k - 1];
                ctrlPts[j][k][l] = tmp_1[k - 1];
            }
        }
        
        // Call ForwardBackward() to get intermediate control points
        // tmp[1][j], ..., tmp[n-1][j];

        // for (i = 0; i < dim; i++) {
        //     tmp_1 = [];
        //     for (k = 0; k < Rv.length; k++) {
        //         tmp_1.push(Rv[k][i]);
        //     }

        //     ForwardBackward(NvTNv, NvTNv.length, -1, tmp_1, sol_v, indxv);
        //     console.log(sol_v)
        //     for (k = 1; k < m; k++) {
        //         ctrlPts[j][k][i] = sol_v.sol[k - 1];
        //     }
        // }

        // tmp_1 = [];
        // for (k = 0; k < Rv.length; k++) {
        //     for (i = 0; i < dim; i++) {
        //         tmp_1.push(Rv[k][i]);
        //     }
        // }
        // for (k = 1; k < m; k++) {
        //     ctrlPts[j][k] = [];
        //     ForwardBackward(NvTNv, NvTNv.length, -1, tmp_1, sol_v, indxv);
        //     console.log(sol_v);Z
        //     for (i = 0; i < dim; i++) {
        //         ctrlPts[j][k][i] = sol_v.sol[k - 1];
        //     }
        // }

        // for (k = 0; k < Rv.length; k++) {
        //     rhsv[j][k] = [...Rv[k]];
        // }
        // for (k = 1; k < m; k++) {
        //     ctrlPts[j][k] = [...tmp_fill];

        //     // solveLU(NvTNv, rhsv[j], sol_v[j], m - 1, indxv);

        //     // console.log(rhsv[j]);
        //     // console.log(sol_v[j]);

        //     // // for (i = 0; i < dim; i++) {
        //     // //     ctrlPts[j][k][i] = sol_v[j][k - 1][i];
        //     // // }
        //     // ctrlPts[j][k] = [...sol_v[j][k-1]];

        //     for (i = 0; i < dim; i++) {
        //         tmp_1 = [];
        //         for (l = 0; l < rhsv[j].length; l++) tmp_1.push(rhsv[j][l][i]);
        //         // console.log(tmp_1);
        //         // solveLU(NvTNv, tmp_1, sol_v[j], m - 1, indxv);
        //         solveLU(NvTNv, tmp_1, tmp_1, m - 1, indxv);
        //         // console.log(tmp_1)
        //         // ctrlPts[j][k][i] = sol_v[j][k - 1][i];
        //         // ctrlPts[j][k] = [...sol_v[j][k - 1]];
        //         ctrlPts[j][k][i] = tmp_1[k - 1];
        //     }
        // }
    }

    P.push(ctrlPts);

    console.log(ctrlPts)
// console.log(U, V);

    return U, V, P;
}


// Surface interpolation
//https://github.com/orbingol/NURBS-Python/blob/5.x/geomdl/fitting.py#L457
function surfInterpolation(Q, r, s, p, q, n, m) {
    const uk = [], vl = [], U = [], V = [];

    surfMeshParams(r, s, Q, uk, vl);

    computeKnots(r, p, n, U, ub);
    computeKnots(s, q, m, V, vb);

    const ctrlPts = [], pts = [];
    for (var u = 0; u < r; u++) {
        pts.push([]);
        for (var v = 0; v < s; v++) {
            pts[u].push(ctrlPts_r)
        }
    }
}


// Scale the NURBS by control points
function scaleNURBSSurface(scaleFactor, nurbsParams, nurbsPos) {
    nurbsParams.ctrlPts.forEach((point) => {
        point.x = (point.x - nurbsPos.x) * scaleFactor + nurbsPos.x;
        point.y = (point.y - nurbsPos.y) * scaleFactor + nurbsPos.y;
        point.z = (point.z - nurbsPos.z) * scaleFactor + nurbsPos.z;
        // Leave weights alone
    })
    return nurbsParams;
}



export {
    SurfaceObject,
    calcNURBSSurfaceDerivatives,
    calcNURBSSurfaceDerivativesXYZ,
    calcBSplineSurfaceDerivatives,
    calcRationalSurfaceDerivatives,
    calcNearestSurfacePointFromPoint,
    isColliding,
    computeN,
    calcBasisFuncOne,
    computeKnots,
    surfMeshParams,
    distance3D,
    LUDecomposition,
    ForwardBackward,
    globalSurfApproxFixednm,
    scaleNURBSSurface
};
