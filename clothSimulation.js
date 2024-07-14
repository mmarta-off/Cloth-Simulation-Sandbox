document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('clothCanvas');
    const ctx = canvas.getContext('2d');
    const width = 800;
    const height = 600;
    canvas.width = width;
    canvas.height = height;

    const clothY = 20;
    const clothX = 20;
    const spacing = 30;
    const points = [];
    let draggingPoint = null;

    function Point(x, y, pin) {
        this.x = x;
        this.y = y;
        this.px = x;
        this.py = y;
        this.vx = 0;
        this.vy = 0;
        this.pin = pin;
    }

    Point.prototype.update = function() {
        if (!this.pin) {
            const nx = this.x + (this.x - this.px) * 0.99 + this.vx;
            const ny = this.y + (this.y - this.py) * 0.99 + this.vy;
            this.px = this.x;
            this.py = this.y;
            this.x = nx;
            this.y = ny;
            this.vx *= 0.99;
            this.vy *= 0.99;
        }
    };

    Point.prototype.draw = function() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, 2 * Math.PI);
        ctx.fill();
    };

    function constrainPoints() {
        for (let y = 0; y < clothY; y++) {
            for (let x = 0; x < clothX; x++) {
                const pointIndex = y * clothX + x;
                const point = points[pointIndex];

                if (x !== 0) {
                    const left = points[pointIndex - 1];
                    constrain(point, left);
                }

                if (y !== 0) {
                    const above = points[pointIndex - clothX];
                    constrain(point, above);
                }
            }
        }
    }

    function constrain(p1, p2) {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const difference = spacing - distance;
        const percent = difference / distance / 2;
        const offsetX = dx * percent;
        const offsetY = dy * percent;

        if (!p1.pin) {
            p1.x += offsetX;
            p1.y += offsetY;
        }
        if (!p2.pin) {
            p2.x -= offsetX;
            p2.y -= offsetY;
        }
    }

    function drawCloth() {
        ctx.strokeStyle = 'white';
        for (let y = 0; y < clothY - 1; y++) {
            for (let x = 0; x < clothX - 1; x++) {
                const pointIndex = y * clothX + x;
                const point = points[pointIndex];
                const right = points[pointIndex + 1];
                const below = points[pointIndex + clothX];

                ctx.beginPath();
                ctx.moveTo(point.x, point.y);
                ctx.lineTo(right.x, right.y);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(point.x, point.y);
                ctx.lineTo(below.x, below.y);
                ctx.stroke();
            }
        }
    }

    function setupCloth() {
        const offsetX = width / 2 - (clothX * spacing) / 2;
        const offsetY = height / 2 - (clothY * spacing) / 2;
        for (let y = 0; y < clothY; y++) {
            for (let x = 0; x < clothX; x++) {
                const pin = y === 0 && (x % 2 === 0); // Pin every other point on the top row
                points.push(new Point(offsetX + x * spacing, offsetY + y * spacing, pin));
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        points.forEach(point => {
            point.update();
        });
        constrainPoints();
        drawCloth();
        points.forEach(point => {
            point.draw();
        });
        requestAnimationFrame(animate);
    }

    setupCloth();
    animate();

    canvas.addEventListener('mousedown', function(e) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        points.forEach(point => {
            if (Math.sqrt((point.x - mouseX) ** 2 + (point.y - mouseY) ** 2) < 10) {
                draggingPoint = point;
            }
        });
    });

    canvas.addEventListener('mouseup', function() {
        draggingPoint = null;
    });

    canvas.addEventListener('mousemove', function(e) {
        if (draggingPoint) {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            draggingPoint.x = mouseX;
            draggingPoint.y = mouseY;
            draggingPoint.px = mouseX;
            draggingPoint.py = mouseY;
        }
    });
});
