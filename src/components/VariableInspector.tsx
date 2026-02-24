import useExecutionStore from '../hooks/useExecutionStore';

export default function VariableInspector() {
  const variables = useExecutionStore((s) => s.variables);
  const isRunning = useExecutionStore((s) => s.isRunning);

  const entries = Object.entries(variables);

  if (entries.length === 0 && !isRunning) return null;

  return (
    <div className="var-inspector">
      <div className="var-inspector__header">Variables</div>
      <div className="var-inspector__body">
        {entries.length === 0 ? (
          <div className="var-inspector__empty">No variables yet</div>
        ) : (
          entries.map(([name, value]) => (
            <div key={name} className="var-inspector__row">
              <span className="var-inspector__name">{name}</span>
              <span className="var-inspector__value">{value}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
