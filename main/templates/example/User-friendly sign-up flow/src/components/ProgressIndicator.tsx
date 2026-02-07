import { motion } from "motion/react";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const stepLabels = ["Personal Info", "Security", "Professional"];

export function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  return (
    <div className="space-y-2">
      {/* Step Labels */}
      <div className="flex justify-between text-xs text-gray-500 mb-2">
        {stepLabels.map((label, index) => (
          <span
            key={index}
            className={`${
              index + 1 <= currentStep ? "text-blue-600" : "text-gray-400"
            } transition-colors`}
          >
            {label}
          </span>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="flex gap-2">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: index + 1 <= currentStep ? "100%" : "0%"
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="h-full bg-blue-600 rounded-full"
            />
          </div>
        ))}
      </div>

      {/* Step Counter */}
      <p className="text-sm text-gray-600 text-center mt-2">
        Step {currentStep} of {totalSteps}
      </p>
    </div>
  );
}
