# PoliMarket - Arquitectura de Componentes Distribuidos 🛒⚙️

Este repositorio contiene el código fuente y la documentación de diseño para el caso de estudio **PoliMarket**, desarrollado como parte de la Actividad Nro. 2 para la maestría en Arquitectura de Software del Politécnico Grancolombiano.

El proyecto implementa un modelo de diseño basado en componentes, separando estrictamente la capa de presentación (cliente) de la capa lógica de negocio (servicios core), garantizando alta cohesión, bajo acoplamiento y facilitando la reutilización de software.

## 🏗️ Arquitectura del Sistema

El sistema está dividido en dos capas principales que se comunican a través de una API RESTful:

1. **Capa de Negocio (Backend):** Desarrollada en **Go**, expone las funcionalidades centrales de las diferentes áreas de negocio de la empresa (Recursos Humanos, Ventas, Bodega, Proveedores y Entregas).
2. **Capa de Clientes (Frontend):** Desarrollada en **HTML5 y Vanilla JavaScript**, actúa como la terminal interactiva para el área de Ventas, consumiendo los servicios expuestos por el backend de manera asíncrona.

### Requisitos Funcionales Implementados (5)
De acuerdo con las reglas de negocio establecidas, el sistema cubre los siguientes flujos operativos:
* **Req 1 (RRHH):** Autorización de vendedores en el sistema.
* **Req 2 (Ventas):** Consulta del catálogo de productos y listado de clientes.
* **Req 3 (Bodega):** Verificación de disponibilidad y stock de productos.
* **Req 4 (Proveedores):** Registro de compras y reabastecimiento de inventario.
* **Req 5 (Entregas):** Consulta de despachos pendientes cruzando información de ventas.

## 🛠️ Stack Tecnológico

* **Backend:** Go (Golang) usando la librería estándar `net/http`.
* **Frontend:** HTML5, Vanilla JavaScript (Fetch API).
* **Diseño UML:** PlantUML (exportado a formato estricto UML 2.5).

## 📂 Estructura del Repositorio

```text
polimarket-arquitectura/
├── backend-go/                # Capa de negocio (API REST en Go)
│   ├── main.go                # Endpoints y lógica de componentes simulada
│   └── go.mod                 # Definición del módulo
├── cliente-web/               # Capa de cliente (Terminal de Ventas)
│   └── index.html             # Interfaz de usuario e integración con API
├── docs/                      # Entregables de diseño (Exportados en formato BMP)
│   ├── diagrama_clases.bmp    # Modelo de datos UML 2.5
│   └── diagrama_componentes.bmp # Modelo de componentes y fachadas UML 2.5
└── README.md                  # Documentación del proyecto
