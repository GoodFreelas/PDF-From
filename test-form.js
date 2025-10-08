/**
 * Script de teste rápido para o formulário de adesão
 * Preenche o formulário com dados de exemplo e faz a requisição para o backend
 */

// Dados de exemplo para preenchimento do formulário
const formData = {
  // Dados pessoais
  NOME: "João Silva Santos",
  RG: "123456789",
  CPF: "12345678901",
  NASCIMENTO: "15/03/1990",
  EMAIL: "joao.silva@email.com",
  TELEFONE1: "(11) 99999-9999",
  TELEFONE2: "(11) 88888-8888",
  DATA: "15/12/2024",
  
  // Dados de endereço
  RUA: "Rua das Flores",
  NUMERO: "123",
  COMPLEMENTO: "Apto 45",
  BAIRRO: "Centro",
  CIDADE: "São Paulo",
  ESTADO: "SP",
  CEP: "01234-567",
  
  // Dados profissionais
  EMPRESA: "Empresa Exemplo Ltda",
  MATRICULA: "12345",
  ORGAO: "RH",
  CARGO: "Analista",
  ADMISSAO: "01/01/2020",
  PIS: "12345678901",
  
  // Planos selecionados (pode ser: saude, qualidonto, vitalmed)
  selectedPlans: ["saude", "qualidonto"],
  
  // Dados de dependentes (opcional, usado no plano vitalmed)
  dependents: [
    {
      NOME: "Maria Silva Santos",
      NASCIMENTO: "20/05/1995",
      CPF: "98765432100"
    },
    {
      NOME: "Pedro Silva Santos", 
      NASCIMENTO: "10/08/2010",
      CPF: "11122233344"
    }
  ]
};

// Assinatura de exemplo (base64 de uma imagem simples)
const signatureData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

// URL do backend
const API_BASE_URL = "http://127.0.0.1:8080";

/**
 * Função para fazer a requisição de teste
 */
async function testFormSubmission() {
  try {
    console.log("🚀 Iniciando teste do formulário...");
    console.log("📋 Dados do formulário:", JSON.stringify(formData, null, 2));
    
    // Verifica se o servidor está online
    console.log("🔍 Verificando status do servidor...");
    const statusResponse = await fetch(`${API_BASE_URL}/api/check-status`);
    const statusData = await statusResponse.json();
    console.log("✅ Servidor online:", statusData);
    
    // Faz a requisição principal
    console.log("📤 Enviando dados para o backend...");
    const response = await fetch(`${API_BASE_URL}/generate-pdfs`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({
        formData,
        signatureData,
        contratos: formData.selectedPlans.join(",")
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erro ${response.status}: ${errorData.message || 'Erro desconhecido'}`);
    }
    
    const result = await response.json();
    console.log("✅ Sucesso! Resultado:", result);
    
  } catch (error) {
    console.error("❌ Erro no teste:", error.message);
    
    if (error.message.includes("ECONNREFUSED")) {
      console.log("💡 Dica: Certifique-se de que o backend está rodando:");
      console.log("   cd backend && npm start");
    }
  }
}

/**
 * Função para testar diferentes combinações de planos
 */
async function testDifferentPlans() {
  const planCombinations = [
    ["saude"],
    ["qualidonto"], 
    ["vitalmed"],
    ["saude", "qualidonto"],
    ["saude", "vitalmed"],
    ["qualidonto", "vitalmed"],
    ["saude", "qualidonto", "vitalmed"]
  ];
  
  console.log("🧪 Testando diferentes combinações de planos...");
  
  for (const plans of planCombinations) {
    console.log(`\n📋 Testando planos: ${plans.join(", ")}`);
    
    const testData = {
      ...formData,
      selectedPlans: plans
    };
    
    try {
      const response = await fetch(`${API_BASE_URL}/generate-pdfs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formData: testData,
          signatureData,
          contratos: plans.join(",")
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Sucesso para ${plans.join(", ")}:`, result.message);
      } else {
        const errorData = await response.json();
        console.log(`❌ Erro para ${plans.join(", ")}:`, errorData.message);
      }
    } catch (error) {
      console.log(`❌ Erro de conexão para ${plans.join(", ")}:`, error.message);
    }
    
    // Pausa entre testes
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

/**
 * Função para testar validação de dados
 */
async function testValidation() {
  console.log("🔍 Testando validação de dados...");
  
  const invalidData = {
    ...formData,
    NOME: "", // Nome vazio
    CPF: "123", // CPF inválido
    EMAIL: "email-invalido", // Email inválido
    selectedPlans: [] // Nenhum plano selecionado
  };
  
  try {
    const response = await fetch(`${API_BASE_URL}/generate-pdfs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        formData: invalidData,
        signatureData,
        contratos: ""
      })
    });
    
    if (response.ok) {
      console.log("⚠️  Dados inválidos foram aceitos (isso não deveria acontecer)");
    } else {
      const errorData = await response.json();
      console.log("✅ Validação funcionando:", errorData.message);
    }
  } catch (error) {
    console.log("❌ Erro na validação:", error.message);
  }
}

// Menu de opções
console.log("🧪 Teste do Formulário de Adesão AMPARE");
console.log("=====================================");
console.log("1. Teste básico com dados válidos");
console.log("2. Teste com diferentes combinações de planos");
console.log("3. Teste de validação de dados");
console.log("4. Executar todos os testes");

// Executa o teste básico por padrão
testFormSubmission();

// Para executar outros testes, descomente as linhas abaixo:
// testDifferentPlans();
// testValidation();
