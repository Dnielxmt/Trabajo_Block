// auth_redirigir.js
(async function() {
    const direccionContrato = sessionStorage.getItem("direccionContrato");

    if (!window.ethereum) {
        alert("⚠️ Instala MetaMask para continuar");
        return;
    }

    try {
        // Conectar a MetaMask
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();

        // provider = new ethers.providers.Web3Provider(window.ethereum);
        // await provider.send("eth_requestAccounts", []);
        // signer = provider.getSigner();

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
            const ownerAddress = await contrato.owner();
            const esOwner = (cuentaActual.toLowerCase() === ownerAddress.toLowerCase());

            //añadir que si es owner redirija a otra pagina

            // Redirigir según rol
            if (esProveedor) {
                console.log("➡️ Proveedor detectado, redirigiendo...");
                window.location.href = "perfil_proveedores.html";
                return;
            }

            if (esSupermercado) {
                console.log("➡️ Supermercado detectado, redirigiendo...");
                window.location.href = "perfil_supermercado.html";
                return;
            }

            if (esOwner) {
                console.log("➡️ Owner detectado, redirigiendo...");
                window.location.href = "perfil_owner.html";
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
