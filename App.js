import * as THREE from './libs/three.module.js';
import { OrbitControls } from './libs/jsm/OrbitControls.js';
import { GLTFLoader } from './libs/jsm/GLTFLoader.js';
import { DRACOLoader } from './libs/jsm/DRACOLoader.js';

import { ARButton } from './libs/jsm/ARButton.js';

class App {

    constructor() {
        let container = document.createElement('div');
        document.body.appendChild(container);

        this.clock = new THREE.Clock();

        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 1000);
        this.camera.position.set(0,1,5);
        this.camera.lookAt(0,0,0);

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xffffff);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        container.appendChild(this.renderer.domElement);

        // lighting
        let ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 0.3);
        this.scene.add(ambient);

        let directional = new THREE.DirectionalLight();
        directional.position.set(0.2, 1, 1);
        this.scene.add(directional);

        //this.loadGLTF("time_machine", 0.1);
        this.loadGLTF("Trump_Happy_Idle", 1);

        this.gridHelper = new THREE.GridHelper(10,10);
        this.scene.add(this.gridHelper);
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.target.set(0, 0, 0);
        this.controls.update();

        this.setupXR();

        window.addEventListener('resize', this.resize.bind(this));
    }

    setupXR() {
        this.renderer.xr.enabled = true;
        //const self = this;
        // let controller;
        //let arButton = new ARButton(this.renderer);
        document.body.appendChild(ARButton.createButton(this.renderer));
        // controller = this.renderer.xr.getController(0);
        // self.scene.add(controller);
    }

    loadGLTF(fileName, scale) {
        const self = this;
        let loader = new GLTFLoader().setPath("./models/");
        let draco = new DRACOLoader();
        draco.setDecoderPath('./libs/draco/');
        loader.setDRACOLoader(draco);

        loader.load(`${fileName}.glb`, 
        function(model) {
            //console.log(model);
            self.animations = {};
            model.animations.forEach(anime => {
                self.animations[anime.name] = anime;
            });
            self.model = model.scene;  // why model.scene.children[0] not working?
            self.model.scale.set(scale, scale, scale);
            self.scene.add(self.model);

            self.mixer = new THREE.AnimationMixer(self.model);
            self.actionName = "Armature|mixamo.com|Layer0";
            self.mixer.clipAction( self.animations[self.actionName] ).play();
            //console.log(self.animations[self.actionName]);

            self.renderer.setAnimationLoop(self.render.bind(self));
        },
        function(xhr) {

        }, 
        function(err) {
            console.log(err);
        });
    }

    resize() {
        this.camera.aspect = window.innerWidth/window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    render() {
        this.update();
        this.renderer.render(this.scene, this.camera);
    }

    update() {
        let dt = this.clock.getDelta();
        //this.gltf1.rotateY(0.01);
        //console.log(this.clock.getDelta());
        //this.gltf1.position.y = 5 * Math.sin(2 * this.clock.getElapsedTime());
        if (this.mixer) {
            //console.log("...");
            this.mixer.update(dt);
        }
    }

}

export { App }