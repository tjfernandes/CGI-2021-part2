import { loadShadersFromURLS, setupWebGL, buildProgramFromSources } from '../../libs/utils.js';
import { mat4, vec3, flatten, lookAt, ortho, mult, translate, rotateX, rotateY, rotateZ, scalem} from '../../libs/MV.js';

import * as SPHERE from './js/sphere.js';
import * as CUBE from './js/cube.js';

/** @type {WebGLRenderingContext} */
let gl;

let program;

/** View and Projection matrices */
let mView;
let mProjection;
let mModel;

const edge = 2.0;

let instances = [];
let select;

const CUBE_S = 0;
const SPHERE_S = 1;

let px;
let py;
let pz;

let rx;
let ry;
let rz;

let sx;
let sy;
let sz;



function render(time)
{
    window.requestAnimationFrame(render);

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    px = document.getElementById("px").value;
    py = document.getElementById("py").value;
    pz = document.getElementById("pz").value; 

    rx = document.getElementById("rx").value;
    ry = document.getElementById("ry").value;
    rz = document.getElementById("rz").value; 

    sx = document.getElementById("sx").value;
    sy = document.getElementById("sy").value;
    sz = document.getElementById("sz").value;

    mModel = mult(mult(mult(mult(translate(px, py, pz), rotateZ(rz)), rotateY(ry)), rotateX(rx)), scalem(sx, sy, sz));

    const uCtm = gl.getUniformLocation(program, "uCtm");
    gl.uniformMatrix4fv(uCtm, false, flatten(mult(mProjection, mult(mView, mModel))));


    for (let inst of instances) {
        if (inst == CUBE_S) {
            CUBE.draw(gl, program, gl.LINES);
        }   
        else if (inst == SPHERE_S){
            SPHERE.draw(gl, program, gl.LINES); 
        }
    }
}



function setup(shaders)
{
    const canvas = document.getElementById('gl-canvas');

    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = window.innerHeight;

    gl = setupWebGL(canvas);
    program = buildProgramFromSources(gl, shaders['shader.vert'], shaders['shader.frag']);

    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.viewport(0,0,canvas.width, canvas.height);

    mView = lookAt(vec3(0,0,0), vec3(-1,-1,-2), vec3(0,1,0));
    setupProjection();

    select = document.getElementById("object_instances");
    
    function setupProjection()
    {
        if(canvas.width < canvas.height) {
            const yLim = edge*canvas.height/canvas.width;
            mProjection = ortho(-edge, edge, -yLim, yLim, -10, 10);
        }
        else {
            const xLim = edge*canvas.width/canvas.height;
            mProjection = ortho(-xLim, xLim, -edge, edge, -10, 10);
        }

    }
    window.addEventListener("resize", function() {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = window.innerHeight;

        setupProjection();
    
        gl.viewport(0,0,canvas.width, canvas.height);
    });
    
    document.getElementById("add_cube").addEventListener("click", function() {
        CUBE.init(gl);
        instances.push(CUBE_S);

        const opt = document.createElement('option');
        opt.value = instances.length;
        opt.innerHTML = "Shape " +  + instances.length + " - Cube";

        select.appendChild(opt);
    });

    document.getElementById("add_sphere").addEventListener("click", function() {
        SPHERE.init(gl);
        instances.push(SPHERE_S);

        const opt = document.createElement('option');
        opt.value = instances.length;
        opt.innerHTML = "Shape " + instances.length + " - Sphere";

        select.appendChild(opt);
    });

    document.getElementById("remove").addEventListener("click", function() {
        instances.splice(select.selectedIndex, 1);
        select.remove(select.selectedIndex);

        for(let i = 0; i < instances.length; i++) {
            if (instances[i] == CUBE_S)
                select.options[i].innerHTML = "Shape " + (i+1) + " - Cube";
            else
                select.options[i].innerHTML = "Shape " + (i+1) + " - Sphere";
        }
    });


    window.requestAnimationFrame(render);
}

const shaderUrls = ['shader.vert', 'shader.frag'];

loadShadersFromURLS(shaderUrls).then(shaders=>setup(shaders));