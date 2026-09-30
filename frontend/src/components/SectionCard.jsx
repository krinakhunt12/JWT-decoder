import JsonTree from "./JsonTree";
import CopyButton from "./CopyButton";

export default function SectionCard({ title, badge, badgeColor, data, extra }) {
  return (
    <div className="rounded-2xl overflow-hidden glass-panel glow-card animate-fade-up">
      <div className="flex items-center justify-between px-5 py-3.5 panel-header">
        <div className="flex items-center gap-3">
          <span
            className="cyber-badge"
            style={{ color: badgeColor, borderColor: `${badgeColor}35` }}
          >
            {badge}
          </span>
          <span className="text-main text-xs font-bold tracking-wide">{title}</span>
        </div>
        <CopyButton text={JSON.stringify(data, null, 2)} />
      </div>

      <div className="p-5 bg-secondary-custom/50 space-y-3">
        <JsonTree data={data} accentColor={badgeColor} />
        {extra && <div className="pt-3 border-t border-main">{extra}</div>}
      </div>
    </div>
  );
}
