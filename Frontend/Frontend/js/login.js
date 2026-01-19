// login.js
// ---------------------------
// Conexión y detección de rol
// ---------------------------

const contractABI = ABI_SISTEMA_PEDIDOS; // tu ABI
let provider, signer, contrato, userAddress;

const contractInput = document.getElementById("contract-address");
const btnConectar = document.getElementById("btn-conectar");
const btnConfirmar = document.getElementById("btn-confirmar");
const btnCambiar = document.getElementById("btn-cambiar");
const userWalletSpan = document.getElementById("user-wallet");
const detectedRoleSpan = document.getElementById("detected-role");
const pantallaConexion = document.getElementById("pantalla-conexion");
const pantallaLogin = document.getElementById("pantalla-login");

// Log simple
function log(msg) { console.log(msg); }

// Logout
function logout() {
    sessionStorage.removeItem("cuentaMetaMask");
    window.location.href = "index.html";
}

// Conectar MetaMask y contrato
async function conectar() {
    try {
        if (!window.ethereum) throw new Error("MetaMask no detectado");

        const direccionContrato = contractInput.value.trim();
        if (!direccionContrato) {
            log("Introduce la dirección del contrato antes de conectar");
            return;
        }
        if (!ethers.utils.isAddress(direccionContrato)) {
            log("Dirección de contrato inválida");
            return;
        }

        await window.ethereum.request({ method: "eth_requestAccounts" });
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        userAddress = await signer.getAddress();

        contrato = new ethers.Contract(direccionContrato, contractABI, signer);

        sessionStorage.setItem("direccionContrato", direccionContrato);
        
        sessionStorage.setItem("cuentaMetaMask", userAddress);

        if (userWalletSpan) userWalletSpan.innerText = userAddress;
        pantallaConexion?.classList.add("hidden");
        pantallaLogin?.classList.remove("hidden");

        const rol = await detectarRol();
        if (detectedRoleSpan) detectedRoleSpan.innerText = rol;

    } catch (err) {
        log("Error al conectar: " + err.message);
    }
}

// Detectar rol on-chain
async function detectarRol() {
    if (!contrato || !userAddress) return "No registrado";

    const ownerAddr = await contrato.owner();
    const isSuper = await contrato.esSupermercado(userAddress);
    const isProv = await contrato.esProveedor(userAddress);

    if (userAddress.toLowerCase() === ownerAddr.toLowerCase()) {
        detectedRoleSpan.style.color = "#f39c12";
        return "Administrador";
    }
    if (isSuper) {
        detectedRoleSpan.style.color = "#2ecc71";
        return "Supermercado";
    }
    if (isProv) {
        detectedRoleSpan.style.color = "#3498db";
        return "Proveedor";
    }

    detectedRoleSpan.style.color = "#e74c3c";
    return "No registrado";
}

// Confirmar login y redirigir
async function confirmarLogin() {
    const rol = await detectarRol();
    if (rol === "Supermercado") location.href = "perfil_supermercado.html";
    else if (rol === "Proveedor") location.href = "perfil_proveedores.html";
    else if (rol === "Administrador") location.href = "perfil_owner.html";
    else logout();
}

// Botones
btnConectar?.addEventListener("click", conectar);
btnConfirmar?.addEventListener("click", confirmarLogin);
btnCambiar?.addEventListener("click", logout);

// Detectar cambio de cuenta o red
if (window.ethereum) {
    window.ethereum.on("accountsChanged", () => logout());
    window.ethereum.on("chainChanged", () => logout());
}
