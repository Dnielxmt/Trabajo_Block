// perfil_owner.js
// ---------------------------
// Funciones exclusivas del Owner
// ---------------------------

const productosList = document.getElementById("productosList");
const crearPedidoButton = document.getElementById("crearPedidoButton");
const proveedorInput = document.getElementById("proveedorInput");
const supermercadoInput = document.getElementById("supermercadoInput");

// Mostrar logs
function log(msg) { console.log(msg); }

// Validar sesión (solo Owner)
async function validarSesionOwner() {
    if (!window.ethereum) logout();
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    const userAddress = await signer.getAddress();
    contrato = new ethers.Contract(contractInput.value, contractABI, signer);

    const ownerAddr = await contrato.owner();
    if (userAddress.toLowerCase() !== ownerAddr.toLowerCase()) {
        alert("Acceso denegado: Solo Owner puede acceder.");
        logout();
    }
}

// Crear pedido de prueba
if (crearPedidoButton) {
    crearPedidoButton.onclick = async () => {
        try {
            const productos = await contrato.obtenerProductosActivos();
            if (!productos || productos.length === 0) return log("No hay productos para pedido");

            const ids = productos.map(p => p.id);
            const cantidades = productos.map(p => 1);

            const proveedor = proveedorInput?.value;
            if (!proveedor) return log("Introduce un proveedor");

            const tx = await contrato.crearPedido(proveedor, ids, cantidades);
            log("Pedido enviado, esperando confirmación...");
            await tx.wait();
            log("✅ Pedido creado con éxito!");
        } catch (err) {
            log("Error al crear pedido: " + err.message);
        }
    };
}

// Registrar Proveedor o Supermercado
async function ejecutarRegistro(tipo) {
    const address = prompt(`Introduce la dirección del ${tipo} (0x...)`);
    if (!address || !ethers.utils.isAddress(address)) return alert("Dirección inválida");

    try {
        const tx = (tipo === 'proveedor') 
            ? await contrato.registrarProveedor(address)
            : await contrato.registrarSupermercado(address);
        await tx.wait();
        log(`✅ ${tipo} registrado correctamente`);
    } catch (err) {
        log("❌ Error: Solo el Owner puede realizar esta acción");
    }
}

// Cambiar política de descuentos
async function ejecutarCambioDescuento() {
    const umbral = prompt("Nuevo umbral de productos para descuento:");
    const porcentaje = prompt("Nuevo porcentaje de descuento:");
    try {
        const tx = await contrato.configurarPoliticaDescuentos(umbral, porcentaje);
        await tx.wait();
        log("✅ Política de descuentos actualizada");
    } catch (err) {
        log("Error al actualizar política");
    }
}
