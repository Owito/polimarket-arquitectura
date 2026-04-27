import { Component, signal, computed, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Cliente, Producto, ValidacionStock, Despacho } from './core/services/api.service';

interface CarritoItem {
  producto: Producto;
  cantidad: number;
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="app-container" [class.light-mode]="!darkMode()">
      <div class="toast-container">
        @for (toast of toasts(); track toast.id) {
          <div [class]="'toast toast-' + toast.type">
            <span class="toast-icon">
              <span *ngIf="toast.type === 'success'">OK</span>
              <span *ngIf="toast.type === 'error'">X</span>
              <span *ngIf="toast.type === 'info'">i</span>
            </span>
            {{ toast.message }}
          </div>
        }
      </div>

      @if (!isLoggedIn()) {
        <div class="login-screen">
          <button
            type="button"
            class="theme-toggle login-theme-toggle"
            (click)="toggleTheme()"
            [title]="darkMode() ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'">
            @if (darkMode()) {
              <span class="theme-icon">☀️</span>
            } @else {
              <span class="theme-icon">🌙</span>
            }
          </button>

          <div class="login-bg-effects">
            <div class="bg-orb bg-orb-1"></div>
            <div class="bg-orb bg-orb-2"></div>
            <div class="bg-orb bg-orb-3"></div>
          </div>
          
          <div class="login-card">
            <div class="brand">
              <div class="logo"><span class="logo-icon">🛒</span></div>
              <h1 class="brand-name">PoliMarket</h1>
              <p class="brand-tagline">Sistema de Gestión Integral</p>
            </div>
            
            <form (ngSubmit)="login()" class="login-form">
              <div class="form-group">
                <label class="form-label">👤 Usuario</label>
                <input type="text" [(ngModel)]="username" name="username"
                  class="form-input" placeholder="Ingresa tu usuario">
              </div>
              
              <div class="form-group">
                <label class="form-label">🔒 Contraseña</label>
                <input type="password" [(ngModel)]="password" name="password"
                  class="form-input" placeholder="Ingresa tu contraseña">
              </div>

              @if (loginError()) {
                <div class="error-message">⚠ {{ loginError() }}</div>
              }
              
              <button type="submit" class="btn-login">
                <span class="btn-icon">→</span> Iniciar Sesión
              </button>
            </form>

            <div class="login-footer">
              <p>PoliMarket v1.0 • Arquitectura Distribuida</p>
            </div>
          </div>
        </div>
      }

