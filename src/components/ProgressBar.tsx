
type ProgressBarProps = {
  value: number; // from 0 to 100
  color?: string; // optional, e.g. 'bg-neonCyan'
};

export default function ProgressBar({ value, color = 'bg-neonCyan' }: ProgressBarProps) {
  return (
    <div className="h-1 bg-gray rounded-full w-full overflow-hidden">
      <div
        className={`h-1 rounded-full transition-all duration-2000 ${color}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
