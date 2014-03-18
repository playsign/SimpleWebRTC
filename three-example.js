"use strict";
/* jslint browser: true, globalstrict: true, devel: true, debug: true */
/* global THREE, _ */
/* global mozRTCPeerConnection, webkitRTCPeerConnection */

var ThreeRtcExample = {};

ThreeRtcExample.setupThree = function (video) {
    var scene, camera, renderer;
    
    var updatingVideo = !!this.domVideoElement;
    this.domVideoElement = video;
    if (updatingVideo)
        return;
    this.scene = scene = new THREE.Scene();
    this.camera = camera = new THREE.PerspectiveCamera(45, 4 / 3.0, 0.1, 1e5);
    this.renderer = renderer = new THREE.WebGLRenderer();
    renderer.setSize(1000, 500);
    document.querySelector("body").appendChild(renderer.domElement);
    var light = new THREE.PointLight(0xffffff);
    light.position.set(0, 250, 0);
    scene.add(light);
    this.videoCanvas = document.createElement('canvas');
    this.videoCanvas.width = 800;
    this.videoCanvas.height = 400;
    this.videoCanvasContext = this.videoCanvas.getContext("2d");
    var videoTexture = new THREE.Texture(this.videoCanvas);
    videoTexture.minFilter = THREE.LinearFilter;
    this.videoTexture = videoTexture;
    var movieScreenMaterial = new THREE.MeshBasicMaterial({map: videoTexture, overdraw: true, side: THREE.DoubleSide});
    var movieScreenGeom = new THREE.PlaneGeometry(240, 100, 4, 4);
    var movieScreenMesh = new THREE.Mesh(movieScreenGeom, movieScreenMaterial);
    this.movieScreenMesh = movieScreenMesh;
    movieScreenMesh.position.set(0, 50, 0);
    scene.add(movieScreenMesh);
    camera.position.set(0, 150, 300);
    camera.lookAt(movieScreenMesh.position);
    console.log("three scene setup done");
};

ThreeRtcExample.render = function () {
    var video = this.domVideoElement;
    if (!video) {
        console.log("render: waiting for video");
        return;
    }
    var canvasContext = this.videoCanvasContext;
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvasContext.drawImage(video, 0, 0/*, video.width, video.height*/);
        //canvasContext.drawImage(video, 0, 0, video.width, video.height);
        var tex = this.videoTexture;
        if (tex) {
            tex.needsUpdate = true;
            console.log("video texture updated");
        }
    } else
        console.log("video not ready");
    this.renderer.render(this.scene, this.camera);
};

var lastRenderTime = 0;
ThreeRtcExample.update = function () {
    this.render();
    var now = Date.now();
    var elapsed = now - lastRenderTime;
    var prevRot = this.movieScreenMesh.rotation.z;
    var newRot = (prevRot + elapsed / 10000) % 180;
    this.movieScreenMesh.rotation.z = newRot;
    lastRenderTime = now;
    var targetInterval = 1000 / 30.0;
    var remaining = targetInterval - elapsed;
    remaining -= 0.5;
    if (remaining < 0)
        remaining = 0;
    window.setTimeout(this.update.bind(this), remaining);
};
