import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import waterVertexShader from './Shaders/Water/vertex.glsl'
import waterFragmentShader from './Shaders/Water/fragment.glsl' 
import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader.js'

THREE.ColorManagement.enabled = false

/**
 * Base
 */
// Debug
const gui = new dat.GUI({ width: 340 })
const debugObject = {}
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

//environment map
const rgbeLoader = new RGBELoader();
rgbeLoader.load('/envMap3.hdr', (envMap)=>
{
  envMap.mapping= THREE.EquirectangularReflectionMapping

  scene.background = envMap
})
/**
 * Water
 */
// Geometry
const waterGeometry = new THREE.PlaneGeometry(8, 8, 1024, 1024)

// color 
debugObject.depthColor = '#15577a'
debugObject.surfaceColor = '#2382be'
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
scene.add(water)

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
camera.position.set(1, 1, 1)
scene.add(camera)
scene.background = new THREE.Color('#a8feff')
gui.addColor(scene, 'background')
// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

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