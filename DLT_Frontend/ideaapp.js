let provider, signer, contrato;
let usuario, rol;

// ABI mínimo necesario de tu contrato (solo lo que usamos)
const abi = [
  "function esProveedor(address) view returns (bool)",
  "function esSupermercado(address) view returns (bool)",
  "function contadorPedidos() view returns (uint256)",
  "function pedidos(uint256) view returns (tuple(uint256 id,address supermercado,address proveedor,uint8 estado,uint256 descuentoAplicado,uint256 fechaCreacion,tuple(uint256 idProducto,uint256 cantidad)[] productos))",
  "function obtenerProductosActivos() view returns (tuple(uint256 id,string nombre,string descripcion,uint256 precio,uint256 stockDisponible,bool activo,address proveedor)[])",
  "function crearProducto(string,string,uint256,uint256)",
  "function eliminarProducto(uint256)",
  "function crearPedido(address,uint256[],uint256[])",
  "function cancelarPedido(uint256)"
];

function log(msg) {
  document.querySelectorAll("#log").forEach(l => l.innerText = msg);
}

function mostrarPantalla(nombre) {
  const pantallas = ['login','inicio','pedidos','productos'];
  for(const p of pantallas){
    document.getElementById(`pantalla-${p}`).style.display = (p===nombre?'block':'none');
  }
}

async function conectarContrato() {
  const direccion = document.getElementById("direccionContrato").value.trim();
  if(!direccion){ 
    log("❌ Introduce la dirección del contrato"); 
    return; 
  }

  if(!window.ethereum){ 
    log("❌ MetaMask no detectado"); 
    return; 
  }

  try {
    log("⏳ Conectando a MetaMask...");
    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    usuario = await signer.getAddress();

    log(`🔹 Cuenta conectada: ${usuario}\n⏳ Conectando al contrato...`);

    contrato = new ethers.Contract(direccion, abi, signer);

    // Verificar que el contrato responde
    try {
      const esProv = await contrato.esProveedor(usuario);
      const esSuper = await contrato.esSupermercado(usuario);

      log(`📄 Contrato conectado: ${direccion}\nRol detectado: ${esProv ? "proveedor" : esSuper ? "supermercado" : "ninguno"}`);

      if(esProv) rol = "proveedor";
      else if(esSuper) rol = "supermercado";
      else { log("❌ Usuario no registrado como proveedor o supermercado"); return; }

      document.getElementById("bienvenida").innerText = `Bienvenido ${rol}`;
      const opcionesDiv = document.getElementById("opciones-rol");
      opcionesDiv.innerHTML = "";

      if(rol==="proveedor"){
        opcionesDiv.innerHTML = `
          <button onclick="mostrarPantalla('productos'); cargarProductos()">Ver/Administrar Productos</button>
        `;
      } else {
        opcionesDiv.innerHTML = `
          <button onclick="mostrarPantalla('pedidos'); cargarPedidos()">Ver/Administrar Pedidos</button>
        `;
      }

      mostrarPantalla("inicio");

    } catch(err2) {
      log("❌ Error conectando al contrato (funciones no disponibles?)\n" + (err2.data?.message || err2.message));
      console.error(err2);
    }

  } catch(err) {
    log("❌ Error MetaMask: " + (err.data?.message || err.message));
    console.error(err);
  }
}


// ---------- FUNCIONES PROVEEDOR ----------
async function cargarProductos() {
  const lista = document.getElementById("productosList");
  lista.innerHTML = "";
  const productos = await contrato.obtenerProductosActivos();

  productos.forEach(p => {
    if(p.proveedor.toLowerCase() === usuario.toLowerCase()){
      const li = document.createElement("li");
      li.innerHTML = `${p.nombre} | Stock: ${p.stockDisponible} 
        <button onclick="eliminarProducto(${p.id})">Eliminar</button>`;
      lista.appendChild(li);
    }
  });
}

async function eliminarProducto(id) {
  log("⏳ Eliminando producto...");
  try {
    const tx = await contrato.eliminarProducto(id);
    await tx.wait();
    log("✅ Producto eliminado");
    cargarProductos();
  } catch(err) {
    log("❌ Error: " + (err.data?.message || err.message));
  }
}

// ---------- FUNCIONES SUPERMERCADO ----------
async function cargarPedidos() {
  const lista = document.getElementById("pedidosList");
  lista.innerHTML = "";

  const total = await contrato.contadorPedidos();
  for(let i=1;i<=total;i++){
    const p = await contrato.pedidos(i);
    if(p.supermercado.toLowerCase() !== usuario.toLowerCase()) continue;
    const estado = ["Pendiente","Enviado","Recibido","Cancelado"][p.estado];
    const li = document.createElement("li");
    li.innerHTML = `Pedido ID ${p.id} | Estado: ${estado} | Productos: ${p.productos.map(x=>`ID${x.idProducto}x${x.cantidad}`).join(", ")}
      <button onclick="cancelarPedido(${p.id})">Cancelar</button>`;
    lista.appendChild(li);
  }
}

async function cancelarPedido(id) {
  log("⏳ Cancelando pedido...");
  try{
    const tx = await contrato.cancelarPedido(id);
    await tx.wait();
    log("✅ Pedido cancelado");
    cargarPedidos();
  } catch(err){
    log("❌ Error: " + (err.data?.message || err.message));
  }
}
