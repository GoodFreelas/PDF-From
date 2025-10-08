#!/usr/bin/env node
/**
 * Script para testar conectividade SMTP em diferentes portas
 * Útil para diagnosticar problemas no Render
 */

import nodemailer from 'nodemailer';
import 'dotenv/config';

const ports = [587, 465, 25, 2525];
const host = 'smtpi.ampare.org.br';

console.log('🔍 Testando conectividade SMTP em diferentes portas...');
console.log(`📧 Host: ${host}`);
console.log(`👤 Usuário: ${process.env.SMTP_USER || 'NÃO CONFIGURADO'}`);
console.log('─'.repeat(50));

for (const port of ports) {
  console.log(`\n🔌 Testando porta ${port}...`);
  
  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true para 465, false para outras portas
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      },
      tls: {
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2'
      },
      connectionTimeout: 10000,
      greetingTimeout: 5000,
      socketTimeout: 10000
    });

    const startTime = Date.now();
    await transporter.verify();
    const duration = Date.now() - startTime;
    
    console.log(`✅ Porta ${port}: CONECTADA (${duration}ms)`);
    
    // Fechar conexão
    transporter.close();
    
  } catch (error) {
    console.log(`❌ Porta ${port}: FALHOU - ${error.message}`);
  }
}

console.log('\n' + '─'.repeat(50));
console.log('💡 Recomendações:');
console.log('- Se todas as portas falharem, o Render pode estar bloqueando SMTP');
console.log('- Considere usar SendGrid, Mailgun ou AWS SES');
console.log('- Verifique se o servidor SMTP aceita conexões externas');
