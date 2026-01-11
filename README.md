# Trabajo_Block
Trabajo fgrupal donde desarrollaremos los avances de nuestra aplicación Blockchain

## 1. Contrato
El contrato se encuentra en la rama prueba y ya funciona. Tiene diversas funciones que permiten la creación de las distitnas entidades

He añadido diversos productos con mis direcciones de Metablock

## 2. Frontend
Todo lo relacionado con el frontend realizado hasta ahora por Celia se encuentra en la carpeta DLT_Frontend.
La idea es que haya varias "pantallas" que te permita:
1. Conectarte a Metamask
2. Comprobar/Decir si eres Proveedor/Supermercado

Para proveedor:
- Crear, Modificar, Eliminar, Consultar PRODUCTOS + stock
- Consultar PEDIDOS asignados 

Para supermercado:
- Crear, Modificar, Eliminar, Consultar PEDIDOS
- Consultar PROVEEDORES ( + filtro satisfación?)
- Consultar PROVEEDORES + sus PRODUCTOS
- Consultar PRODUCTOS 

### 1. Conexión y Login
- Conectarse a MetaMask
- Identificar el rol según la dirección registrada en el contrato:
  - Proveedor
  - Supermercado

### 2. Funcionalidades por Rol

#### 2.1 Proveedor
- **Productos**
  - Crear productos (`crearProducto`)
  - Modificar productos (`actualizarProducto`)
  - Eliminar productos (`eliminarProducto`)
  - Consultar productos:
    - Todos los productos activos del proveedor (`obtenerProductosPorProveedor`)
    - Todos los productos activos en el sistema (`obtenerProductosActivos`)
- **Pedidos**
  - Consultar pedidos asignados al proveedor  
    *(Nota: El contrato actualmente **NO** tiene función directa para filtrar pedidos por proveedor. Se podría añadir:)*

function obtenerPedidosPorProveedor(address _proveedor) external view returns (Pedido[] memory) { ... }


#### 2.2 Supermercado
- **Pedidos**
    - Crear pedidos (`crearPedido`)
    - Cancelar pedidos (`cancelarPedido`)
    - Consultar pedidos del supermercado
    - (`Opcional`) Modificar pedidos → actualmente no implementado en contrato

- **Proveedores**
    - Consultar proveedores registrados (`esProveedor`)
    - Filtrar proveedores por satisfacción:
    satisfaccion = pedidosCompletados / (pedidosCompletados + pedidosCancelados)
    - Consultar productos de proveedores (`obtenerProductosPorProveedor`)

- **Productos**
    - Consultar todos los productos activos (`obtenerProductosActivos`)


### 3. Detalles extra a considerar
- **Stock automático:**
    - Actualmente el contrato solo valida stock, no lo descuenta.
    - Para reflejar stock real, se podría actualizar crearPedido así:
    productos[_idProducto].stockDisponible -= _cantidades[i];


- **Roles y permisos en frontend:**
    - Mostrar solo botones y opciones que correspondan al rol del usuario.


- **Logs de acciones:**
    - Mostrar confirmaciones de transacción y errores en pantalla.

### 4. Navegación / Pantallas

#### Pantalla de conexión
- Botón: Conectar MetaMask
- Campo: Dirección del contrato
- Mostrar logs de conexión

#### Pantalla de login
- Detectar automáticamente el rol según dirección
- Botón: Confirmar rol / cambiar rol manualmente (opcional)

#### Pantalla de inicio
- Breve resumen según rol:
  - **Proveedor:** total productos, pedidos asignados
  - **Supermercado:** total pedidos, proveedores disponibles

#### Pantalla de gestión
- **Proveedor:**
  - Crear / Modificar / Eliminar productos
  - Consultar pedidos asignados
- **Supermercado:**
  - Crear / Cancelar pedidos
  - Consultar proveedores + productos
  - Consultar pedidos

#### Pantalla de logs
- Mostrar todas las transacciones recientes
- Mostrar errores y confirmaciones




### 5. Resumen de funciones del contrato a usar en frontend

| Función                       | Rol                       | Descripción                                         |
|-------------------------------|---------------------------|---------------------------------------------------|
| `crearProducto`               | Proveedor                 | Crear nuevo producto                               |
| `actualizarProducto`          | Proveedor                 | Modificar precio/stock                             |
| `eliminarProducto`            | Proveedor                 | Marcar producto como inactivo                     |
| `obtenerProductosPorProveedor`| Proveedor / Supermercado  | Listar productos de un proveedor                  |
| `obtenerProductosActivos`     | Proveedor / Supermercado  | Listar todos los productos activos                |
| `crearPedido`                 | Supermercado              | Crear nuevo pedido                                 |
| `cancelarPedido`              | Supermercado              | Cancelar pedido pendiente                          |
| `confirmarEnvio`              | Proveedor                 | Marcar pedido como enviado                         |
| `confirmarRecepcion`          | Supermercado              | Marcar pedido como recibido                        |
| `obtenerNumeroPedidos`        | Ambos                     | Número total de pedidos                             |
| `reputacion`                  | Ambos                     | Pedidos completados / cancelados por proveedor    |
| `esProveedor`                 | Ambos                     | Validar dirección de proveedor                     |
| `esSupermercado`              | Ambos                     | Validar dirección de supermercado                 |
