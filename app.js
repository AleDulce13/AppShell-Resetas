const API_URL = 'https://api-resetas-s4qf.onrender.com/api/recetas';

const contenedor = document.querySelector('#recetas');
const offline = document.querySelector('#offline');

window.addEventListener('load', () => {
    registerWS();
    cargarRecetas();
    actualizarEstado();
});

window.addEventListener('online', actualizarEstado);
window.addEventListener('offline', actualizarEstado);

function actualizarEstado() {
    if (navigator.onLine) {
        offline.classList.remove('visible');
    } else {
        offline.classList.add('visible');
    }
}

async function cargarRecetas() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        let html = '';
        data.forEach(receta => {
            html += `
                <div class="card">
                    <h2>${receta.nombre}</h2>

                    <div class="tiempo"> ${receta.tiempo}</div>
                    <div><b>Ingredientes:</b> ${receta.ingredientes}</div>
                </div>
            `;
        });
        contenedor.innerHTML = html;
    } catch (e) {
        contenedor.innerHTML = '<div class="card">No se pudieron cargar las recetas.</div>';
    }
}

async function registerWS() {
    if ('serviceWorker' in navigator) {
        try {
            await navigator.serviceWorker.register('./sw.js');
        } catch (e) {
            console.log('Falla en el registro del service worker');
        }
    }
}