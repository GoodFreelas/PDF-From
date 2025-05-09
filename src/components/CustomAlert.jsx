// Componente de alerta personalizado
const CustomAlert = ({ message, type = 'warning', onClose }) => {
  return (
    <div className="fixed top-16 right-4 z-50 animate-fadeIn">
      <div className={`max-w-md rounded-lg shadow-lg overflow-hidden ${type === 'warning' ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-l-4 border-yellow-500' :
          type === 'error' ? 'bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500' :
            'bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500'
        }`}>
        <div className="p-4 flex items-start">
          <div className="flex-shrink-0 mr-3">
            {type === 'warning' && (
              <svg className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            {type === 'error' && (
              <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            {type === 'success' && (
              <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <p className={`text-sm font-medium ${type === 'warning' ? 'text-yellow-700' :
                type === 'error' ? 'text-red-700' :
                  'text-green-700'
              }`}>
              {message}
            </p>
          </div>
          <div className="ml-3 flex-shrink-0">
            <button
              onClick={onClose}
              className={`inline-flex text-gray-400 hover:text-gray-500 focus:outline-none`}
            >
              <span className="sr-only">Fechar</span>
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomAlert