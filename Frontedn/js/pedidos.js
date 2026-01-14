window.addEventListener("DOMContentLoaded", async () => {
    await conectar();
    await mostrarMisPedidos();
});

async function mostrarMisPedidos() {
    try {
        const cuentaActual = await signer.getAddress();
        console.warn("cuentaActual", cuentaActual);

        let resultado;

        // ¿Eres supermercado?
        const esSuper = await contrato.esSupermercado(cuentaActual);
        if (esSuper) {
            resultado = await contrato.obtenerPedidosPorSupermercadoPlano(cuentaActual);
        } else {
            // ¿Eres proveedor?
            const esProv = await contrato.esProveedor(cuentaActual);
            if (esProv) {
                resultado = await contrato.obtenerPedidosPorProveedorPlano(cuentaActual);
            } else {
                document.getElementById("listaPedidos").innerHTML =
                    "<p>No estás registrado como supermercado ni proveedor.</p>";
                return;
            }
        }

        const cont = document.getElementById("listaPedidos");
        cont.innerHTML = "";

        const ids        = resultado[0];
        const proveedores= resultado[1];
        const estados    = resultado[2];
        const descuentos = resultado[3];
        const fechas     = resultado[4];

        if (ids.length === 0) {
            cont.innerHTML = "<p>No tienes pedidos aún.</p>";
            return;
        }

        for (let i = 0; i < ids.length; i++) {
            const estadoTexto = ["Pendiente", "Enviado", "Recibido", "Cancelado"][Number(estados[i])];

            const tarjeta = document.createElement("div");
            tarjeta.className = "pedido-tarjeta";

            tarjeta.innerHTML = `
                <h3>Pedido #${ids[i]}</h3>
                <p>Proveedor: ${proveedores[i]}</p>
                <p>Estado: ${estadoTexto}</p>
                <p>Descuento aplicado: ${descuentos[i]}%</p>
                <p>Fecha creación: ${new Date(Number(fechas[i]) * 1000).toLocaleString()}</p>
            `;

            cont.appendChild(tarjeta);
        }

    } catch (err) {
        console.error("Error cargando pedidos:", err);
        alert("Error cargando tus pedidos. Mira la consola.");
    }
}
