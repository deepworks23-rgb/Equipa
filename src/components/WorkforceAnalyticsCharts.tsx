import { BarChart3 } from 'lucide-react';
import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  computeDepartmentStatusDistribution,
  computeStatusDistribution,
  type Collaborator,
  type CollaboratorStatus,
} from '../utils/talentLogic';

interface WorkforceAnalyticsChartsProps {
  collaborators: Collaborator[];
  activeStatusFilter: CollaboratorStatus | 'Todos';
  onSelectStatusFilter: (status: CollaboratorStatus | 'Todos') => void;
}

const STATUS_COLORS: Record<CollaboratorStatus, string> = {
  Ativo: '#10B981',
  Férias: '#F59E0B',
  Rescindido: '#EF4444',
};

const STATUS_SWATCH_CLASS: Record<string, string> = {
  Ativo: 'bg-[#10B981]',
  Férias: 'bg-[#F59E0B]',
  Rescindido: 'bg-[#EF4444]',
};

interface TooltipPayloadItem {
  name?: string;
  value?: number;
  color?: string;
  payload?: {
    departamento?: string;
    total?: number;
    status?: CollaboratorStatus;
    percentage?: number;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function DepartmentTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const total = payload[0]?.payload?.total ?? 0;

  return (
    <div className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 shadow-level-2 text-xs text-[#111827]">
      <p className="font-display font-semibold text-[#111827] mb-1.5">{label}</p>
      <div className="flex flex-col gap-1">
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between gap-4">
            <span className="inline-flex items-center gap-1.5 text-[#44474E]">
              <span
                className={`w-2.5 h-2.5 rounded-xs shrink-0 ${
                  STATUS_SWATCH_CLASS[entry.name ?? ''] ?? 'bg-[#94A3B8]'
                }`}
              />
              <span>{entry.name}</span>
            </span>
            <span className="font-mono font-semibold tabular-nums">{entry.value ?? 0}</span>
          </div>
        ))}
        <div className="mt-1 pt-1 border-t border-[#E2E8F0] flex items-center justify-between gap-4 font-semibold">
          <span className="text-[#64748B]">Total</span>
          <span className="font-mono tabular-nums text-[#111827]">{total}</span>
        </div>
      </div>
    </div>
  );
}

function StatusTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0];
  const status = item?.payload?.status ?? (item?.name as CollaboratorStatus | undefined);
  const percentage = item?.payload?.percentage ?? 0;

  return (
    <div className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 shadow-level-2 text-xs text-[#111827]">
      <div className="flex items-center justify-between gap-3">
        <span className="font-semibold">{status}</span>
        <span className="font-mono tabular-nums">
          {item?.value ?? 0} ({percentage}%)
        </span>
      </div>
    </div>
  );
}

