import React from 'react';

const ErrorPage = ({ 
  error, 
  onRetry, 
  onGoBack, 
  isRetrying = false,
  showRetryButton = true 
}) => {
  const getErrorMessage = (error) => {
    if (error?.includes('timeout') || error?.includes('ETIMEDOUT')) {
      return {
        title: 'Erro de Conexão',
        message: 'O servidor está demorando para responder. Isso pode ser devido a problemas de rede ou sobrecarga do servidor.',
        suggestion: 'Tente novamente em alguns instantes.'
      };
    }
    
    if (error?.includes('Connection timeout')) {
      return {
        title: 'Timeout de Conexão',
        message: 'Não foi possível conectar com o servidor de email. O servidor pode estar temporariamente indisponível.',
        suggestion: 'Verifique sua conexão e tente novamente.'
      };
    }
    
    if (error?.includes('SMTP') || error?.includes('email')) {
      return {
        title: 'Erro no Envio de Email',
        message: 'Os PDFs foram gerados com sucesso, mas houve um problema ao enviar por email.',
        suggestion: 'Os arquivos foram salvos no servidor. Tente reenviar ou entre em contato conosco.'
      };
    }
    
    return {
      title: 'Erro Inesperado',
      message: 'Ocorreu um erro inesperado durante o processamento.',
      suggestion: 'Tente novamente ou entre em contato conosco se o problema persistir.'
    };
  };

  const errorInfo = getErrorMessage(error);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Ícone de Erro */}
        <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <svg 
            className="w-10 h-10 text-red-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
            />
          </svg>
        </div>

        {/* Título do Erro */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {errorInfo.title}
        </h1>

        {/* Mensagem do Erro */}
        <p className="text-gray-600 mb-6 leading-relaxed">
          {errorInfo.message}
        </p>

        {/* Sugestão */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800 text-sm">
            💡 <strong>Dica:</strong> {errorInfo.suggestion}
          </p>
        </div>

        {/* Detalhes Técnicos (colapsáveis) */}
        {error && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 mb-2">
              Ver detalhes técnicos
            </summary>
            <div className="bg-gray-100 rounded-lg p-3 text-xs font-mono text-gray-600 break-all">
              {error}
            </div>
          </details>
        )}

        {/* Botões de Ação */}
        <div className="space-y-3">
          {showRetryButton && (
            <button
              onClick={onRetry}
              disabled={isRetrying}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              {isRetrying ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Tentando novamente...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Tentar Novamente
                </>
              )}
            </button>
          )}

          <button
            onClick={onGoBack}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar ao Formulário
          </button>
        </div>

        {/* Informações de Contato */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Se o problema persistir, entre em contato conosco:
            <br />
            <a href="mailto:suporte@ampare.org.br" className="text-blue-600 hover:underline">
              suporte@ampare.org.br
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
