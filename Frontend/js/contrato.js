// // js/contrato.js

// // Dirección de tu contrato
// // const direccionContrato = "0x4a6762EC197F7C8cC79775cc34733986f89615cc";
// const direccionContrato = "0x02EBc01250D6931d985B0D0409B862357371F4DB";

// // Contrato global
// let contrato;

// // Función para inicializar el contrato
// function cargarContrato(signer) {
//     contrato = new ethers.Contract(direccionContrato, ABI_SISTEMA_PEDIDOS, signer);
//     return contrato;
// }

// js/contrato.js
// Este archivo ASUME que `contrato` ya existe

async function esProveedor() {
    return await contrato.esProveedor(cuentaActual);
}

async function esSupermercado() {
    return await contrato.esSupermercado(cuentaActual);
}

async function obtenerProductos() {
    return await contrato.obtenerProductosActivos();
}