      @if (isLoggedIn()) {
        <div class="main-layout">
          @if (isMobile() && sidebarOpen()) {
            <button
              type="button"
              class="sidebar-backdrop"
              aria-label="Cerrar menu lateral"
              (click)="closeSidebarMobile()"></button>
          }

          <aside
            class="sidebar"
            [class.collapsed]="!isMobile() && sidebarCollapsed()"
            [class.mobile-open]="isMobile() && sidebarOpen()">
            <div class="sidebar-header">
              <div class="sidebar-brand" (click)="toggleSidebarState()">
                <span class="sidebar-logo">🛒</span>
                @if (!shouldHideSidebarText()) {
                  <span class="sidebar-title">PoliMarket</span>
                }
              </div>
            </div>
            
            <nav class="sidebar-nav">
              @for (item of navItems; track item.id) {
                <button class="nav-item" 
                  [class.active]="activeTab() === item.id"
                  (click)="setActiveTab(item.id)">
                  <span class="nav-icon">{{ item.icon }}</span>
                  @if (!shouldHideSidebarText()) {
                    <span class="nav-label">{{ item.label }}</span>
                  }
                </button>
              }
            </nav>

            <div class="sidebar-footer">
              <div class="user-info">
                <div class="user-avatar">{{ username.charAt(0).toUpperCase() }}</div>
                @if (!shouldHideSidebarText()) {
                  <div class="user-details">
                    <span class="user-name">{{ username }}</span>
                    <span class="user-role">Vendedor</span>
                  </div>
                }
              </div>
              <button class="btn-logout" (click)="logout()">
                <span>🚪</span>
                @if (!shouldHideSidebarText()) { <span>Salir</span> }
              </button>
            </div>
          </aside>

          <main class="content" [class.sidebar-collapsed]="!isMobile() && sidebarCollapsed()">
            <header class="content-header">
              <div class="header-left">
                @if (isMobile()) {
                  <button
                    type="button"
                    class="mobile-menu-button"
                    aria-label="Abrir menu lateral"
                    (click)="toggleSidebarState()">☰</button>
                }

                <div>
                  <h1 class="page-title">{{ getPageTitle() }}</h1>
                  <p class="page-subtitle">{{ getPageSubtitle() }}</p>
                </div>
              </div>
              <div class="header-right">
                <div class="header-date">📅 {{ currentDate }}</div>
                <button class="theme-toggle" (click)="toggleTheme()" [title]="darkMode() ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'">
                  @if (darkMode()) {
                    <span class="theme-icon">☀️</span>
                  } @else {
                    <span class="theme-icon">🌙</span>
                  }
                </button>
              </div>
            </header>

            @if (activeTab() !== 'auth') {
              <div class="dashboard-stats">
                <div class="stat-card stat-primary">
                  <div class="stat-icon">📦</div>
                  <div class="stat-content">
                    <span class="stat-value">{{ catalogo()?.productos?.length || 0 }}</span>
                    <span class="stat-label">Productos</span>
                  </div>
                </div>
                <div class="stat-card stat-success">
                  <div class="stat-icon">👥</div>
                  <div class="stat-content">
                    <span class="stat-value">{{ catalogo()?.clientes?.length || 0 }}</span>
                    <span class="stat-label">Clientes</span>
                  </div>
                </div>
                <div class="stat-card stat-warning">
                  <div class="stat-icon">🚚</div>
                  <div class="stat-content">
                    <span class="stat-value">{{ entregas()?.length || 0 }}</span>
                    <span class="stat-label">Entregas</span>
                  </div>
                </div>
                <div class="stat-card stat-info">
                  <div class="stat-icon">🛒</div>
                  <div class="stat-content">
                    <span class="stat-value">{{ carrito().length }}</span>
                    <span class="stat-label">En Carrito</span>
                  </div>
                </div>
              </div>
            }

            <div class="content-panel">
              @if (activeTab() === 'auth') {
                <div class="panel-center">
                  <div class="success-animation">
                    <div class="success-circle"><span class="success-check">✓</span></div>
                  </div>
                  <h2 class="success-title">¡Bienvenido!</h2>
                  <p class="success-message">Has iniciado sesión correctamente</p>
                  <div class="user-card">
                    <div class="user-card-avatar">{{ username.charAt(0).toUpperCase() }}</div>
                    <div class="user-card-info">
                      <span class="user-card-name">{{ username }}</span>
                      <span class="user-card-role">Vendedor Autorizado</span>
                    </div>
                  </div>
                  <button class="btn-continue" (click)="setActiveTab('ventas')">Continuar al Sistema →</button>
                </div>
              }

              @if (activeTab() === 'ventas') {
                <div class="panel-grid">
                  <div class="panel-section">
                    <div class="section-header">
                      <h3 class="section-title">📦 Catálogo de Productos</h3>
                    </div>
                    
                    @if (loading()) {
                      <div class="loading-skeleton">
                        @for (i of [1,2,3,4]; track i) { <div class="skeleton-card"></div> }
                      </div>
                    }

                    @if (!loading() && catalogo()) {
                      <div class="products-grid">
                        @for (producto of catalogo()!.productos; track producto.id) {
                          <div class="product-card">
                            <div class="product-image">
                              <span class="product-emoji">{{ obtenerEmojiProducto(producto.nombre) }}</span>
                            </div>
                            <div class="product-info">
                              <h4 class="product-name">{{ producto.nombre }}</h4>
                              <p class="product-id">SKU: {{ producto.id }}</p>
                              <p class="product-price">\${{ producto.precio.toFixed(2) }}</p>
                            </div>
                            <div class="product-actions">
                              <input type="number" min="1" [(ngModel)]="cantidadesCarrito[producto.id]"
                                class="qty-input" placeholder="1">
                              <button class="btn-add" (click)="agregarAlCarrito(producto)">+ Agregar</button>
                            </div>
                          </div>
                        }
                      </div>
                    }
                  </div>

                  <div class="panel-section cart-section">
                    <div class="section-header">
                      <h3 class="section-title">🛒 Carrito</h3>
                      @if (carrito().length > 0) {
                        <button class="btn-clear" (click)="vaciarCarrito()">🗑 Vaciar</button>
                      }
                    </div>

                    @if (carrito().length === 0) {
                      <div class="empty-cart">
                        <span class="empty-icon">🛒</span>
                        <p>El carrito está vacío</p>
                      </div>
                    } @else {
                      <div class="cart-items">
                        @for (item of carrito(); track item.producto.id) {
                          <div class="cart-item">
                            <span class="cart-item-emoji">{{ obtenerEmojiProducto(item.producto.nombre) }}</span>
                            <div class="cart-item-info">
                              <span class="cart-item-name">{{ item.producto.nombre }}</span>
                              <span class="cart-item-qty">x{{ item.cantidad }}</span>
                            </div>
                            <span class="cart-item-price">\${{ (item.producto.precio * item.cantidad).toFixed(2) }}</span>
                            <button class="btn-remove" (click)="quitarDelCarrito(item.producto.id)">✕</button>
                          </div>
                        }
                      </div>

                      <div class="cart-total">
                        <span>Total</span>
                        <span class="total-amount">\${{ totalCarrito().toFixed(2) }}</span>
                      </div>

                      <div class="cart-checkout">
                        <select [(ngModel)]="clienteSeleccionado" class="client-select">
                          <option value="">-- Seleccionar Cliente --</option>
                          @for (cliente of catalogo()!.clientes; track cliente.id) {
                            <option [value]="cliente.id">{{ cliente.nombre }}</option>
                          }
                        </select>
                        <button class="btn-checkout" 
                          [disabled]="!clienteSeleccionado || carrito().length === 0"
                          (click)="confirmarVenta()">💰 Confirmar Venta</button>
                      </div>
                    }
                  </div>
                </div>

                @if (catalogo()?.clientes?.length) {
                  <div class="panel-section clients-section">
                    <div class="section-header">
                      <h3 class="section-title">👥 Directorio de Clientes</h3>
                    </div>
                    <div class="clients-list">
                      @for (cliente of catalogo()!.clientes; track cliente.id) {
                        <div class="client-chip">
                          <span class="client-avatar">{{ cliente.nombre.charAt(0) }}</span>
                          <span class="client-name">{{ cliente.nombre }}</span>
                        </div>
                      }
                    </div>
                  </div>
                }
              }

              @if (activeTab() === 'bodega') {
                <div class="panel-grid">
                  <div class="panel-section">
                    <div class="section-header">
                      <h3 class="section-title">📊 Stock de Bodega</h3>
                    </div>

                    @if (!loading() && stockData()) {
                      <div class="stock-grid">
                        @for (producto of catalogo()!.productos; track producto.id) {
                          <div class="stock-card" [class.critical]="obtenerStock(producto.id) < 5">
                            <div class="stock-info">
                              <span class="stock-name">{{ producto.nombre }}</span>
                              <span class="stock-id">ID: {{ producto.id }}</span>
                            </div>
                            <div class="stock-value">
                              <span class="stock-count">{{ obtenerStock(producto.id) }}</span>
                              <span class="stock-unit">unidades</span>
                            </div>
                            <div class="stock-bar">
                              <div class="stock-fill" [style.width.%]="Math.min(obtenerStock(producto.id) * 3.33, 100)"></div>
                            </div>
                          </div>
                        }
                      </div>
                    }
                  </div>

                  <div class="panel-section validate-section">
                    <div class="section-header">
                      <h3 class="section-title">🔍 Validar Stock</h3>
                    </div>

                    <div class="validate-form">
                      <select [(ngModel)]="productoValidar" class="validate-select">
                        <option value="">-- Producto --</option>
                        @for (producto of catalogo()!.productos; track producto.id) {
                          <option [value]="producto.id">{{ producto.nombre }}</option>
                        }
                      </select>
                      <input type="number" min="1" [(ngModel)]="cantidadValidar"
                        class="validate-input" placeholder="Cantidad">
                      <button class="btn-validate" (click)="validarStock()">✓ Verificar</button>
                    </div>

                    @if (validacion()) {
                      <div class="validation-result" [class.success]="validacion()!.disponible" [class.error]="!validacion()!.disponible">
                        <div class="result-icon">{{ validacion()!.disponible ? '✓' : '✕' }}</div>
                        <div class="result-info">
                          <span class="result-message">{{ validacion()!.mensaje }}</span>
                          <span class="result-stock">Stock disponible: {{ validacion()!.stock_actual }}</span>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }

              @if (activeTab() === 'proveedores') {
                <div class="panel-section">
                  <div class="section-header">
                    <h3 class="section-title">🏭 Registro de Compras</h3>
                  </div>

                  <div class="purchase-form">
                    <div class="form-row">
                      <div class="form-group">
                        <label class="form-label">Producto</label>
                        <select [(ngModel)]="compraProducto" class="form-select">
                          <option value="">-- Seleccionar --</option>
                          @for (producto of catalogo()!.productos; track producto.id) {
                            <option [value]="producto.id">{{ producto.nombre }}</option>
                          }
                        </select>
                      </div>
                      <div class="form-group">
                        <label class="form-label">Cantidad</label>
                        <input type="number" min="1" [(ngModel)]="compraCantidad"
                          class="form-input" placeholder="Cantidad">
                      </div>
                    </div>
                    <button class="btn-purchase" (click)="registrarCompra()">📦 Registrar Compra</button>
                  </div>

                  @if (compraConfirmada()) {
                    <div class="purchase-success">
                      <span class="success-icon">✓</span>
                      <span>{{ compraConfirmada() }}</span>
                    </div>
                  }
                </div>
              }

              @if (activeTab() === 'entregas') {
                <div class="panel-section">
                  <div class="section-header">
                    <h3 class="section-title">🚚 Entregas Pendientes</h3>
                  </div>

                  <div class="filter-tabs">
                    <button class="filter-tab" [class.active]="filtroEntregas() === 'TODOS'" (click)="filtroEntregas.set('TODOS')">Todos</button>
                    <button class="filter-tab filter-pending" [class.active]="filtroEntregas() === 'PENDIENTE'" (click)="filtroEntregas.set('PENDIENTE')">⏱ Pendiente</button>
                    <button class="filter-tab filter-transit" [class.active]="filtroEntregas() === 'EN CAMINO'" (click)="filtroEntregas.set('EN CAMINO')">🚛 En Camino</button>
                  </div>

                  @if (entregasFiltradas().length === 0) {
                    <div class="empty-state"><span class="empty-icon">📭</span><p>No hay entregas</p></div>
                  }

                  @if (entregasFiltradas().length > 0) {
                    <div class="delivery-list">
                      @for (entrega of entregasFiltradas(); track $index) {
                        <div class="delivery-card">
                          <div class="delivery-info"><p class="delivery-detail">{{ entrega.detalle }}</p></div>
                          <div class="delivery-status" [class]="obtenerClaseEstado(entrega.estado)">{{ entrega.estado }}</div>
                        </div>
                      }
                    </div>
                  }
                </div>
              }
            </div>
          </main>
        </div>
      }
    </div>
  `,
  styles: [`
    :root {
      --bg-primary: #0a0a0f;
      --bg-secondary: #12121a;
      --bg-tertiary: #1a1a24;
      --bg-card: rgba(26, 26, 38, 0.8);
      --border-subtle: rgba(255, 255, 255, 0.14);
      --border-light: rgba(255, 255, 255, 0.22);
      --primary: #f43f5e;
      --primary-light: #fb7185;
      --secondary: #6366f1;
      --success: #10b981;
      --warning: #f59e0b;
      --danger: #ef4444;
      --info: #3b82f6;
      --text-primary: #f8fafc;
      --text-secondary: #94a3b8;
      --text-muted: #7388a3;
      --gradient-primary: linear-gradient(135deg, #f43f5e 0%, #6366f1 100%);
      --gradient-success: linear-gradient(135deg, #10b981 0%, #059669 100%);
      --shadow-card: 0 4px 24px rgba(0, 0, 0, 0.3);
      --shadow-glow: 0 0 40px rgba(244, 63, 94, 0.15);
    }

    .light-mode {
      --bg-primary: #f8fafc;
      --bg-secondary: #ffffff;
      --bg-tertiary: #f1f5f9;
      --bg-card: rgba(255, 255, 255, 0.9);
      --border-subtle: rgba(0, 0, 0, 0.08);
      --border-light: rgba(0, 0, 0, 0.12);
      --primary: #e11d48;
      --primary-light: #e11d48;
      --secondary: #4f46e5;
      --success: #059669;
      --warning: #d97706;
      --danger: #dc2626;
      --info: #2563eb;
      --text-primary: #0f172a;
      --text-secondary: #475569;
      --text-muted: #94a3b8;
      --gradient-primary: linear-gradient(135deg, #e11d48 0%, #4f46e5 100%);
      --gradient-success: linear-gradient(135deg, #059669 0%, #047857 100%);
      --shadow-card: 0 4px 24px rgba(0, 0, 0, 0.08);
      --shadow-glow: 0 0 40px rgba(225, 29, 72, 0.1);
    }

    .light-mode .login-card { background: rgba(255, 255, 255, 0.95); border-color: var(--border-subtle); }
    .light-mode .form-input { background: var(--bg-secondary); border-color: var(--border-subtle); color: var(--text-primary); }
    .light-mode .form-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(225, 29, 72, 0.15); }
    .light-mode .content { background: var(--bg-primary); }
    .light-mode .content-panel { background: var(--bg-card); border-color: var(--border-subtle); }
    .light-mode .sidebar { background: var(--bg-secondary); border-color: var(--border-subtle); }
    .light-mode .product-card, .light-mode .cart-section, .light-mode .stock-card, .light-mode .delivery-card { background: var(--bg-secondary); border-color: var(--border-subtle); }
    .light-mode .cart-item { background: var(--bg-tertiary); }
    .light-mode .client-select, .light-mode .validate-select, .light-mode .form-select, .light-mode .qty-input { background: var(--bg-tertiary); border-color: var(--border-subtle); color: var(--text-primary); }
    .light-mode .user-card, .light-mode .loading-skeleton .skeleton-card { background: var(--bg-secondary); border-color: var(--border-subtle); }
    .light-mode .header-date { background: var(--bg-card); color: var(--text-secondary); border: 1px solid var(--border-subtle); }
    .light-mode .bg-orb { opacity: 0.2; }
    .light-mode .btn-logout { border-color: var(--border-subtle); color: var(--text-muted); }
    .light-mode .nav-item { color: var(--text-secondary); }
    .light-mode .nav-item:hover { background: var(--bg-tertiary); color: var(--text-primary); }
    .light-mode .product-card:hover { border-color: var(--primary); }
    .light-mode .stat-card { background: var(--bg-card); border-color: var(--border-subtle); }
    .light-mode .empty-cart, .light-mode .empty-state { color: var(--text-muted); }
    .light-mode .filter-tab { border-color: var(--border-subtle); color: var(--text-secondary); }
    .light-mode .client-chip { background: var(--bg-tertiary); border-color: var(--border-subtle); }
    .light-mode .delivery-status { border: 1px solid currentColor; }

    .app-container { min-height: 100vh; background: var(--bg-primary); color: var(--text-primary); }

    .toast-container { position: fixed; top: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; }
    .toast { padding: 14px 20px; border-radius: 12px; display: flex; align-items: center; gap: 10px; font-weight: 500; box-shadow: var(--shadow-card); }
    .toast-success { background: rgba(16, 185, 129, 0.9); color: white; }
    .toast-error { background: rgba(239, 68, 68, 0.9); color: white; }
    .toast-info { background: rgba(59, 130, 246, 0.9); color: white; }

    .login-screen { min-height: 100vh; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; padding: 24px; }
    .login-bg-effects { position: absolute; inset: 0; overflow: hidden; }
    .bg-orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.4; }
    .bg-orb-1 { width: 400px; height: 400px; background: var(--primary); top: -100px; right: -100px; animation: float 8s ease-in-out infinite; }
    .bg-orb-2 { width: 300px; height: 300px; background: var(--secondary); bottom: -50px; left: -50px; animation: float 10s ease-in-out infinite reverse; }
    .bg-orb-3 { width: 200px; height: 200px; background: var(--warning); top: 50%; left: 50%; transform: translate(-50%, -50%); animation: pulse 6s ease-in-out infinite; }
    @keyframes float { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(30px, -30px); } }
    @keyframes pulse { 0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; } 50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.5; } }

