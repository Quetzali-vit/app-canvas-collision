const canvas = document.getElementById("canvas");
const collisionSound = new Audio('campana.mp3');  // Asegúrate de que el archivo esté en la ruta correcta

let ctx = canvas.getContext("2d");

// Se define el tamaño del lienzo (canvas)
canvas.width = 550;
canvas.height = 550;

// Función para generar un color RGB aleatorio.
function getRandomColor() {
    return `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;
}

// Clase para representar un círculo en el lienzo.
// Los círculos tienen posición, radio, velocidad, y color.
class Circle {
    constructor(x, y, radius, speed) {
        this.radius = radius;   // Radio del círculo
        this.posX = x;          // Posición X en el lienzo
        this.posY = y;          // Posición Y en el lienzo
        this.color = getRandomColor();  // Color aleatorio
        this.speed = speed;     // Velocidad del círculo

        // Velocidades en X y Y aleatorias, multiplicadas por un signo aleatorio
        this.dx = (Math.random() > 0.5 ? 0.7 : -0.7) * this.speed;
        this.dy = (Math.random() > 0.5 ? 0.7 : -0.7) * this.speed;
    }

    // Dibuja el círculo en el lienzo.
    draw() {
        ctx.beginPath();
        ctx.fillStyle = this.color;  // Color de relleno
        ctx.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2);  // Dibuja el círculo
        ctx.fill();  // Aplica el relleno
        ctx.closePath();  // Cierra el camino de dibujo
    }

    // Actualiza la posición del círculo y maneja los límites de colisión con los bordes del lienzo.
    update() {
        this.posX += this.dx;
        this.posY += this.dy;

        // Previene que el círculo se salga de los límites del lienzo
        if (this.posX + this.radius >= canvas.width) {
            this.posX = canvas.width - this.radius;
            this.dx = -this.dx;  // Invertir la dirección en X
        }
        if (this.posX - this.radius <= 0) {
            this.posX = this.radius;
            this.dx = -this.dx;  // Invertir la dirección en X
        }
        if (this.posY + this.radius >= canvas.height) {
            this.posY = canvas.height - this.radius;
            this.dy = -this.dy;  // Invertir la dirección en Y
        }
        if (this.posY - this.radius <= 0) {
            this.posY = this.radius;
            this.dy = -this.dy;  // Invertir la dirección en Y
        }
    }
}

function resolveCollision(circle1, circle2) {
    // Calcula la distancia entre los centros de los dos círculos
    let dx = circle2.posX - circle1.posX;
    let dy = circle2.posY - circle1.posY;
    let distance = Math.sqrt(dx * dx + dy * dy);

    // Si los círculos se solapan (es decir, la distancia es menor que la suma de sus radios)
    if (distance < circle1.radius + circle2.radius) {
        // Reinicia el sonido antes de reproducirlo nuevamente
        collisionSound.currentTime = 0;  // Reinicia el tiempo del sonido
        collisionSound.play();  // Reproduce el sonido de la colisión

        // Resto de la lógica de la colisión...
        let angle = Math.atan2(dy, dx);

        // Calcula la velocidad (módulo de la velocidad) de ambos círculos
        let speed1 = Math.sqrt(circle1.dx * circle1.dx + circle1.dy * circle1.dy);
        let speed2 = Math.sqrt(circle2.dx * circle2.dx + circle2.dy * circle2.dy);

        // Calcula las direcciones de los dos círculos (ángulos de movimiento)
        let dir1 = Math.atan2(circle1.dy, circle1.dx);
        let dir2 = Math.atan2(circle2.dy, circle2.dx);

        // Ajusta las velocidades de los círculos después de la colisión
        circle1.dx = speed2 * Math.cos(dir2);
        circle1.dy = speed2 * Math.sin(dir2);
        circle2.dx = speed1 * Math.cos(dir1);
        circle2.dy = speed1 * Math.sin(dir1);

        // Ajusta las posiciones de los círculos para evitar que se solapen
        let overlap = (circle1.radius + circle2.radius - distance) / 2;
        circle1.posX -= Math.cos(angle) * overlap;
        circle1.posY -= Math.sin(angle) * overlap;
        circle2.posX += Math.cos(angle) * overlap;
        circle2.posY += Math.sin(angle) * overlap;

        // Cambia los colores de los círculos después de la colisión
        circle1.color = getRandomColor();
        circle2.color = getRandomColor();
    }
}

/** Función para generar círculos con posiciones aleatorias en el lienzo.
    Los círculos no deben solaparse entre sí. */
function generateCircles(numCircles) {
    let circles = [];  // Arreglo para almacenar los círculos generados
    for (let i = 0; i < numCircles; i++) {
        // Genera un radio aleatorio para el círculo entre 20 y 50
        let radius = Math.floor(Math.random() * 30) + 20;

        let x, y;
        let validPosition = false;

        // Asegura que no haya solapamiento entre los círculos generados
        while (!validPosition) {
            // Calcula una posición aleatoria para el círculo dentro del canvas, sin exceder los límites
            x = Math.random() * (canvas.width - 2 * radius) + radius;
            y = Math.random() * (canvas.height - 2 * radius) + radius;

            // Verifica si el nuevo círculo se solapa con alguno de los círculos existentes
            validPosition = circles.every(circle => {
                let dx = circle.posX - x;  // Distancia en el eje X
                let dy = circle.posY - y;  // Distancia en el eje Y
                // Si la distancia entre los centros es mayor que la suma de los radios, no hay solapamiento
                return Math.sqrt(dx * dx + dy * dy) > circle.radius + radius;
            });
        }
        // Crea un nuevo círculo con la posición (x, y), el radio generado, y una velocidad aleatoria entre 1 y 3
        circles.push(new Circle(x, y, radius, Math.random() * 2 + 1));
    }
    return circles;  // Devuelve el arreglo de círculos generados
}

let circles = generateCircles(5);  // Genera 10 círculos inicialmente

// Función que actualiza el estado de todos los círculos y redibuja el lienzo.
// También verifica las colisiones entre los círculos.
function updateCircles() {
    requestAnimationFrame(updateCircles);  // Llama a la función nuevamente para crear una animación continua

    ctx.fillStyle = "rgba(186, 224, 194, 0.21)";  // Color de fondo del lienzo
    ctx.fillRect(0, 0, canvas.width, canvas.height);  // Redibuja el fondo

    // Actualiza y dibuja cada círculo
    for (let i = 0; i < circles.length; i++) {
        circles[i].update();
        circles[i].draw();
    }

    // Detecta colisiones entre círculos
    for (let i = 0; i < circles.length; i++) {
        for (let j = i + 1; j < circles.length; j++) { resolveCollision(circles[i], circles[j]);
        }
    }
}

// Función para actualizar el número de círculos generados en el lienzo.
// Se obtiene el valor del input con id "circleCount".
function updateCircleCount() {
    let circleCount = parseInt(document.getElementById("circleCount").value);
    if (circleCount >= 2 && circleCount <= 20) { circles = generateCircles(circleCount);  // Genera los círculos con el nuevo número
    } else {
        alert("Por favor, ingresa un número entre el 2 y 20.");
    }
}

// Inicia la animación
updateCircles();
