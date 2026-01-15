// js/web3.js
let provider;
let signer;
let cuentaActual;
let contrato;

// const direccionContrato = "0x4a6762EC197F7C8cC79775cc34733986f89615cc";
const direccionContrato = "0x02EBc01250D6931d985B0D0409B862357371F4DB";

async function conectar() {
    if (!window.ethereum) {
        alert("⚠️ Instala Metamask para usar esta DApp");
        return;
    }

    try {
        provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = await provider.getSigner();
        cuentaActual = await signer.getAddress();
        console.log("Conectado como:", cuentaActual);

        // Usar ABI definido en abi.js
        contrato = new ethers.Contract(direccionContrato, ABI_SISTEMA_PEDIDOS, signer);
        console.log("Contrato listo:", contrato);
    } catch (err) {
        console.error("Error de conexión:", err);
        alert("Error conectando Metamask. Mira la consola.");
    }
}
