
// ABI completo para funciones que vamos a usar
const contractABI = [
  "function owner() public view returns (address)",
  "function esProveedor(address) public view returns (bool)",
  "function esSupermercado(address) public view returns (bool)",
  "function registrarProveedor(address _proveedor) external",
  "function registrarSupermercado(address _supermercado) external",
  "function configurarPoliticaDescuentos(uint256 _umbral, uint256 _porcentaje) external",
  "function obtenerProductosActivos() view returns (tuple(uint256 id,string nombre,string descripcion,uint256 precio,uint256 stockDisponible,bool activo,address proveedor)[])",
  "function crearPedido(address _proveedor, uint256[] _idsProductos, uint256[] _cantidades) external"
];

let provider;
let signer;
let contrato;
let userAddress;
let proveedor;
let supermercado;

const connectButton = document.getElementById("connectButton") || document.getElementById("btn-conectar");
const productosList = document.getElementById("productosList");
const crearPedidoButton = document.getElementById("crearPedidoButton");
const status = document.getElementById("status");
const logsDiv = document.getElementById("logs") || document.getElementById("logs-admin");

const contractAddressInput = document.getElementById("contractAddressInput") || document.getElementById("contract-address");
const proveedorInput = document.getElementById("proveedorInput");
const supermercadoInput = document.getElementById("supermercadoInput");

// Función para mostrar logs
function log(msg) {
  console.log(msg);
  const p = document.createElement("p");
  p.innerText = `> [${new Date().toLocaleTimeString()}] ${msg}`;
  if (logsDiv) {
    logsDiv.appendChild(p);
    logsDiv.scrollTop = logsDiv.scrollHeight; // auto-scroll
  }
}

// Conectar MetaMask y configurar contrato
if (connectButton) {
  connectButton.onclick = async () => {
    try {
      if (!window.ethereum) throw new Error("MetaMask no detectado");

      // Conectar cuentas
      await window.ethereum.request({ method: "eth_requestAccounts" });
      provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
      userAddress = await signer.getAddress();
      
      if (status) status.innerText = "Conectado: " + userAddress;
      log("✅ Conectado a MetaMask con cuenta: " + userAddress);

      // Tomar la dirección de contrato que introduzca el usuario
      const contractAddress = contractAddressInput.value;
      if (!contractAddress || !ethers.utils.isAddress(contractAddress)) {
        log("❌ Dirección de contrato inválida");
        return;
      }
      
      contrato = new ethers.Contract(contractAddress, contractABI, signer);
      log("📄 Contrato conectado en: " + contractAddress);

      // Guardar direcciones dinámicas de proveedor y supermercado
      if (proveedorInput) proveedor = proveedorInput.value;
      if (supermercadoInput) supermercado = supermercadoInput.value;

      // Cambiar a la pantalla de login tras conexión exitosa
      if(document.getElementById('pantalla-conexion')) {
          document.getElementById('pantalla-conexion').classList.add('hidden');
      }
      if(document.getElementById('pantalla-login')) {
          document.getElementById('pantalla-login').classList.remove('hidden');
          document.getElementById('user-wallet').innerText = userAddress;
      }

      // Iniciar detección de rol en el contrato
      await detectarRol(userAddress, contractAddress);

      // Cargar productos si existe la lista
      if (productosList) await cargarProductos();

    } catch (err) {
      log("❌ Error al conectar: " + err.message);
    }
  };
}

//-----------------------------------------------------------------------------
//-------------------------- GESTIÓN DE ROLES (BLOCKCHAIN) --------------------
//-----------------------------------------------------------------------------

