// js/productos_global.js
let carrito = [];
const WEI_A_EURO = 1; // Ajusta según el precio del ether. 1 wei ≈ 2e-6 € aprox


// ---------- Conexión ----------
async function conectarYCargar() {
    await conectar(); // función de web3.js que inicializa provider, signer y contrato
    await cargarProductosGlobales();
}

// ---------- Cargar productos activos ----------
async function cargarProductosGlobales() {
    const productos = await contrato.obtenerProductosActivos();
    const contenedor = document.getElementById("productos");
    contenedor.innerHTML = "";

    productos.forEach(p => {
        const stock = BigInt(p.stockDisponible);
        const precio = BigInt(p.precio);

        const tarjeta = document.createElement("div");
        tarjeta.className = "producto-tarjeta";

        tarjeta.innerHTML = `
            <h3>${p.nombre}</h3>
            <p>${p.descripcion}</p>
            <p>Proveedor: ${p.proveedor}</p>
            <p>Precio: ${precio.toString()} wei</p>
            <p>Stock: ${stock.toString()}</p>
            <div>
                <input type="number" min="1" max="${stock}" value="1" style="width:50px" data-id="${p.id}" data-proveedor="${p.proveedor}" class="cantidad-input">
                <button ${stock === 0n ? "disabled" : ""} 
                        data-id="${p.id}" 
                        data-nombre="${p.nombre}" 
                        data-precio="${precio}" 
                        data-stock="${stock}" 
                        data-proveedor="${p.proveedor}">
                    Añadir al carrito
                </button>
            </div>
        `;
        contenedor.appendChild(tarjeta);
    });

    // Evento añadir al carrito
    document.querySelectorAll(".producto-tarjeta button").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = BigInt(btn.dataset.id);
            const nombre = btn.dataset.nombre;
            const precio = BigInt(btn.dataset.precio);
            const stock = BigInt(btn.dataset.stock);
            const proveedor = btn.dataset.proveedor;

            // Leer cantidad del input
            const input = btn.parentElement.querySelector(".cantidad-input");
            let cantidad = BigInt(input.value);
            if (cantidad < 1n) cantidad = 1n;
            if (cantidad > stock) cantidad = stock;

            añadirAlCarrito({id, nombre, precio, stock, proveedor, cantidad});
        });
    });
}

// ---------- Carrito ----------
function añadirAlCarrito(producto) {
    const index = carrito.findIndex(p => p.id === producto.id && p.proveedor === producto.proveedor);
    if (index >= 0) {
        // Sumar cantidad respetando stock
        if (carrito[index].cantidad + producto.cantidad <= producto.stock) {
            carrito[index].cantidad += producto.cantidad;
        } else {
            carrito[index].cantidad = producto.stock;
            alert("❌ Se ha limitado la cantidad al stock disponible");
        }
    } else {
        carrito.push({...producto});
    }
    actualizarCarritoUI();
}

