# PoliMarket - Arquitectura de Componentes Distribuidos 🛒⚙️

Este repositorio contiene el código fuente y la documentación de diseño para el caso de estudio **PoliMarket**, desarrollado como parte de la Actividad Nro. 2 para la maestría en Arquitectura de Componentes Distribuidos.

El proyecto implementa un modelo de diseño basado en componentes, separando estrictamente la capa de presentación (cliente) de la capa lógica de negocio (servicios core), garantizando alta cohesión y bajo acoplamiento entre módulos.

## 🏗️ Arquitectura del Sistema

El sistema está dividido en dos capas principales que se comunican a través de una API RESTful:

1. **Capa de Negocio (Backend):** Desarrollada en **Go**, expone las funcionalidades centrales de las diferentes áreas de negocio de la empresa (Recursos Humanos, Ventas, Bodega, Proveedores y Entregas).
2. **Capa de Clientes (Frontend):** Desarrollada en **HTML5 y Vanilla JavaScript**, actúa como la terminal interactiva para el área de Ventas, consumiendo los servicios expuestos por el backend para realizar las operaciones requeridas.

### Requisitos Funcionales Implementados (5)
De acuerdo con las reglas de negocio establecidas, el sistema cubre los siguientes flujos operativos:
* **Req 1 (RRHH):** Autorización de vendedores en el sistema.
* **Req 2 (Ventas):** Consulta del catálogo de productos y listado de clientes.
* **Req 3 (Bodega):** Verificación de disponibilidad y stock de productos.
* **Req 4 (Proveedores):** Registro de compras y reabastecimiento de inventario.
* **Req 5 (Entregas):** Consulta de despachos pendientes cruzando información de ventas.

## 🧩 Actividad / Patrones

### 1) Descripción del problema
En el proceso de **validación de stock**, la lógica puede terminar duplicada en diferentes puntos (ventas, compras y bodega), lo que eleva el riesgo de inconsistencias, errores y cambios costosos cuando se ajustan las reglas del negocio.

### 2) Patrón aplicado
Se aplica el patrón **GoF Factory Method** para encapsular la creación del validador de stock. Esto desacopla la lógica de validación del endpoint y permite evolucionar la validación (por ejemplo, reglas por tipo de producto) sin tocar los consumidores.

### 3) Evidencia en el código
Se creó una interfaz `StockValidator`, su implementación `DefaultStockValidator` y un método de fábrica `NewStockValidator`, utilizado por el endpoint `POST /bodega/validar`.

**Ejemplo de uso del endpoint `POST /bodega/validar`:**

```bash
curl -X POST http://localhost:8080/bodega/validar \
  -H "Content-Type: application/json" \
  -d '{"id_producto":"P1","cantidad":2}'
```

**Respuesta esperada:**

```json
{
  "disponible": true,
  "stock_actual": 15,
  "mensaje": "Stock disponible"
}
```

### 4) Documento breve
El documento breve queda representado en esta sección del README y sirve para publicación en el foro del curso.

### 5) Retroalimentación individual
Como parte de la actividad, cada integrante debe comentar el trabajo de otro grupo indicando si está de acuerdo con el enfoque propuesto o si aplicaría una solución diferente.

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
```