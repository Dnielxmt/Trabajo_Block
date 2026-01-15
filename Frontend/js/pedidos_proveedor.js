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

        let totalPedido = 0n;

        for (let i = 0; i < idsProductos.length; i++) {
            const prod = await contrato.obtenerProducto(idsProductos[i]);
            const subtotal = BigInt(prod.precio) * BigInt(cantidades[i]);
            totalPedido += subtotal;

            const item = document.createElement("div");
            item.className = "linea-producto";
            item.innerHTML = `
                ${prod.nombre} - Cantidad: ${cantidades[i]} - Precio unitario: ${prod.precio} wei - Subtotal: ${subtotal} wei
            `;
            cont.appendChild(item);
        }

        const totalDiv = document.createElement("div");
        totalDiv.innerHTML = `<b>Total del pedido: ${totalPedido} wei</b>`;
        cont.appendChild(totalDiv);

    } catch (err) {
        console.error("Error cargando líneas de pedido:", err);
    }
}