async function detectarRol(address, contractAddr) {
    log("Verificando permisos en el contrato...");

    try {
        let rolFinal = "No registrado";
        const elRol = document.getElementById('detected-role');

        // Consultas on-chain basadas en la lógica del contrato
        const ownerAddr = await contrato.owner();
        const isSuper = await contrato.esSupermercado(address);
        const isProv = await contrato.esProveedor(address);

        if (address.toLowerCase() === ownerAddr.toLowerCase()) {
            rolFinal = "Administrador";
            if(elRol) elRol.style.color = "#f39c12"; 
        } else if (isSuper) {
            rolFinal = "Supermercado";
            if(elRol) elRol.style.color = "#2ecc71"; 
        } else if (isProv) {
            rolFinal = "Proveedor";
            if(elRol) elRol.style.color = "#3498db"; 
        } else {
            if(elRol) elRol.style.color = "#e74c3c"; 
            log("Acceso denegado: Dirección no autorizada en el sistema.");
        }

        if(elRol) elRol.innerText = rolFinal;
        log(`Rol identificado con éxito: ${rolFinal}`);

    } catch (error) {
        log("Error crítico al consultar el contrato en Besu.");
        console.error(error);
    }
}

// Cargar productos activos y mostrarlos
async function cargarProductos() {
  try {
    if (!contrato) throw new Error("Contrato no definido");

    const productos = await contrato.obtenerProductosActivos();
    productosList.innerHTML = "";

    if (productos.length === 0) {
      log("⚠️ No hay productos activos en el contrato");
      return;
    }

    productos.forEach(p => {
      const li = document.createElement("li");
      li.innerText = `${p.id}: ${p.nombre} - ${p.descripcion} | Precio: ${p.precio} | Stock: ${p.stockDisponible}`;
      productosList.appendChild(li);
      log(`📦 Producto cargado: ${p.nombre} (ID: ${p.id}) | Stock: ${p.stockDisponible}`);
    });

  } catch (err) {
    log("❌ Error al cargar productos: " + err.message);
  }
}


// Crear pedido de prueba
if (crearPedidoButton) {
  crearPedidoButton.onclick = async () => {
    try {
      if (!contrato) throw new Error("Contrato no definido");

      const productos = await contrato.obtenerProductosActivos();
      if (productos.length === 0) {
        log("⚠️ No hay productos para hacer pedido");
        return;
      }

      const ids = productos.map(p => p.id);
      const cantidades = productos.map(p => 1); // 1 unidad de cada producto

      log("🛒 Creando pedido para proveedor: " + proveedor);
      const tx = await contrato.crearPedido(proveedor, ids, cantidades);
      log("⏳ Transacción enviada, esperando confirmación...");

      await tx.wait();
      log("✅ Pedido creado con éxito!");

    } catch (err) {
      log("❌ Error al crear pedido: " + (err.data?.message || err.message));
    }
  };
}

async function ejecutarRegistro(tipo) {
    const address = prompt(`Introduce la dirección del ${tipo} a registrar (0x...):`);
    if (!address || !ethers.utils.isAddress(address)) return alert("Dirección inválida");

    try {
        log(`Registrando ${tipo}: ${address}...`);
        const tx = (tipo === 'proveedor') 
            ? await contrato.registrarProveedor(address)
            : await contrato.registrarSupermercado(address);
        
        await tx.wait();
        log(`✅ ${tipo} registrado correctamente en Besu.`);
    } catch (err) {
        log("❌ Error: Solo el owner puede realizar esta acción.");
    }
}

async function ejecutarCambioDescuento() {
    const umbral = prompt("Nuevo umbral de productos para descuento (ej: 1000):");
    const porcentaje = prompt("Nuevo porcentaje de descuento (ej: 5):");

    try {
        log("Actualizando política de descuentos...");
        const tx = await contrato.configurarPoliticaDescuentos(umbral, porcentaje);
        await tx.wait();
        log("✅ Política actualizada on-chain.");
    } catch (err) {
        log("❌ Error al actualizar política.");
    }
}

if(document.getElementById('btn-confirmar')) {
    document.getElementById('btn-confirmar').onclick = () => {
        const rol = document.getElementById('detected-role').innerText;

        // Redirección lógica según el rol verificado en la DLT
        if (rol === "Supermercado") {
            window.location.href = "perfil_supermercado.html";
        } else if (rol === "Proveedor") {
            window.location.href = "perfil_proveedor.html";
        } else if (rol === "Administrador") {
            window.location.href = "perfil_owner.html";
        } else {
            alert("No tienes permisos para acceder a la plataforma.");
        }
    };
}