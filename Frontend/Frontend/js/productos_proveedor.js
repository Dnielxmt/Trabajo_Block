// js/productos_proveedor.js

let provider, signer, cuentaActual, contrato;
let carrito = [];
let proveedorSeleccionado;

const direccionContrato = sessionStorage.getItem("direccionContrato");


const ETH_TO_EURO = 1; 

// ---------- Conexión a Metamask ----------
async function conectar() {
    if (!window.ethereum) return alert("⚠️ Instala Metamask");

    try {
        provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = await provider.getSigner();
        cuentaActual = window.ethereum.selectedAddress
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
                    <input type="number" min="1" max="${stock}" value="1" style="width:50px" class="cantidad-input">
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

                // Leer cantidad del input
                const input = btn.parentElement.querySelector(".cantidad-input");
                let cantidad = BigInt(input.value);
                if (cantidad < 1n) cantidad = 1n;
                if (cantidad > stock) cantidad = stock;

                añadirAlCarrito({id, nombre, precio, stock, cantidad});
            });
        });

    } catch (err) {
        console.error("Error cargando productos:", err);
        alert("Error cargando productos. Revisa la consola.");
    }
}

// ---------- Carrito con tabla ----------
function añadirAlCarrito(producto) {
    const index = carrito.findIndex(p => p.id === producto.id);
    if (index >= 0) {
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

// ---------- Actualizar carrito UI con formato tipo global ----------
async function actualizarCarritoUI() {
    const cont = document.getElementById("carrito");
    cont.innerHTML = "";

    if (carrito.length === 0) {
        cont.innerHTML = "<p>El carrito está vacío.</p>";
        document.getElementById("vaciarCarrito").disabled = true;
        document.getElementById("confirmarPedido").disabled = true;
        return;
    }

    // Tarjeta contenedora
    const tarjeta = document.createElement("div");
    tarjeta.className = "pedido-tarjeta";

    tarjeta.innerHTML = `
        <h3>Carrito del proveedor</h3>
        <div class="productos"></div>
        <div class="totales"></div>
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
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio (wei)</th>
                <th>Subtotal (wei)</th>
                <th>Eliminar</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    const tbody = tabla.querySelector("tbody");

    let totalWei = 0n;

    carrito.forEach(p => {
        const subtotal = p.precio * p.cantidad;
        totalWei += subtotal;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${p.nombre}</td>
            <td style="text-align:right;">${p.cantidad}</td>
            <td style="text-align:right;">${p.precio}</td>
            <td style="text-align:right;">${subtotal}</td>
            <td style="text-align:center;">
                <button data-id="${p.id}">❌</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    productosDiv.appendChild(tabla);

    // Totales
    totalesDiv.innerHTML = `
        <p><strong>Total:</strong> ${totalWei} wei</p>
    `;

    // Eliminar producto
    productosDiv.querySelectorAll("button").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = BigInt(btn.dataset.id);
            carrito = carrito.filter(p => p.id !== id);
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

    const ids = carrito.map(p => p.id);
    const cantidades = carrito.map(p => BigInt(p.cantidad));

    try {
        const tx = await contrato.crearPedido(proveedorSeleccionado, ids, cantidades);
        await tx.wait();
        alert("✅ Pedido creado con éxito!");
        carrito = [];
        actualizarCarritoUI();

        await cargarProductosProveedor();

    } catch (err) {
        console.error("Error creando pedido:", err);
        alert("❌ Error creando pedido. Mira la consola.");
    }
});

// ---------- Inicialización ----------
window.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    proveedorSeleccionado = params.get("prov");

    if (!proveedorSeleccionado) return alert("No se ha seleccionado un proveedor.");

    await conectar();
    await cargarProductosProveedor();
});
