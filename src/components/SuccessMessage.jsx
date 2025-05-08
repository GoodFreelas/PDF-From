export default function SuccessMessage({ email }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
        <div className="mb-6">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Contratos gerados com sucesso!</h2>
        
        <p className="mb-6 text-gray-600">
          Os documentos foram baixados no seu computador e enviados para o e-mail{' '}
          <span className="font-semibold text-blue-600">{email}</span>.
        </p>
        
        <button
          onClick={() => window.location.reload()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md py-3 font-medium transition duration-200"
        >
          Preencher Novos Contratos
        </button>
      </div>
    </div>
  );
}