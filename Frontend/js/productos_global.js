// js/productos_global.js
let carrito = [];

// ---------- Conexión ----------
async function conectarYCargar() {
    await conectar(); // proveedor de web3.js
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

            añadirAlCarrito({id, nombre, precio, stock, proveedor});
        });
    });
}

// ---------- Carrito ----------
function añadirAlCarrito(producto) {
    const index = carrito.findIndex(p => p.id === producto.id && p.proveedor === producto.proveedor);
    if (index >= 0) {
        if (carrito[index].cantidad < producto.stock) {
            carrito[index].cantidad++;
        } else {
            alert("❌ No puedes añadir más de este producto (stock limitado)");
        }
    } else {
        carrito.push({...producto, cantidad: 1});
    }
    actualizarCarritoUI();
}

function actualizarCarritoUI() {
    const cont = document.getElementById("carrito");
    cont.innerHTML = "";

    if (carrito.length === 0) {
        cont.innerHTML = "<p>El carrito está vacío.</p>";
        document.getElementById("vaciarCarrito").disabled = true;
        document.getElementById("confirmarPedido").disabled = true;
        return;
    }

    carrito.forEach(p => {
        const item = document.createElement("div");
        item.className = "carrito-item";
        item.innerHTML = `
            ${p.nombre} - Cantidad: ${p.cantidad} - Precio: ${(p.precio * BigInt(p.cantidad)).toString()} wei
            <button data-id="${p.id}" data-proveedor="${p.proveedor}">Eliminar</button>
        `;
        cont.appendChild(item);
    });

    cont.querySelectorAll("button").forEach(btn => {
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