export function WorkforceAnalyticsCharts({
  collaborators,
  activeStatusFilter,
  onSelectStatusFilter,
}: WorkforceAnalyticsChartsProps) {
  const departmentData = useMemo(
    () => computeDepartmentStatusDistribution(collaborators),
    [collaborators],
  );

  const statusData = useMemo(
    () => computeStatusDistribution(collaborators),
    [collaborators],
  );

  const pieData = useMemo(
    () => statusData.filter((item) => item.count > 0),
    [statusData],
  );

  const barChartHeight = Math.max(168, Math.min(260, departmentData.length * 36 + 32));

  if (collaborators.length === 0) {
    return (
      <section
        data-testid="admin-analytics-section"
        aria-label="Análise da equipa por departamento e status"
        className="shrink-0 bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-level-1 flex flex-col items-center justify-center text-center gap-1.5"
      >
        <BarChart3 className="w-5 h-5 text-[#FE8100]" aria-hidden="true" />
        <p className="font-display text-sm font-semibold text-[#111827]">
          Sem dados suficientes para gráficos
        </p>
        <p className="text-xs text-[#64748B]">
          Adicione colaboradores para visualizar a distribuição por departamento e status.
        </p>
      </section>
    );
  }

  return (
    <section
      data-testid="admin-analytics-section"
      aria-label="Análise da equipa por departamento e status"
      className="shrink-0 flex flex-col lg:flex-row items-stretch gap-2.5 sm:gap-3.5"
    >
      {/* Gráfico 1: Barras Empilhadas por Departamento e Status */}
      <div
        data-testid="chart-department-distribution"
        className="flex-[2] min-w-0 bg-white border border-[#E2E8F0] rounded-lg p-3.5 sm:p-4 shadow-level-1 flex flex-col justify-between gap-2.5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="min-w-0">
            <h2 className="font-display text-sm font-semibold text-[#111827]">
              Distribuição por Departamento e Status
            </h2>
            <p className="text-[11px] text-[#64748B]">
              Total de colaboradores por unidade e disponibilidade atual
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium text-[#44474E] shrink-0">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#10B981]" aria-hidden="true" />
              <span>Ativo</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#F59E0B]" aria-hidden="true" />
              <span>Férias</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#EF4444]" aria-hidden="true" />
              <span>Rescindido</span>
            </span>
          </div>
        </div>

        <div className="w-full min-w-0">
          <ResponsiveContainer width="100%" height={barChartHeight} minWidth={0}>
            <BarChart
              data={departmentData}
              layout="vertical"
              margin={{ top: 4, right: 16, left: 4, bottom: 0 }}
              barSize={18}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
              <XAxis
                type="number"
                allowDecimals={false}
                tick={{ fontSize: 11, fill: '#64748B' }}
                axisLine={{ stroke: '#E2E8F0' }}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="departamento"
                width={132}
                tick={{ fontSize: 11, fill: '#111827', fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: '#FFFAF5' }}
                content={<DepartmentTooltip />}
              />
              <Bar
                dataKey="Ativo"
                stackId="status"
                fill={STATUS_COLORS.Ativo}
                isAnimationActive={false}
              />
              <Bar
                dataKey="Férias"
                stackId="status"
                fill={STATUS_COLORS.Férias}
                isAnimationActive={false}
              />
              <Bar
                dataKey="Rescindido"
                stackId="status"
                fill={STATUS_COLORS.Rescindido}
                radius={[0, 4, 4, 0]}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico 2: Donut de Distribuição por Status */}
      <div
        data-testid="chart-status-distribution"
        className="flex-1 min-w-0 lg:max-w-[390px] bg-white border border-[#E2E8F0] rounded-lg p-3.5 sm:p-4 shadow-level-1 flex flex-col justify-between gap-2.5"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="font-display text-sm font-semibold text-[#111827]">
              Distribuição por Status
            </h2>
            <p className="text-[11px] text-[#64748B]">
              Clique num estado para filtrar a lista
            </p>
          </div>
          {activeStatusFilter !== 'Todos' && (
            <button
              type="button"
              onClick={() => onSelectStatusFilter('Todos')}
              className="shrink-0 text-[11px] font-semibold text-[#C25900] hover:underline whitespace-nowrap"
            >
              Limpar filtro
            </button>
          )}
        </div>

        <div className="flex-1 flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center justify-center gap-3 sm:gap-4">
          <div className="relative w-[150px] h-[150px] shrink-0 flex items-center justify-center">
            <ResponsiveContainer width={150} height={150} minWidth={0}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={44}
                  outerRadius={66}
                  paddingAngle={pieData.length > 1 ? 3 : 0}
                  stroke="none"
                  isAnimationActive={false}
                  onClick={(_data, index) => {
                    const clickedStatus = pieData[index]?.status;
                    if (!clickedStatus) return;
                    onSelectStatusFilter(
                      activeStatusFilter === clickedStatus ? 'Todos' : clickedStatus,
                    );
                  }}
                  className="cursor-pointer"
                >
                  {pieData.map((entry) => (
                    <Cell
                      key={entry.status}
                      fill={STATUS_COLORS[entry.status]}
                      opacity={
                        activeStatusFilter === 'Todos' || activeStatusFilter === entry.status
                          ? 1
                          : 0.35
                      }
                    />
                  ))}
                </Pie>
                <Tooltip content={<StatusTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-display text-xl font-bold text-[#111827] tabular-nums leading-none">
                {collaborators.length}
              </span>
              <span className="mt-0.5 text-[10px] font-medium text-[#64748B]">Total</span>
            </div>
          </div>

          <div className="flex-1 w-full min-w-0 flex flex-col gap-1.5">
            {statusData.map((item) => {
              const isSelected = activeStatusFilter === item.status;
              return (
                <button
                  key={item.status}
                  type="button"
                  onClick={() => onSelectStatusFilter(isSelected ? 'Todos' : item.status)}
                  aria-pressed={isSelected}
                  className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md border text-xs transition-colors ${
                    isSelected
                      ? 'border-[#FE8100] bg-[#FFF4E5] text-[#111827] font-semibold'
                      : 'border-[#E2E8F0] bg-[#F8FAFC] hover:border-[#CBD5E1] text-[#111827]'
                  }`}
                >
                  <span className="inline-flex items-center gap-2 min-w-0">
                    <span
                      className={`w-2.5 h-2.5 rounded-xs shrink-0 ${STATUS_SWATCH_CLASS[item.status]}`}
                      aria-hidden="true"
                    />
                    <span className="truncate">{item.status}</span>
                  </span>

                  <span className="font-mono text-[11px] tabular-nums text-[#44474E] shrink-0">
                    <strong className="text-[#111827] font-semibold">{item.count}</strong> ·{' '}
                    {item.percentage}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
