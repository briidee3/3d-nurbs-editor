// BD 2026

/*
Wrapper/manager for NURBS surface objects in THREE js
*/

import * as THREE from 'three';
import { NURBSSurface } from 'three/addons/curves/NURBSSurface.js';
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';
import BasicScene from './BasicScene.js';
import { calcBasisFunctionDerivatives, findSpan, calcKoverI, calcBasisFunctions } from 'three/examples/jsm/curves/NURBSUtils.js';
import { max } from 'three/src/nodes/math/MathNode.js';
import { int } from 'three/tsl';
import * as math from 'mathjs';
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

    return d;

}


// TNB pg 369
// Perform forward/backward substitution
// Chapter 2 of Numerical recipes in C, 2nd edition, W.H. Press et al.
// Assumes A is LU decomposition of some matrix
function ForwardBackward(A, q, sbw, rhs, sol, indx) {
    // rhs[] is right hand side of system (coords of Q[k])
    // const rhs = [];

    // sol[] is the solution vector (coords of P[i])
    // const sol = [];
    
    sol = JSON.parse(JSON.stringify(rhs));  // Copy RHS into sol

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
    for (i = q; i > 0; i--) {
        sum = sol[i];
        for (j = i; j < q; j++) sum -= A[i][j] * sol[j];
        sol[i] = sum / A[i][i]; // Store component of solution vector X
    }
    
    return rhs, sol;
}


// 3D distance
function distance3D(p1, p2) {
    // Handle as arrays if arrays
    if (Array.isArray(p1) && Array.isArray(p2)) 
        return Math.sqrt((p2[0] - p1[0]) ** 2 + (p2[1] - p1[1]) ** 2 + (p2[2] - p1[2]) ** 2);
    // Else handle as objects with x,y,z properties
    else
        return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2 + (p2.z - p1.z) ** 2);
}


// TNB Algorithm A9.3
/**
 * Compute parameters for global surface interpolation
 * @param {*} n - Num data points along u - 1
 * @param {*} m - Num data points along v - 1
 * @param {*} Q - Data points to fit to
 * @param {*} uk - Output for uk
 * @param {*} vl - Output for vl
 */
function surfMeshParams(n, m, Q, uk, vl) {
    var num = m + 1;    // Num of nondegenerate rows
    uk[0] = 0; uk[n] = 1;
    vl[0] = 0; vl[n] = 1;
    var k, l, d;
    var total;

    // Create and fill empty array for holding tmp vals
    const cds = [];
    cds.length = n + 1;
    cds.fill(0);

    // Initialize out vecs
    for (k = 1; k < n; k++) {
        uk[k] = 0;
        vl[k] = 0;
    }


    // Handle uk
    for (l = 0; l <= m; l++) {
        total = 0; // total chord length of row
        for (k = 1; k <= n; k++) {
            cds[k] = distance3D(Q[k][l], Q[k-1][l]);
            total += cds[k];
        }
        if (total == 0) num -= 1;
        else {
            d = 0;
            for (k = 1; k < n; k++) {
                d += cds[k];
                uk[k] += d / total;
            }
        }
    }
    if (num == 0) {
        console.error("0 nondegenerate rows in surfMeshParams()");
        return -1;
    }
    for (k = 1; k < n; k++) uk[k] /= num;

    // Handle vl
    for (k = 0; k <= m; k++) {
        total = 0; // total chord length of column
        for (l = 1; l <= n; l++) {
            cds[l] = distance3D(Q[k][l], Q[k][l - 1]);
            total += cds[l];
        }
        if (total == 0) num -= 1;
        else {
            d = 0;
            for (l = 1; l < n; l++) {
                d += cds[l];
                vl[l] += d / total;
            }
        }
    }
    if (num == 0) {
        console.error("0 nondegenerate rows in surfMeshParams()");
        return -1;
    }
    for (l = 1; l < n; l++) vl[l] /= num;

}


// TNB Compute knots U by Eqs. 9.68 and 9.69
/**
 * @param {*} p - Degree of nonrational curve (>= 1)
 * @param {*} n - Number of basis functions (>= p)
 * @param {*} m - Number of points to be approximated (>= n)
 * @param {*} r - Length of knot vector U - 1
 * @param {*} U - Array to write knot vecs to
 * @param {*} ub - ubar (can be acquired from surfMeshParams)
 */
