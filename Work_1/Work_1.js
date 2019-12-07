"use strict";

var gl;

var objIndex = 1;
var currentSelectIndex = 0;
var globalPosition;
var objects = [];
var objButtonArray = [];
var thetaLoc;
var globalScale;

//camera variables
var near = 0.3;
var far = 6.0;
var radius = 4.0;
var thetaCamera = 0.0;
var phiCamera = 0.0;

var fovy = 45.0;  // Field-of-view in Y direction angle (in degrees)
var aspect;       // Viewport aspect ratio

var mvMatrix, pMatrix;
var modelView, projection;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;


var eye;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

//light
var lightPosition = vec4(-500, 1.0, -1.0, 0.0);
var lightPosition1 = vec4(10, -1, 1.0, 0.0);
var lightPosition2 = vec4(0.0, 1.0, 1.0, 0.0);
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightDiffuse1 = vec4(1.0, 1.0, 1.0, 1.0);
var lightDiffuse2 = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular1 = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular2 = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4(1.0, 0.8, 0.0, 1.0);
var materialShininess = 100.0;

var ambientColor, diffuseColor, specularColor;


function createObjectButton() {
    var btn = document.createElement("button");
    var t = document.createTextNode("Object" + objIndex.toString());
    var indexStored = objIndex - 1;
    btn.appendChild(t);
    document.body.appendChild(btn);





  // Create button to remove the figure
  const figureIndex = objects.length;
  var removeBtn = document.createElement("button");
  var removeText = document.createTextNode("Remove Object" + objIndex.toString());
  removeBtn.appendChild(removeText);

  removeBtn.onclick = function() {
    objects.splice(figureIndex,1);
    currentSelectIndex = 0;
    removeBtn.remove();
    btn.remove();
  }

  document.body.appendChild(removeBtn);

  // End remove figure



    objIndex++;
    objButtonArray.push(btn);
    btn.onclick = function () {
        currentSelectIndex = getIndex(objects, currentSelectIndex); 
        objects[currentSelectIndex].selected = false;
        currentSelectIndex = indexStored;
        objects[currentSelectIndex].selected = true;
    }

}

window.onload = function init() {

    //load the canvas
    var canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    //
    //  Configure WebGL
    //
    gl.viewport(0, 0, canvas.width, canvas.height);
    aspect = canvas.width / canvas.height;

    gl.clearColor(1, 1, 1, 1.0);

    //  Load shaders and initialize attribute buffers

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    thetaLoc = gl.getUniformLocation(program, "theta");

    globalPosition = gl.getUniformLocation(program, "tr");
    globalScale = gl.getUniformLocation(program, "scale");

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

    gl.enable(gl.DEPTH_TEST);


    //object functions

    function Cone() {
        this.colors = [];

        this.sxAxis = 0;
        this.syAxis = 1;
        this.szAxis = 2;
        this.colors = [];
        this.xScale = 1;
        this.yScale = 1;
        this.zScale = 1;
        this.scaleMatrix = [this.xScale, this.yScale, this.zScale];
        this.scale = 1;

        this.translation = 0;
        this.xTranslation = 0;
        this.yTranslation = 0;
        this.zTranslation = 0;
        this.translationMatrix = [this.xTranslation, this.yTranslation, this.zTranslation];

        this.txAxis = 0;
        this.tyAxis = 1;
        this.tzAxis = 2;

        this.xAxis = 0;
        this.yAxis = 1;
        this.zAxis = 2;

        this.selected = false;
        this.axis = 0;
        this.theta = [0, 0, 0];
        this.flag = false;
        this.vertices = [];
        this.normals = [];
        this.r = 0.2;
        this.h = 0.5;
        this.pas = 0.3;

        this.color = vec4(this.r_color, this.g_color, this.b_color, this.transparency);

        this.color = function (r_color, g_color, b_color, transparency) {

            this.r_color = r_color;
            this.g_color = g_color;
            this.b_color = b_color;
            this.transparency = transparency;
            for (var i = 0; i < this.vertices.length; i++) {
                this.colors.push(vec4(this.r_color, this.g_color, this.b_color, this.transparency));

            }
        }


        this.draw = function () {
            for (this.alpha = 0; this.alpha < 2 * Math.PI; this.alpha += this.pas) {
                //vertices points
                this.p0 = vec3(0, 0, 0);
                this.p1 = vec3(0, this.h, 0);
                this.p2 = vec3(this.r * Math.cos(this.alpha), 0, this.r * Math.sin(this.alpha));
                this.p3 = vec3(this.r * Math.cos(this.alpha - this.pas), 0, this.r * Math.sin(this.alpha - this.pas));

                //normal points 1
                var n1 = subtract(this.p2, this.p1);
                var n2 = subtract(this.p3, this.p1);
                var N = normalize(cross(n1, n2));

                //triangle
                this.vertices.push(this.p1);
                this.normals.push(N);
                this.vertices.push(this.p2);
                this.normals.push(N);
                this.vertices.push(this.p3);
                this.normals.push(N);
                //normal points 2
                var n11 = subtract(this.p0, this.p2);
                var n21 = subtract(this.p3, this.p2);
                var N1 = normalize(cross(n11, n21));

                //circle
                this.vertices.push(this.p0);
                this.normals.push(N1);
                this.vertices.push(this.p2);
                this.normals.push(N1);
                this.vertices.push(this.p3);
                this.normals.push(N1);

            }
        }
        this.render = function () {

            var nBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(this.normals), gl.STATIC_DRAW);

            gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(vNormal);

            var vBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertices), gl.STATIC_DRAW);

            gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(vPosition);

            var colorsId = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, colorsId);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(this.colors), gl.STATIC_DRAW);

            gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(vColor);

            this.translationMatrix[this.taxis] = this.translation;
            gl.uniform3fv(globalPosition, this.translationMatrix);

            this.scaleMatrix[this.saxis] = this.scale;
            gl.uniform3fv(globalScale, this.scaleMatrix);

            if (this.flag)
                this.theta[this.axis] += 2.0;
            gl.uniform3fv(thetaLoc, this.theta);
            gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length);

            var ambientProduct = mult(lightAmbient, materialAmbient);
            var diffuseProduct = mult(lightDiffuse, materialDiffuse);
            var diffuseProduct1 = mult(lightDiffuse1, materialDiffuse);
            var diffuseProduct2 = mult(lightDiffuse2, materialDiffuse);
            var specularProduct = mult(lightSpecular, materialSpecular);
            var specularProduct1 = mult(lightSpecular1, materialSpecular);
            var specularProduct2 = mult(lightSpecular2, materialSpecular);

            gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
                flatten(ambientProduct));
            gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
                flatten(diffuseProduct));
                gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct1"),
                flatten(diffuseProduct1));
                gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct2"),
                flatten(diffuseProduct2));
            gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
                flatten(specularProduct));
                gl.uniform4fv(gl.getUniformLocation(program, "specularProduct1"),
                flatten(specularProduct1));
                gl.uniform4fv(gl.getUniformLocation(program, "specularProduct2"),
                flatten(specularProduct2));
            gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
                flatten(lightPosition));
                gl.uniform4fv(gl.getUniformLocation(program, "lightPosition1"),
                flatten(lightPosition1));
                gl.uniform4fv(gl.getUniformLocation(program, "lightPosition2"),
                flatten(lightPosition2));
