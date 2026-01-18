// auth_redirigir.js
(async function() {
    const direccionContrato = "0x85E7f2Df79f7EE589602c72505Ed3Cf9F82A5210";

    if (!window.ethereum) {
        alert("⚠️ Instala MetaMask para continuar");
        return;
    }

    try {
        // Conectar a MetaMask
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        // Esperar 100 ms antes de obtener la cuenta
        //await new Promise(resolve => setTimeout(resolve, 20));
        const cuentaActual = window.ethereum.selectedAddress;

        // Revisar cuenta guardada en sessionStorage
        const cuentaAnterior = sessionStorage.getItem("cuentaMetaMask");

        // Solo proceder si cambió la cuenta o no está guardada
        if (cuentaActual !== cuentaAnterior) {
            // Guardar la cuenta actual para futuras comparaciones
            sessionStorage.setItem("cuentaMetaMask", cuentaActual);

            // Conectar al contrato
            const contrato = new ethers.Contract(direccionContrato, ABI_SISTEMA_PEDIDOS, signer);

            // Comprobar rol
            const esProveedor = await contrato.esProveedor(cuentaActual);
            const esSupermercado = await contrato.esSupermercado(cuentaActual);
            //añadir que si es owner redirija a otra pagina

            // Redirigir según rol
            if (esProveedor) {
                console.log("➡️ Proveedor detectado, redirigiendo...");
                window.location.href = "index_proveedores.html";
                return;
            }

            if (esSupermercado) {
                console.log("➡️ Supermercado detectado, redirigiendo...");
                window.location.href = "index.html";
                return;
            }

            alert("⚠️ Esta cuenta no está registrada");
        }

        // Si la cuenta no cambió, no hace nada y la página sigue igual
        console.log("✅ Cuenta sin cambios, no se redirige");

    } catch (err) {
        console.error("Error al comprobar rol y redirigir:", err);
    }
})();
