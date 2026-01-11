// ABI mínimo para funciones que vamos a usar
const contractABI = [
  "function obtenerProductosActivos() view returns (tuple(uint256 id,string nombre,string descripcion,uint256 precio,uint256 stockDisponible,bool activo,address proveedor)[])",
  "function crearPedido(address _proveedor, uint256[] _idsProductos, uint256[] _cantidades) external",
];

let provider;
let signer;
let contrato;
let proveedor;
let supermercado;

const connectButton = document.getElementById("connectButton");
const productosList = document.getElementById("productosList");
const crearPedidoButton = document.getElementById("crearPedidoButton");
const status = document.getElementById("status");
const logsDiv = document.getElementById("logs");

const contractAddressInput = document.getElementById("contractAddressInput");
const proveedorInput = document.getElementById("proveedorInput");
const supermercadoInput = document.getElementById("supermercadoInput");

// Función para mostrar logs
function log(msg) {
  console.log(msg);
  const p = document.createElement("p");
  p.innerText = msg;
  logsDiv.appendChild(p);
  logsDiv.scrollTop = logsDiv.scrollHeight; // auto-scroll
}

// Conectar MetaMask y configurar contrato
connectButton.onclick = async () => {
  try {
    if (!window.ethereum) throw new Error("MetaMask no detectado");

    // Conectar cuentas
    await window.ethereum.request({ method: "eth_requestAccounts" });
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    const cuenta = await signer.getAddress();
    status.innerText = "Conectado: " + cuenta;
    log("✅ Conectado a MetaMask con cuenta: " + cuenta);

    // Tomar la dirección de contrato que introduzca el usuario
    const contractAddress = contractAddressInput.value;
    if (!contractAddress || !ethers.utils.isAddress(contractAddress)) {
      log("❌ Dirección de contrato inválida");
      return;
    }
    contrato = new ethers.Contract(contractAddress, contractABI, signer);
    log("📄 Contrato conectado en: " + contractAddress);

    // Guardar direcciones dinámicas de proveedor y supermercado
    proveedor = proveedorInput.value;
    supermercado = supermercadoInput.value;

    // Cargar productos
    await cargarProductos();

  } catch (err) {
    log("❌ Error al conectar: " + err.message);
  }
};

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
