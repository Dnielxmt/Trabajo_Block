// js/index.js

async function init() {
    const cuenta = await conectarWallet();
    const span = document.getElementById("cuenta");
    if (cuenta) {
        span.innerText = "Conectado como: " + cuenta;
    } else {
        span.innerText = "No conectado";
    }
}

function irA(pagina) {
    window.location.href = pagina;
}
