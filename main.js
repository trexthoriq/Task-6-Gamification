const canvas = document.getElementById("renderCanvas");
canvas.width = 300;
canvas.height = 300;

let groundReady = false;
let playerMesh;
let ground;
let gravity = -0.98; // Gaya gravitasi
let verticalSpeed = 0; // Kecepatan vertikal player

let score = 0;
let scoreText; // for GUI text

const engine = new BABYLON.Engine(canvas, true);

const createScene = function () {
    const scene = new BABYLON.Scene(engine);
    scene.gravity = new BABYLON.Vector3(0, gravity, 0);
    scene.collisionsEnabled = true;

    // GUI untuk tampilan skor
    const guiTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    scoreText = new BABYLON.GUI.TextBlock();
    scoreText.text = "Burung Camar: 0";
    scoreText.color = "white";
    scoreText.fontSize = 24;
    scoreText.top = "-45%";
    scoreText.left = "-45%";
    scoreText.left = "10px";
    scoreText.top = "10px";
    scoreText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    scoreText.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    scoreText.background = "#00000066"; // semi-transparent black
    scoreText.paddingLeft = "10px";
    scoreText.paddingTop = "5px";
    guiTexture.addControl(scoreText);

    // Kamera akan mengikuti mesh
    const followCam = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
    followCam.radius = 10;   // jarak dari player
    followCam.heightOffset = 5; // tinggi kamera
    followCam.rotationOffset = 0; // posisi depan player
    scene.activeCamera = followCam;
    followCam.attachControl(canvas, true);

    // Cahaya
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

    // Terrain
    ground = BABYLON.MeshBuilder.CreateGroundFromHeightMap("ground", "texture/heightMap.png", {
    width: 300,
    height: 300,
    subdivisions: 100,
    minHeight: 0,
    maxHeight: 5
}, scene, () => {
    const groundMaterial = new BABYLON.StandardMaterial("groundMat", scene);
    groundMaterial.diffuseColor = new BABYLON.Color3(0.93, 0.82, 0.55); // Soft sand color
    ground.material = groundMaterial;
    ground.checkCollisions = true;

    groundReady = true;
});

        function showMessage(text) {
        const ui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("msgUI");

        const msgBox = new BABYLON.GUI.TextBlock();
        msgBox.text = text;
        msgBox.color = "white";
        msgBox.fontSize = 30;
        msgBox.background = "rgba(0,0,0,0.7)";
        msgBox.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        msgBox.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        msgBox.paddingTop = "20px";
        msgBox.paddingBottom = "20px";
        ui.addControl(msgBox);

        setTimeout(() => {
            ui.removeControl(msgBox);
        }, 3000);
    }

    // Skybox
    const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 300 }, scene);
    const skyboxMaterial = new BABYLON.StandardMaterial("skyBoxMaterial", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.disableLighting = true;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("https://playground.babylonjs.com/textures/skybox4", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skybox.material = skyboxMaterial;

    // Air Laut
    const waterMesh = BABYLON.MeshBuilder.CreateGround("waterMesh", { width: 300, height: 300 }, scene);
    waterMesh.position.y = -0.05;
    const waterMaterial = new BABYLON.WaterMaterial("waterMaterial", scene);
    waterMaterial.bumpTexture = new BABYLON.Texture("assets/bump.png", scene);
    waterMaterial.windForce = -5;
    waterMaterial.waveHeight = 0.4;
    waterMaterial.bumpHeight = 0.1;
    waterMaterial.waveLength = 0.1;
    waterMaterial.colorBlendFactor = 0.3;
    waterMaterial.windDirection = new BABYLON.Vector2(1, 1);
    waterMaterial.waterColor = new BABYLON.Color3(0, 0.3, 0.6);
    waterMesh.material = waterMaterial;
    waterMaterial.addToRenderList(skybox);
    waterMaterial.addToRenderList(ground);

    // Pohon Kelapa
    const palmPositions = [
        new BABYLON.Vector3(Math.random() * 300  - 150, 1, Math.random() * 300 - 150),
        new BABYLON.Vector3(Math.random() * 300  - 150, 1, Math.random() * 300 - 150),
        new BABYLON.Vector3(Math.random() * 300  - 150, 1, Math.random() * 300 - 150),
        new BABYLON.Vector3(Math.random() * 300  - 150, 1, Math.random() * 300 - 150),
        new BABYLON.Vector3(Math.random() * 300  - 150, 1, Math.random() * 300 - 150),
        new BABYLON.Vector3(Math.random() * 300  - 150, 1, Math.random() * 300 - 150),
    ];
    palmPositions.forEach((pos) => {
        BABYLON.SceneLoader.ImportMesh("", "models/", "palm_tree.glb", scene, function (meshes) {
            const palm = meshes[0];
            palm.position = pos;
            palm.scaling = new BABYLON.Vector3(0.1, 0.1, 0.1);
        });
    });

    // Mesh Player
    // playerMesh = BABYLON.MeshBuilder.CreateSphere("player", { diameter: 2 }, scene);
    // playerMesh.position = new BABYLON.Vector3(0, 5, 0);
    // const playerMaterial = new BABYLON.StandardMaterial("playerMat", scene);
    // playerMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.8, 1);
    // playerMesh.material = playerMaterial;
    // playerMesh.checkCollisions = true;
    // playerMesh.applyGravity = true;
    

    // followCam.lockedTarget = playerMesh; // Kamera mengikuti player

    BABYLON.SceneLoader.ImportMesh("", "models/", "cat.glb", scene, function (meshes) {
        playerMesh = meshes[0];
        playerMesh.name = "player";
        playerMesh.position = new BABYLON.Vector3(0, 5, 0);
        playerMesh.scaling = new BABYLON.Vector3(0.1, 0.1, 0.1); // Adjust scale as needed
        playerMesh.checkCollisions = true;
        playerMesh.applyGravity = true;


        followCam.lockedTarget = playerMesh; // Kamera mengikuti player
    });


    // Input gerakan
    const inputMap = {};
    scene.actionManager = new BABYLON.ActionManager(scene);
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, evt => {
        inputMap[evt.sourceEvent.key] = true;
    }));
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, evt => {
        inputMap[evt.sourceEvent.key] = false;
    }));

    // Update movement
    scene.onBeforeRenderObservable.add(() => {
        let moveSpeed = 0.3;
        if (inputMap["s"] || inputMap["S"]) playerMesh.moveWithCollisions(playerMesh.forward.scale(moveSpeed));
        if (inputMap["w"] || inputMap["W"]) playerMesh.moveWithCollisions(playerMesh.forward.scale(-moveSpeed));
        if (inputMap["d"] || inputMap["D"]) playerMesh.moveWithCollisions(playerMesh.right.scale(-moveSpeed));
        if (inputMap["a"] || inputMap["A"]) playerMesh.moveWithCollisions(playerMesh.right.scale(moveSpeed));
    });

    

    const shellModels = ["shell.glb"]; // Daftar model kerang
    for (let i = 0; i < 30; i++) {
        const shellIndex = i % shellModels.length; // Pilih model secara bergantian
        const shellName = "shell" + i;
        BABYLON.SceneLoader.ImportMesh("", "models/", shellModels[shellIndex], scene, function (meshes) {
            const shell = meshes[0];
            shell.name = shellName;
            shell.position = new BABYLON.Vector3(Math.random() * 100  - 50, 2, Math.random() * 100 - 50);
            shell.scaling = new BABYLON.Vector3(0.03, 0.03, 0.03); // Sesuaikan skala
            shell.isPickable = true;
        });
    }

    const rockModels = ['rock.glb'];
    for (let i = 0; i < 5; i++) {
        const rockIndex = i % rockModels.length; // Pilih model secara bergantian
        const rockName = "rock" + i;
        BABYLON.SceneLoader.ImportMesh("", "models/", rockModels[rockIndex], scene, function (meshes) {
            const rock = meshes[0];
            rock.name = rockName;
            rock.position = new BABYLON.Vector3(Math.random() * 100 - 50 , 1, Math.random() * 100 - 50);
            rock.scaling = new BABYLON.Vector3(2, 2, 2); // Sesuaikan skala
            rock.isPickable = true;
        });
    }

        // Koleksi Burung Camar
    const birds = [];
    const numBirds = 30; // Jumlah total burung camar
    const birdSpeed = 0.03; // Kecepatan burung camar
    const worldSize = 140; // Ukuran dunia tempat burung camar terbang

    // Fungsi untuk memuat dan menempatkan burung camar
    const createBird = (index) => {
        const birdName = "bird" + index;

        BABYLON.SceneLoader.ImportMesh("", "models/", 'flying_seagull.glb', scene, function (meshes) {
            const bird = meshes[0]; // Ambil mesh pertama dari hasil import
            bird.name = birdName;

            // Inisialisasi posisi, arah, dan kecepatan burung camar
            bird.position = new BABYLON.Vector3(Math.random() * 2 * worldSize - worldSize, 4, Math.random() * 2 * worldSize - worldSize);
            bird.direction = new BABYLON.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize(); // Arah acak
            bird.speed = birdSpeed; // Kecepatan konstan
            bird.scaling = new BABYLON.Vector3(3, 3, 3); // Sesuaikan skala
            bird.isPickable = true;

            // Pastikan semua mesh di dalam mesh yang diimpor dapat dipilih
            meshes.forEach(mesh => {
                mesh.isPickable = true;
            });

            birds.push(bird);
        });
    };

    // Buat semua burung camar
    for (let i = 0; i < numBirds; i++) {
        createBird(i);
    }

    // Update posisi burung camar
    scene.onBeforeRenderObservable.add(() => {
        for (let i = 0; i < birds.length; i++) {
            const bird = birds[i];

            // Perbarui posisi berdasarkan arah dan kecepatan
            bird.position.addInPlace(bird.direction.scale(bird.speed));

            // Pantulkan burung camar di batas dunia
            if (bird.position.x > worldSize) {
                bird.direction.x = -Math.abs(bird.direction.x);
            }
            if (bird.position.x < -worldSize) {
                bird.direction.x = Math.abs(bird.direction.x);
            }
            if (bird.position.z > worldSize) {
                bird.direction.z = -Math.abs(bird.direction.z);
            }
            if (bird.position.z < -worldSize) {
                bird.direction.z = Math.abs(bird.direction.z);
            }

            // Jaga agar burung camar tetap di atas tanah
            if (bird.position.y < 4) {
                bird.position.y = 4;
            }
        }
    });

    // Interaksi Klik dengan toleransi radius pilih
    scene.onPointerObservable.add((pointerInfo) => {
        if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERPICK) {
            const pickInfo = pointerInfo.pickInfo;

            if (!pickInfo || !pickInfo.ray || !pickInfo.pickedPoint) {
                console.log("Pointer pick event missing pickInfo or pickedPoint");
                return;
            }

            const pickedMesh = pickInfo.pickedMesh;
            const pickedPoint = pickInfo.pickedPoint;

            // Toleransi jarak dalam satuan dunia untuk menganggap klik tentang burung camar
            const CLICK_TOLERANCE = 1.5;

            // Mencari burung camar terdekat dari titik pickedPoint dalam radius toleransi
            let closestBird = null;
            let minDistance = Number.MAX_VALUE;
            for (const bird of birds) {
                if (!bird.position) continue;
                const distance = BABYLON.Vector3.Distance(bird.position, pickedPoint);
                if (distance < CLICK_TOLERANCE && distance < minDistance) {
                    minDistance = distance;
                    closestBird = bird;
                }
            }

            if (closestBird) {
                console.log(`Picked bird by proximity: ${closestBird.name}, distance: ${minDistance.toFixed(2)}`);

                // Buang burung camar yang dipilih
                closestBird.dispose();
                const index = birds.indexOf(closestBird);
                if (index > -1) birds.splice(index, 1);

                // Tingkatkan skor dan perbarui tampilan
                score++;
                scoreText.text = "Burung Camar Collected: " + score;

                // Tampilkan pesan jika skor mencapai ambang batas
                if (score >= 10) {
                    showMessage("You Have Collected 10!");
                }
                return;
            }

            // Fallback ke cek mesh yang dipilih langsung (mesin atau parent)
            if (pickedMesh) {
                let bird = null;
                if (birds.includes(pickedMesh)) {
                    bird = pickedMesh;
                } else if (pickedMesh.parent && birds.includes(pickedMesh.parent)) {
                    bird = pickedMesh.parent;
                }
                if (bird) {
                    console.log("Picked bird mesh:", bird.name);
                    bird.dispose();
                    const index = birds.indexOf(bird);
                    if (index > -1) birds.splice(index, 1);

                    score++;
                    scoreText.text = "Burung Camar: " + score;
                    if (score >= 3) {
                        showMessage("Zona Baru Terbuka!");
                    }
                    return;
                } else {
                    console.log("Picked non-bird mesh:", pickedMesh.name);
                }
            } else {
                console.log("No mesh picked on pointer event");
            }
        }
    });

    return scene;
};

const scene = createScene();

engine.runRenderLoop(() => {
    scene.render();
});

window.addEventListener("resize", () => {
    engine.resize();
});
