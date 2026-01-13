// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Sistema de Pedidos Supermercados–Proveedores
 * @author Proyecto DLT
 * @notice Registro on-chain de pedidos, productos, descuentos automáticos y reputación
 */

// Este contrato gestiona la relación comercial entre supermercados y proveedores.
// Permite crear productos, realizar pedidos y llevar un historial de reputación.


contract SistemaPedidosB2B {

    // ROLES

    address public owner; // Dirección del administrador del sistema, quien despliega el contrato
    
    // Mapeos para identificar quienes son proveedores o supermercados autorizados
    mapping(address => bool) public esProveedor;
    mapping(address => bool) public esSupermercado;

    
    // Restringir acceso a roles registrados
    modifier onlyOwner() {
        require(msg.sender == owner, "Solo el administrador");
        _;
    }

    modifier onlyProveedor() {
        require(esProveedor[msg.sender], "Solo proveedor autorizado");
        _;
    }

    modifier onlySupermercado() {
        require(esSupermercado[msg.sender], "Solo supermercado autorizado");
        _;
    }


    //-----------------------------------------------------------------------------
    //------------------------ ENUMS Y STRUCTS -------------------------------------
    //-----------------------------------------------------------------------------


    enum EstadoPedido { Pendiente, Enviado, Recibido, Cancelado }

    // Producto ofrecido por un proveedor
    struct Producto {
        uint256 id;
        string nombre;
        string descripcion;
        uint256 precio;
        uint256 stockDisponible;
        bool activo;
        address proveedor;
    }

    // Producto específico dentro de un pedido
    struct LineaProducto {
        uint256 idProducto;
        uint256 cantidad;
    }

    
    // Contiene info asociada a un pedido
    struct Pedido {
        uint256 id;
        address supermercado;
        address proveedor;
        EstadoPedido estado;
        uint256 descuentoAplicado; // porcentaje fijo
        uint256 fechaCreacion;
        LineaProducto[] productos;
    }

    // Registra el historial de comportamiento de cada proveedor
    struct ReputacionProveedor {
        uint256 pedidosCompletados;
        uint256 pedidosCancelados;
    }


    //-----------------------------------------------------------------------------
    //--------------------------VARIABLES DE ESTADO ------------------------------
    //-----------------------------------------------------------------------------

    // Contadores para generar identificadores únicos
    uint256 public contadorPedidos;
    uint256 public contadorProductos;

    // Política de descuentos para pedidos de gran volumen
    uint256 public umbralGranVolumen = 1000;
    uint256 public porcentajeDescuento = 5;

    // Almacenan pedidos, productos y reputación de proveedores    
    mapping(uint256 => Pedido) public pedidos;
    mapping(uint256 => Producto) public productos;
    mapping(address => ReputacionProveedor) public reputacion;




    //-----------------------------------------------------------------------------
    //-------------------------- EVENTOS---------- ------------------------------
    //-----------------------------------------------------------------------------

    event ProveedorRegistrado(address proveedor);
    event SupermercadoRegistrado(address supermercado);

    event ProductoCreado(uint256 idProducto, address proveedor);
    event ProductoActualizado(uint256 idProducto);
    event ProductoDesactivado(uint256 idProducto);

    event PedidoCreado(uint256 idPedido, address supermercado, address proveedor, uint256 descuento);
    event PedidoEnviado(uint256 idPedido);
    event PedidoRecibido(uint256 idPedido);
    event PedidoCancelado(uint256 idPedido);

    event PoliticaDescuentoActualizada(uint256 nuevoUmbral, uint256 nuevoPorcentaje);

    //-----------------------------------------------------------------------------
    //-------------------------- CONSTRUCTOR---------- ------------------------------
    //-----------------------------------------------------------------------------


    constructor() {
        owner = msg.sender;
    }

    //-----------------------------------------------------------------------------
    //-------------------------- GESTIÓN DE ACTORES (OWNER)----------------
    //-----------------------------------------------------------------------------


    // Registro de actores
    function registrarProveedor(address _proveedor) external onlyOwner {
        esProveedor[_proveedor] = true;
        emit ProveedorRegistrado(_proveedor);
    }

    function registrarSupermercado(address _supermercado) external onlyOwner {
        esSupermercado[_supermercado] = true;
        emit SupermercadoRegistrado(_supermercado);
    }

    function configurarPoliticaDescuentos(uint256 _umbral, uint256 _porcentaje) external onlyOwner {
        umbralGranVolumen = _umbral;
        porcentajeDescuento = _porcentaje;
        emit PoliticaDescuentoActualizada(_umbral, _porcentaje);
    }

    //-----------------------------------------------------------------------------
    //-------------------------- GESTIÓN DE PRODUCTOS ----------------
    //-----------------------------------------------------------------------------

    // Permite a un proveedor crear un nuevo producto
    function crearProducto(
        string calldata _nombre,
        string calldata _descripcion,
        uint256 _precio,
        uint256 _stock
    ) external onlyProveedor {
        contadorProductos++;

        productos[contadorProductos] = Producto({
            id: contadorProductos,
            nombre: _nombre,
            descripcion: _descripcion,
            precio: _precio,
            stockDisponible: _stock,
            activo: true,
            proveedor: msg.sender
        });

        emit ProductoCreado(contadorProductos, msg.sender);
    }

    
    
    function actualizarProducto(
        uint256 _idProducto,
        uint256 _nuevoPrecio,
        uint256 _nuevoStock
    ) external onlyProveedor {
        Producto storage p = productos[_idProducto];
        require(p.proveedor == msg.sender, "No eres el propietario");

        p.precio = _nuevoPrecio;
        p.stockDisponible = _nuevoStock;

        emit ProductoActualizado(_idProducto);
    }

    function eliminarProducto(uint256 _idProducto) external onlyProveedor {
        Producto storage p = productos[_idProducto];
        require(p.proveedor == msg.sender, "No eres el propietario");

        p.activo = false;
        emit ProductoDesactivado(_idProducto);
    }


    //-----------------------------------------------------------------------------
    //-------------------------- GESTIÓN DE PEDIDOS -------------------------------
    //-----------------------------------------------------------------------------

    // Permite a un supermercado crear un pedido a un proveedor
    function crearPedido(
        address _proveedor,
        uint256[] calldata _idsProductos,
        uint256[] calldata _cantidades
    ) external onlySupermercado {

        require(esProveedor[_proveedor], "Proveedor no autorizado");
        require(_idsProductos.length == _cantidades.length, "Datos inconsistentes");

        contadorPedidos++;
        Pedido storage p = pedidos[contadorPedidos];

        p.id = contadorPedidos;
        p.supermercado = msg.sender;
        p.proveedor = _proveedor;
        p.estado = EstadoPedido.Pendiente;
        p.fechaCreacion = block.timestamp;

        uint256 totalCantidad = 0;

         // Se verifica que haya stock y que el producto esté activos y se añade cada LineaProducto al pedido

        for (uint256 i = 0; i < _idsProductos.length; i++) {
            Producto storage prod = productos[_idsProductos[i]];
            require(prod.activo, "Producto inactivo");
            require(prod.stockDisponible >= _cantidades[i], "Stock insuficiente");

            totalCantidad += _cantidades[i];

            p.productos.push(
                LineaProducto({
                    idProducto: _idsProductos[i],
                    cantidad: _cantidades[i]
                })
            );
        }

        if (totalCantidad >= umbralGranVolumen) { // Aplica un descuento automático si se supera el umbral definido
            p.descuentoAplicado = porcentajeDescuento;
        } else {
            p.descuentoAplicado = 0;
        }

        emit PedidoCreado(contadorPedidos, msg.sender, _proveedor, p.descuentoAplicado);
    }

    function confirmarEnvio(uint256 _idPedido) external onlyProveedor {
        Pedido storage p = pedidos[_idPedido];
        require(p.proveedor == msg.sender, "No eres el proveedor asignado");
        require(p.estado == EstadoPedido.Pendiente, "Estado invalido");

        p.estado = EstadoPedido.Enviado; // El proveedor confirma el envío del pedido
        emit PedidoEnviado(_idPedido);
    }

    function confirmarRecepcion(uint256 _idPedido) external onlySupermercado {
        Pedido storage p = pedidos[_idPedido];
        require(p.supermercado == msg.sender, "No eres el supermercado");
        require(p.estado == EstadoPedido.Enviado, "Pedido no enviado");

        p.estado = EstadoPedido.Recibido; // El supermercado confirma la recepción del pedido
        reputacion[p.proveedor].pedidosCompletados++;

        emit PedidoRecibido(_idPedido);
    }

    function cancelarPedido(uint256 _idPedido) external onlySupermercado {
        Pedido storage p = pedidos[_idPedido];
        require(p.supermercado == msg.sender, "No autorizado");
        require(p.estado == EstadoPedido.Pendiente, "No se puede cancelar");

        p.estado = EstadoPedido.Cancelado;
        reputacion[p.proveedor].pedidosCancelados++;

        emit PedidoCancelado(_idPedido);
    }

    //-----------------------------------------------------------------------------
    //-------------------------- FUNCIONES DE CONSULTA ---------- ----------------
    //-----------------------------------------------------------------------------


    function obtenerNumeroPedidos() external view returns (uint256) {
        return contadorPedidos;
    }

    // Devuelve la reputación de un proveedor (pedidos completados y cancelados)
    function obtenerReputacionProveedor(address _proveedor) external view returns (uint256 completados, uint256 cancelados) {
        ReputacionProveedor storage r = reputacion[_proveedor];
        return (r.pedidosCompletados, r.pedidosCancelados);
    }

    // Permite a los supermercados consultar un producto activo por su ID
    function obtenerProducto(uint256 _idProducto) external view returns (string memory nombre, string memory descripcion, uint256 precio, uint256 stock, bool stockSuficiente, address proveedor){
        Producto storage p = productos[_idProducto];
        require(p.activo, "Producto no disponible");

        bool disponible = p.stockDisponible > 0;

        return (
            p.nombre,
            p.descripcion,
            p.precio,
            p.stockDisponible,
            disponible,
            p.proveedor
        );
    }

    // Devuelve todos los productos activos ofrecidos por proveedores
    function obtenerProductosActivos() external view returns (Producto[] memory) {
        uint256 total = contadorProductos;
        uint256 activos = 0;

        // Contar productos activos
        for (uint256 i = 1; i <= total; i++) {
            if (productos[i].activo) {
                activos++;
            }
        }

        // Crear array del tamaño exacto
        Producto[] memory lista = new Producto[](activos);
        uint256 index = 0;

        // Llenar el array
        for (uint256 i = 1; i <= total; i++) {
            if (productos[i].activo) {
                lista[index] = productos[i];
                index++;
            }
        }

        return lista;
    }

    // Devuelve los productos activos de un proveedor concreto
    function obtenerProductosPorProveedor(address _proveedor) external view returns (Producto[] memory){
        uint256 total = contadorProductos;
        uint256 cantidad = 0;

        // Contar productos activos del proveedor
        for (uint256 i = 1; i <= total; i++) {
            if (
                productos[i].activo &&
                productos[i].proveedor == _proveedor
            ) {
                cantidad++;
            }
        }

        Producto[] memory lista = new Producto[](cantidad);
        uint256 index = 0;

        // Llenar array
        for (uint256 i = 1; i <= total; i++) {
            if (
                productos[i].activo &&
                productos[i].proveedor == _proveedor
            ) {
                lista[index] = productos[i];
                index++;
            }
        }

        return lista;
    }

    // Obtener pedidos por supermercado para que un supermercado pueda ver su historial de pedidos
    function obtenerPedidosPorSupermercado(address _supermercado) external view returns (Pedido[] memory){
        uint256 total = contadorPedidos;
        uint256 cantidad = 0;

        for (uint256 i = 1; i <= total; i++) {
            if (pedidos[i].supermercado == _supermercado) {
                cantidad++;
            }
        }

        Pedido[] memory lista = new Pedido[](cantidad);
        uint256 index = 0;

        for (uint256 i = 1; i <= total; i++) {
            if (pedidos[i].supermercado == _supermercado) {
                lista[index] = pedidos[i];
                index++;
            }
        }

        return lista;
    }

    //obtenerPedidosPorProveedor para que el proveedor vea todos los pedidos que ha recibido
    function obtenerPedidosPorProveedor(address _proveedor) external view returns (Pedido[] memory){
        uint256 total = contadorPedidos;
        uint256 cantidad = 0;

        for (uint256 i = 1; i <= total; i++) {
            if (pedidos[i].proveedor == _proveedor) {
                cantidad++;
            }
        }

        Pedido[] memory lista = new Pedido[](cantidad);
        uint256 index = 0;

        for (uint256 i = 1; i <= total; i++) {
            if (pedidos[i].proveedor == _proveedor) {
                lista[index] = pedidos[i];
                index++;
            }
        }

        return lista;
    }

    // function obtenerPedido(uint256 _idPedido)
    // external
    // view
    // returns (
    //     address supermercado,
    //     address proveedor,
    //     EstadoPedido estado,
    //     uint256 descuento,
    //     uint256 fecha,
    //     LineaProducto[] memory productos){
        
    //     Pedido storage p = pedidos[_idPedido];

    //     return (
    //         p.supermercado,
    //         p.proveedor,
    //         p.estado,
    //         p.descuentoAplicado,
    //         p.fechaCreacion,
    //         p.productos
    //     );
    // }

    function calcularTotalPedido(uint256 _idPedido) external view returns (uint256 total) {
        Pedido storage p = pedidos[_idPedido];

        for (uint256 i = 0; i < p.productos.length; i++) {
            LineaProducto storage lp = p.productos[i];
            Producto storage prod = productos[lp.idProducto];

            total += prod.precio * lp.cantidad;
        }

        if (p.descuentoAplicado > 0) {
            total = total - ((total * p.descuentoAplicado) / 100);
        }
    }

}
