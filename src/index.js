import './css/style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { DoubleSide, Mesh } from 'three';

const devMode = true;
const dracoLoader = new DRACOLoader()
const loader = new GLTFLoader();
const listener = new THREE.AudioListener();
const busSound = new THREE.Audio(listener);
const birdsBackgroundSound = new THREE.Audio(listener);
const backgroundMusic = new THREE.Audio(listener);
const progressBar = document.getElementById('progressBar');
const countDown = setInterval(function(){ updateProgressBar()}, 500);  // calls updateProgressBar()
const renderer = new THREE.WebGLRenderer(
     {
            canvas: document.querySelector('canvas.webgl'),
            antialias: true
            
     }
);



let activeScene, activeCamera, mainScene, viewerScene, mainCamera, controls, activeDirectionalLight, activeAmbientLight;
let counter = 0;
let audioMuted = false;

function init(){
    
    // setup main scene.
    mainScene = new THREE.Scene();
    mainScene.background = new THREE.Color(0xf7f7f7);
    activeScene = mainScene;

    // Create the camera.
    mainCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    mainCamera.position.z = 75;
    mainCamera.position.y = 50;
    activeCamera = mainCamera;

    //add listener to the main Camera
    mainCamera.add(listener);

    // Setup controls
    switchControls('normal');

    // Setup lights
    switchLightSetup('normal');

    // Load models
    loadModels();

    // Load sounds
    loadSounds();


    // Set render window size
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.render( activeScene, activeCamera);
    

    selectNewScene("main"); // Set active scene to the main scene.

    // Activate refreshing 
    animate();

    // Check for development mode
    if (devMode){
        startApplication();
    }

}


// Scene switchers
function selectNewScene(newScene){
    switch(newScene){
        case "main":
            activeScene = mainScene;
            activeCamera = mainCamera;
            console.log("Switched to: MainScene");
            break;

        case "viewer":
            activeScene = "viewerScene";
            activeCamera = "HERE COMES NEW CAMERA";
            console.log("Switched to: ViewerScene");
            break;
        default: 
        activeScene = "mainScene";
    }
}

// Set control mode
function switchControls(controlType){
    switch(controlType){
        case 'normal':
            controls = new OrbitControls(activeCamera, renderer.domElement);
            controls.update();
            controls.enablePan = false;
            controls.maxPolarAngle = Math.PI / 2 + -.3;
            console.log('Switched to normal controls');
            break;

        case 'viewerControls':
            console.log('Switched to viewerControls');
    }
}

// Set lights based on scene
function switchLightSetup(lightType){
    switch(lightType){
        case 'normal':
            console.log('Lights are set to normal');
            activeDirectionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.8);
            activeAmbientLight = new THREE.AmbientLight(0xffffff, 0.7);
            mainScene.add(activeDirectionalLight);
            mainScene.add(activeAmbientLight);
            break;

        case 'viewerLights':
            console.log('Lights are set for the 360 Viewer');
            break;
    }
}

// Setup after start button has been pressed.
function startApplication(){
    
    document.getElementById('wrapper').style.display = 'none';  // Hide the wrapper.
    document.getElementById('webgl').style.display = 'block'; // Display the canvas.
    document.getElementById('interface').style.display = 'flex' ;// Show the Interface
    document.getElementById('muteBtn').addEventListener('click', muteSwitch, false); // Add function to mute button.

    busSound.play();
    birdsBackgroundSound.play();
    backgroundMusic.play();
}


function updateProgressBar(){
    counter += 0.5;  // increase the counter. T
    
    // increase the progress bar value or remove it if the counter is finished.
    if(counter <= 2){
        let newValue = Number(progressBar.getAttribute('value'));
        newValue += 0.25;
        progressBar.setAttribute('value', newValue);
    } else {
        clearInterval(countDown); // stop the countdown.
        progressBar.style.display = 'none';  // hide progress bar.
        document.getElementById('loadingLabel').style.display = 'none'; // hide loading label.
        document.getElementById('main').innerHTML += '<button id="startButton" type="button">Start</button>';
        document.getElementById('startButton').addEventListener('click', startApplication, false);
    }
}

function loadModels(){

    dracoLoader.setDecoderPath('./draco/'); // set path to draco module.
    loader.setDRACOLoader(dracoLoader); // set the draco loader.

    loader.load('models/bus.gltf', function(gltf){
        
        gltf.scene.scale.set(1, 1, 1);
        mainScene.add(gltf.scene);
        console.log(gltf.scene);
    })

}

// This function prepares all the sounds for the scene.
function loadSounds(){
     const AudioLoader = new THREE.AudioLoader();
     AudioLoader.load('./sound/electricBusLoop.ogg', function(buffer){
         busSound.setBuffer(buffer);
         busSound.setLoop(true);
         busSound.setVolume(0.3);
     })

     AudioLoader.load('./sound/Birds.More.Loud.ogg', function (buffer){
         birdsBackgroundSound.setBuffer(buffer);
         birdsBackgroundSound.setLoop(true);
         birdsBackgroundSound.setVolume(0.5);
     })

     AudioLoader.load('./sound/piano.loop.ogg', function (buffer){
         backgroundMusic.setBuffer(buffer);
         backgroundMusic.setLoop(true);
         backgroundMusic.setVolume(0.1);
     })
}

function muteSwitch(){
    if(audioMuted){
        // Unmute the audio. 
        backgroundMusic.play();
        birdsBackgroundSound.play();
        busSound.play();
        document.getElementById('muteBtn').src = './img/mute.svg';
        audioMuted = false;
        console.log('Sound is on.')
    }else{
        // Mute the application.
        backgroundMusic.pause();
        birdsBackgroundSound.pause();
        busSound.pause();
        document.getElementById('muteBtn').src = './img/sound.svg';
        audioMuted = true;
        console.log('Sound is off.');
    }
    
}

function onWindowResize(){
	activeCamera.aspect = window.innerWidth / window.innerHeight;
	activeCamera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate(){

    // Request next frame.
    requestAnimationFrame(animate);

    //Render the scene
    renderer.render(activeScene, activeCamera);

    // Update controls
    controls.update();
    
}

// event listeners
window.addEventListener('resize', onWindowResize, false);

init();
