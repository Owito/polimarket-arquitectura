use reqwest::blocking::Client;
use std::error::Error;

fn main() -> Result<(), Box<dyn Error>> {
    let client = Client::new();
    let base_url = "http://localhost:8080";

    println!("--------------------------------------");
    println!("PoliMarket - Terminal App de Bodega");
    println!("--------------------------------------\n");

    // Endpoint 1: Entregas pendientes (/entregas/pendientes)
    println!(">>> Consultando entregas pendientes...");
    let res_entregas = client.get(format!("{}/entregas/pendientes", base_url)).send()?;
    if res_entregas.status().is_success() {
        let text = res_entregas.text()?;
        let json: serde_json::Value = serde_json::from_str(&text)?;
        println!("{}", serde_json::to_string_pretty(&json)?);
    } else {
        println!("Error al consultar despachos. HTTP Status: {}", res_entregas.status());
    }
    
    println!("\n--------------------------------------\n");

    // Endpoint 2: Bodega stock (/bodega/stock)
    println!(">>> Consultando stock en bodega...");
    let res_stock = client.get(format!("{}/bodega/stock", base_url)).send()?;
    if res_stock.status().is_success() {
        let text = res_stock.text()?;
        let json: serde_json::Value = serde_json::from_str(&text)?;
        println!("{}", serde_json::to_string_pretty(&json)?);
    } else {
        println!("Error al consultar stock. HTTP Status: {}", res_stock.status());
    }

    Ok(())
}
