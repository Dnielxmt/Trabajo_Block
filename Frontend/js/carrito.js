// js/carrito.js

let carrito = [];

function agregarAlCarrito(producto) {
    const index = carrito.findIndex(p => p.id === producto.id);
    if (index >= 0) {
        carrito[index].cantidad++;
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }
    mostrarCarrito();
}

function quitarDelCarrito(id) {
    carrito = carrito.filter(p => p.id !== id);
    mostrarCarrito();
}

function vaciarCarrito() {
    if (carrito.length === 0) {
        alert("⚠️ El carrito ya está vacío");
        return;
    }
    carrito = [];
    mostrarCarrito();
    alert("🗑️ Carrito vaciado correctamente");
}

function mostrarCarrito() {
    const container = document.getElementById("carrito-container");
    container.innerHTML = "";

    const btnConfirmar = document.getElementById("confirmar-pedido");
    const btnVaciar = document.getElementById("vaciar-carrito");

    if (carrito.length === 0) {
        container.innerHTML = "<p>Carrito vacío</p>";
        btnConfirmar.disabled = true;
        btnVaciar.disabled = true;
        return;
    }

    btnConfirmar.disabled = false;
    btnVaciar.disabled = false;

    carrito.forEach(p => {
        const div = document.createElement("div");
        div.className = "carrito-item";
        div.innerHTML = `
            ${p.nombre} x ${p.cantidad} - ${p.precio} wei c/u
            <button onclick="quitarDelCarrito(${p.id})">❌ Quitar</button>
        `;
        container.appendChild(div);
    });
}

// Confirmar pedido (simulado con console.log y alert)
document.getElementById("confirmar-pedido").addEventListener("click", async () => {
    if (carrito.length === 0) {
        alert("⚠️ Carrito vacío, no se puede confirmar pedido");
        return;
    }

    // Preparar datos
    const ids = carrito.map(p => p.id);
    const cantidades = carrito.map(p => p.cantidad);

    console.log("✅ Pedido a crear:", { proveedor: proveedorSeleccionado, ids, cantidades });

    // Aviso de éxito simulado
    alert(`🎉 Pedido creado con éxito con ${carrito.length} productos`);

    // Vaciar carrito tras confirmar
    carrito = [];
    mostrarCarrito();
});

// Vaciar carrito
document.getElementById("vaciar-carrito").addEventListener("click", () => {
    if (carrito.length === 0) {
        alert("⚠️ El carrito ya está vacío");
        return;
    }
    carrito = [];
    mostrarCarrito();
    alert("🗑️ Carrito vaciado correctamente");
});
