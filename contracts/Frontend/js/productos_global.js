// js/productos_global.js
let carrito = [];
const WEI_A_EURO = 1; // Ajusta según el precio del ether


// ---------- Conexión ----------
async function conectarYCargar() {
    await conectar(); // inicializa provider, signer y contrato
    await cargarProductosGlobales();
}


// ---------- Acortar dirección SOLO visual ----------
function acortarDireccion(addr, inicio = 4, fin = 4) {
    if (!addr) return "";
    return addr.slice(0, 2 + inicio) + "..." + addr.slice(-fin);
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
            <p>Proveedor: ${acortarDireccion(p.proveedor)}</p>
            <p>Precio: ${precio.toString()} wei</p>
            <p>Stock: ${stock.toString()}</p>
            <div>
                <input type="number"
                       min="1"
                       max="${stock}"
                       value="1"
                       style="width:50px"
                       class="cantidad-input">
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

            const input = btn.parentElement.querySelector(".cantidad-input");
            let cantidad = BigInt(input.value);

            if (cantidad < 1n) cantidad = 1n;
            if (cantidad > stock) cantidad = stock;

            añadirAlCarrito({ id, nombre, precio, stock, proveedor, cantidad });
        });
    });
}


// ---------- Carrito ----------
function añadirAlCarrito(producto) {
    const index = carrito.findIndex(
        p => p.id === producto.id && p.proveedor === producto.proveedor
    );

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

    actualizarCarritoUI();
}


// ---------- Actualizar carrito UI ----------
function actualizarCarritoUI() {
    const cont = document.getElementById("carrito");
    cont.innerHTML = "";

    if (carrito.length === 0) {
        cont.innerHTML = "<p>El carrito está vacío.</p>";
        document.getElementById("vaciarCarrito").disabled = true;
        document.getElementById("confirmarPedido").disabled = true;
        return;
    }

    const tarjeta = document.createElement("div");
    tarjeta.className = "pedido-tarjeta";

    tarjeta.innerHTML = `
        <h3>Carrito global</h3>
        <div class="productos"></div>
        <div class="totales"></div>
    `;
    cont.appendChild(tarjeta);

    const productosDiv = tarjeta.querySelector(".productos");
    const totalesDiv = tarjeta.querySelector(".totales");

    const tabla = document.createElement("table");
    tabla.style.width = "100%";
    tabla.innerHTML = `
        <thead>
            <tr>
                <th>Producto</th>
                <th>Proveedor</th>
                <th>Cantidad</th>
                <th>Precio €</th>
                <th>Subtotal €</th>
                <th>Eliminar</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

    const tbody = tabla.querySelector("tbody");
    let totalWei = 0n;

    carrito.forEach(p => {
        const subtotalWei = p.precio * p.cantidad;
        totalWei += subtotalWei;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${p.nombre}</td>
            <td>${acortarDireccion(p.proveedor)}</td>
            <td>${p.cantidad}</td>
            <td>${(Number(p.precio) * WEI_A_EURO).toFixed(2)} €</td>
            <td>${(Number(subtotalWei) * WEI_A_EURO).toFixed(2)} €</td>
            <td>
                <button data-id="${p.id}" data-proveedor="${p.proveedor}">
                    ❌
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    productosDiv.appendChild(tabla);

    totalesDiv.innerHTML = `
        <p><strong>Total aprox:</strong> ${(Number(totalWei) * WEI_A_EURO).toFixed(2)} €</p>
    `;

    // Eliminar producto
    productosDiv.querySelectorAll("button").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = BigInt(btn.dataset.id);
            const proveedor = btn.dataset.proveedor;

            carrito = carrito.filter(
                p => !(p.id === id && p.proveedor === proveedor)
            );

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

    const pedidosPorProveedor = {};

    carrito.forEach(p => {
        if (!pedidosPorProveedor[p.proveedor]) {
            pedidosPorProveedor[p.proveedor] = { ids: [], cantidades: [] };
        }
        pedidosPorProveedor[p.proveedor].ids.push(p.id);
        pedidosPorProveedor[p.proveedor].cantidades.push(p.cantidad);
    });

    try {
        for (const prov in pedidosPorProveedor) {
            const { ids, cantidades } = pedidosPorProveedor[prov];
            const tx = await contrato.crearPedido(prov, ids, cantidades);
            await tx.wait();
        }

        alert("✅ Pedidos creados con éxito");
        carrito = [];
        actualizarCarritoUI();

    } catch (err) {
        console.error("Error creando pedido:", err);
        alert("❌ Error creando pedido");
    }
});


// ---------- Inicialización ----------
window.addEventListener("DOMContentLoaded", async () => {
    await conectarYCargar();
});
