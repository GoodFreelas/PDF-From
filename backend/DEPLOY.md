# Deploy do Backend AMPARE no Fly.io

Este guia explica como fazer deploy do backend AMPARE PDF Generator no Fly.io usando tanto o navegador web quanto o CLI.

## Pré-requisitos

1. **Conta no Fly.io**: Crie uma conta em [fly.io](https://fly.io)
2. **Repositório Git**: Certifique-se de que seu código está em um repositório Git (GitHub, GitLab, etc.)

## Método 1: Deploy pelo Navegador Web (Recomendado)

### 1. Acesse o Dashboard do Fly.io
- Vá para [fly.io](https://fly.io) e faça login
- Clique em "Create App" ou "New App"

### 2. Configurar Nova Aplicação
- **App Name**: `ampare-pdf-backend` (ou escolha outro nome)
- **Organization**: Selecione sua organização
- **Region**: Escolha `São Paulo (gru)` para melhor performance no Brasil
- **Source**: Selecione seu repositório Git

### 3. Configurar Build Settings
Na seção de configuração do build:
- **Dockerfile Path**: `backend/Dockerfile`
- **Root Directory**: `backend/`

### 4. Configurar Variáveis de Ambiente
Na seção "Environment Variables", adicione:
```
NODE_ENV=production
PORT=8080
SMTP_USER=seu_email@email.com
SMTP_PASSWORD=sua_senha_smtp
ADMIN_EMAIL=admin@email.com
```

### 5. Configurar Resources
- **Memory**: 1GB (recomendado)
- **CPU**: 1 vCPU compartilhado
- **Storage**: Sem necessidade adicional

### 6. Deploy
- Clique em "Deploy"
- Aguarde o processo de build e deploy (pode levar alguns minutos)
- A aplicação estará disponível em: `https://ampare-pdf-backend.fly.dev`

## Método 2: Deploy via CLI

### Pré-requisitos CLI
1. **Fly CLI**: Instale o CLI do Fly.io
   ```bash
   # Linux/macOS
   curl -L https://fly.io/install.sh | sh
   
   # Ou via npm
   npm install -g @fly/flyctl
   ```

### Configuração Inicial CLI
1. **Login no Fly.io**
   ```bash
   fly auth login
   ```

2. **Configurar Variáveis de Ambiente**
   Configure as variáveis de ambiente necessárias:
   ```bash
   # Configurar email SMTP
   fly secrets set SMTP_USER=seu_email@email.com
   fly secrets set SMTP_PASSWORD=sua_senha_smtp
   fly secrets set ADMIN_EMAIL=admin@email.com
   
   # Configurar porta (opcional, padrão é 8080)
   fly secrets set PORT=8080
   ```

3. **Deploy Inicial**
   ```bash
   # Navegar para o diretório do backend
   cd backend
   
   # Deploy da aplicação
   fly deploy
   ```

## Gerenciamento da Aplicação

### Via Navegador Web
Acesse o [dashboard do Fly.io](https://fly.io) para:

- **📊 Monitoramento**: Ver métricas, logs e status da aplicação
- **🔧 Configuração**: Alterar variáveis de ambiente, recursos e configurações
- **📝 Logs**: Visualizar logs em tempo real com filtros
- **🔄 Deploy**: Fazer novos deploys com interface visual
- **📈 Escalabilidade**: Ajustar recursos (CPU, memória, instâncias)
- **🌐 Domínios**: Configurar domínios personalizados e SSL
- **💰 Billing**: Acompanhar uso e custos

### Via CLI
```bash
# Ver status da aplicação
fly status

# Ver logs em tempo real
fly logs

# Ver logs específicos
fly logs --app ampare-pdf-backend

# Abrir aplicação no navegador
fly open

# SSH para a máquina
fly ssh console
```

### Gerenciamento de Secrets

#### Via Navegador Web
1. Acesse seu app no dashboard do Fly.io
2. Vá para a seção "Secrets" ou "Environment Variables"
3. Adicione, edite ou remova variáveis de ambiente
4. Clique em "Save" para aplicar as mudanças

#### Via CLI
```bash
# Listar secrets
fly secrets list

# Definir secret
fly secrets set NOME_VARIAVEL=valor

# Remover secret
fly secrets unset NOME_VARIAVEL
```

### Escalabilidade

#### Via Navegador Web
1. Acesse seu app no dashboard do Fly.io
2. Vá para a seção "Scaling" ou "Resources"
3. Ajuste:
   - **Instâncias**: Número de máquinas rodando
   - **CPU**: Quantidade de vCPUs
   - **Memória**: Quantidade de RAM
4. Clique em "Apply Changes"

#### Via CLI
```bash
# Escalar para múltiplas instâncias
fly scale count 2

# Escalar recursos
fly scale memory 2048
fly scale cpu 2
```

## Monitoramento

### Via Dashboard Web
Acesse o dashboard do Fly.io para:
- **📊 Métricas**: CPU, memória, rede, requisições
- **📝 Logs**: Visualização de logs com filtros avançados
- **🔍 Health Checks**: Status de saúde da aplicação
- **📈 Gráficos**: Tendências e performance ao longo do tempo

### Health Check
A aplicação inclui um endpoint de health check:
```
GET https://ampare-pdf-backend.fly.dev/api/check-status
```

### Logs via CLI
```bash
# Ver logs em tempo real
fly logs

# Ver logs com filtros
fly logs --app ampare-pdf-backend --region gru
```

## Troubleshooting

### Via Dashboard Web
1. **Logs**: Verifique a seção de logs no dashboard para erros
2. **Métricas**: Monitore CPU, memória e rede para identificar gargalos
3. **Configuração**: Verifique se as variáveis de ambiente estão corretas
4. **Restart**: Use o botão "Restart" no dashboard se necessário

### Problemas Comuns

1. **Erro de Build**: Verifique se todas as dependências estão no package.json
2. **Erro de Memória**: Aumente a memória via dashboard ou `fly scale memory 2048`
3. **Timeout**: Verifique os logs para identificar gargalos
4. **CORS**: A configuração CORS já inclui o domínio do Fly.io

### Comandos de Debug CLI
```bash
# Ver configuração atual
fly info

# Ver métricas
fly metrics

# Restart da aplicação
fly restart
```

## Domínio Personalizado (Opcional)

### Via Dashboard Web
1. Acesse seu app no dashboard do Fly.io
2. Vá para a seção "Domains" ou "Certificates"
3. Clique em "Add Domain"
4. Digite seu domínio personalizado
5. Configure os registros DNS conforme instruído
6. Aguarde a validação e ativação do certificado SSL

### Via CLI
```bash
# Adicionar certificado SSL
fly certs add seu-dominio.com

# Verificar status do certificado
fly certs show seu-dominio.com
```

## Backup e Restore

```bash
# Fazer backup dos secrets
fly secrets list > backup-secrets.txt

# Backup da configuração
fly info > backup-config.txt
```

## Atualizações

### Via Dashboard Web
1. Acesse seu app no dashboard do Fly.io
2. Vá para a seção "Deployments" ou "Releases"
3. Clique em "Deploy" para fazer deploy da versão mais recente
4. Para rollback, selecione uma versão anterior e clique em "Rollback"

### Via CLI
```bash
# Deploy da nova versão
fly deploy

# Rollback se necessário
fly releases
fly releases rollback VERSION
```

---

## URLs da Aplicação

- **Produção**: https://ampare-pdf-backend.fly.dev
- **Health Check**: https://ampare-pdf-backend.fly.dev/api/check-status
- **API Docs**: Consulte o código fonte para endpoints disponíveis

## Suporte

Em caso de problemas:
1. Verifique os logs: `fly logs`
2. Consulte a documentação do Fly.io
3. Verifique o status: `fly status`
