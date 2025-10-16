#!/bin/bash

# Script de teste rápido usando curl para o backend do formulário de adesão
# Executa: chmod +x test-curl.sh && ./test-curl.sh

echo "🧪 Teste do Backend - Formulário de Adesão AMPARE"
echo "================================================"

# URL do backend
API_BASE_URL="http://127.0.0.1:8080"

# Dados de exemplo
FORM_DATA='{
  "formData": {
    "NOME": "João Silva Santos",
    "RG": "123456789",
    "CPF": "12345678901",
    "NASCIMENTO": "15/03/1990",
    "EMAIL": "joao.silva@email.com",
    "TELEFONE1": "(11) 99999-9999",
    "TELEFONE2": "(11) 88888-8888",
    "DATA": "15/12/2024",
    "RUA": "Rua das Flores",
    "NUMERO": "123",
    "COMPLEMENTO": "Apto 45",
    "BAIRRO": "Centro",
    "CIDADE": "São Paulo",
    "ESTADO": "SP",
    "CEP": "01234-567",
    "EMPRESA": "Empresa Exemplo Ltda",
    "MATRICULA": "12345",
    "ORGAO": "RH",
    "CARGO": "Analista",
    "ADMISSAO": "01/01/2020",
    "PIS": "12345678901",
    "VALOR": "50,00",
    "VALOR1": "35,00",
    "dependents": [
      {
        "NOME": "Maria Silva Santos",
        "NASCIMENTO": "20/05/1995",
        "CPF": "98765432100"
      }
    ]
  },
  "signatureData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "contratos": "qualidonto,vitalmed"
}'

# Teste 1: Verificar status do servidor
echo "🔍 Verificando status do servidor..."
curl -s "$API_BASE_URL/api/check-status" | jq '.' || echo "❌ Erro ao conectar com o servidor"

echo ""

# Teste 2: Envio do formulário com ambos os planos
echo "🚀 Testando envio do formulário (Qualidonto + Vitalmed)..."
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "$FORM_DATA" \
  "$API_BASE_URL/generate-pdfs" | jq '.' || echo "❌ Erro no envio do formulário"

echo ""

# Teste 3: Teste com apenas o plano Qualidonto
echo "🧪 Testando com apenas o plano Qualidonto..."
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "formData": {
      "NOME": "Maria Silva",
      "RG": "987654321",
      "CPF": "98765432100",
      "NASCIMENTO": "20/05/1995",
      "EMAIL": "maria@email.com",
      "TELEFONE1": "(11) 88888-8888",
      "DATA": "15/12/2024",
      "RUA": "Av. Paulista",
      "NUMERO": "1000",
      "BAIRRO": "Bela Vista",
      "CIDADE": "São Paulo",
      "ESTADO": "SP",
      "CEP": "01310-100",
      "EMPRESA": "Empresa Teste",
      "MATRICULA": "54321",
      "ORGAO": "TI",
      "CARGO": "Desenvolvedor",
      "ADMISSAO": "01/06/2023",
      "PIS": "98765432100",
      "VALOR1": "35,00"
    },
    "signatureData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    "contratos": "qualidonto"
  }' \
  "$API_BASE_URL/generate-pdfs" | jq '.' || echo "❌ Erro no teste com plano único"

echo ""

# Teste 4: Teste com plano vitalmed (inclui dependentes e ambos valores)
echo "🧪 Testando com plano Vitalmed (inclui dependentes)..."
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "formData": {
      "NOME": "Carlos Silva",
      "RG": "111222333",
      "CPF": "11122233344",
      "NASCIMENTO": "10/08/1985",
      "EMAIL": "carlos@email.com",
      "TELEFONE1": "(11) 77777-7777",
      "TELEFONE2": "(11) 66666-6666",
      "TELEFONE3": "(11) 55555-5555",
      "DATA": "15/12/2024",
      "RUA": "Rua das Palmeiras",
      "NUMERO": "456",
      "COMPLEMENTO": "Casa",
      "BAIRRO": "Jardins",
      "CIDADE": "São Paulo",
      "ESTADO": "SP",
      "CEP": "01452-000",
      "EMPRESA": "Empresa Vitalmed",
      "MATRICULA": "99999",
      "ORGAO": "Saúde",
      "CARGO": "Gerente",
      "ADMISSAO": "01/03/2022",
      "PIS": "11122233344",
      "VALOR": "50,00",
      "VALOR1": "35,00",
      "dependents": [
        {
          "NOME": "Ana Silva",
          "NASCIMENTO": "15/12/1990",
          "CPF": "55566677788"
        },
        {
          "NOME": "Lucas Silva",
          "NASCIMENTO": "20/03/2015",
          "CPF": "99988877766"
        }
      ]
    },
    "signatureData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    "contratos": "vitalmed"
  }' \
  "$API_BASE_URL/generate-pdfs" | jq '.' || echo "❌ Erro no teste com vitalmed"

echo ""

# Teste 5: Teste com todos os planos disponíveis
echo "🧪 Testando com todos os planos (Qualidonto + Vitalmed)..."
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "formData": {
      "NOME": "Roberto Santos",
      "RG": "444555666",
      "CPF": "44455566677",
      "NASCIMENTO": "25/09/1988",
      "EMAIL": "roberto@email.com",
      "TELEFONE1": "(11) 44444-4444",
      "TELEFONE2": "(11) 33333-3333",
      "DATA": "15/12/2024",
      "RUA": "Rua dos Pinheiros",
      "NUMERO": "789",
      "BAIRRO": "Pinheiros",
      "CIDADE": "São Paulo",
      "ESTADO": "SP",
      "CEP": "05422-000",
      "EMPRESA": "Empresa Completa Ltda",
      "MATRICULA": "77777",
      "ORGAO": "Administração",
      "CARGO": "Coordenador",
      "ADMISSAO": "15/08/2021",
      "PIS": "44455566677",
      "VALOR": "50,00",
      "VALOR1": "35,00",
      "dependents": [
        {
          "NOME": "Paula Santos",
          "NASCIMENTO": "10/01/1992",
          "CPF": "11122233344"
        }
      ]
    },
    "signatureData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    "contratos": "qualidonto,vitalmed"
  }' \
  "$API_BASE_URL/generate-pdfs" | jq '.' || echo "❌ Erro no teste com todos os planos"

echo ""
echo "✅ Testes concluídos!"
echo ""
echo "📋 Resumo dos testes:"
echo "   1. ✓ Status do servidor"
echo "   2. ✓ Qualidonto + Vitalmed (com dependentes)"
echo "   3. ✓ Apenas Qualidonto (VALOR1 apenas)"
echo "   4. ✓ Apenas Vitalmed (VALOR + VALOR1)"
echo "   5. ✓ Todos os planos disponíveis"
echo ""
echo "💡 Dicas:"
echo "   - Se houver erros de conexão, certifique-se de que o backend está rodando:"
echo "     cd backend && npm start"
echo "   - Para instalar o jq (formatação JSON):"
echo "     sudo apt install jq  # Ubuntu/Debian"
echo "     brew install jq      # macOS"
echo ""
echo "📝 Observações sobre os valores:"
echo "   - Qualidonto: usa apenas VALOR1"
echo "   - Vitalmed: usa VALOR e VALOR1"