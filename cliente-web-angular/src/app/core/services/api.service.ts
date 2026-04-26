import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Cliente {
  id: string;
  nombre: string;
}

export interface Producto {
  id: string;
  nombre: string;
  precio: number;
}

export interface Stock {
  id_producto: string;
  cantidad: number;
}

export interface ValidacionStock {
  disponible: boolean;
  stock_actual: number;
  mensaje: string;
}

export interface Despacho {
  estado: string;
  detalle: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = 'https://polimarket-arquitectura.onrender.com';

  autorizar(): Observable<{ autorizado: boolean; mensaje: string }> {
    return this.http.post<{ autorizado: boolean; mensaje: string }>(`${this.baseUrl}/hr/autorizar`, {});
  }

  getCatalogo(): Observable<{ clientes: Cliente[]; productos: Producto[] }> {
    return this.http.get<{ clientes: Cliente[]; productos: Producto[] }>(`${this.baseUrl}/ventas/catalogo`);
  }

  getStock(): Observable<{ stock: Record<string, number> }> {
    return this.http.get<{ stock: Record<string, number> }>(`${this.baseUrl}/bodega/stock`);
  }

  validarStock(idProducto: string, cantidad: number): Observable<ValidacionStock> {
    return this.http.post<ValidacionStock>(`${this.baseUrl}/bodega/validar`, {
      id_producto: idProducto,
      cantidad: cantidad
    });
  }

  registrarCompra(productos: { id_producto: string; cantidad: number }[]): Observable<{ confirmado: boolean; mensaje: string }> {
    return this.http.post<{ confirmado: boolean; mensaje: string }>(`${this.baseUrl}/proveedores/compra`, {
      productos
    });
  }

  getEntregas(): Observable<{ pendientes: Despacho[] }> {
    return this.http.get<{ pendientes: Despacho[] }>(`${this.baseUrl}/entregas/pendientes`);
  }
}