    .login-card { background: rgba(18, 18, 26, 0.9); backdrop-filter: blur(20px); border: 1px solid var(--border-subtle); border-radius: 24px; padding: 48px; width: 100%; max-width: 420px; box-shadow: var(--shadow-card), var(--shadow-glow); position: relative; z-index: 1; }
    .brand { text-align: center; margin-bottom: 36px; }
    .logo { width: 72px; height: 72px; background: var(--gradient-primary); border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; box-shadow: var(--shadow-glow); }
    .logo-icon { font-size: 36px; }
    .brand-name { font-size: 32px; font-weight: 800; background: var(--gradient-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0; }
    .brand-tagline { color: var(--text-muted); margin: 8px 0 0; }
    .login-form { display: flex; flex-direction: column; gap: 20px; }
    .form-group { display: flex; flex-direction: column; gap: 8px; }
    .form-label { color: var(--text-secondary); font-size: 14px; font-weight: 500; }
    .form-input { width: 100%; background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 14px 16px; color: var(--text-primary); font-size: 16px; transition: all 0.2s ease; }
    .form-input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(244, 63, 94, 0.2); }
    .form-input::placeholder { color: var(--text-muted); }
    .error-message { display: flex; align-items: center; gap: 8px; color: var(--danger); font-size: 14px; padding: 12px; background: rgba(239, 68, 68, 0.1); border-radius: 8px; }
    .btn-login { background: var(--gradient-primary); border: none; border-radius: 12px; padding: 16px; color: white; font-size: 16px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: all 0.2s ease; box-shadow: 0 4px 20px rgba(244, 63, 94, 0.3); }
    .btn-login:hover { transform: translateY(-2px); box-shadow: 0 6px 30px rgba(244, 63, 94, 0.4); }
    .login-footer { text-align: center; margin-top: 24px; color: var(--text-muted); font-size: 12px; }
    .login-theme-toggle { position: absolute; top: 20px; right: 20px; z-index: 4; backdrop-filter: blur(10px); }

