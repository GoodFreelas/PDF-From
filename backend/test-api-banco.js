import fetch from 'node-fetch';
import fs from 'fs';

async function testBancoApi() {
  const url = 'http://localhost:8080/generate-pdfs';
  
  // Dummy signature (a tiny transparent PNG)
  const signatureData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

  const payload = {
    contratos: 'banco',
    signatureData: signatureData,
    formData: {
      CPF: '123.456.789-01',
      NOME: 'CLIENTE TESTE AUTOMATICO',
      CNPJ: '12.345.678/0001-90',
      AGENCIA: '1234-5',
      CONTA: '00098765-4',
      VALOR: '1.500,00',
      DATA: '2025-03-21',
      EMAIL: 'teste@email.com',
      TELEFONE1: '(71) 99999-9999',
      EMPRESA: 'EMPRESA TESTE'
    }
  };

  try {
    console.log('Enviando requisição para o backend...');
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('Sucesso!');
      console.log('Mensagem do servidor:', result.message);
      console.log('Verifique a pasta "backend/temp/" para o PDF gerado.');
    } else {
      console.error('Erro na requisição:', result.message || response.statusText);
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('Erro: Não foi possível conectar ao servidor. O backend está rodando na porta 8080?');
    } else {
      console.error('Erro inesperado:', error.message);
    }
  }
}

testBancoApi();
