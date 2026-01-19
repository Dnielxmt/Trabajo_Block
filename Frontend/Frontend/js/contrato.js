// // js/contrato.js
async function esProveedor() {
    return await contrato.esProveedor(cuentaActual);
}

async function esSupermercado() {
    return await contrato.esSupermercado(cuentaActual);
}

async function obtenerProductos() {
    return await contrato.obtenerProductosActivos();
}

