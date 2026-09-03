import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ScoreDoughnut({
  labels,
  data,
  colors,
  title,
  centerLabel,
  centerValue,
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      {title && (
        <h3 className="text-lg font-semibold text-slate-800 mb-4">{title}</h3>
      )}
      <div className="relative flex justify-center items-center" style={{ height: 260 }}>
        <Doughnut
          data={{
            labels,
            datasets: [
              {
                data,
                backgroundColor: colors,
                borderWidth: 0,
                hoverOffset: 6,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            cutout: '68%',
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  usePointStyle: true,
                  pointStyle: 'circle',
                  padding: 16,
                  font: { size: 12 },
                },
              },
              tooltip: {
                backgroundColor: '#1e293b',
                titleColor: '#f8fafc',
                bodyColor: '#cbd5e1',
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                  label: (ctx) => `${ctx.label}: ${ctx.parsed}%`,
                },
              },
            },
          }}
        />
        {(centerLabel || centerValue) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {centerValue && (
              <span className="text-3xl font-bold text-slate-800">{centerValue}</span>
            )}
            {centerLabel && (
              <span className="text-sm text-slate-500 mt-1">{centerLabel}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}