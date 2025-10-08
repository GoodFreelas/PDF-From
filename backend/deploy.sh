#!/bin/bash

# Script de Deploy para Fly.io - AMPARE PDF Generator Backend

echo "🚀 Iniciando deploy do backend AMPARE no Fly.io..."

# Verificar se o flyctl está instalado
if ! command -v fly &> /dev/null; then
    echo "❌ flyctl não encontrado. Instale primeiro:"
    echo "curl -L https://fly.io/install.sh | sh"
    exit 1
fi

# Verificar se está logado no Fly.io
if ! fly auth whoami &> /dev/null; then
    echo "🔐 Faça login no Fly.io primeiro:"
    fly auth login
fi

# Verificar se as variáveis de ambiente estão configuradas
echo "📋 Verificando configuração de secrets..."

if ! fly secrets list | grep -q SMTP_USER; then
    echo "⚠️  SMTP_USER não configurado. Configure com:"
    echo "fly secrets set SMTP_USER=seu_email@ampare.org.br"
    read -p "Deseja continuar mesmo assim? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

if ! fly secrets list | grep -q SMTP_PASSWORD; then
    echo "⚠️  SMTP_PASSWORD não configurado. Configure com:"
    echo "fly secrets set SMTP_PASSWORD=sua_senha_smtp"
    read -p "Deseja continuar mesmo assim? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Deploy da aplicação
echo "🔄 Fazendo deploy da aplicação..."
fly deploy

# Verificar status após deploy
echo "✅ Deploy concluído! Verificando status..."
fly status

# Mostrar URL da aplicação
echo ""
echo "🌐 Sua aplicação está disponível em:"
echo "https://ampare-pdf-backend.fly.dev"
echo ""
echo "🔍 Health check:"
echo "https://ampare-pdf-backend.fly.dev/api/check-status"
echo ""
echo "📊 Para ver logs:"
echo "fly logs"
echo ""
echo "🎉 Deploy concluído com sucesso!"
