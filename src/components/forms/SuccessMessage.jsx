export default function SuccessMessage({ email }) {
  return (
    <section className="max-w-2xl mx-auto mt-8 bg-white p-8 rounded shadow text-center">
      <h2 className="text-2xl font-bold mb-4">Contratos gerados com sucesso!</h2>
      <p className="mb-6">
        Os documentos foram baixados no seu computador. Revise e envie para o e-mail{' '}
        <span className="font-semibold">{email}</span>.
      </p>
      <button
        className="bg-blue-600 hover:bg-blue-700 text-white rounded py-2 px-8"
        onClick={() => window.location.replace('/')}
      >
        Preencher Novos Contratos
      </button>
    </section>
  );
}
