
export default function StatusBadge({ status }) {
  const styles = {
    'APROVADO': 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    'REPROVADO': 'bg-red-100 text-red-700 border border-red-200',
    'CURSANDO': 'bg-blue-100 text-blue-700 border border-blue-200',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
};