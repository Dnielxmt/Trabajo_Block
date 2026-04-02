let proveedorActual;

window.addEventListener("DOMContentLoaded", async () => {
    await conectar();
    const cuentaActual = window.ethereum.selectedAddress
    proveedorActual = cuentaActual;
    document.getElementById("cuenta").innerText = "Conectado como: " + proveedorActual;

    await cargarProductos();
});

// ---------- Cargar productos del proveedor ----------
async function cargarProductos() {
    const contenedor = document.getElementById("productos");
    contenedor.innerHTML = "";

    try {
        const productos = await contrato.obtenerProductosPorProveedor(proveedorActual);
        if (productos.length === 0) {
            contenedor.innerHTML = "<p>No tienes productos aún.</p>";
            return;
        }

        productos.forEach(p => {
            const tarjeta = document.createElement("div");
            tarjeta.className = "producto-tarjeta";

            tarjeta.innerHTML = `
                <h3>${p.nombre}</h3>
                <p>${p.descripcion}</p>
                <p>Precio: ${p.precio} wei</p>
                <p>Stock: ${p.stockDisponible}</p>
                <button onclick="modificarProducto(${p.id})">Modificar</button>
                <button onclick="eliminarProducto(${p.id})">Eliminar</button>
            `;
            contenedor.appendChild(tarjeta);
        });

    } catch (err) {
        console.error("Error cargando productos:", err);
        contenedor.innerHTML = "<p>Error cargando productos. Mira la consola.</p>";
    }
}

// ---------- Crear producto ----------
document.getElementById("crearProductoBtn").addEventListener("click", async () => {
    const nombre = document.getElementById("nombre").value;
    const descripcion = document.getElementById("descripcion").value;
    const precio = BigInt(document.getElementById("precio").value || 0);
    const stock = BigInt(document.getElementById("stock").value || 0);

    if(!nombre || !descripcion || precio <= 0n || stock < 0n) return alert("Rellena todos los campos correctamente.");

    try {
        const tx = await contrato.crearProducto(nombre, descripcion, precio, stock);
        await tx.wait();
        alert("✅ Producto creado!");
        await cargarProductos();
    } catch (err) {
        console.error("Error creando producto:", err);
        alert("❌ Error creando producto. Mira la consola.");
    }
});

// ---------- Modificar producto ----------
async function modificarProducto(id) {
    const nuevoPrecio = BigInt(prompt("Nuevo precio (wei):"));
    const nuevoStock = BigInt(prompt("Nuevo stock:"));

    if(nuevoPrecio < 0n || nuevoStock < 0n) return alert("Valores inválidos.");

    try {
        const tx = await contrato.actualizarProducto(id, nuevoPrecio, nuevoStock);
        await tx.wait();
        alert("✅ Producto actualizado!");
        await cargarProductos();
    } catch (err) {
        console.error("Error actualizando producto:", err);
        alert("❌ Error actualizando producto. Mira la consola.");
    }
}

// ---------- Eliminar producto ----------
async function eliminarProducto(id) {
    if(!confirm("¿Seguro que quieres eliminar este producto?")) return;
    try {
        const tx = await contrato.eliminarProducto(id);
        await tx.wait();
        alert("✅ Producto eliminado!");
        await cargarProductos();
    } catch (err) {
        console.error("Error eliminando producto:", err);
        alert("❌ Error eliminando producto. Mira la consola.");
    }
}
