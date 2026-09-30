export default function JsonTree({ data, accentColor = "#00d4ff", depth = 0 }) {
  if (data === null) return <span className="text-muted-custom font-mono-custom text-xs">null</span>;
  if (typeof data === "boolean") return <span className={`font-mono-custom text-xs font-semibold ${data ? "text-primary-color" : "text-danger-custom"}`}>{String(data)}</span>;
  if (typeof data === "number") return <span className="text-warning-custom font-semibold font-mono-custom text-xs">{data}</span>;
  if (typeof data === "string") return <span className="text-main font-mono-custom text-xs break-all">"{data}"</span>;

  if (Array.isArray(data)) {
    return (
      <div className="space-y-1">
        {data.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-muted-custom font-mono-custom text-xs mt-0.5 select-none">[{i}]</span>
            <JsonTree data={item} accentColor={accentColor} depth={depth + 1} />
          </div>
        ))}
      </div>
    );
  }

  if (typeof data === "object") {
    return (
      <div className="space-y-2">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex items-start gap-2.5">
            <span
              className="font-mono-custom text-xs font-bold shrink-0 mt-0.5 select-none"
              style={{ color: accentColor, opacity: 0.95 }}
            >
              {key}
            </span>
            <span className="text-muted-custom font-mono-custom text-xs mt-0.5">:</span>
            <div className="flex-1 min-w-0">
              {typeof value === "object" && value !== null ? (
                <div className="ml-2 pl-2 border-l border-main">
                  <JsonTree data={value} accentColor={accentColor} depth={depth + 1} />
                </div>
              ) : (
                <JsonTree data={value} accentColor={accentColor} depth={depth + 1} />
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <span className="text-muted-custom font-mono-custom text-xs">{String(data)}</span>;
}
