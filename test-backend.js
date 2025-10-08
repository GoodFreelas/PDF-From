#!/usr/bin/env node

/**
 * Script de teste rápido para o backend do formulário de adesão
 * Executa: node test-backend.js
 */

const https = require('https');
const http = require('http');

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
 * Função para fazer requisição HTTP
 */
function makeRequest(url, options, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const req = client.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonBody });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

/**
 * Função para testar o status do servidor
 */
async function testServerStatus() {
  try {
    console.log("🔍 Verificando status do servidor...");
    const response = await makeRequest(`${API_BASE_URL}/api/check-status`);
    
    if (response.status === 200) {
      console.log("✅ Servidor online:", response.data);
      return true;
    } else {
      console.log("❌ Servidor retornou status:", response.status);
      return false;
    }
  } catch (error) {
    console.log("❌ Erro ao conectar com o servidor:", error.message);
    console.log("💡 Certifique-se de que o backend está rodando:");
    console.log("   cd backend && npm start");
    return false;
  }
}

/**
 * Função para testar o envio do formulário
 */
async function testFormSubmission(plans = ["saude", "qualidonto"]) {
  try {
    console.log(`\n🚀 Testando envio do formulário com planos: ${plans.join(", ")}`);
    
    const requestData = {
      formData,
      signatureData,
      contratos: plans.join(",")
    };
    
    const response = await makeRequest(`${API_BASE_URL}/generate-pdfs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, requestData);
    
    if (response.status === 200) {
      console.log("✅ Sucesso! Resultado:", response.data);
      return true;
    } else {
      console.log("❌ Erro:", response.status, response.data);
      return false;
    }
  } catch (error) {
    console.log("❌ Erro no teste:", error.message);
    return false;
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
  
  console.log("\n🧪 Testando diferentes combinações de planos...");
  
  for (const plans of planCombinations) {
    console.log(`\n📋 Testando planos: ${plans.join(", ")}`);
    await testFormSubmission(plans);
    
    // Pausa entre testes
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

/**
 * Função principal
 */
async function main() {
  console.log("🧪 Teste do Backend - Formulário de Adesão AMPARE");
  console.log("================================================");
  
  // Verifica se o servidor está online
  const serverOnline = await testServerStatus();
  if (!serverOnline) {
    process.exit(1);
  }
  
  // Teste básico
  await testFormSubmission();
  
  // Teste com diferentes planos
  await testDifferentPlans();
  
  console.log("\n✅ Todos os testes concluídos!");
}

// Executa o teste
main().catch(console.error);
