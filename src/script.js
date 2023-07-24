import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import waterVertexShader from './Shaders/Water/vertex.glsl'
import waterFragmentShader from './Shaders/Water/fragment.glsl' 
import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader.js'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'

THREE.ColorManagement.enabled = false

/**
 * Base
 */
// Debug
const gui = new dat.GUI({ width: 340})
gui.open(false)

const debugObject = {}
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

//fog 
const fog = new THREE.Fog('#000000', 10, 12);
scene.fog = fog

//environment map
const rgbeLoader = new RGBELoader();
rgbeLoader.load('/envMap.hdr', (envMap)=>
{
  envMap.mapping= THREE.EquirectangularReflectionMapping
    envMap.rotation = Math.PI
  scene.background = envMap
  scene.environment = envMap
})
/**
 * Water
 */
// Geometry
const waterGeometry = new THREE.PlaneGeometry(32, 32, 1024, 1024)

// color 
debugObject.depthColor = '#4c79c2'
debugObject.surfaceColor = '#5e8dd9'
// Material 
const waterMaterial = new THREE.ShaderMaterial({
    side:2,
  
    vertexShader: waterVertexShader,
    fragmentShader: waterFragmentShader, 
     uniforms: {
        uTime: {value: 0},
        uBigWavesElevation: {value :0.1}, 
        uBigWavesFrequency: {value : new THREE.Vector2( 2.5, 1.6)}, 
        uBigWavesSpeed:{value :0.6},

        uSmallWaveElevation: {value :0.15},
        uSmallWaveFrequency: {value :2.0},
        uSmallWaveSpeed: {value :0.3},
        uSmallWaveIteration: {value :3.0},
        

        uDepthColor: {value: new THREE.Color(debugObject.depthColor)},
        uSurfaceColor: {value: new THREE.Color(debugObject.surfaceColor)}, 
        uColorOffset: {value:0.08}, 
        uColorMultiplier: {value: 5}
     }
})

//Debug 
gui.add(waterMaterial.uniforms.uBigWavesElevation, 'value').min(0).max(1).step(0.001).name('uBigWavesElevation');
gui.add(waterMaterial.uniforms.uBigWavesFrequency.value, 'x').min(0).max(10).step(0.1).name('waves x axis');
gui.add(waterMaterial.uniforms.uBigWavesFrequency.value, 'y').min(0).max(10).step(0.1).name('waves z axis');
gui.add(waterMaterial.uniforms.uBigWavesSpeed, 'value').min(0).max(4).step(0.1).name('waves speed');
gui.addColor(debugObject, 'depthColor')
.name('Depth Color')
.onChange(()=>
{
    waterMaterial.uniforms.uDepthColor.value.set(debugObject.depthColor)
})
gui.addColor(debugObject, 'surfaceColor').name('Surface Color')
.onChange(()=>
{
    waterMaterial.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor)
})
gui.add(waterMaterial.uniforms.uColorOffset, 'value').min(0).max(1).step(0.001).name('Color offset');
gui.add(waterMaterial.uniforms.uColorMultiplier, 'value').min(0).max(10).step(0.001).name('Color Multiplier');
gui.add(waterMaterial.uniforms.uSmallWaveElevation, 'value').min(0).max(1).step(0.001).name('Small Wave Elevation');
gui.add(waterMaterial.uniforms.uSmallWaveFrequency, 'value').min(0).max(10).step(0.001).name('Small Wave Frequency');
gui.add(waterMaterial.uniforms.uSmallWaveSpeed, 'value').min(0).max(1).step(0.001).name('Small Wave Speed');
gui.add(waterMaterial.uniforms.uSmallWaveIteration, 'value').min(0).max(10).step(1).name('Small Wave Iteration');


// Mesh
const water = new THREE.Mesh(waterGeometry, waterMaterial)
water.rotation.x = - Math.PI * 0.5
water.rotation.z =  Math.PI * 0.5
water.position.y = -0.5
scene.add(water)

let model = null
//model
const gltfLoader = new GLTFLoader();

gltfLoader.load('/Ship_Model.glb', (gltf)=>
{
    model = gltf.scene
    model.scale.set(0.03, 0.03, 0.03)
    model.position.set(0, -0.5, 0)
    model.rotation.set(0, 1.56, 0)
   scene.add(model);
})
/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(1, 0.15, 0.5)
scene.add(camera)
// scene.background = new THREE.Color('#a8feff')
// gui.addColor(scene, 'background')

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.enableZoom = false

controls.addEventListener( 'change', function(){
    //...
    this.target.y = 0;
    camera.position.y = 0;
    //...
 }
)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    //model 
    if(model){
    model.position.x = Math.cos(elapsedTime*0.02)*4
    model.position.z = Math.sin(elapsedTime*0.02)*4

    }

    //updating time 
    waterMaterial.uniforms.uTime.value = elapsedTime
    // Update controls
    controls.update()
   
    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()