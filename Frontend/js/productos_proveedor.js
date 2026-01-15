// js/productos_proveedor.js

let provider, signer, cuentaActual, contrato;
let carrito = [];
let proveedorSeleccionado;

// const direccionContrato = "0x4a6762EC197F7C8cC79775cc34733986f89615cc";
const direccionContrato = "0x0eaaf6bdCCE16ccd228880a54B0e67124d731693";

// ---------- Conexión a Metamask ----------
async function conectar() {
    if (!window.ethereum) return alert("⚠️ Instala Metamask");

    try {
        provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = await provider.getSigner();
        cuentaActual = await signer.getAddress();
        document.getElementById("cuenta").innerText = "Conectado como: " + cuentaActual;

        contrato = new ethers.Contract(direccionContrato, ABI_SISTEMA_PEDIDOS, signer);
        console.log("Contrato listo:", contrato);

    } catch (err) {
        console.error("Error conectando:", err);
        document.getElementById("cuenta").innerText = "No se pudo conectar a Metamask";
    }
}

// ---------- Cargar productos ----------
async function cargarProductosProveedor() {
    try {
        const productos = await contrato.obtenerProductosPorProveedor(proveedorSeleccionado);
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
                <p>Precio: ${precio.toString()} wei</p>
                <p>Stock: ${stock.toString()}</p>
                <div>
                    <button ${stock === 0n ? "disabled" : ""} data-id="${p.id}" data-nombre="${p.nombre}" data-precio="${precio}" data-stock="${stock}">
                        Añadir al carrito
                    </button>
                </div>
            `;
            contenedor.appendChild(tarjeta);
        });

        // Evento de añadir al carrito
        document.querySelectorAll(".producto-tarjeta button").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = BigInt(btn.dataset.id);
                const nombre = btn.dataset.nombre;
                const precio = BigInt(btn.dataset.precio);
                const stock = BigInt(btn.dataset.stock);

                añadirAlCarrito({id, nombre, precio, stock});
            });
        });

    } catch (err) {
        console.error("Error cargando productos:", err);
        alert("Error cargando productos. Revisa la consola.");
    }
}

// ---------- Carrito ----------
function añadirAlCarrito(producto) {
    const index = carrito.findIndex(p => p.id === producto.id);
    if(index >= 0) {
        if(carrito[index].cantidad < producto.stock) {
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

    if(carrito.length === 0) {
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
            <button data-id="${p.id}">Eliminar</button>
        `;
        cont.appendChild(item);
    });

    cont.querySelectorAll("button").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = BigInt(btn.dataset.id);
            carrito = carrito.filter(p => p.id !== id);
            actualizarCarritoUI();
        });
    });

    document.getElementById("vaciarCarrito").disabled = false;
    document.getElementById("confirmarPedido").disabled = false;
}

// Vaciar carrito
document.getElementById("vaciarCarrito").addEventListener("click", () => {
    carrito = [];
    actualizarCarritoUI();
});

// Confirmar pedido
document.getElementById("confirmarPedido").addEventListener("click", async () => {
    if(carrito.length === 0) return alert("Carrito vacío");

    const ids = carrito.map(p => p.id);
    const cantidades = carrito.map(p => BigInt(p.cantidad));

    try {
        const tx = await contrato.crearPedido(proveedorSeleccionado, ids, cantidades);
        await tx.wait();
        alert("✅ Pedido creado con éxito!");
        carrito = [];
        actualizarCarritoUI();
    } catch (err) {
        console.error("Error creando pedido:", err);
        alert("❌ Error creando pedido. Mira la consola.");
    }
});

// ---------- Inicialización ----------
window.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    proveedorSeleccionado = params.get("prov");

    if(!proveedorSeleccionado) return alert("No se ha seleccionado un proveedor.");

    await conectar();
    await cargarProductosProveedor();
});
