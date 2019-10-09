window.onload = function () {
    const app = new Vue({
        el: '#vue',
        data: {
            message: 'hello!Vue',
            xrSettion: null,
            environmentBlendMode: null,
            renderState: null,
            viewerSpace: null,

            canvas: null,
            ctx: null,
            xrRefSpace: null,

            count: 0,
        },
        created() {
        },
        mounted() {
            // ARコンテンツがサポートされているか確認
            navigator.xr.supportsSession('immersive-ar').then(() => {
                this.message = 'immersive-ar supported';
                const enterXrBtn = document.createElement("button");
                enterXrBtn.innerHTML = "Enter AR";
                enterXrBtn.addEventListener("click", this.beginXRSession);
                document.body.appendChild(enterXrBtn);
            });
        },
        methods: {
            // XRSessionの開始
            beginXRSession() {
                this.message = 'beginXRSession';

                // XRSession取得
                navigator.xr.requestSession("inline").then((session) => {
                    session.mode = 'inline';
                    this.xrSession = session;
                    this.xrSession.addEventListener('end', this.xrSession = null);
                    try {
                        layer = new XRWebGLLayer(this.xrSession, gl);
                    } catch(e) {
                        this.message = e;
                    }

                    this.message = 'got XRSession';
                    // 領域データの取得
                    this.xrSession.requestReferenceSpace('local').then((refSpace) => {
                        this.xrRefSpace = refSpace;
                        this.message = 'got xrRefSpace';
                    }).then(setupWebGLLayer)
                    .then(() => {
                        // Start the render loop
                        try {
                            this.message = 'called requestAnimationFrame';
                            // xrSessionのrequestAnimationFrameにコールバック関数投げても動かエラーもはかない
                            // 普通のrequestAnimationFrameに投げればちゃんと動く
                            this.xrSession.requestAnimationFrame(onDrawFrame);
                        } catch(e) {
                            this.message = e;
                        }
                    });
                });

                // webGレイヤーをXRSessioにセット
                const setupWebGLLayer = () => {
                    // Make sure the canvas context we want to use is compatible with the current xr device.
                    return gl.makeXRCompatible().then(() => {
                        // The content that will be shown on the device is defined by the session's
                        // baseLayer.
                        try {
                            this.xrSession.updateRenderState({ baseLayer: layer });
                            this.message = 'setup WebGLLayer';
                        } catch(e) {
                            this.message = e;
                        }
                    });
                }

                // 描画ループ
                const onDrawFrame = (timestamp, xrFrame) => {
                    const test = document.getElementById('test');
                    test.innerHTML = 'onDrawFrame worked!';
                    // this.message = timestamp;
                    this.count++;
                    // Do we have an active session?
                    if (this.xrSession) {
                        let glLayer = this.xrSession.renderState.baseLayer;
                        let pose = xrFrame.getViewerPose(this.xrReferenceSpace);
                        if (pose) {
                            // Run imaginary 3D engine's simulation to step forward physics, animations, etc.
                            scene.updateScene(timestamp, xrFrame);

                            gl.bindFramebuffer(gl.FRAMEBUFFER, glLayer.framebuffer);

                            for (let view of pose.views) {
                                let viewport = glLayer.getViewport(view);
                                gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);
                                drawScene(view);
                            }
                        }
                        // Request the next animation callback
                        this.xrSession.requestAnimationFrame(onDrawFrame);
                    } else {
                        // No session available, so render a default mono view.
                        gl.viewport(0, 0, glCanvas.width, glCanvas.height);
                        drawScene();

                        // Request the next window callback
                        window.requestAnimationFrame(onDrawFrame);
                    }
                }

                const drawScene = (view) => {
                    let viewMatrix = null;
                    let projectionMatrix = null;
                    if (view) {
                        viewMatrix = view.transform.inverse.matrix;
                        projectionMatrix = view.projectionMatrix;
                    } else {
                        viewMatrix = defaultViewMatrix;
                        projectionMatrix = defaultProjectionMatrix;
                    }

                    // Set uniforms as appropriate for shaders being used

                    // Draw Scene
                }
            },
        }
    });        }
};