    .main-layout { display: flex; min-height: 100vh; position: relative; }
    .sidebar { width: 260px; background: var(--bg-secondary); border-right: 1px solid var(--border-subtle); display: flex; flex-direction: column; transition: width 0.3s ease, transform 0.3s ease; position: fixed; top: 0; left: 0; height: 100vh; z-index: 220; }
    .sidebar.collapsed { width: 72px; }
    .sidebar-backdrop { position: fixed; inset: 0; background: rgba(5, 7, 12, 0.6); border: 0; z-index: 200; }
    .sidebar-header { padding: 20px; border-bottom: 1px solid var(--border-subtle); }
    .sidebar-brand { display: flex; align-items: center; gap: 12px; cursor: pointer; }
    .sidebar-logo { font-size: 28px; }
    .sidebar-title { font-size: 20px; font-weight: 700; background: var(--gradient-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .sidebar-nav { flex: 1; padding: 16px 12px; display: flex; flex-direction: column; gap: 4px; }
    .nav-item { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-radius: 12px; border: none; background: transparent; color: var(--text-secondary); font-size: 15px; font-weight: 500; cursor: pointer; transition: all 0.2s ease; text-align: left; }
    .nav-item:hover { background: var(--bg-tertiary); color: var(--text-primary); }
    .nav-item.active { background: linear-gradient(135deg, rgba(244, 63, 94, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%); color: var(--primary-light); border: 1px solid rgba(244, 63, 94, 0.3); }
    .nav-icon { font-size: 20px; }
    .sidebar-footer { padding: 16px; border-top: 1px solid var(--border-subtle); }
    .user-info { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .user-avatar { width: 40px; height: 40px; background: var(--gradient-primary); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; }
    .user-details { display: flex; flex-direction: column; }
    .user-name { font-weight: 600; font-size: 14px; }
    .user-role { font-size: 12px; color: var(--text-muted); }
    .btn-logout { width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 10px; border-radius: 8px; border: 1px solid var(--border-subtle); background: transparent; color: var(--text-muted); cursor: pointer; transition: all 0.2s ease; }
    .btn-logout:hover { border-color: var(--danger); color: var(--danger); }

    .content { flex: 1; margin-left: 260px; padding: 24px 32px; transition: margin-left 0.3s ease; }
    .content.sidebar-collapsed { margin-left: 72px; }
    .content-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
    .header-left { display: flex; align-items: flex-start; gap: 14px; }
    .mobile-menu-button { width: 38px; height: 38px; border: 1px solid var(--border-subtle); border-radius: 10px; background: var(--bg-card); color: var(--text-primary); font-size: 19px; font-weight: 700; cursor: pointer; }
    .mobile-menu-button:hover { border-color: var(--primary); }
    .page-title { font-size: 28px; font-weight: 700; margin: 0; }
    .page-subtitle { color: var(--text-muted); margin: 4px 0 0; }
    .header-date { display: flex; align-items: center; gap: 8px; color: var(--text-secondary); font-size: 14px; background: var(--bg-card); padding: 8px 16px; border-radius: 8px; }

    .dashboard-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
    @media (max-width: 1024px) { .dashboard-stats { grid-template-columns: repeat(2, 1fr); } }
    .stat-card { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 20px; display: flex; align-items: center; gap: 16px; transition: all 0.2s ease; }
    .stat-card:hover { transform: translateY(-2px); border-color: var(--border-light); }
    .stat-icon { font-size: 32px; }
    .stat-content { display: flex; flex-direction: column; }
    .stat-value { font-size: 28px; font-weight: 700; }
    .stat-label { font-size: 13px; color: var(--text-muted); }

    .content-panel { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 20px; padding: 28px; }
    .panel-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; }
    @media (max-width: 1200px) { .panel-grid { grid-template-columns: 1fr; } }
    .panel-section { margin-bottom: 24px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .section-title { display: flex; align-items: center; gap: 10px; font-size: 18px; font-weight: 600; margin: 0; }

    .products-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
    @media (max-width: 768px) { .products-grid { grid-template-columns: 1fr; } }
    .product-card { background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 20px; transition: all 0.2s ease; }
    .product-card:hover { border-color: var(--primary); transform: translateY(-2px); }
    .product-image { width: 60px; height: 60px; background: var(--bg-secondary); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
    .product-emoji { font-size: 28px; }
    .product-name { font-size: 16px; font-weight: 600; margin: 0 0 4px; }
    .product-id { font-size: 12px; color: var(--text-muted); margin: 0 0 8px; }
    .product-price { font-size: 20px; font-weight: 700; color: var(--primary); margin: 0; }
    .product-actions { display: flex; gap: 8px; margin-top: 16px; }
    .qty-input { width: 60px; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 8px; text-align: center; color: var(--text-primary); }
    .btn-add { flex: 1; background: var(--secondary); border: none; border-radius: 8px; padding: 10px; color: white; font-weight: 500; cursor: pointer; transition: all 0.2s ease; }
    .btn-add:hover { filter: brightness(1.1); }

    .cart-section { background: var(--bg-tertiary); border-radius: 16px; padding: 20px; }
    .btn-clear { background: transparent; border: none; color: var(--danger); cursor: pointer; font-size: 13px; }
    .btn-clear:hover { text-decoration: underline; }
    .cart-items { display: flex; flex-direction: column; gap: 8px; max-height: 200px; overflow-y: auto; }
    .cart-item { display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--bg-secondary); border-radius: 10px; }
    .cart-item-emoji { font-size: 20px; }
    .cart-item-info { flex: 1; display: flex; flex-direction: column; }
    .cart-item-name { font-weight: 500; }
    .cart-item-qty { font-size: 12px; color: var(--text-muted); }
    .cart-item-price { font-weight: 600; color: var(--primary); }
    .btn-remove { background: transparent; border: none; color: var(--text-muted); cursor: pointer; padding: 4px 8px; }
    .btn-remove:hover { color: var(--danger); }
    .cart-total { display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-top: 1px solid var(--border-subtle); margin-top: 16px; }
    .total-amount { font-size: 24px; font-weight: 700; color: var(--primary); }
    .cart-checkout { display: flex; flex-direction: column; gap: 12px; }
    .client-select { background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 12px; color: var(--text-primary); }
    .btn-checkout { background: var(--gradient-success); border: none; border-radius: 10px; padding: 14px; color: white; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
    .btn-checkout:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-checkout:not(:disabled):hover { transform: translateY(-2px); }
    .empty-cart { text-align: center; padding: 32px; color: var(--text-muted); }
    .empty-icon { font-size: 48px; display: block; margin-bottom: 12px; opacity: 0.5; }

    .clients-list { display: flex; flex-wrap: wrap; gap: 8px; }
    .client-chip { display: flex; align-items: center; gap: 8px; background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 20px; padding: 6px 14px 6px 6px; }
    .client-avatar { width: 24px; height: 24px; background: var(--gradient-primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; }
    .client-name { font-size: 14px; }

    .stock-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .stock-card { background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 16px; }
    .stock-card.critical { border-color: var(--danger); }
    .stock-info { display: flex; flex-direction: column; margin-bottom: 12px; }
    .stock-name { font-weight: 600; }
    .stock-id { font-size: 12px; color: var(--text-muted); }
    .stock-value { display: flex; align-items: baseline; gap: 4px; margin-bottom: 8px; }
    .stock-count { font-size: 28px; font-weight: 700; }
    .stock-count.critical { color: var(--danger); }
    .stock-unit { font-size: 12px; color: var(--text-muted); }
    .stock-bar { height: 4px; background: var(--bg-secondary); border-radius: 2px; overflow: hidden; }
    .stock-fill { height: 100%; background: var(--gradient-success); border-radius: 2px; transition: width 0.3s ease; }
    .stock-card.critical .stock-fill { background: var(--danger); }

    .validate-form { display: flex; gap: 12px; flex-wrap: wrap; }
    .validate-select, .validate-input { flex: 1; min-width: 150px; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 12px; color: var(--text-primary); }
    .btn-validate { background: var(--secondary); border: none; border-radius: 10px; padding: 12px 24px; color: white; font-weight: 500; cursor: pointer; }
    .validation-result { display: flex; align-items: center; gap: 16px; margin-top: 20px; padding: 16px; border-radius: 12px; }
    .validation-result.success { background: rgba(16, 185, 129, 0.15); border: 1px solid var(--success); }
    .validation-result.error { background: rgba(239, 68, 68, 0.15); border: 1px solid var(--danger); }
    .result-icon { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; }
    .success .result-icon { background: var(--success); color: white; }
    .error .result-icon { background: var(--danger); color: white; }
    .result-message { font-weight: 600; font-size: 16px; }
    .success .result-message { color: var(--success); }
    .error .result-message { color: var(--danger); }
    .result-stock { display: block; font-size: 13px; color: var(--text-muted); }

    .purchase-form { display: flex; flex-direction: column; gap: 16px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-select { background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 12px; color: var(--text-primary); }
    .btn-purchase { background: var(--gradient-success); border: none; border-radius: 10px; padding: 14px; color: white; font-weight: 600; cursor: pointer; }
    .purchase-success { display: flex; align-items: center; gap: 10px; padding: 16px; background: rgba(16, 185, 129, 0.15); border: 1px solid var(--success); border-radius: 10px; color: var(--success); margin-top: 16px; }

    .filter-tabs { display: flex; gap: 8px; margin-bottom: 20px; }
    .filter-tab { padding: 8px 16px; border-radius: 8px; border: 1px solid var(--border-subtle); background: transparent; color: var(--text-secondary); cursor: pointer; transition: all 0.2s ease; }
    .filter-tab.active { background: var(--primary); border-color: var(--primary); color: white; }
    .filter-tab.filter-pending.active { background: var(--warning); border-color: var(--warning); }
    .filter-tab.filter-transit.active { background: var(--info); border-color: var(--info); }

    .delivery-list { display: flex; flex-direction: column; gap: 10px; }
    .delivery-card { display: flex; justify-content: space-between; align-items: center; background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 16px; }
    .delivery-detail { margin: 0; }
    .delivery-status { padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; border: 1px solid transparent; }
    .delivery-status.bg-amber-500 { background: rgba(245, 158, 11, 0.2); color: var(--warning); }
    .delivery-status.bg-blue-500 { background: rgba(59, 130, 246, 0.2); color: var(--info); }

    .app-container:not(.light-mode) .delivery-status.bg-amber-500 {
      background: rgba(180, 83, 9, 0.42);
      border-color: rgba(245, 158, 11, 0.55);
      color: #fef3c7;
    }

    .app-container:not(.light-mode) .delivery-status.bg-blue-500 {
      background: rgba(29, 78, 216, 0.42);
      border-color: rgba(96, 165, 250, 0.55);
      color: #dbeafe;
    }
    .empty-state { text-align: center; padding: 40px; color: var(--text-muted); }

    .loading-skeleton { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .skeleton-card { height: 100px; background: linear-gradient(90deg, var(--bg-tertiary) 25%, var(--bg-card) 50%, var(--bg-tertiary) 75%); background-size: 200% 100%; border-radius: 12px; animation: shimmer 1.5s infinite; }
    @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }

    .panel-center { text-align: center; padding: 48px; }
    .success-animation { margin-bottom: 24px; }
    .success-circle { width: 100px; height: 100px; border-radius: 50%; background: var(--gradient-success); display: inline-flex; align-items: center; justify-content: center; animation: popIn 0.5s ease-out; }
    @keyframes popIn { 0% { transform: scale(0); } 70% { transform: scale(1.1); } 100% { transform: scale(1); } }
    .success-check { font-size: 48px; color: white; }
    .success-title { font-size: 28px; font-weight: 700; margin: 0 0 8px; }
    .success-message { color: var(--text-muted); margin: 0 0 32px; }
    .user-card { display: inline-flex; align-items: center; gap: 16px; background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 16px 24px; margin-bottom: 32px; }
    .user-card-avatar { width: 48px; height: 48px; background: var(--gradient-primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; }
    .user-card-info { text-align: left; }
    .user-card-name { display: block; font-weight: 600; }
    .user-card-role { display: block; font-size: 13px; color: var(--text-muted); }
    .btn-continue { background: var(--gradient-primary); border: none; border-radius: 12px; padding: 16px 32px; color: white; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
    .btn-continue:hover { transform: translateY(-2px); }

    .theme-toggle { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 8px 12px; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; }
    .theme-toggle:hover { border-color: var(--primary); transform: scale(1.05); }
    .theme-icon { font-size: 18px; }
    .header-right { display: flex; align-items: center; gap: 12px; }

    @media (max-width: 1024px) {
      .content { padding: 20px; }
      .content-panel { padding: 20px; }
      .header-date { display: none; }
      .dashboard-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .stock-grid { grid-template-columns: 1fr; }
      .form-row { grid-template-columns: 1fr; }
    }

    @media (max-width: 768px) {
      .login-screen { padding: 16px; }
      .login-card { padding: 28px 20px; border-radius: 20px; }
      .brand-name { font-size: 28px; }
      .sidebar { width: min(78vw, 280px); transform: translateX(-100%); }
      .sidebar.mobile-open { transform: translateX(0); }
      .content, .content.sidebar-collapsed { margin-left: 0; padding: 16px; }
      .content-header { flex-direction: column; gap: 12px; align-items: stretch; margin-bottom: 22px; }
      .header-right { justify-content: flex-end; }
      .dashboard-stats { grid-template-columns: 1fr; }
      .panel-grid { gap: 16px; }
      .products-grid, .loading-skeleton { grid-template-columns: 1fr; }
      .product-actions { flex-direction: column; }
      .qty-input { width: 100%; }
      .filter-tabs { flex-wrap: wrap; }
      .delivery-card { flex-direction: column; align-items: flex-start; gap: 10px; }
      .validation-result { flex-direction: column; align-items: flex-start; }
      .toast-container { left: 12px; right: 12px; top: 12px; }
      .toast { width: 100%; }
      .panel-center { padding: 24px 10px; }
      .user-card { width: 100%; justify-content: center; }
    }

    @media (max-width: 480px) {
      .content-panel { padding: 16px; border-radius: 16px; }
      .section-header { flex-direction: column; align-items: flex-start; gap: 8px; }
      .cart-item { flex-wrap: wrap; }
      .cart-item-price { width: 100%; }
      .btn-checkout, .btn-purchase, .btn-validate { width: 100%; }
      .validate-select, .validate-input { min-width: 100%; }
      .theme-toggle { padding: 8px 10px; }
    }
  `]
})
export class AppComponent {
  Math = Math;
  
  darkMode = signal(localStorage.getItem('theme') !== 'light');
  sidebarCollapsed = signal(false);
  isMobile = signal(window.innerWidth <= 768);
  sidebarOpen = signal(false);
  isLoggedIn = signal(false);
  activeTab = signal('auth');
  loading = signal(false);
  toastId = 0;
  toasts = signal<Toast[]>([]);
  
  username = '';
  password = '';
  loginError = signal('');

  catalogo = signal<{ clientes: Cliente[]; productos: Producto[] } | null>(null);
  stockData = signal<Record<string, number> | null>(null);
  validacion = signal<ValidacionStock | null>(null);
  entregas = signal<Despacho[] | null>(null);
  
  filtroEntregas = signal('TODOS');
  compraConfirmada = signal('');

  cantidadesCarrito: Record<string, number> = {};
  carrito = signal<CarritoItem[]>([]);
  clienteSeleccionado = '';

  productoValidar = '';
  cantidadValidar = 0;

  compraProducto = '';
  compraCantidad = 0;

  currentDate = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  navItems = [
    { id: 'auth', label: 'Panel', icon: '🏠' },
    { id: 'ventas', label: 'Ventas', icon: '💰' },
    { id: 'bodega', label: 'Bodega', icon: '📦' },
    { id: 'proveedores', label: 'Proveedores', icon: '🏭' },
    { id: 'entregas', label: 'Entregas', icon: '🚚' }
  ];

  totalCarrito = computed(() => this.carrito().reduce((sum, item) => sum + (item.producto.precio * item.cantidad), 0));

  entregasFiltradas = computed(() => {
    const ents = this.entregas();
    if (!ents) return [];
    if (this.filtroEntregas() === 'TODOS') return ents;
    return ents.filter(e => e.estado === this.filtroEntregas());
  });

  constructor(private api: ApiService) {}

  @HostListener('window:resize')
  onWindowResize() {
    const mobile = window.innerWidth <= 768;
    this.isMobile.set(mobile);
    if (!mobile) {
      this.sidebarOpen.set(false);
    }
  }

  shouldHideSidebarText(): boolean {
    return this.isMobile() || this.sidebarCollapsed();
  }

  toggleSidebarState() {
    if (this.isMobile()) {
      this.sidebarOpen.set(!this.sidebarOpen());
      return;
    }
    this.sidebarCollapsed.set(!this.sidebarCollapsed());
  }

  closeSidebarMobile() {
    if (!this.isMobile()) {
      return;
    }
    this.sidebarOpen.set(false);
  }

  getPageTitle(): string {
    const titles: Record<string, string> = { 'auth': 'Panel de Control', 'ventas': 'Módulo de Ventas', 'bodega': 'Gestión de Bodega', 'proveedores': 'Proveedores', 'entregas': 'Control de Entregas' };
    return titles[this.activeTab()] || 'PoliMarket';
  }

  getPageSubtitle(): string {
    const subtitles: Record<string, string> = { 'auth': 'Bienvenido al sistema', 'ventas': 'Administración de ventas y clientes', 'bodega': 'Control de inventario y stock', 'proveedores': 'Registro de compras', 'entregas': 'Seguimiento de despachos' };
    return subtitles[this.activeTab()] || '';
  }

  login() {
    if (!this.username || !this.password) {
      this.loginError.set('Ingresa usuario y contraseña');
      return;
    }
    this.isLoggedIn.set(true);
    this.loginError.set('');
    this.cargarDatos();
    this.showToast('Bienvenido ' + this.username, 'success');
  }

  logout() {
    this.isLoggedIn.set(false);
    this.username = '';
    this.password = '';
    this.activeTab.set('auth');
  }

  setActiveTab(tab: string) {
    this.activeTab.set(tab);
    if (this.isMobile()) {
      this.sidebarOpen.set(false);
    }
  }

  toggleTheme() {
    const newValue = !this.darkMode();
    this.darkMode.set(newValue);
    localStorage.setItem('theme', newValue ? 'dark' : 'light');
  }

  cargarDatos() {
    this.loading.set(true);
    this.api.getCatalogo().subscribe({ next: (data) => this.catalogo.set(data), error: () => this.catalogo.set({ clientes: [], productos: [] }) });
    this.api.getStock().subscribe({ next: (data) => this.stockData.set(data.stock), error: () => this.stockData.set({}) });
    this.api.getEntregas().subscribe({ next: (data) => this.entregas.set(data.pendientes), error: () => this.entregas.set([]) });
    setTimeout(() => this.loading.set(false), 500);
  }

  obtenerStock(idProducto: string): number {
    const stock = this.stockData();
    return stock ? stock[idProducto] || 0 : 0;
  }

  obtenerEmojiProducto(nombre: string): string {
    const lower = nombre.toLowerCase();
    if (lower.includes('teclado')) return '⌨️';
    if (lower.includes('monitor')) return '🖥️';
    if (lower.includes('mouse')) return '🖱️';
    if (lower.includes('auricular')) return '🎧';
    return '📦';
  }

  agregarAlCarrito(producto: Producto) {
    const cantidad = this.cantidadesCarrito[producto.id] || 1;
    if (cantidad <= 0) return;
    const items = this.carrito();
    const existente = items.find(i => i.producto.id === producto.id);
    if (existente) { existente.cantidad += cantidad; }
    else { items.push({ producto, cantidad }); }
    this.carrito.set([...items]);
    this.cantidadesCarrito[producto.id] = 1;
    this.showToast(producto.nombre + ' agregado', 'success');
  }

  quitarDelCarrito(productoId: string) {
    const items = this.carrito().filter(i => i.producto.id !== productoId);
    this.carrito.set(items);
  }

  vaciarCarrito() {
    this.carrito.set([]);
    this.showToast('Carrito vaciado', 'info');
  }

  confirmarVenta() {
    if (!this.clienteSeleccionado || this.carrito().length === 0) return;
    this.showToast('Venta confirmada por $' + this.totalCarrito().toFixed(2), 'success');
    this.carrito.set([]);
    this.clienteSeleccionado = '';
  }

  validarStock() {
    if (!this.productoValidar || this.cantidadValidar <= 0) return;
    this.api.validarStock(this.productoValidar, this.cantidadValidar).subscribe({ next: (data) => this.validacion.set(data) });
  }

  registrarCompra() {
    if (!this.compraProducto || this.compraCantidad <= 0) return;
    this.api.registrarCompra([{ id_producto: this.compraProducto, cantidad: this.compraCantidad }]).subscribe({
      next: (data) => { this.compraConfirmada.set(data.mensaje); this.showToast(data.mensaje, 'success'); },
      error: () => { this.compraConfirmada.set('Error'); this.showToast('Error al registrar', 'error'); }
    });
    setTimeout(() => this.compraConfirmada.set(''), 3000);
  }

  obtenerClaseEstado(estado: string): string {
    switch (estado) { case 'PENDIENTE': return 'bg-amber-500'; case 'EN CAMINO': return 'bg-blue-500'; default: return 'bg-slate-500'; }
  }

  showToast(message: string, type: 'success' | 'error' | 'info') {
    const id = ++this.toastId;
    this.toasts.update(t => [...t, { id, message, type }]);
    setTimeout(() => { this.toasts.update(t => t.filter(toast => toast.id !== id)); }, 3000);
  }
}
