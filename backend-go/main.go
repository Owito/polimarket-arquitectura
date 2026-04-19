package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
)

// Tipos base para simulación de base de datos
type Cliente struct {
	ID     string `json:"id"`
	Nombre string `json:"nombre"`
}

type Producto struct {
	ID     string  `json:"id"`
	Nombre string  `json:"nombre"`
	Precio float64 `json:"precio"`
}

type StockProducto struct {
	IDProducto string `json:"id_producto"`
	Cantidad   int    `json:"cantidad"`
}

type Despacho struct {
	IDEstado string `json:"estado"`
	Detalle  string `json:"detalle"`
}

// Factory Method (GoF) para validación de stock
// Producto del Factory: interfaz de validación
// Concrete Product: DefaultStockValidator
// Creator: NewStockValidator
type StockValidator interface {
	Validar(idProducto string, cantidad int) (bool, string)
}
type DefaultStockValidator struct {
	stock map[string]int
}

func (v DefaultStockValidator) Validar(idProducto string, cantidad int) (bool, string) {
	if cantidad <= 0 {
		return false, "Cantidad inválida"
	}
	stockActual, ok := v.stock[idProducto]
	if !ok {
		return false, "Producto no existe en stock"
	}
	if stockActual < cantidad {
		return false, "Stock insuficiente"
	}
	return true, "Stock disponible"
}

// Factory Method
func NewStockValidator(stock map[string]int) StockValidator {
	return DefaultStockValidator{stock: stock}
}
type ValidacionStockRequest struct {
	IDProducto string `json:"id_producto"`
	Cantidad   int    `json:"cantidad"`
}
var (
	clientes = []Cliente{
		{ID: "C1", Nombre: "Juan Perez"},
		{ID: "C2", Nombre: "Maria Silva"},
	}
	productos = []Producto{
		{ID: "P1", Nombre: "Teclado Mecanico", Precio: 80.50},
		{ID: "P2", Nombre: "Monitor 24", Precio: 150.00},
	}
	stock = map[string]int{
		"P1": 15,
		"P2": 3,
	}
	entregas = []Despacho{
		{IDEstado: "PENDIENTE", Detalle: "Entrega a Juan Perez, Teclado"},
		{IDEstado: "EN CAMINO", Detalle: "Entrega a Maria Silva, Monitor"},
	}
)
func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/hr/autorizar", func(w http.ResponseWriter, r *http.Request) {
		enableCORS(w)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"autorizado": true,
			"mensaje":    "Vendedor autorizado exitosamente",
		})
	})
	mux.HandleFunc("/ventas/catalogo", func(w http.ResponseWriter, r *http.Request) {
		enableCORS(w)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"clientes":  clientes,
			"productos": productos,
		})
	})
	mux.HandleFunc("/bodega/stock", func(w http.ResponseWriter, r *http.Request) {
		enableCORS(w)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"stock": stock,
		})
	})
	mux.HandleFunc("/bodega/validar", func(w http.ResponseWriter, r *http.Request) {
		enableCORS(w)
		if r.Method != http.MethodPost {
			http.Error(w, "Metodo no permitido", http.StatusMethodNotAllowed)
			return
		}

		var req ValidacionStockRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Body inválido", http.StatusBadRequest)
			return
		}

		validator := NewStockValidator(stock)
		disponible, mensaje := validator.Validar(req.IDProducto, req.Cantidad)
		stockActual := 0
		if value, ok := stock[req.IDProducto]; ok {
			stockActual = value
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"disponible":   disponible,
			"stock_actual": stockActual,
			"mensaje":      mensaje,
		})
	})
	mux.HandleFunc("/proveedores/compra", func(w http.ResponseWriter, r *http.Request) {
		enableCORS(w)
		if r.Method != http.MethodPost {
			http.Error(w, "Metodo no permitido", http.StatusMethodNotAllowed)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"confirmado": true,
			"mensaje":    "Compra registrada exitosamente",
		})
	})
	mux.HandleFunc("/entregas/pendientes", func(w http.ResponseWriter, r *http.Request) {
		enableCORS(w)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"pendientes": entregas,
		})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Server running on port %s...\n", port)
	log.Fatal(http.ListenAndServe(":"+port, mux))
}

func enableCORS(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
}