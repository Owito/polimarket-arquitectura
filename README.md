## Estado del proyecto

Este repositorio contiene un ejemplo sencillo de arquitectura para **PoliMarket** con tres piezas principales:

- **backend-go/**: API en Go con datos en memoria. Expone endpoints de demostración:
  - `GET /hr/autorizar`
  - `GET /ventas/catalogo`
  - `GET /bodega/stock`
  - `POST /proveedores/compra`
  - `GET /entregas/pendientes`
- **cliente-cli-rust/**: cliente de línea de comandos (Rust) que consulta `/entregas/pendientes` y `/bodega/stock` contra `http://localhost:8080`.
- **cliente-web/**: página HTML que permite probar `/hr/autorizar` y `/ventas/catalogo`. **Reemplaza `API_URL` en el script por la URL del backend desplegado** (por ejemplo, en Render).
- **docs/**: diagramas PlantUML de clases y componentes.
- **render.yaml**: configuración para desplegar el backend en Render.

### Ejecución rápida

1) **Backend**:  
   ```bash
   cd backend-go
   go run main.go
   ```

2) **CLI** (requiere backend activo en `:8080`):  
   ```bash
   cd cliente-cli-rust
   cargo run
   ```

3) **Web**: abre `cliente-web/index.html` en el navegador tras ajustar `API_URL`.

### Estado actual y pruebas

- Backend operativo con datos de ejemplo y CORS habilitado para pruebas.
- Clientes (CLI y web) preparados para consumir la API; el web requiere definir `API_URL`.
- Sin base de datos ni autenticación real (solo mocks).
- Pruebas ejecutadas en esta rama:
  - `backend-go`: `go test ./...` (sin archivos de prueba, pasa).
  - `cliente-cli-rust`: `cargo test` (0 tests, compila correctamente).

