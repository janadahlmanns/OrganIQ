import { motion } from 'framer-motion';

type ProgressBarProps = {
  currentProgress: number; // From 0 to 100 (current progress)
  newProgress: number; // From 0 to 100 (updated progress)
  color?: string; // Optional, e.g. 'bg-neonCyan'
  suppressAnimation?: boolean; // Optional, whether to suppress animation even when progress changes
};

export default function ProgressBar({
  currentProgress,
  newProgress,
  color = 'bg-neonCyan',
  suppressAnimation = false,
}: ProgressBarProps) {
  const shouldAnimate = !suppressAnimation && currentProgress !== newProgress; // Only animate if progress is different and no suppression

  return (
    <div className="h-1 bg-gray rounded-full w-full overflow-hidden">
      <motion.div
        className={`h-1 rounded-full ${color}`}
        style={{
          width: `${newProgress}%`,
          willChange: 'transform, opacity',
        }}
        initial={{ width: `${currentProgress}%` }} // Start at current progress
        animate={{ width: `${newProgress}%` }} // Animate to updated progress
        transition={{ duration: 0.4, ease: "easeOut" }}
        key={shouldAnimate ? "animating" : "static"} // Ensure re-animation happens when values change
      />
    </div>
  );
}
