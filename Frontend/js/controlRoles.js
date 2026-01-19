// js/controlRoles.js

let provider, signer, contrato, cuentaActual;

// Dirección del contrato desde sesión
const direccionContrato = sessionStorage.getItem("direccionContrato");

// Detectar rol esperado en la página
// Por ejemplo, en perfiles_supermercado.html -> data-rol="Supermercado"
const rolEsperado = document.body.dataset.rol;

// Log simple
function log(msg) { console.log(msg); }

// Logout y redirección a login
function logout() {
    sessionStorage.removeItem("cuentaMetaMask");
    sessionStorage.removeItem("direccionContrato");
    window.location.href = "login.html";
}

// Conectar a MetaMask y contrato
async function conectar() {
    if (!direccionContrato) {
        log("No hay contrato en sesión");
        logout();
        return;
    }

    if (!window.ethereum) {
        alert("⚠️ Instala MetaMask para usar esta DApp");
        return;
    }

    provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();
    cuentaActual = await signer.getAddress();

    contrato = new ethers.Contract(direccionContrato, ABI_SISTEMA_PEDIDOS, signer);
    console.log("Conectado como:", cuentaActual);
}

// Detectar rol on-chain
async function detectarRol() {
    if (!contrato || !cuentaActual) return "No registrado";

    const ownerAddr = await contrato.owner();
    const isSuper = await contrato.esSupermercado(cuentaActual);
    const isProv = await contrato.esProveedor(cuentaActual);

    if (cuentaActual.toLowerCase() === ownerAddr.toLowerCase()) return "Administrador";
    if (isSuper) return "Supermercado";
    if (isProv) return "Proveedor";

    return "No registrado";
}

// Validar acceso
async function validarAcceso() {
    try {
        await conectar();
        const rolActual = await detectarRol();
        console.log("Rol actual:", rolActual, "| Rol esperado:", rolEsperado);

        if (rolActual !== rolEsperado) {
            log("Rol no coincide. Haciendo logout...");
            logout();
        }
    } catch (err) {
        console.error("Error validando acceso:", err);
        logout();
    }
}

// Detectar cambios de cuenta o red
if (window.ethereum) {
    window.ethereum.on("accountsChanged", logout);
    window.ethereum.on("chainChanged", logout);
}

// Ejecutar validación al cargar la página
window.addEventListener("DOMContentLoaded", validarAcceso);
