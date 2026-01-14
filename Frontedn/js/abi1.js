const ABI_SISTEMA_PEDIDOS = 
	[
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "idPedido",
				"type": "uint256"
			}
		],
		"name": "PedidoCancelado",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "idPedido",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "supermercado",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "proveedor",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "descuento",
				"type": "uint256"
			}
		],
		"name": "PedidoCreado",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "idPedido",
				"type": "uint256"
			}
		],
		"name": "PedidoEnviado",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "idPedido",
				"type": "uint256"
			}
		],
		"name": "PedidoRecibido",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "nuevoUmbral",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "nuevoPorcentaje",
				"type": "uint256"
			}
		],
		"name": "PoliticaDescuentoActualizada",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "idProducto",
				"type": "uint256"
			}
		],
		"name": "ProductoActualizado",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "idProducto",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "proveedor",
				"type": "address"
			}
		],
		"name": "ProductoCreado",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "idProducto",
				"type": "uint256"
			}
		],
		"name": "ProductoDesactivado",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "proveedor",
				"type": "address"
			}
		],
		"name": "ProveedorRegistrado",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "supermercado",
				"type": "address"
			}
		],
		"name": "SupermercadoRegistrado",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_idProducto",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_nuevoPrecio",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_nuevoStock",
				"type": "uint256"
			}
		],
		"name": "actualizarProducto",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_idPedido",
				"type": "uint256"
			}
		],
		"name": "calcularTotalPedido",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "total",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_idPedido",
				"type": "uint256"
			}
		],
		"name": "cancelarPedido",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_umbral",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_porcentaje",
				"type": "uint256"
			}
		],
		"name": "configurarPoliticaDescuentos",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_idPedido",
				"type": "uint256"
			}
		],
		"name": "confirmarEnvio",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_idPedido",
				"type": "uint256"
			}
		],
		"name": "confirmarRecepcion",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "contadorPedidos",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "contadorProductos",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_proveedor",
				"type": "address"
			},
			{
				"internalType": "uint256[]",
				"name": "_idsProductos",
				"type": "uint256[]"
			},
			{
				"internalType": "uint256[]",
				"name": "_cantidades",
				"type": "uint256[]"
			}
		],
		"name": "crearPedido",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_nombre",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_descripcion",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_precio",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_stock",
				"type": "uint256"
			}
		],
		"name": "crearProducto",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_idProducto",
				"type": "uint256"
			}
		],
		"name": "eliminarProducto",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "esProveedor",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "esSupermercado",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "obtenerNumeroPedidos",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_proveedor",
				"type": "address"
			}
		],
		"name": "obtenerPedidosPorProveedor",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "supermercado",
						"type": "address"
					},
					{
						"internalType": "address",
						"name": "proveedor",
						"type": "address"
					},
					{
						"internalType": "enum SistemaPedidosB2B.EstadoPedido",
						"name": "estado",
						"type": "uint8"
					},
					{
						"internalType": "uint256",
						"name": "descuentoAplicado",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "fechaCreacion",
						"type": "uint256"
					},
					{
						"components": [
							{
								"internalType": "uint256",
								"name": "idProducto",
								"type": "uint256"
							},
							{
								"internalType": "uint256",
								"name": "cantidad",
								"type": "uint256"
							}
						],
						"internalType": "struct SistemaPedidosB2B.LineaProducto[]",
						"name": "productos",
						"type": "tuple[]"
					}
				],
				"internalType": "struct SistemaPedidosB2B.Pedido[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_supermercado",
				"type": "address"
			}
		],
		"name": "obtenerPedidosPorSupermercado",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "supermercado",
						"type": "address"
					},
					{
						"internalType": "address",
						"name": "proveedor",
						"type": "address"
					},
					{
						"internalType": "enum SistemaPedidosB2B.EstadoPedido",
						"name": "estado",
						"type": "uint8"
					},
					{
						"internalType": "uint256",
						"name": "descuentoAplicado",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "fechaCreacion",
						"type": "uint256"
					},
					{
						"components": [
							{
								"internalType": "uint256",
								"name": "idProducto",
								"type": "uint256"
							},
							{
								"internalType": "uint256",
								"name": "cantidad",
								"type": "uint256"
							}
						],
						"internalType": "struct SistemaPedidosB2B.LineaProducto[]",
						"name": "productos",
						"type": "tuple[]"
					}
				],
				"internalType": "struct SistemaPedidosB2B.Pedido[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_idProducto",
				"type": "uint256"
			}
		],
		"name": "obtenerProducto",
		"outputs": [
			{
				"internalType": "string",
				"name": "nombre",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "descripcion",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "precio",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "stock",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "stockSuficiente",
				"type": "bool"
			},
			{
				"internalType": "address",
				"name": "proveedor",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "obtenerProductosActivos",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "nombre",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "descripcion",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "precio",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "stockDisponible",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "activo",
						"type": "bool"
					},
					{
						"internalType": "address",
						"name": "proveedor",
						"type": "address"
					}
				],
				"internalType": "struct SistemaPedidosB2B.Producto[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_proveedor",
				"type": "address"
			}
		],
		"name": "obtenerProductosPorProveedor",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "nombre",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "descripcion",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "precio",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "stockDisponible",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "activo",
						"type": "bool"
					},
					{
						"internalType": "address",
						"name": "proveedor",
						"type": "address"
					}
				],
				"internalType": "struct SistemaPedidosB2B.Producto[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_proveedor",
				"type": "address"
			}
		],
		"name": "obtenerReputacionProveedor",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "completados",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "cancelados",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "pedidos",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "supermercado",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "proveedor",
				"type": "address"
			},
			{
				"internalType": "enum SistemaPedidosB2B.EstadoPedido",
				"name": "estado",
				"type": "uint8"
			},
			{
				"internalType": "uint256",
				"name": "descuentoAplicado",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "fechaCreacion",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "porcentajeDescuento",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "productos",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "nombre",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "descripcion",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "precio",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "stockDisponible",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "activo",
				"type": "bool"
			},
			{
				"internalType": "address",
				"name": "proveedor",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_proveedor",
				"type": "address"
			}
		],
		"name": "registrarProveedor",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_supermercado",
				"type": "address"
			}
		],
		"name": "registrarSupermercado",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "reputacion",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "pedidosCompletados",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "pedidosCancelados",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "umbralGranVolumen",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}

];