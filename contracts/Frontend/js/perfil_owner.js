let provider;
let signer;
let contrato;

const CONTRACT_ADDRESS = sessionStorage.getItem("direccionContrato");

function log(msg) {
    const logs = document.getElementById("logs");
    logs.textContent += "\n" + msg;
}

// Inicializar y validar Owner
window.addEventListener("load", async () => {
    try {
        if (!window.ethereum) {
            alert("MetaMask no detectado");
            return;
        }

        provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();

        contrato = new ethers.Contract(
            CONTRACT_ADDRESS,
            ABI_SISTEMA_PEDIDOS,
            signer
        );

        const user = await signer.getAddress();
        const owner = await contrato.owner();

        if (user.toLowerCase() !== owner.toLowerCase()) {
            alert("Acceso denegado: Solo Owner");
            return;
        }

        log("✅ Owner verificado");
        log("🟢 Conectado a la red correctamente");

    } catch (err) {
        log("❌ Error al inicializar: " + err.message);
    }
});

// Registrar proveedor o supermercado
async function ejecutarRegistro(tipo) {
    try {
        let address = prompt(`Dirección del ${tipo} (0x...)`);
        if (!address) return;

        address = address.trim();

        if (!ethers.utils.isAddress(address)) {
            alert("Dirección inválida");
            return;
        }

        log("⏳ Enviando transacción...");

        const tx = (tipo === "proveedor")
            ? await contrato.registrarProveedor(address)
            : await contrato.registrarSupermercado(address);

        await tx.wait();
        log(`✅ ${tipo} registrado correctamente`);

    } catch (err) {
        log("❌ Error: " + (err.reason || err.message));
    }
}

// Cambiar política de descuentos
async function ejecutarCambioDescuento() {
    try {
        const umbral = prompt("Nuevo umbral:");
        const porcentaje = prompt("Nuevo porcentaje:");
        if (!umbral || !porcentaje) return;

        log("⏳ Actualizando política...");

        const tx = await contrato.configurarPoliticaDescuentos(
            parseInt(umbral),
            parseInt(porcentaje)
        );

        await tx.wait();
        log("✅ Política de descuentos actualizada");

    } catch (err) {
        log("❌ Error: " + (err.reason || err.message));
    }
}
