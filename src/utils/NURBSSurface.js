// BD 2026

/*
Wrapper/manager for NURBS surface objects in THREE js
*/

import * as THREE from 'three';
import { NURBSSurface } from 'three/addons/curves/NURBSSurface.js';
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';
import BasicScene from './BasicScene.js';
import { calcBasisFunctionDerivatives, findSpan, calcKoverI, calcNURBSDerivatives, calcBasisFunctions } from 'three/examples/jsm/curves/NURBSUtils.js';
// import './SplitElements.js';


export default class SurfaceObject {

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
                [ 1, 1, 1, 1, 1 ]
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
        threeScene = new BasicScene()
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
    calcBSplineSurfaceDerivatives(p, U, q, V, P, u, v, d) {
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
                    tmp[s].add(P[uspan - p + r][vspan - q + s].clone().multiplyScalar(Nu[k][r]));
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
    calcRationalSurfaceDerivatives(Pders) {
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
    calcNURBSSurfaceDerivatives(u, v, d) {
        // const Pders = this.calcBSplineSurfaceDerivatives(p, U, q, V, P, u, v, d);
        const Pders = this.calcBSplineSurfaceDerivatives(
            this.nurbsParams.degree1,
            this.nurbsParams.knots1,
            this.nurbsParams.degree2,
            this.nurbsParams.knots2,
            this.nurbsParams.ctrlPts, 
            u, v, d
        );
        console.log("Pders:");
        console.log(Pders);

        return this.calcRationalSurfaceDerivatives(Pders);
    }

    /**
     * Iteratively approximate the nearest point on a NURBS surface (u,v) to a given point (x,y,z). Modified version of algorithm 2 from https://arxiv.org/pdf/2210.13160
     * @param {Number} dn  - Minimum distance traveled each iteration. Also serves to find the basis vectors for u and v
     * @param {Number} tol - Maximum deviation between output of f(u, v) and point p, unless maxIt is reached first.
     * @param {Number} maxIt - Maximum number of iterations
     * @param {THREE.Vector3} p - Point in world space for which the nearest point on the NURBS surface will be approximated
     * @param {Number} damp - Multiplier for dampCur when decreasing distance along u and v traveled per iteration 
     * @returns 
     */
    calcNearestSurfacePointFromPoint(dn, tol, maxIt, p, damp) {
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

        this.getSurfacePoint(uCur, vCur, pCur);
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
            this.getSurfacePoint(uCur + dn, vCur, uHatCur);
            uHatCur.sub(pCur.clone());
            du = uHatCur.normalize().dot(rVecCur.normalize().multiplyScalar(2 / Math.sqrt(2)));//Math.sqrt(2) / 2));// / (rCur);
            this.getSurfacePoint(uCur, vCur + dn, vHatCur);
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
            this.getSurfacePoint(uCur, vCur, pCur);
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
    calcNURBSSurfaceDerivativesXYZ(point, d, tol, maxIt) {
        // Offset p by the nurbsObj's position
        const p = point.clone();
        p.sub(this.nurbsObj.position);
        console.log(p);

        const tol_ = tol || 0.000001;
        const minDistForUnitVectors = tol_ / 2;
        const maxIterations = maxIt || 60;
        const uvCoords = this.calcNearestSurfacePointFromPoint(minDistForUnitVectors, tol_, maxIterations, p, 0.5 );

        console.log(uvCoords);
        const test = new THREE.Vector3();
        this.getSurfacePoint(uvCoords[0], uvCoords[1], test);
        console.log(test);

        return this.calcNURBSSurfaceDerivatives(uvCoords[0], uvCoords[1], d);
    }

    // Check if another THREE object is colliding with the mesh of the surface object
    isColliding() {

    }
};
