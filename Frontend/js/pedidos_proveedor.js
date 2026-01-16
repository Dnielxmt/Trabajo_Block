// js/pedidos_proveedor.js

window.addEventListener("DOMContentLoaded", async () => {
    await conectar();
    await mostrarPedidosProveedor();
});

const coloresEstado = ["🟡 Pendiente", "🔵 Enviado", "🟢 Recibido", "🔴 Cancelado"];

async function mostrarPedidosProveedor() {
    try {
        const cuentaActual = await signer.getAddress();
        const esProv = await contrato.esProveedor(cuentaActual);

        if (!esProv) {
            document.getElementById("listaPedidos").innerHTML =
                "<p>No estás registrado como proveedor.</p>";
            return;
        }

        const resultado = await contrato.obtenerPedidosPorProveedorPlano(cuentaActual);

        const cont = document.getElementById("listaPedidos");
        cont.innerHTML = "";

        const ids = resultado[0];
        const supermercados = resultado[1];
        const estados = resultado[2];
        const descuentos = resultado[3];
        const fechas = resultado[4];

        if (ids.length === 0) {
            cont.innerHTML = "<p>No tienes pedidos aún.</p>";
            return;
        }

        for (let i = 0; i < ids.length; i++) {
            const pId = ids[i];
            const estado = Number(estados[i]);
            const estadoTexto = coloresEstado[estado];

            // Tarjeta del pedido
            const tarjeta = document.createElement("div");
            tarjeta.className = "pedido-tarjeta";
            tarjeta.style.border = "1px solid #ccc";
            tarjeta.style.borderRadius = "10px";
            tarjeta.style.padding = "15px";
            tarjeta.style.marginBottom = "15px";
            tarjeta.style.background = "#f9f9f9";

            tarjeta.innerHTML = `
                <h3>Pedido #${pId}</h3>
                <p>Supermercado: ${supermercados[i]}</p>
                <p>Estado: ${estadoTexto}</p>
                <p>Descuento aplicado: ${descuentos[i]}%</p>
                <p>Fecha creación: ${new Date(Number(fechas[i]) * 1000).toLocaleString()}</p>
                <div id="productos-${pId}" class="productos-pedido"></div>
                <div class="acciones"></div>
            `;

            cont.appendChild(tarjeta);

            const accionesDiv = tarjeta.querySelector(".acciones");

            // Proveedor: puede marcar como enviado solo si estado = Pendiente
            if (estado === 0) {
                const btnEnviado = document.createElement("button");
                btnEnviado.innerText = "📦 Marcar como enviado";
                btnEnviado.style.marginTop = "5px";
                btnEnviado.onclick = async () => {
                    try {
                        const tx = await contrato.confirmarEnvio(pId);
                        await tx.wait();
                        alert("Pedido marcado como enviado!");
                        await mostrarPedidosProveedor(); // refrescar
                    } catch (err) {
                        console.error(err);
                        alert("Error al marcar como enviado. Mira la consola.");
                    }
                };
                accionesDiv.appendChild(btnEnviado);
            }

            // Cargar líneas de productos
            await cargarLineasPedido(pId);
        }

    } catch (err) {
        console.error("Error cargando pedidos:", err);
        alert("Error cargando tus pedidos. Mira la consola.");
    }
}

async function cargarLineasPedido(idPedido) {
    try {
        const detalle = await contrato.obtenerDetallePedido(idPedido);
        const [supermercado, proveedor, estado, descuento, fecha, idsProductos, cantidades] = detalle;

        const cont = document.getElementById(`productos-${idPedido}`);
        cont.innerHTML = "";

        if (!idsProductos || idsProductos.length === 0) {
            cont.innerHTML = "<p>Sin productos.</p>";
            return;
        }

        // Crear tabla interna
        const tabla = document.createElement("table");
        tabla.className = "tabla-productos";

        const header = document.createElement("tr");
        header.innerHTML = `
            <th>Producto</th>
            <th>Descripción</th>
            <th>Precio unitario</th>
            <th>Cantidad</th>
            <th>Subtotal</th>
        `;
        tabla.appendChild(header);

        let totalPedido = 0n;

        for (let i = 0; i < idsProductos.length; i++) {
            const prod = await contrato.obtenerProducto(idsProductos[i]);
            const precio = BigInt(prod.precio);
            const cantidad = BigInt(cantidades[i]);
            const subtotal = precio * cantidad;
            totalPedido += subtotal;

            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${prod.nombre}</td>
                <td>${prod.descripcion}</td>
                <td>${ethers.formatEther(precio)} ETH</td>
                <td>${cantidad} unidades</td>
                <td>${ethers.formatEther(subtotal)} ETH</td>
            `;
            tabla.appendChild(fila);
        }

        cont.appendChild(tabla);

        // Total con y sin descuento
        let totalConDescuento = totalPedido;
        if (Number(descuento) > 0) {
            totalConDescuento = totalPedido - (totalPedido * BigInt(descuento) / 100n);
        }

        const totalDiv = document.createElement("div");
        totalDiv.style.marginTop = "10px";
        totalDiv.innerHTML = `
            <p><b>Total sin descuento:</b> ${ethers.formatEther(totalPedido)} ETH</p>
            <p><b>Total con descuento (${descuento}%):</b> ${ethers.formatEther(totalConDescuento)} ETH</p>
        `;
        cont.appendChild(totalDiv);

    } catch (err) {
        console.error("Error cargando líneas de pedido:", err);
    }
}