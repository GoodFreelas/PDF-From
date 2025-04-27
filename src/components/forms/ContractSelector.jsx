import { CONTRACT_FILES } from '../../constants/contracts';

export default function ContractSelector({ contracts, currentContract, onChange }) {
  return (
    <select
      className="mb-2 border rounded p-1 w-full"
      value={currentContract}
      onChange={(e) => onChange(e.target.value)}
    >
      {contracts.map((id) => (
        <option key={id} value={id}>
          {CONTRACT_FILES[id].label}
        </option>
      ))}
    </select>
  );
}