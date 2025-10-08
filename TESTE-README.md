# 🧪 Testes Rápidos para o Formulário de Adesão

Este diretório contém scripts para testar rapidamente o formulário de adesão e a comunicação com o backend.

## 📋 Scripts Disponíveis

### 1. `test-curl.sh` (Recomendado - Mais Simples)
Script bash que usa curl para testar o backend.

```bash
# Executar o teste
./test-curl.sh
```

**Requisitos:**
- `curl` (geralmente já instalado)
- `jq` para formatação JSON (opcional)
  ```bash
  # Ubuntu/Debian
  sudo apt install jq
  
  # macOS
  brew install jq
  ```

### 2. `test-backend.js` (Node.js)
Script Node.js que testa diferentes combinações de planos.

```bash
# Executar o teste
node test-backend.js
```

**Requisitos:**
- Node.js instalado

### 3. `test-form.js` (Browser/Node.js)
Script JavaScript que pode ser executado no browser ou Node.js.

```bash
# No Node.js
node test-form.js

# No browser (console do navegador)
# Copie e cole o conteúdo do arquivo no console
```

## 🚀 Como Usar

### Passo 1: Iniciar o Backend
```bash
cd backend
npm start
```

### Passo 2: Executar o Teste
```bash
# Opção 1: Script bash (mais simples)
./test-curl.sh

# Opção 2: Script Node.js
node test-backend.js

# Opção 3: Script JavaScript
node test-form.js
```

## 📊 O que os Testes Fazem

### Teste 1: Status do Servidor
- Verifica se o backend está online
- Endpoint: `GET /api/check-status`

### Teste 2: Envio Básico do Formulário
- Envia dados completos do formulário
- Testa com planos: `saude` e `qualidonto`
- Endpoint: `POST /generate-pdfs`

### Teste 3: Plano Único
- Testa envio com apenas o plano de saúde
- Valida se o sistema funciona com um plano

### Teste 4: Plano Vitalmed
- Testa o plano que inclui dependentes
- Valida o processamento de dados de familiares

## 🔧 Dados de Teste

Os scripts usam dados fictícios para teste:

```javascript
{
  "NOME": "João Silva Santos",
  "RG": "123456789",
  "CPF": "12345678901",
  "NASCIMENTO": "15/03/1990",
  "EMAIL": "joao.silva@email.com",
  "TELEFONE1": "(11) 99999-9999",
  // ... outros campos
}
```

## 🐛 Solução de Problemas

### Erro de Conexão
```
❌ Erro ao conectar com o servidor
```
**Solução:** Certifique-se de que o backend está rodando:
```bash
cd backend && npm start
```

### Erro de CORS
```
❌ Origin não permitida pelo CORS
```
**Solução:** O backend já está configurado para aceitar requisições locais.

### Erro de Validação
```
❌ Erro: Por favor, selecione pelo menos um plano
```
**Solução:** Verifique se os dados de teste incluem planos válidos.

## 📝 Personalizando os Testes

### Alterar Dados de Teste
Edite os objetos `formData` nos scripts para usar seus próprios dados.

### Testar Diferentes Planos
Modifique o array `selectedPlans` ou `contratos`:
- `["saude"]` - Apenas seguro-saúde
- `["qualidonto"]` - Apenas plano odontológico  
- `["vitalmed"]` - Apenas assistência familiar
- `["saude", "qualidonto"]` - Múltiplos planos

### Testar Dependentes
Para o plano `vitalmed`, adicione dependentes no array `dependents`:
```javascript
"dependents": [
  {
    "NOME": "Maria Silva",
    "NASCIMENTO": "20/05/1995",
    "CPF": "98765432100"
  }
]
```

## 🎯 Resultados Esperados

### Sucesso
```json
{
  "success": true,
  "message": "2 PDFs enviados para o administrador e arquivos temporários excluídos"
}
```

### Erro de Validação
```json
{
  "success": false,
  "message": "Por favor, selecione pelo menos um plano"
}
```

## 📧 Verificação de Email

Se o backend estiver configurado com credenciais SMTP, os PDFs serão enviados por email para o administrador. Verifique:
- Variáveis de ambiente no arquivo `.env`
- Logs do servidor para confirmação de envio
- Caixa de entrada do email do administrador
