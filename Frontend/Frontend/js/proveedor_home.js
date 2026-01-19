// js/proveedor_home.js

(async function () {
    const direccionContrato = sessionStorage.getItem("direccionContrato");

    if (!window.ethereum) {
        alert("⚠️ Instala MetaMask");
        return;
    }

    try {
        // Conectar a MetaMask
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const cuentaActual = await signer.getAddress();

        // Mostrar cuenta
        document.getElementById("cuenta").innerText =
            "Conectado como: " + cuentaActual;

        // Conectar contrato
        const contrato = new ethers.Contract(
            direccionContrato,
            ABI_SISTEMA_PEDIDOS,
            signer
        );

        // Obtener reputación
        const rep = await contrato.obtenerReputacionProveedor(cuentaActual);

        const completados = rep.completados ?? rep[0];
        const cancelados = rep.cancelados ?? rep[1];

        // Pintar reputación
        document.getElementById("reputacionProveedor").innerHTML = `
            <strong>📊 Reputación del proveedor</strong><br>
            ✅ Pedidos completados: ${completados}<br>
            ❌ Pedidos cancelados: ${cancelados}
        `;

    } catch (err) {
        console.error("Error en home proveedor:", err);
        document.getElementById("reputacionProveedor").innerText =
            "❌ Error cargando reputación";
    }
})();
