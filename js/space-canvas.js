/**
 * Space Starfield & 3D Perspective Matrix Grid
 * No glow effects - crisp, clean, professional engineering aesthetics
 */
(function() {
    const canvas = document.getElementById('space-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const STAR_COUNT = 240;
    const STAR_SPEED = 0.5;
    const FOV = 360;

    let targetCameraX = 0;
    let targetCameraY = 0;
    let cameraX = 0;
    let cameraY = 0;

    // 3D Perspective Grid parameters
    let gridOffsetZ = 0;
    const GRID_SPEED = 1.2;
    const GRID_SPACING = 70;
    const GRID_DEPTH = 1800;

    class Star {
        constructor() {
            this.reset(true);
        }

        reset(initial = false) {
            this.x = (Math.random() - 0.5) * width * 2.5;
            this.y = (Math.random() - 0.5) * height * 2.5;
            this.z = initial ? Math.random() * 1200 + 40 : 1200;
            this.size = Math.random() * 1.2 + 0.5;
            this.alpha = Math.random() * 0.6 + 0.3;
        }

        update() {
            this.z -= STAR_SPEED;
            if (this.z <= 10) {
                this.reset(false);
            }
        }

        draw(camX, camY) {
            const factor = FOV / this.z;
            const screenX = (this.x - camX) * factor + width / 2;
            const screenY = (this.y - camY) * factor + height / 2;

            if (screenX < -10 || screenX > width + 10 || screenY < -10 || screenY > height + 10) {
                return;
            }

            const fade = Math.min(1, (1200 - this.z) / 350) * this.alpha;

            // Crisp pin-point star without blur or glow
            ctx.fillStyle = `rgba(226, 232, 240, ${fade})`;
            ctx.fillRect(Math.floor(screenX), Math.floor(screenY), Math.max(1, Math.floor(this.size * factor)), Math.max(1, Math.floor(this.size * factor)));
        }
    }

    const stars = Array.from({ length: STAR_COUNT }, () => new Star());

    function onResize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', onResize);

    window.addEventListener('mousemove', (e) => {
        const normX = (e.clientX / width - 0.5) * 2;
        const normY = (e.clientY / height - 0.5) * 2;
        targetCameraX = normX * 45;
        targetCameraY = normY * 30;
    });

    /**
     * Draw moving 3D perspective floor & ceiling square grids
     * Clean 1px lines, no diffuse glow
     */
    function draw3DGrid(camX, camY) {
        gridOffsetZ = (gridOffsetZ + GRID_SPEED) % GRID_SPACING;

        const horizonY = height * 0.55 + camY * 0.4;
        const vanishX = width / 2 + camX * 0.4;

        ctx.lineWidth = 1;

        // Ground Grid Lines
        const groundY = 280; // Distance below horizon in 3D units
        const gridCols = 24;
        const colSpacing = 110;

        // 1. Longitudinal lines receding into horizon
        for (let col = -gridCols / 2; col <= gridCols / 2; col++) {
            const worldX = col * colSpacing;
            
            // Near point (z = 80)
            const nearZ = 80;
            const nearFactor = FOV / nearZ;
            const nearScreenX = (worldX - camX * 0.3) * nearFactor + vanishX;
            const nearScreenY = groundY * nearFactor + horizonY;

            // Far point (z = GRID_DEPTH)
            const farZ = GRID_DEPTH;
            const farFactor = FOV / farZ;
            const farScreenX = (worldX - camX * 0.3) * farFactor + vanishX;
            const farScreenY = groundY * farFactor + horizonY;

            // Calculate opacity based on distance from center
            const distRatio = 1 - Math.abs(col) / (gridCols / 2);
            const lineAlpha = Math.max(0.02, distRatio * 0.14);

            ctx.strokeStyle = `rgba(99, 102, 241, ${lineAlpha})`;
            ctx.beginPath();
            ctx.moveTo(nearScreenX, nearScreenY);
            ctx.lineTo(farScreenX, farScreenY);
            ctx.stroke();
        }

        // 2. Transverse horizontal lines moving forward along Z
        const zStep = GRID_SPACING;
        for (let z = zStep - gridOffsetZ; z < GRID_DEPTH; z += zStep) {
            const factor = FOV / z;
            const screenY = groundY * factor + horizonY;

            if (screenY > height + 20 || screenY < horizonY) continue;

            const halfWidth3D = (gridCols / 2) * colSpacing;
            const leftX = (-halfWidth3D - camX * 0.3) * factor + vanishX;
            const rightX = (halfWidth3D - camX * 0.3) * factor + vanishX;

            // Fade out as lines approach horizon or far depth
            const depthFade = Math.min(1, z / 200) * Math.max(0, 1 - (z / GRID_DEPTH));
            const lineAlpha = depthFade * 0.16;

            ctx.strokeStyle = `rgba(99, 102, 241, ${lineAlpha})`;
            ctx.beginPath();
            ctx.moveTo(leftX, screenY);
            ctx.lineTo(rightX, screenY);
            ctx.stroke();
        }
    }

    let animationFrameId;

    function render() {
        cameraX += (targetCameraX - cameraX) * 0.05;
        cameraY += (targetCameraY - cameraY) * 0.05;

        // Crisp dark background fill
        ctx.fillStyle = '#07080d';
        ctx.fillRect(0, 0, width, height);

        // Draw 3D moving square perspective grid
        draw3DGrid(cameraX, cameraY);

        // Draw stars
        for (let i = 0; i < stars.length; i++) {
            stars[i].update();
            stars[i].draw(cameraX, cameraY);
        }

        animationFrameId = requestAnimationFrame(render);
    }

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animationFrameId);
        } else {
            animationFrameId = requestAnimationFrame(render);
        }
    });

    render();
})();