console.log(lightPosition2)
            gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);

        }

        createObjectButton();

    }
    function Cylinder() {
        this.sxAxis = 0;
        this.syAxis = 1;
        this.szAxis = 2;

        this.xScale = 1;
        this.yScale = 1;
        this.zScale = 1;
        this.scale = 1;
        this.scaleMatrix = [this.xScale, this.yScale, this.zScale];

        this.translation = 0;
        this.xTranslation = 0;
        this.yTranslation = 0;
        this.zTranslation = 0;
        this.translationMatrix = [this.xTranslation, this.yTranslation, this.zTranslation];

        this.txAxis = 0;
        this.tyAxis = 1;
        this.tzAxis = 2;
        this.taxis = 0;

        this.xAxis = 0;
        this.yAxis = 1;
        this.zAxis = 2;

        this.selected = false;
        this.axis = 0;
        this.flag = true;
        this.theta = [0, 0, 0];
        this.vertices = [];
        this.normals = [];
        this.numPoints = 200;
        this.r = 0.2;
        this.h = 0.5;

        this.colors = [];
        this.color = vec4(this.r_color, this.g_color, this.b_color, this.transparency);

        this.color = function (r_color, g_color, b_color, transparency) {

            this.r_color = r_color;
            this.g_color = g_color;
            this.b_color = b_color;
            this.transparency = transparency;
            for (var i = 0; i < this.vertices.length; i++) {
                this.colors.push(vec4(this.r_color, this.g_color, this.b_color, this.transparency));

            }
        }
        this.draw = function () {
            for (this.i = 0; this.i < this.numPoints; this.i++) {
                this.p0 = vec3(0, 0, 0);
                this.p1 = vec3(0, this.h, 0);
                this.p2 = vec3(this.r * Math.sin(this.i * 2 * Math.PI / this.numPoints), 0, this.r * Math.cos(this.i * 2 * Math.PI / this.numPoints));
                this.p3 = vec3(this.r * Math.sin((this.i + 1) * 2 * Math.PI / this.numPoints), 0, this.r * Math.cos((this.i + 1) * 2 * Math.PI / this.numPoints));
                this.p4 = vec3(this.r * Math.sin((this.i + 1) * 2 * Math.PI / this.numPoints), this.h, this.r * Math.cos((this.i + 1) * 2 * Math.PI / this.numPoints));
                this.p5 = vec3(this.r * Math.sin(this.i * 2 * Math.PI / this.numPoints), this.h, this.r * Math.cos(this.i * 2 * Math.PI / this.numPoints));


                //normal points 1
                var n01 = subtract(this.p5, this.p3);
                var n02 = subtract(this.p2, this.p3);
                var N0 = normalize(cross(n01, n02));

                //triangle
                this.vertices.push(this.p2);
                this.normals.push(N0);
                this.vertices.push(this.p5);
                this.normals.push(N0);
                this.vertices.push(this.p3);
                this.normals.push(N0);

                //normal points 2
                var n11 = subtract(this.p4, this.p3);
                var n12 = subtract(this.p5, this.p3);
                var N1 = normalize(cross(n11, n12));

                //triangle
                this.vertices.push(this.p5);
                this.normals.push(N1);
                this.vertices.push(this.p4);
                this.normals.push(N1);
                this.vertices.push(this.p3);
                this.normals.push(N1);

                //normal points 3
                var n21 = subtract(this.p3, this.p0);
                var n22 = subtract(this.p2, this.p0);
                var N2 = normalize(cross(n21, n22));
                //CIRCLE
                this.vertices.push(this.p2);
                this.normals.push(N2);
                this.vertices.push(this.p0);
                this.normals.push(N2);
                this.vertices.push(this.p3);
                this.normals.push(N2);

                //normal points 3
                var n31 = subtract(this.p4, this.p5);
                var n32 = subtract(this.p1, this.p5);
                var N3 = normalize(cross(n31, n32));
                //CIRCLE
                this.vertices.push(this.p5);
                this.normals.push(N3);
                this.vertices.push(this.p1);
                this.normals.push(N3);
                this.vertices.push(this.p4);
                this.normals.push(N3);

            }
            createObjectButton();
        }
        this.render = function () {

            var nBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(this.normals), gl.STATIC_DRAW);

            var vNormal = gl.getAttribLocation(program, "vNormal");
            gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(vNormal);

            var vBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertices), gl.STATIC_DRAW);

            var vPosition = gl.getAttribLocation(program, "vPosition");
            gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(vPosition);
            var colorsId = gl.createBuffer();

            gl.bindBuffer(gl.ARRAY_BUFFER, colorsId);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(this.colors), gl.STATIC_DRAW);

            gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(vColor);


            this.translationMatrix[this.taxis] = this.translation;
            gl.uniform3fv(globalPosition, this.translationMatrix);

            this.scaleMatrix[this.saxis] = this.scale;
            gl.uniform3fv(globalScale, this.scaleMatrix);

          ///////  this.flag = false;
            if (this.flag)
                this.theta[this.axis] += 2.0;
            gl.uniform3fv(thetaLoc, this.theta);
            gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length);

            var ambientProduct = mult(lightAmbient, materialAmbient);
            var diffuseProduct = mult(lightDiffuse, materialDiffuse);
            var diffuseProduct1 = mult(lightDiffuse1, materialDiffuse);
            var diffuseProduct2 = mult(lightDiffuse2, materialDiffuse);
            var specularProduct = mult(lightSpecular, materialSpecular);
            var specularProduct1 = mult(lightSpecular1, materialSpecular);
            var specularProduct2 = mult(lightSpecular2, materialSpecular);

            gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
                flatten(ambientProduct));
            gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
                flatten(diffuseProduct));
            gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct1"),
                flatten(diffuseProduct1));
                gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct2"),
                flatten(diffuseProduct2));
            gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
                flatten(specularProduct));
            gl.uniform4fv(gl.getUniformLocation(program, "specularProduct1"),
                flatten(specularProduct1));
            gl.uniform4fv(gl.getUniformLocation(program, "specularProduct2"),
                flatten(specularProduct2));
            gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
                flatten(lightPosition));
            gl.uniform4fv(gl.getUniformLocation(program, "lightPosition1"),
                flatten(lightPosition1));
            gl.uniform4fv(gl.getUniformLocation(program, "lightPosition2"),
                flatten(lightPosition2));
 

            gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);


        }

    }




    function Sphere() {
        this.sxAxis = 0;
        this.syAxis = 1;
        this.szAxis = 2;

        this.xScale = 1;
        this.yScale = 1;
        this.zScale = 1;
        this.scale = 1;
        this.scaleMatrix = [this.xScale, this.yScale, this.zScale];

        this.translation = 0;
        this.xTranslation = 0;
        this.yTranslation = 0;
        this.zTranslation = 0;
        this.translationMatrix = [this.xTranslation, this.yTranslation, this.zTranslation];

        this.txAxis = 0;
        this.tyAxis = 1;
        this.tzAxis = 2;
        this.taxis = 0;

        this.xAxis = 0;
        this.yAxis = 1;
        this.zAxis = 2;

        this.selected = false;
        this.axis = 0;
        this.flag = false;
        this.theta = [0, 0, 0];
        this.r = 0.2;
        this.latitudeBands = 30;
        this.longitudeBands = 30;
        this.vertices = [];
        this.normals = [];


        this.colors = [];
        this.color = vec4(this.r_color, this.g_color, this.b_color, this.transparency);

        this.color = function (r_color, g_color, b_color, transparency) {

            this.r_color = r_color;
            this.g_color = g_color;
            this.b_color = b_color;
            this.transparency = transparency;
            for (var i = 0; i < this.vertices.length; i++) {
                this.colors.push(vec4(this.r_color, this.g_color, this.b_color, this.transparency));

            }
        }

        this.draw = function () {
            for (this.latNumber = 0; this.latNumber <= this.latitudeBands; this.latNumber++) {

                this.theta0 = this.latNumber * Math.PI / this.latitudeBands;
                this.sinTheta = Math.sin(this.theta0);
                this.cosTheta = Math.cos(this.theta0);

                this.theta1 = (this.latNumber + 1) * Math.PI / this.latitudeBands;
                this.sinTheta1 = Math.sin(this.theta1);
                this.cosTheta1 = Math.cos(this.theta1);

                for (this.longNumber = 0; this.longNumber <= this.longitudeBands; this.longNumber++) {

                    this.phi = this.longNumber * 2 * Math.PI / this.longitudeBands;
                    this.sinPhi = Math.sin(this.phi);
                    this.cosPhi = Math.cos(this.phi);

                    this.x = this.r * this.cosPhi * this.sinTheta;
                    this.y = this.r * this.cosTheta;
                    this.z = this.r * this.sinPhi * this.sinTheta;

                    this.x1 = this.r * this.cosPhi * this.sinTheta1;
                    this.y1 = this.r * this.cosTheta1;
                    this.z1 = this.r * this.sinPhi * this.sinTheta1;


                    this.phi2 = (this.longNumber + 1) * 2 * Math.PI / this.longitudeBands;
                    this.sinPhi2 = Math.sin(this.phi2);
                    this.cosPhi2 = Math.cos(this.phi2);

                    this.x2 = this.r * this.cosPhi2 * this.sinTheta;
                    this.y2 = this.r * this.cosTheta;
                    this.z2 = this.r * this.sinPhi2 * this.sinTheta;

                    this.x3 = this.r * this.cosPhi2 * this.sinTheta1;
                    this.y3 = this.r * this.cosTheta1;
                    this.z3 = this.r * this.sinPhi2 * this.sinTheta1;

                    //points declare
                    this.p0 = vec3(this.x, this.y, this.z);
                    this.p1 = vec3(this.x1, this.y1, this.z1);
                    this.p2 = vec3(this.x2, this.y2, this.z2);
                    this.p5 = vec3(this.x3, this.y3, this.z3);

                    //normal points 1
                    var n1 = subtract(this.p1, this.p2);
                    var n2 = subtract(this.p0, this.p2);
                    var N1 = normalize(cross(n1, n2));

                    //first triangle

                    this.vertices.push(this.p0);
                    this.normals.push(N1);
                    this.vertices.push(this.p1);
                    this.normals.push(N1);
                    this.vertices.push(this.p2);
                    this.normals.push(N1);

                    //normal points 2
                    var n21 = subtract(this.p5, this.p2);
                    var n22 = subtract(this.p1, this.p2);
                    var N2 = normalize(cross(n21, n22));

                    //second triangle
                    this.vertices.push(this.p1);
                    this.normals.push(N2);
                    this.vertices.push(this.p2);
                    this.normals.push(N2);
                    this.vertices.push(this.p5);
                    this.normals.push(N2);
                }
            }

        }
        this.render = function () {
            var nBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(this.normals), gl.STATIC_DRAW);

            var vNormal = gl.getAttribLocation(program, "vNormal");
            gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(vNormal);

            var vBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertices), gl.STATIC_DRAW);

            var vPosition = gl.getAttribLocation(program, "vPosition");
            gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(vPosition);

            var colorsId = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, colorsId);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(this.colors), gl.STATIC_DRAW);

           

            this.translationMatrix[this.taxis] = this.translation;
            gl.uniform3fv(globalPosition, this.translationMatrix);

            this.scaleMatrix[this.saxis] = this.scale;
            gl.uniform3fv(globalScale, this.scaleMatrix);


            if (this.flag)
                this.theta[this.axis] += 2.0;
            gl.uniform3fv(thetaLoc, this.theta);
            gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length);

            var ambientProduct = mult(lightAmbient, materialAmbient);
            var diffuseProduct = mult(lightDiffuse, materialDiffuse);
            var diffuseProduct1 = mult(lightDiffuse1, materialDiffuse);
            var diffuseProduct2 = mult(lightDiffuse2, materialDiffuse);
            var specularProduct = mult(lightSpecular, materialSpecular);
            var specularProduct1 = mult(lightSpecular1, materialSpecular);
            var specularProduct2 = mult(lightSpecular2, materialSpecular);

            gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
                flatten(ambientProduct));
            gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
                flatten(diffuseProduct));
            gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct1"),
                flatten(diffuseProduct1));
                gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct2"),
                flatten(diffuseProduct2));
            gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
                flatten(specularProduct));
            gl.uniform4fv(gl.getUniformLocation(program, "specularProduct1"),
                flatten(specularProduct1));
            gl.uniform4fv(gl.getUniformLocation(program, "specularProduct2"),
                flatten(specularProduct2));
            gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
                flatten(lightPosition));
            gl.uniform4fv(gl.getUniformLocation(program, "lightPosition1"),
                flatten(lightPosition1));
            gl.uniform4fv(gl.getUniformLocation(program, "lightPosition2"),
                flatten(lightPosition2));

            gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);

        }
        createObjectButton();

    }



    var vNormal = gl.getAttribLocation(program, "vNormal");
    var vPosition = gl.getAttribLocation(program, "vPosition");
    var vColor = gl.getAttribLocation(program, "vColor");


    var xSpinButton = document.getElementById("xButton").onclick = function () {
        currentSelectIndex = getIndex(objects, currentSelectIndex); 
        objects[currentSelectIndex].axis = objects[currentSelectIndex].xAxis;
    };
    var ySpinButton = document.getElementById("yButton").onclick = function () {
        currentSelectIndex = getIndex(objects, currentSelectIndex); 
        objects[currentSelectIndex].axis = objects[currentSelectIndex].yAxis;
    };
    var zSpinButton = document.getElementById("zButton").onclick = function () {
        currentSelectIndex = getIndex(objects, currentSelectIndex); 
        objects[currentSelectIndex].axis = objects[currentSelectIndex].zAxis;
    };

    var stopFigure = document.getElementById("sButton").onclick = function () {
        currentSelectIndex = getIndex(objects, currentSelectIndex); 
        objects[currentSelectIndex].axis = objects[currentSelectIndex].flag;
    };


    var getConeButton = document.getElementById("GetCone");
    var getSphereButton = document.getElementById("GetSphere");
    var getCylinderButton = document.getElementById("GetCylinder");
    var vColor = gl.getAttribLocation(program, "vColor");

    const verticesFile = [[-1, -1, 1],[1, -1, 1],[1, 1, 1],[1, 1, 1],[-1, 1, 1],[-1, -1, 1],[1, 1, -1],[1, -1, -1],
    [-1, -1, -1],[-1, -1, -1], [-1, 1, -1], [1, 1, -1], [1, 1, 1], [1, 1, -1], [-1, 1, -1], [-1, 1, -1], [-1, 1, 1]
    ,[1, 1, 1]
    ,[1, -1, 1]
    ,[1, -1, -1]
    ,[1, 1, -1]
    ,[1, 1, -1]
    ,[1, 1, 1]
    ,[1, -1, 1]
    ,[-1, -1, 1]
    ,[-1, -1, -1]
    ,[1, -1, -1]
    ,[1, -1, -1]
    ,[1, -1, 1]
    ,[-1, -1, 1]
    ,[-1, 1, 1]
    ,[-1, 1, -1]
    ,[-1, -1, -1]
    ,[-1, -1, -1]
    ,[-1, -1, 1]
    ,[-1, 1, 1]];

    const normalsFile = [[0, 0, 1, 1],[0, 0, 1, 1],[0, 0, 1, 1],[0, 0, 1, 1],[0, 0, 1, 1],[0, 0, 1, 1],[0, 0, -1, 1],[0, 0, -1, 1],[0, 0, -1, 1],[0, 0, -1, 1]
    ,[0, 0, -1, 1]
    ,[0, 0, -1, 1]
    ,[0, 1, -0, 1]
    ,[0, 1, -0, 1]
    ,[0, 1, -0, 1]
    ,[0, 1, -0, 1]
    ,[0, 1, -0, 1]
    ,[0, 1, -0, 1]
    ,[1, 0, -0, 1]
    ,[1, 0, -0, 1]
    ,[1, 0, -0, 1]
    ,[1, 0, -0, 1]
    ,[1, 0, -0, 1]
    ,[1, 0, -0, 1]
    ,[0, -1, -0, 1]
    ,[0, -1, -0, 1]
    ,[0, -1, -0, 1]
    ,[0, -1, -0, 1]
    ,[0, -1, -0, 1]
    ,[0, -1, -0, 1]
    ,[-1, 0, -0, 1]
    ,[-1, 0, -0, 1]
    ,[-1, 0, -0, 1]
    ,[-1, 0, -0, 1]
    ,[-1, 0, -0, 1]
    ,[-1, 0, -0, 1]];

    function ObjFromFile(vertices, normals) {
        this.colors = [];

        this.sxAxis = 0;
        this.syAxis = 1;
        this.szAxis = 2;
        this.colors = [];
        this.xScale = 1;
        this.yScale = 1;
        this.zScale = 1;
        this.scaleMatrix = [this.xScale, this.yScale, this.zScale];
        this.scale = 1;

        this.translation = 0;
        this.xTranslation = 0;
        this.yTranslation = 0;
        this.zTranslation = 0;
        this.translationMatrix = [this.xTranslation, this.yTranslation, this.zTranslation];

        this.txAxis = 0;
        this.tyAxis = 1;
        this.tzAxis = 2;

        this.xAxis = 0;
        this.yAxis = 1;
        this.zAxis = 2;

        this.selected = false;
        this.axis = 0;
        this.theta = [0, 0, 0];
        this.flag = false;
        this.vertices = vertices;
        this.normals = normals;
        this.r = 0.2;
        this.h = 0.5;
        this.pas = 0.3;

        this.color = vec4(this.r_color, this.g_color, this.b_color, this.transparency);


        this.color = function (r_color, g_color, b_color, transparency) {

            this.r_color = r_color;
            this.g_color = g_color;
            this.b_color = b_color;
            this.transparency = transparency;
            for (var i = 0; i < this.vertices.length; i++) {
                this.colors.push(vec4(this.r_color, this.g_color, this.b_color, this.transparency));

            }
        }



        this.render = function () {

            var nBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(this.normals), gl.STATIC_DRAW);

            gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(vNormal);

            var vBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertices), gl.STATIC_DRAW);

            gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(vPosition);

            this.translationMatrix[this.taxis] = this.translation;
            gl.uniform3fv(globalPosition, this.translationMatrix);

            this.scaleMatrix[this.saxis] = this.scale;
            gl.uniform3fv(globalScale, this.scaleMatrix);

            if (this.flag)
                this.theta[this.axis] += 2.0;
            gl.uniform3fv(thetaLoc, this.theta);
            gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length);

            var ambientProduct = mult(lightAmbient, materialAmbient);
            var diffuseProduct = mult(lightDiffuse, materialDiffuse);
            var specularProduct = mult(lightSpecular, materialSpecular);

            gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
                flatten(ambientProduct));
            gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
                flatten(diffuseProduct));
            gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
                flatten(specularProduct));
            gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
                flatten(lightPosition));

            gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);

        }

        createObjectButton();

    }


    function Obj() {
        this.colors = [];

        this.sxAxis = 0;
        this.syAxis = 1;
        this.szAxis = 2;
        this.colors = [];
        this.xScale = 1;
        this.yScale = 1;
        this.zScale = 1;
        this.scaleMatrix = [this.xScale, this.yScale, this.zScale];
        this.scale = 1;

        this.translation = 0;
        this.xTranslation = 0;
        this.yTranslation = 0;
        this.zTranslation = 0;
        this.translationMatrix = [this.xTranslation, this.yTranslation, this.zTranslation];

        this.txAxis = 0;
        this.tyAxis = 1;
        this.tzAxis = 2;

        this.xAxis = 0;
        this.yAxis = 1;
        this.zAxis = 2;

        this.selected = false;
        this.axis = 0;
        this.theta = [0, 0, 0];
        this.flag = false;
        this.vertices = [];
        this.normals = [];
        this.r = 0.2;
        this.h = 0.5;
        this.pas = 0.3;

        this.color = vec4(this.r_color, this.g_color, this.b_color, this.transparency);


        this.color = function (r_color, g_color, b_color, transparency) {

            this.r_color = r_color;
            this.g_color = g_color;
            this.b_color = b_color;
            this.transparency = transparency;
            for (var i = 0; i < this.vertices.length; i++) {
                this.colors.push(vec4(this.r_color, this.g_color, this.b_color, this.transparency));

            }
        }



        this.render = function () {

            var nBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(this.normals), gl.STATIC_DRAW);

            gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(vNormal);

            var vBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertices), gl.STATIC_DRAW);

            gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(vPosition);

            var colorsId = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, colorsId);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(this.colors), gl.STATIC_DRAW);

            gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(vColor);

            this.translationMatrix[this.taxis] = this.translation;
            gl.uniform3fv(globalPosition, this.translationMatrix);

            this.scaleMatrix[this.saxis] = this.scale;
            gl.uniform3fv(globalScale, this.scaleMatrix);

            if (this.flag)
                this.theta[this.axis] += 2.0;
            gl.uniform3fv(thetaLoc, this.theta);
            gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length);

            var ambientProduct = mult(lightAmbient, materialAmbient);
            var diffuseProduct = mult(lightDiffuse, materialDiffuse);
            var specularProduct = mult(lightSpecular, materialSpecular);

            gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
                flatten(ambientProduct));
            gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
                flatten(diffuseProduct));
            gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
                flatten(specularProduct));
            gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
                flatten(lightPosition));

            gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);

        }

        createObjectButton();

    }


    getConeButton.onclick = function () {

        var cone1 = new Cone(0, 0, 0);
        cone1.draw();
        cone1.color(cone1.r_color, cone1.g_color, cone1.b_color, cone1.transparency);
        objects.push(cone1);
        currentSelectIndex = objects.length - 1


    };

    getSphereButton.onclick = function () {

        var sphere1 = new Sphere();
        sphere1.draw();
        sphere1.color(sphere1.r_color, sphere1.g_color, sphere1.b_color, sphere1.transparency);
        objects.push(sphere1);
        currentSelectIndex = objects.length - 1

    };

    getCylinderButton.onclick = function () {

        var cylinder1 = new Cylinder();
        cylinder1.draw();
        cylinder1.color(cylinder1.r_color, cylinder1.g_color, cylinder1.b_color, cylinder1.transparency);
        objects.push(cylinder1);
        currentSelectIndex = objects.length - 1

    };




    //After loading file and parsing it, we obtain the array of vertices, normals and texture
    //after that, call objfromFile with those arrays 
    //     var obj1 = new ObjFromFile(verticesFile, normalsFile);
    //     obj1.render();
    //     objects.push(obj1);
    //     currentSelectIndex = objects.length - 1

    var slidertx = document.getElementById("xTranslationSlider");
    slidertx.oninput = function () {
        console.log(this.value);
        currentSelectIndex = getIndex(objects, currentSelectIndex); 
        objects[currentSelectIndex].taxis = objects[currentSelectIndex].txAxis;
        objects[currentSelectIndex].translation = slidertx.value;
    };

    var sliderty = document.getElementById("yTranslationSlider");
    sliderty.oninput = function () {
        currentSelectIndex = getIndex(objects, currentSelectIndex); 
        objects[currentSelectIndex].taxis = objects[currentSelectIndex].tyAxis;
        objects[currentSelectIndex].translation = sliderty.value;
    };

    var slidertz = document.getElementById("zTranslationSlider");
    slidertz.oninput = function () {
        currentSelectIndex = getIndex(objects, currentSelectIndex); 
        objects[currentSelectIndex].taxis = objects[currentSelectIndex].tzAxis;
        objects[currentSelectIndex].translation = slidertz.value;
    };

    var slidersx = document.getElementById("xScaleSlider");
    slidersx.oninput = function () {
        currentSelectIndex = getIndex(objects, currentSelectIndex); 
        objects[currentSelectIndex].saxis = objects[currentSelectIndex].sxAxis;
        objects[currentSelectIndex].scale = slidersx.value;
    };

    var slidersy = document.getElementById("yScaleSlider");
    slidersy.oninput = function () {
        currentSelectIndex = getIndex(objects, currentSelectIndex); 
        objects[currentSelectIndex].saxis = objects[currentSelectIndex].syAxis;
        objects[currentSelectIndex].scale = slidersy.value;
    };

    var slidersz = document.getElementById("zScaleSlider");
    slidersz.oninput = function () {
        currentSelectIndex = getIndex(objects, currentSelectIndex); 
        objects[currentSelectIndex].saxis = objects[currentSelectIndex].szAxis;
        objects[currentSelectIndex].scale = slidersz.value;
    };



    var r_color_slider = document.getElementById("R_slider");
    r_color_slider.oninput = function () {
        currentSelectIndex = getIndex(objects, currentSelectIndex); 
        objects[currentSelectIndex].colors = [];
        objects[currentSelectIndex].color(this.value, objects[currentSelectIndex].g_color, objects[currentSelectIndex].b_color, objects[currentSelectIndex].transparency);
    }

    var g_color_slider = document.getElementById("G_slider");
    g_color_slider.oninput = function () {
        currentSelectIndex = getIndex(objects, currentSelectIndex); 
        objects[currentSelectIndex].colors = [];
        objects[currentSelectIndex].color(objects[currentSelectIndex].r_color, this.value, objects[currentSelectIndex].b_color, objects[currentSelectIndex].transparency);
    }


    var b_color_slider = document.getElementById("B_slider");
    b_color_slider.oninput = function () {
        currentSelectIndex = getIndex(objects, currentSelectIndex); 
        objects[currentSelectIndex].colors = [];
        objects[currentSelectIndex].color(objects[currentSelectIndex].r_color, objects[currentSelectIndex].g_color, this.value, objects[currentSelectIndex].transparency);
    }
    var shininess_Slider = document.getElementById("ShininessSlider");
    shininess_Slider.oninput = function () {
        materialShininess = this.value;
    } 
    var diffuse_Slider = document.getElementById("diffuseSlider");
    diffuse_Slider.oninput = function () {
        const [red, green, blue] = getRGBfromHex(this.value);
        lightDiffuse = vec4(red, green, blue, 1.0);
    }
    var diffuse1_Slider = document.getElementById("diffuse1Slider");
    diffuse1_Slider.oninput = function () {
        const [red, green, blue] = getRGBfromHex(this.value);
        lightDiffuse1 = vec4(red, green, blue, 1.0);
    }
    var diffuse2_Slider = document.getElementById("diffuse2Slider");
    diffuse2_Slider.oninput = function () {
        const [red, green, blue] = getRGBfromHex(this.value);
        lightDiffuse2 = vec4(red, green, blue, 1.0);
    }


    var specular_Slider = document.getElementById("specularSlider");
    specular_Slider.oninput = function () {
        const [red, green, blue] = getRGBfromHex(this.value);
        lightSpecular = vec4(red, green, blue, 1.0);
    }
    var specular1_Slider = document.getElementById("specular1Slider");
    specular1_Slider.oninput = function () {
        const [red, green, blue] = getRGBfromHex(this.value);
        lightSpecular1 = vec4(red, green, blue, 1.0);
    }
    var specular2_Slider = document.getElementById("specular2Slider");
    specular2_Slider.oninput = function () {
        const [red, green, blue] = getRGBfromHex(this.value);
        lightSpecular2 = vec4(red, green, blue, 1.0);
    }



    var materialAmbient_Slider = document.getElementById("MaterialAmbientSlider");
    materialAmbient.oninput = function () {
        materialAmbient = vec4(this.value, this.value, this.value, this.value);
    }
    var MaterialDiffuse_Slider = document.getElementById("MaterialDiffuseSlider");
    MaterialDiffuse_Slider.oninput = function () {
        materialDiffuse = vec4(this.value, this.value, this.value, this.value);
    }
    var MaterialSpecular_Slider = document.getElementById("MaterialSpecularSlider");
    MaterialSpecular_Slider.oninput = function () {
        materialSpecular = vec4(this.value, this.value, this.value, this.value);
    }

    
    var lightposition_Slider = document.getElementById("lightPositionSlider");
    lightposition_Slider.oninput = function () {
        lightPosition = vec4(lightPosition[0], this.value, lightPosition[2], 1);
    }
    var lightposition1_Slider = document.getElementById("lightPosition1Slider");
    lightposition1_Slider.oninput = function () {
        lightPosition1 = vec4(this.value, this.value, -this.value, this.value);
    }
    var lightposition2_Slider = document.getElementById("lightPosition2Slider");
    lightposition2_Slider.oninput = function () {
        lightPosition2 = vec4(-this.value, this.value, this.value, this.value);
    }



    function getRGBfromHex(hexValue) {
        const reg = /#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})/;
        const match = reg.exec(hexValue);
        const colors = match.slice(1, 4).map(c => parseInt(c, 16) / 255);
        return colors;
      }
      
      const colorPicker = document.getElementById("lightAmbient");
      colorPicker.oninput = function() {
        const [red, green, blue] = getRGBfromHex(this.value);
        lightAmbient = vec4(red, green, blue, 1.0);
      }



    //buttons for view parameters
    document.getElementById("zFarSlider").onchange = function (event) {
        far = event.target.value;
    };
    document.getElementById("zNearSlider").onchange = function (event) {
        near = event.target.value;
    };
    document.getElementById("radiusSlider").onchange = function (event) {
        radius = event.target.value;
    };
    document.getElementById("thetaSlider").onchange = function (event) {
        thetaCamera = event.target.value * Math.PI / 180.0;
    };
    document.getElementById("phiSlider").onchange = function (event) {
        phiCamera = event.target.value * Math.PI / 180.0;
    };
    document.getElementById("aspectSlider").onchange = function (event) {
        aspect = event.target.value;
    };
    document.getElementById("fovSlider").onchange = function (event) {
        fovy = event.target.value;
    };



    renderScene();

}

function renderScene() {

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //camera render
    eye = vec3(radius * Math.sin(thetaCamera) * Math.cos(phiCamera),
        radius * Math.sin(thetaCamera) * Math.sin(phiCamera), radius * Math.cos(thetaCamera));
    var modelViewMatrix = lookAt(eye, at, up);
    var projectionMatrix = perspective(fovy, aspect, near, far);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    for (var i = 0; i < objects.length; i++) {
        objects[i].render();
        // console.log(objects.length);

    }


    requestAnimFrame(renderScene);
}


function getIndex(objects, currentSelectIndex) {
    if (objects[currentSelectIndex]) {
      return currentSelectIndex;
    } else {
      return objects.length - 1;
    }
  }