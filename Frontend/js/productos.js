async function init() {
    await conectarWallet();
    cargarContrato();
    cargarProductos();
}

async function cargarProductos() {
    const lista = await contrato.obtenerProductosActivos();
    const cont = document.getElementById("productos");

    lista.forEach(p => {
        cont.innerHTML += `
            <div>
                <b>${p.nombre}</b> (${p.precio})
                <input type="number" id="c${p.id}" value="1">
                <button onclick="agregarProducto(${p.id}, 
                    document.getElementById('c${p.id}').value,
                    '${p.proveedor}')">Añadir</button>
            </div>
        `;
    });
}