// function computeKnots(p, n, m, r, U, ub) {
function computeKnots(numPts, deg, numCtrlPts, U, ub) {
    var i, j, alpha;
    const d = numPts / (numCtrlPts - deg);

    // Initialize with all zeros
    U.length = deg + 1;
    U.fill(0);

    for (j = 1; j < numCtrlPts - deg; j++) {
        i = Math.round(j*d);
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

    return N[0];
}


// TNB compute N by Eq. 9.66 and https://github.com/orbingol/NURBS-Python/blob/5.x/geomdl/fitting.py
/**
 * @param {*} p - Degree of nonrational curve (>= 1)
 * @param {*} n - Number of control points in U direction - 1
 * @param {*} r - number of data points in U direction - 1
 */
function computeN(p, n, r, N, U, ub) {
    var i, j, m_tmp = [];

    // for (j = 0; j < m - 1; j++) {
    //     // for (i = 0; i < n - 1; i ++) {
    //     N[i][j] = calcBasisFunctions(n - 1, ub[j], p, U);           // NOTE TO SELF: DOUBLE CHECK THIS ASAP
    //     // }
    // }
    

    for (i = 1; i < r; i++) {
        m_tmp = [];
        for (j = 1; j < n; j++) {
            m_tmp.push(calcBasisFuncOne(p, U, j, ub[i]));
        }
        N.push(m_tmp);
    }

    return N;
}



// TNB Algorithm A9.7
// Global surface approx with fixed num of ctrl pts
// Input: r, s, Q, p, q, n, m
// Output: U, V, P
/**
 * 
 * @param {*} r - Number of points to be approximated in U direction
 * @param {*} s - Number of points to be approximated in V direction
 * @param {*} Q - Points to fit
 * @param {*} p - Degree of curve in U direction (>= 1)
 * @param {*} q - Degree of curve in V direction (>= 1)
 * @param {*} n - Number of control points in U direction
 * @param {*} m - Number of control points in V direction
 * @returns 
 */
function globalSurfApproxFixednm(r, s, Q, p, q, n, m) {

    var i, j, k, l, tmp_1, tmp_2, tmp_3, Rku, Ru, Rkv, Rv, R_tmp, n0p, nnp, elem2, elem3;
    // const ud = (m + 1) / (n - q + 1);
    // const vd = (m + 1) / (n - q + 1);

    const ub = [], vb = [], sol_u = [], sol_v = [];
    

    surfMeshParams(r, s, Q, ub, vb);

    // Compute knots U by Eqs. (9.68), (9.69)
    const U = [];
    computeKnots(r, p, n, U, ub);

    // Compute knots V by Eqs. (9.68), (9.69)
    const V = [];
    computeKnots(s, q, m, V, vb);

    
    // Compute Nu[][] and NTNu[][] using Eq. (9.66)
    const Nu = [];
    computeN(p, n, r, Nu, U, ub)

    const NuT = math.transpose(Nu);
    const NuTNu = math.multiply(NuT, Nu);
    
    const indxu = [];
    LUDecomposition(NuTNu, NuTNu.length, p, indxu);

    const tmp = [];
    tmp.length = n + 1;
    tmp.fill([]);
    for (j = 0; j < tmp.length; j++) {
        tmp[j].length = s + 1;
        tmp[j].fill(0);
    }

    // Fit in u direction
    for (j = 0; j <= s; j++) {
        tmp[0][j] = Q[0][j];
        tmp[n][j] = Q[r][j];

        // Compute and load Ru[] (Eqs. [9.63] and [9.67])
        // Compute Rku (Eq. 9.63)
        Rku = [];
        for (i = 1; i < r - 1; i++) {
            n0p = calcBasisFuncOne(p, U, 0, ub[i]);
            nnp = calcBasisFuncOne(p, U, n, ub[i]);
            elem2 = [Q[0][j][0] * n0p, Q[0][j][1] * n0p, Q[0][j][2] * n0p];
            elem3 = [Q[r][j][0] * nnp, Q[r][j][1] * nnp, Q[r][j][2] * nnp];
            Rku.push([Q[i][j][0] - elem2[0] - elem3[0], Q[i][j][1] - elem2[1] - elem3[1], Q[i][j][2] - elem2[2] - elem3[2]])
        }

        // Compute Ru (Eq. 9.67)
        Ru = [];
        Ru.length = Q[0][0].length;
        Ru.fill([]);
        for (i = 0; i < Q[0][0].length; i++) {
            Ru[i].length = n - 1;
            Ru[i].fill(0);
        }
        for (i = 1; i < n; i++) {
            R_tmp = [];
            for (k = 0; k < Rku.length; k++) {
                tmp_1 = calcBasisFuncOne(p, U, i, ub[k + 1]);
                R_tmp.append([[Rku[i][0] * tmp_1, Rku[i][1] * tmp_1, Rku[i][2] * tmp_1]]);
            }
            for (k = 0; k < Q[0][0].length; k++) {
                for (l = 0; l < R_tmp.length; l++) {
                    Ru[i - 1][k] += R_tmp[l][k];
                }
            }
        }
        
        // Call ForwardBackward() to get intermediate control points
        // tmp[1][j], ..., tmp[n-1][j];
        for (i = 0; i < Q[0][0].length; i++) {
            tmp_1 = [];
            for (k = 0; k < Ru.length; k++) {
                tmp_1.push(Ru[k][i]);
            }

            ForwardBackward(NuTNu, NuTNu.length, -1, tmp_1, sol_u, indxu);
            for (k = 1; k < n; k++) {
                tmp[k][j][i] = tmp_1[k - 1];
            }
        }
    }



    // Compute Nv[][] and NvTNv[][] using Eq. (9.66)
    const Nv = [];
    computeN(q, m, s, Nv, V, vb)

    const NvT = math.transpose(Nv);
    const NvTNv = math.multiply(NvT, Nv);
    
    const indxv = [];
    LUDecomposition(NvTNv, NvTNv.length, q, indxv);

    const ctrlPts = [];
    ctrlPts.length = n + 1;
    ctrlPts.fill([]);
    for (j = 0; j < tmp.length; j++) {
        ctrlPts[j].length = m + 1;
        ctrlPts[j].fill(0);
    }

    // Fit in v direction
    for (j = 0; j <= n; j++) {
        ctrlPts[j][0] = tmp[j][0];
        ctrlPts[j][m] = tmp[j][s];

        // Compute and load Rv[] (Eqs. [9.63] and [9.67])
        // Compute Rkv (Eq. 9.63)
        Rkv = [];
        for (i = 1; i < m; i++) {
            n0p = calcBasisFuncOne(p, U, 0, ub[i]);
            nnp = calcBasisFuncOne(p, U, m, ub[i]);
            elem2 = [tmp[0][j][0] * n0p, tmp[0][j][1] * n0p, tmp[0][j][2] * n0p];
            elem3 = [tmp[r][j][0] * nnp, tmp[r][j][1] * nnp, tmp[r][j][2] * nnp];
            Rkv.push([tmp[i][j][0] - elem2[0] - elem3[0], tmp[i][j][1] - elem2[1] - elem3[1], tmp[i][j][2] - elem2[2] - elem3[2]])
        }

        // Compute Rv (Eq. 9.67)
        Rv = [];
        Rv.length = Q[0][0].length;
        Rv.fill([]);
        for (i = 0; i < Q[0][0].length; i++) {
            Rv[i].length = m - 1;
            Rv[i].fill(0);
        }

        for (i = 1; i < m; i++) {
            R_tmp = [];
            for (k = 0; k < Rkv.length; k++) {
                tmp_1 = calcBasisFuncOne(q, V, i, vb[k + 1]);
                R_tmp.append([[Rkv[i][0] * tmp_1, Rkv[i][1] * tmp_1, Rkv[i][2] * tmp_1]]);
            }
            for (k = 0; k < Q[0][0].length; k++) {
                for (l = 0; l < R_tmp.length; l++) {
                    Rv[i - 1][k] += R_tmp[l][k];
                }
            }
        }
        
        // Call ForwardBackward() to get intermediate control points
        // tmp[1][j], ..., tmp[n-1][j];
        for (i = 0; i < Q[0][0].length; i++) {
            tmp_1 = [];
            for (k = 0; k < Rv.length; k++) {
                tmp_1.push(Rv[k][i]);
            }

            ForwardBackward(NvTNv, NvTNv.length, -1, tmp_1, sol_v, indxv);
            for (k = 1; k < n; k++) {
                ctrlPts[k][j][i] = tmp_1[k - 1];
            }
        }
    }

    const P = ctrlPts;


    return U, V, P;
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
    globalSurfApproxFixednm
};
