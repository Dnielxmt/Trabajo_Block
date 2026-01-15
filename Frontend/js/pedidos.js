// js/pedidos.js

window.addEventListener("DOMContentLoaded", async () => {
    await conectar();
    await mostrarMisPedidos();
});

// Colores por estado
const coloresEstado = ["🟡 Pendiente", "🔵 Enviado", "🟢 Recibido", "🔴 Cancelado"];

async function mostrarMisPedidos() {
    try {
        const cuentaActual = await signer.getAddress();
        console.warn("cuentaActual", cuentaActual);

        let resultado;

        // Comprobar rol
        const esSuper = await contrato.esSupermercado(cuentaActual);
        let esProv = false;
        if (!esSuper) esProv = await contrato.esProveedor(cuentaActual);

        if (!esSuper && !esProv) {
            document.getElementById("listaPedidos").innerHTML =
                "<p>No estás registrado como supermercado ni proveedor.</p>";
            return;
        }

        // Obtener pedidos
        if (esSuper) {
            resultado = await contrato.obtenerPedidosPorSupermercadoPlano(cuentaActual);
        } else if (esProv) {
            resultado = await contrato.obtenerPedidosPorProveedorPlano(cuentaActual);
        }

        const cont = document.getElementById("listaPedidos");
        cont.innerHTML = "";

        const ids         = resultado[0];
        const otros       = resultado[1]; // proveedores o supermercados según rol
        const estados     = resultado[2];
        const descuentos  = resultado[3];
        const fechas      = resultado[4];

        if (ids.length === 0) {
            cont.innerHTML = "<p>No tienes pedidos aún.</p>";
            return;
        }

        for (let i = 0; i < ids.length; i++) {
            const pId = ids[i];
            const estado = Number(estados[i]);
            const estadoTexto = coloresEstado[estado];

            // Crear tarjeta
            const tarjeta = document.createElement("div");
            tarjeta.className = "pedido-tarjeta";
            tarjeta.style.border = "1px solid #ccc";
            tarjeta.style.borderRadius = "10px";
            tarjeta.style.padding = "15px";
            tarjeta.style.marginBottom = "15px";
            tarjeta.style.background = "#f9f9f9";

            tarjeta.innerHTML = `
                <h3>Pedido #${pId}</h3>
                <p>${esSuper ? "Proveedor" : "Supermercado"}: ${otros[i]}</p>
                <p>Estado: ${estadoTexto}</p>
                <p>Descuento aplicado: ${descuentos[i]}%</p>
                <p>Fecha creación: ${new Date(Number(fechas[i]) * 1000).toLocaleString()}</p>
                <div class="acciones"></div>
            `;

            cont.appendChild(tarjeta);

            const accionesDiv = tarjeta.querySelector(".acciones");

            // ------------------ Botones según rol y estado ------------------
            // Supermercado: puede marcar como recibido solo si estado = Enviado
            if (esSuper && estado === 1) {
                const btnRecibido = document.createElement("button");
                btnRecibido.innerText = "✅ Marcar como recibido";
                btnRecibido.style.marginTop = "5px";
                btnRecibido.onclick = async () => {
                    try {
                        const tx = await contrato.confirmarRecepcion(pId);
                        await tx.wait();
                        alert("Pedido marcado como recibido!");
                        await mostrarMisPedidos(); // refrescar
                    } catch (err) {
                        console.error(err);
                        alert("Error al marcar como recibido. Mira la consola.");
                    }
                };
                accionesDiv.appendChild(btnRecibido);
            }

            // Proveedor: puede marcar como enviado solo si estado = Pendiente
            if (esProv && estado === 0) {
                const btnEnviado = document.createElement("button");
                btnEnviado.innerText = "📦 Marcar como enviado";
                btnEnviado.style.marginTop = "5px";
                btnEnviado.onclick = async () => {
                    try {
                        const tx = await contrato.confirmarEnvio(pId);
                        await tx.wait();
                        alert("Pedido marcado como enviado!");
                        await mostrarMisPedidos(); // refrescar
                    } catch (err) {
                        console.error(err);
                        alert("Error al marcar como enviado. Mira la consola.");
                    }
                };
                accionesDiv.appendChild(btnEnviado);
            }
        }

    } catch (err) {
        console.error("Error cargando pedidos:", err);
        alert("Error cargando tus pedidos. Mira la consola.");
    }
}
