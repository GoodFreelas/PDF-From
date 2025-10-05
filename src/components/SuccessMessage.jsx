// ================================
// Imports
// ================================
import PropTypes from 'prop-types';

// ================================
// Componente SuccessMessage
// ================================

/**
 * Componente de mensagem de sucesso após submissão
 * @param {Object} props - Propriedades do componente
 * @param {string} props.email - Email do usuário
 * @returns {JSX.Element} - Componente SuccessMessage
 */
export default function SuccessMessage({ email }) {
  // ================================
  // JSX Return
  // ================================
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
        <div className="mb-6">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Solicitação enviada com sucesso!
        </h2>
        <p className="mb-6 text-gray-600">
          Sua solicitação de adesão aos benefícios foi enviada com sucesso. Os
          contratos preenchidos foram enviados para análise da equipe AMPARE. Em
          até 24 horas, você receberá o seu termo de ciência Ampare
        </p>
        <p className="mb-6 text-sm text-gray-500">
          Em breve entraremos em contato através do e-mail{" "}
          <span className="font-semibold text-blue-600">{email}</span> para
          finalizar o processo.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md py-3 font-medium transition duration-200"
        >
          Preencher Nova Solicitação
        </button>
      </div>
    </div>
  );
}

// ================================
// PropTypes
// ================================
SuccessMessage.propTypes = {
  email: PropTypes.string.isRequired,
};
