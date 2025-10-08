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
    "dependents": [
      {
        "NOME": "Maria Silva Santos",
        "NASCIMENTO": "20/05/1995",
        "CPF": "98765432100"
      }
    ]
  },
  "signatureData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "contratos": "saude,qualidonto"
}'

# Teste 1: Verificar status do servidor
echo "🔍 Verificando status do servidor..."
curl -s "$API_BASE_URL/api/check-status" | jq '.' || echo "❌ Erro ao conectar com o servidor"

echo ""

# Teste 2: Envio do formulário
echo "🚀 Testando envio do formulário..."
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "$FORM_DATA" \
  "$API_BASE_URL/generate-pdfs" | jq '.' || echo "❌ Erro no envio do formulário"

echo ""

# Teste 3: Teste com apenas um plano
echo "🧪 Testando com apenas o plano de saúde..."
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
      "PIS": "98765432100"
    },
    "signatureData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    "contratos": "saude"
  }' \
  "$API_BASE_URL/generate-pdfs" | jq '.' || echo "❌ Erro no teste com plano único"

echo ""

# Teste 4: Teste com plano vitalmed (inclui dependentes)
echo "🧪 Testando com plano vitalmed (inclui dependentes)..."
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
      "DATA": "15/12/2024",
      "RUA": "Rua das Palmeiras",
      "NUMERO": "456",
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
echo "✅ Testes concluídos!"
echo ""
echo "💡 Dicas:"
echo "   - Se houver erros de conexão, certifique-se de que o backend está rodando:"
echo "     cd backend && npm start"
echo "   - Para instalar o jq (formatação JSON):"
echo "     sudo apt install jq  # Ubuntu/Debian"
echo "     brew install jq      # macOS"
