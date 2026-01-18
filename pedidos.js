// js/pedidos.js

window.addEventListener("DOMContentLoaded", async () => {
    await conectar(); // Conecta Metamask y el contrato
    await mostrarMisPedidos();
});

// Colores por estado
const coloresEstado = ["🟡 Pendiente", "🔵 Enviado", "🟢 Recibido", "🔴 Cancelado"];

async function mostrarMisPedidos() {
    try {
        const cuentaActual = window.ethereum.selectedAddress;

        let resultado;

        const esSuper = await contrato.esSupermercado(cuentaActual);
        let esProv = false;
        if (!esSuper) esProv = await contrato.esProveedor(cuentaActual);

        if (!esSuper && !esProv) {
            document.getElementById("listaPedidos").innerHTML =
                "<p>No estás registrado como supermercado ni proveedor.</p>";
            return;
        }

        if (esSuper) {
            resultado = await contrato.obtenerPedidosPorSupermercadoPlano(cuentaActual);
        } else if (esProv) {
            resultado = await contrato.obtenerPedidosPorProveedorPlano(cuentaActual);
        }

        const cont = document.getElementById("listaPedidos");
        cont.innerHTML = "";

        const ids         = resultado[0];
        const otros       = resultado[1];
        const estados     = resultado[2];
        const descuentos  = resultado[3];
        const fechas      = resultado[4];

        if (ids.length === 0) {
            cont.innerHTML = "<p>No tienes pedidos aún.</p>";
            return;
        }

        // Ordenar de más reciente a más antiguo
        const pedidosOrdenados = ids.map((id, i) => ({
            id,
            otro: otros[i],
            estado: Number(estados[i]),
            descuento: descuentos[i],
            fecha: Number(fechas[i])
        })).sort((a, b) => b.fecha - a.fecha);

        for (let pedido of pedidosOrdenados) {
            const pId = pedido.id;
            const estado = pedido.estado;
            const estadoTexto = coloresEstado[estado];

            // Crear tarjeta
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
                <h3 style="margin-bottom:5px;">Pedido #${pId}</h3>
                <p><strong>${esSuper ? "Proveedor" : "Supermercado"}:</strong> ${pedido.otro}</p>
                <p><strong>Estado:</strong> ${estadoTexto}</p>
                <p><strong>Descuento aplicado:</strong> ${pedido.descuento}%</p>
                <p><strong>Fecha creación:</strong> ${new Date(pedido.fecha * 1000).toLocaleString()}</p>
                <div class="productos"></div>
                <div class="totales" style="margin-top:10px;"></div>
                <div class="acciones" style="margin-top:10px;"></div>
            `;

            cont.appendChild(tarjeta);

            const productosDiv = tarjeta.querySelector(".productos");
            const totalesDiv = tarjeta.querySelector(".totales");
            const accionesDiv = tarjeta.querySelector(".acciones");

            // ------------------ Traer productos del pedido ------------------
            const detalle = await contrato.obtenerDetallePedido(pId);
            const idsProductos = detalle[5];
            const cantidades = detalle[6];

            if (idsProductos.length === 0) {
                productosDiv.innerHTML = "<p>Sin productos.</p>";
            } else {
                const tabla = document.createElement("table");
                tabla.style.width = "100%";
                tabla.style.borderCollapse = "collapse";
                tabla.innerHTML = `
                    <thead>
                        <tr>
                            <th style="text-align:left; border-bottom:1px solid #ddd;">Producto</th>
                            <th style="text-align:right; border-bottom:1px solid #ddd;">Cantidad</th>
                            <th style="text-align:right; border-bottom:1px solid #ddd;">Precio €</th>
                            <th style="text-align:right; border-bottom:1px solid #ddd;">Subtotal €</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                `;
                const tbody = tabla.querySelector("tbody");

                for (let j = 0; j < idsProductos.length; j++) {
                    const prodId = idsProductos[j];
                    const cantidad = cantidades[j];
                    const prodInfo = await contrato.obtenerProducto(prodId);

                    const nombre = prodInfo[0];
                    const precio = prodInfo[2];
                    const subtotal = precio * cantidad;

                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td>${nombre}</td>
                        <td style="text-align:right;">${cantidad}</td>
                        <td style="text-align:right;">${precio}</td>
                        <td style="text-align:right;">${subtotal}</td>
                    `;
                    tbody.appendChild(tr);
                }

                productosDiv.appendChild(tabla);
            }

            // ------------------ Calcular totales ------------------
            const totalConDescuento = await contrato.calcularTotalPedido(pId);
            const totalSinDescuento = await contrato.calcularTotalSinDescuento(pId);

            totalesDiv.innerHTML = `
                <p>Total sin descuento: ${totalSinDescuento} €</p>
                <p><strong>Total Final (aplicando descuento):</strong> ${totalConDescuento} €</p>
            `;

            // ------------------ Botones según rol y estado ------------------
            if (esSuper && estado === 1) {
                const btnRecibido = document.createElement("button");
                btnRecibido.innerText = "✅ Marcar como recibido";
                btnRecibido.style.marginRight = "5px";
                btnRecibido.style.padding = "5px 10px";
                btnRecibido.onclick = async () => {
                    try {
                        const tx = await contrato.confirmarRecepcion(pId);
                        await tx.wait();
                        alert("Pedido marcado como recibido!");
                        await mostrarMisPedidos();
                    } catch (err) {
                        console.error(err);
                        alert("Error al marcar como recibido. Mira la consola.");
                    }
                };
                accionesDiv.appendChild(btnRecibido);
            }

            if (esProv && estado === 0) {
                const btnEnviado = document.createElement("button");
                btnEnviado.innerText = "📦 Marcar como enviado";
                btnEnviado.style.padding = "5px 10px";
                btnEnviado.onclick = async () => {
                    try {
                        const tx = await contrato.confirmarEnvio(pId);
                        await tx.wait();
                        alert("Pedido marcado como enviado!");
                        await mostrarMisPedidos();
                    } catch (err) {
                        console.error(err);
                        alert("Error al marcar como enviado. Mira la consola.");
                    }
                };
                accionesDiv.appendChild(btnEnviado);
            }

            // ------------------ Botón Cancelar pedido ------------------
            if ((esSuper || esProv) && estado === 0) { // Pendiente
                const btnCancelar = document.createElement("button");
                btnCancelar.innerText = "❌ Cancelar";
                btnCancelar.style.position = "absolute";
                btnCancelar.style.bottom = "10px";
                btnCancelar.style.right = "10px";
                btnCancelar.style.backgroundColor = "red";
                btnCancelar.style.color = "white";
                btnCancelar.style.border = "none";
                btnCancelar.style.borderRadius = "6px";
                btnCancelar.style.padding = "5px 10px";
                btnCancelar.style.cursor = "pointer";

                btnCancelar.onclick = async () => {
                    if (!confirm("¿Seguro que quieres cancelar este pedido?")) return;

                    try {
                        const tx = await contrato.cancelarPedido(pId);
                        await tx.wait();
                        alert("✅ Pedido cancelado correctamente");
                        await mostrarMisPedidos();
                    } catch (err) {
                        console.error("Error cancelando pedido:", err);
                        alert("❌ Error cancelando pedido. Mira la consola.");
                    }
                };

                // Necesitamos que la tarjeta tenga position: relative para posicionar el botón
                tarjeta.style.position = "relative";
                tarjeta.appendChild(btnCancelar);
            }
        }

    } catch (err) {
        console.error("Error cargando pedidos:", err);
        alert("Error cargando tus pedidos. Mira la consola.");
    }
}
