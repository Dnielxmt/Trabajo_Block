// js/proveedores.js

async function cargarProveedores() {
    try {
        await conectar(); // conecta Metamask y contrato

        const productos = await contrato.obtenerProductosActivos();

        console.log("Productos obtenidos del contrato:", productos); // 🔹 DEBUG

        if (!productos || productos.length === 0) {
            document.getElementById("listaProveedores").innerText = "No hay proveedores disponibles.";
            return;
        }

        const proveedores = [...new Set(productos.map(p => p.proveedor))];

        const div = document.getElementById("listaProveedores");
        div.innerHTML = "";

        proveedores.forEach(p => {
            div.innerHTML += `
                <div class="proveedor">
                    <b>Proveedor:</b> ${p}<br>
                    <button onclick="location.href='productos_proveedor.html?prov=${p}'">
                        Ver productos
                    </button>
                </div><hr>
            `;
        });

    } catch (err) {
        console.error("Error cargando proveedores:", err);
        document.getElementById("listaProveedores").innerText = "Error cargando proveedores. Revisa consola.";
    }
}

window.onload = cargarProveedores;
