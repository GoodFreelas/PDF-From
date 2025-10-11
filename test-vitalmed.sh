#!/bin/bash

# Script de teste específico para o contrato vitalmed
# Executa: chmod +x test-vitalmed.sh && ./test-vitalmed.sh

echo "🧪 Teste Específico - Contrato Vitalmed"
echo "======================================"

# URL do backend
API_BASE_URL="http://127.0.0.1:8080"

# Verificar se o servidor está online
echo "🔍 Verificando status do servidor..."
STATUS_RESPONSE=$(curl -s "$API_BASE_URL/api/check-status")
if [[ $? -eq 0 ]]; then
    echo "✅ Servidor online: $STATUS_RESPONSE"
else
    echo "❌ Erro ao conectar com o servidor"
    echo "💡 Certifique-se de que o backend está rodando: cd backend && npm start"
    exit 1
fi

echo ""

# Teste específico para o contrato vitalmed com dependentes
echo "🚀 Testando contrato vitalmed com dependentes..."
RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "formData": {
      "NOME": "Carlos Silva Santos",
      "RG": "111222333",
      "CPF": "11122233344",
      "NASCIMENTO": "10/08/1985",
      "EMAIL": "carlos@email.com",
      "TELEFONE1": "(11) 77777-7777",
      "TELEFONE2": "(11) 77777-7777",
      "TELEFONE3": "(11) 77777-7777",
      "COMPLEMENTO": "apt 48",
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
      "VALOR":  "123",
      "dependents": [
        {
          "NOME": "Ana Silva Santos",
          "NASCIMENTO": "15/12/1990",
          "CPF": "55566677788"
        },
        {
          "NOME": "Lucas Silva Santos",
          "NASCIMENTO": "20/03/2015",
          "CPF": "99988877766"
        },
        {
          "NOME": "Marina Silva Santos",
          "NASCIMENTO": "05/07/2018",
          "CPF": "44455566677"
        },
        {
          "NOME": "Ana Silva Santos",
          "NASCIMENTO": "15/12/1990",
          "CPF": "55566677788"
        },
        {
          "NOME": "Lucas Silva Santos",
          "NASCIMENTO": "20/03/2015",
          "CPF": "99988877766"
        },
        {
          "NOME": "Marina Silva Santos",
          "NASCIMENTO": "05/07/2018",
          "CPF": "44455566677"
        },
        {
          "NOME": "Marina Silva Santos",
          "NASCIMENTO": "05/07/2018",
          "CPF": "44455566677"
        }
      ]
    },
    "signatureData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    "contratos": "vitalmed"
  }' \
  "$API_BASE_URL/generate-pdfs")

if [[ $? -eq 0 ]]; then
    echo "✅ Resposta do servidor: $RESPONSE"
else
    echo "❌ Erro no teste do contrato vitalmed"
fi

echo ""
echo "📋 Modificações aplicadas no contrato vitalmed:"
echo "   ✅ Campo RG removido das posições"
echo "   ✅ Tamanho da fonte do CPF reduzido de 15 para 10"
echo "   ✅ Espaçamento do CPF reduzido de 18 para 12"
echo "   ✅ Espaçamento final do CPF reduzido de 10 para 6"
echo "   ✅ Mesmas configurações aplicadas aos CPFs dos familiares"
echo ""
echo "✅ Teste do contrato vitalmed concluído!"

