// js/contrato.js

// Dirección de tu contrato
// const direccionContrato = "0x4a6762EC197F7C8cC79775cc34733986f89615cc";
const direccionContrato = "0x0eaaf6bdCCE16ccd228880a54B0e67124d731693";

// Contrato global
let contrato;

// Función para inicializar el contrato
function cargarContrato(signer) {
    contrato = new ethers.Contract(direccionContrato, ABI_SISTEMA_PEDIDOS, signer);
    return contrato;
}
