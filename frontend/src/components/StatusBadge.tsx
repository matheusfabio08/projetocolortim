type Status = 'ABERTA' | 'EM_PRODUCAO' | 'FINALIZADA' | 'CANCELADA' | 'PENDENTE' | 'APROVADO' | 'REPROVADO' | string;

const MAP: Record<string, { cls: string; label: string }> = {
  ABERTA:       { cls: 'bg-blue-100 text-blue-700',   label: 'Aberta' },
  EM_PRODUCAO:  { cls: 'bg-yellow-100 text-yellow-700', label: 'Em Produção' },
  FINALIZADA:   { cls: 'bg-green-100 text-green-700',  label: 'Finalizada' },
  CANCELADA:    { cls: 'bg-red-100 text-red-700',      label: 'Cancelada' },
  PENDENTE:     { cls: 'bg-orange-100 text-orange-700', label: 'Pendente' },
  APROVADO:     { cls: 'bg-emerald-100 text-emerald-700', label: 'Aprovado' },
  REPROVADO:    { cls: 'bg-rose-100 text-rose-700',    label: 'Reprovado' },
};

export default function StatusBadge({ status }: { status: Status }) {
  const { cls, label } = MAP[status] ?? { cls: 'bg-gray-100 text-gray-600', label: status };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}
