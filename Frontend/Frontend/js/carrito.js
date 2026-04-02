// js/carrito.js

let carrito = [];
const ETH_A_EURO = 0.0003;

// ---------- Agregar al carrito ----------
function agregarAlCarrito(producto) {
    const index = carrito.findIndex(p => p.id === producto.id);
    if (index >= 0) {
        if (carrito[index].cantidad + producto.cantidad <= producto.stock) {
            carrito[index].cantidad += producto.cantidad;
        } else {
            carrito[index].cantidad = producto.stock;
            alert("❌ Se ha limitado la cantidad al stock disponible");
        }
    } else {
        carrito.push({ ...producto });
    }
    mostrarCarrito();
}

// ---------- Quitar del carrito ----------
function quitarDelCarrito(id) {
    carrito = carrito.filter(p => p.id !== id);
    mostrarCarrito();
}

// ---------- Vaciar carrito ----------
function vaciarCarrito() {
    if (carrito.length === 0) {
        alert("⚠️ El carrito ya está vacío");
        return;
    }
    carrito = [];
    mostrarCarrito();
    alert("🗑️ Carrito vaciado correctamente");
}

// ---------- Mostrar carrito ----------
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

    // Tabla para productos
    const tabla = document.createElement("table");
    tabla.style.width = "100%";
    tabla.style.borderCollapse = "collapse";
    tabla.innerHTML = `
        <thead>
            <tr>
                <th style="text-align:left; border-bottom:1px solid #ddd;">Producto</th>
                <th style="text-align:right; border-bottom:1px solid #ddd;">Cantidad</th>
                <th style="text-align:right; border-bottom:1px solid #ddd;">Precio c/u (wei)</th>
                <th style="text-align:right; border-bottom:1px solid #ddd;">Subtotal (wei)</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    const tbody = tabla.querySelector("tbody");

    let totalWei = 0n;

    carrito.forEach(p => {
        const subtotal = p.precio * BigInt(p.cantidad);
        totalWei += subtotal;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${p.nombre}</td>
            <td style="text-align:right;">${p.cantidad}</td>
            <td style="text-align:right;">${p.precio}</td>
            <td style="text-align:right;">${subtotal}</td>
        `;
        tbody.appendChild(tr);
    });

    container.appendChild(tabla);

    // Totales
    const totalesDiv = document.createElement("div");
    totalesDiv.style.marginTop = "10px";
    const totalEuros = Number(totalWei) * ETH_A_EURO;
    totalesDiv.innerHTML = `
        <p><strong>Total en wei:</strong> ${totalWei}</p>
        <p><strong>Total aproximado en €:</strong> ${totalEuros.toFixed(2)} €</p>
    `;
    container.appendChild(totalesDiv);
}

// ---------- Confirmar pedido ----------
document.getElementById("confirmar-pedido").addEventListener("click", async () => {
    if (carrito.length === 0) {
        alert("⚠️ Carrito vacío, no se puede confirmar pedido");
        return;
    }

    const ids = carrito.map(p => p.id);
    const cantidades = carrito.map(p => BigInt(p.cantidad));

    console.log("✅ Pedido a crear:", { proveedor: proveedorSeleccionado, ids, cantidades });

    alert(`🎉 Pedido creado con éxito con ${carrito.length} productos`);

    carrito = [];
    mostrarCarrito();
});

// ---------- Vaciar carrito ----------
document.getElementById("vaciar-carrito").addEventListener("click", () => {
    vaciarCarrito();
});
