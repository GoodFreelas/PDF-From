// Script de teste para verificar se o backend está funcionando
const API_BASE_URL = "https://pdf-from.fly.dev";

async function testBackend() {
  console.log("🧪 Testando conexão com o backend...");
  
  try {
    // Teste 1: Health check
    console.log("1️⃣ Testando health check...");
    const healthResponse = await fetch(`${API_BASE_URL}/api/check-status`);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log("✅ Health check OK:", healthData);
    } else {
      console.log("❌ Health check falhou:", healthResponse.status);
    }
    
  } catch (error) {
    console.error("❌ Erro na conexão:", error.message);
    
    if (error.message.includes('CORS')) {
      console.log("🔧 Solução: Aguarde o deploy da correção CORS");
    } else if (error.message.includes('fetch')) {
      console.log("🔧 Solução: Verifique se o backend está rodando");
    }
  }
}

// Executar teste
testBackend();