// ---------- Actualizar carrito UI estilo pedidos.js ----------
function actualizarCarritoUI() {
    const cont = document.getElementById("carrito");
    cont.innerHTML = "";

    if (carrito.length === 0) {
        cont.innerHTML = "<p>El carrito está vacío.</p>";
        document.getElementById("vaciarCarrito").disabled = true;
        document.getElementById("confirmarPedido").disabled = true;
        return;
    }

    // Crear tarjeta tipo pedido-tarjeta
    const tarjeta = document.createElement("div");
    tarjeta.className = "pedido-tarjeta";
    tarjeta.style.border = "1px solid #ddd";
    tarjeta.style.borderRadius = "12px";
    tarjeta.style.padding = "18px";
    tarjeta.style.marginBottom = "18px";
    tarjeta.style.background = "#fcfcfc";
    tarjeta.style.boxShadow = "0 2px 6px rgba(0,0,0,0.05)";
    tarjeta.style.transition = "all 0.3s";
    tarjeta.onmouseover = () => tarjeta.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
    tarjeta.onmouseout = () => tarjeta.style.boxShadow = "0 2px 6px rgba(0,0,0,0.05)";

    tarjeta.innerHTML = `
        <h3 style="margin-bottom:5px;">Carrito global</h3>
        <div class="productos"></div>
        <div class="totales" style="margin-top:10px;"></div>
    `;
    cont.appendChild(tarjeta);

    const productosDiv = tarjeta.querySelector(".productos");
    const totalesDiv = tarjeta.querySelector(".totales");

    // Tabla de productos
    const tabla = document.createElement("table");
    tabla.style.width = "100%";
    tabla.style.borderCollapse = "collapse";
    tabla.innerHTML = `
        <thead>
            <tr>
                <th style="text-align:left; border-bottom:1px solid #ddd;">Producto</th>
                <th style="text-align:right; border-bottom:1px solid #ddd;">Proveedor</th>
                <th style="text-align:right; border-bottom:1px solid #ddd;">Cantidad</th>
                <th style="text-align:right; border-bottom:1px solid #ddd;">Precio €</th>
                <th style="text-align:right; border-bottom:1px solid #ddd;">Subtotal €</th>
                <th style="text-align:center; border-bottom:1px solid #ddd;">Eliminar</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    const tbody = tabla.querySelector("tbody");

    let totalWei = 0n;

    carrito.forEach(p => {
        const subtotalWei = p.precio * BigInt(p.cantidad);
        const subtotalEuros = Number(subtotalWei) * WEI_A_EURO;
        totalWei += subtotalWei;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${p.nombre}</td>
            <td style="text-align:right;">${p.proveedor}</td>
            <td style="text-align:right;">${p.cantidad}</td>
            <td style="text-align:right;">${(Number(p.precio) * WEI_A_EURO).toFixed(2)} €</td>
            <td style="text-align:right;">${subtotalEuros.toFixed(2)} €</td>
            <td style="text-align:center;"><button data-id="${p.id}" data-proveedor="${p.proveedor}">❌</button></td>
        `;
        tbody.appendChild(tr);
    });

    productosDiv.appendChild(tabla);

    // Totales
    const totalEuros = Number(totalWei) * WEI_A_EURO;

    totalesDiv.innerHTML = `
        <p><strong>Total global (aprox):</strong> ${totalEuros.toFixed(2)} €</p>
        <p><em>Los totales exactos se calcularán por proveedor al confirmar el pedido</em></p>
    `;

    // Eventos botones eliminar
    productosDiv.querySelectorAll("button").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = BigInt(btn.dataset.id);
            const proveedor = btn.dataset.proveedor;
            carrito = carrito.filter(p => !(p.id === id && p.proveedor === proveedor));
            actualizarCarritoUI();
        });
    });

    document.getElementById("vaciarCarrito").disabled = false;
    document.getElementById("confirmarPedido").disabled = false;
}


// ---------- Vaciar carrito ----------
document.getElementById("vaciarCarrito").addEventListener("click", () => {
    carrito = [];
    actualizarCarritoUI();
});

// ---------- Confirmar pedido ----------
document.getElementById("confirmarPedido").addEventListener("click", async () => {
    if (carrito.length === 0) return alert("Carrito vacío");

    // Agrupar productos por proveedor
    const pedidosPorProveedor = {};
    carrito.forEach(p => {
        if (!pedidosPorProveedor[p.proveedor]) pedidosPorProveedor[p.proveedor] = {ids: [], cantidades: []};
        pedidosPorProveedor[p.proveedor].ids.push(p.id);
        pedidosPorProveedor[p.proveedor].cantidades.push(BigInt(p.cantidad));
    });

    try {
        for (const prov in pedidosPorProveedor) {
            const {ids, cantidades} = pedidosPorProveedor[prov];
            const tx = await contrato.crearPedido(prov, ids, cantidades);
            await tx.wait();
        }
        alert("✅ Pedidos creados con éxito!");
        carrito = [];
        actualizarCarritoUI();
    } catch (err) {
        console.error("Error creando pedido:", err);
        alert("❌ Error creando pedido. Mira la consola.");
    }
});

// ---------- Inicialización ----------
window.addEventListener("DOMContentLoaded", async () => {
    await conectarYCargar();
});
