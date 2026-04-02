let proveedoresLista = []; // proveedores + reputación

async function cargarProveedores() {
    try {
        await conectar();

        const productos = await contrato.obtenerProductosActivos();
        console.log("Productos obtenidos:", productos);

        const div = document.getElementById("listaProveedores");
        div.innerHTML = "";

        if (!productos || productos.length === 0) {
            div.innerText = "No hay proveedores disponibles.";
            return;
        }

        const proveedores = [...new Set(productos.map(p => p.proveedor))];
        proveedoresLista = [];

        for (const p of proveedores) {
            let completados = 0n;
            let cancelados = 0n;

            try {
                const rep = await contrato.obtenerReputacionProveedor(p);
                completados = rep.completados ?? rep[0];
                cancelados = rep.cancelados ?? rep[1];
            } catch (err) {
                console.error(`Error reputación proveedor ${p}:`, err);
            }

            proveedoresLista.push({
                proveedor: p,
                completados,   
                cancelados     
            });
        }

        mostrarProveedores(proveedoresLista);

    } catch (err) {
        console.error("Error cargando proveedores:", err);
        document.getElementById("listaProveedores").innerText =
            "Error cargando proveedores. Revisa consola.";
    }
}

// ---------- Mostrar proveedores ----------
function mostrarProveedores(lista) {
    const div = document.getElementById("listaProveedores");
    div.innerHTML = "";

    lista.forEach(p => {
        div.innerHTML += `
            <div class="proveedor">
                <b>Proveedor:</b> ${p.proveedor}<br>
                <b>Reputación:</b>
                ✅ Completados: ${p.completados.toString()} |
                ❌ Cancelados: ${p.cancelados.toString()}<br>
                <button onclick="location.href='productos_proveedor.html?prov=${p.proveedor}'">
                    Ver productos
                </button>
            </div><hr>
        `;
    });
}

// ---------- Ordenar por reputación ----------
function ordenarPorReputacion() {
    if (proveedoresLista.length === 0) return;

    const listaOrdenada = [...proveedoresLista].sort((a, b) =>
        Number(b.completados) - Number(a.completados)
    );

    mostrarProveedores(listaOrdenada);
}

// ---------- Init ----------
window.onload = cargarProveedores;
