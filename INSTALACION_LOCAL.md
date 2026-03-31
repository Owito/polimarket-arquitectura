# Guía de Instalación y Uso (Local)

Sigue estos pasos para clonar y ejecutar el entorno de simulación de PoliMarket en tu máquina local.

---

## ✅ Prerrequisitos

- Tener **Git** instalado.
- Tener **Go** instalado (versión 1.18 o superior).
- Un **navegador web moderno** (Chrome, Firefox, Edge, etc.).

---

## Paso 1: Clonar el repositorio

Abre tu terminal y clona este proyecto en tu entorno local:

```bash
git clone https://github.com/Owito/polimarket-arquitectura.git
cd polimarket-arquitectura
```

---

## Paso 2: Levantar el Backend (Servicios Core)

El backend en Go no requiere de una base de datos externa, ya que utiliza estructuras en memoria para la simulación de este prototipo.

```bash
cd backend-go
go run main.go
```

El servidor iniciará exitosamente y la consola mostrará que está escuchando en `http://localhost:8080`.

---

## Paso 3: Ejecutar el Cliente Web (Terminal de Ventas)

El cliente frontend es completamente estático y no requiere dependencias de Node.js.

1. Abre un explorador de archivos y navega hasta la carpeta `cliente-web`.
2. Haz doble clic en el archivo `index.html` para abrirlo en tu navegador predeterminado.
3. Interactúa con los botones de la interfaz para verificar la comunicación en tiempo real con los servicios de **Autorización (RRHH)** y **Consulta de Catálogo (Ventas)** alojados en el backend.
