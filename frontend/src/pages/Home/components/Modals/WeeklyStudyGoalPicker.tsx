import { Minus, Plus } from "lucide-react";

const STEP_BUTTON_CLASS =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-semidark text-white transition hover:bg-gray-dark disabled:cursor-not-allowed disabled:opacity-40";

type TimeStepperColumnProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  disabled?: boolean;
  onChange: (value: number) => void;
};

function TimeStepperColumn({
  label,
  value,
  min,
  max,
  step,
  disabled = false,
  onChange,
}: TimeStepperColumnProps) {
  return (
    <div className="flex flex-1 items-center justify-center gap-3">
      <button
        type="button"
        aria-label={`${label} ${step} 감소`}
        disabled={disabled || value <= min}
        onClick={() => onChange(Math.max(min, value - step))}
        className={STEP_BUTTON_CLASS}
      >
        <Minus className="h-4 w-4" strokeWidth={2.5} />
      </button>

      <div className="flex w-[72px] flex-col items-center">
        <span className="text-2xl font-semibold text-white">{value}</span>
        <span className="mt-0.5 text-xs font-medium text-gray-normal">
          {label}
        </span>
      </div>

      <button
        type="button"
        aria-label={`${label} ${step} 증가`}
        disabled={disabled || value >= max}
        onClick={() => onChange(Math.min(max, value + step))}
        className={STEP_BUTTON_CLASS}
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} />
      </button>
    </div>
  );
}

type WeeklyStudyGoalPickerProps = {
  hours: number;
  minutes: number;
  disabled?: boolean;
  onHoursChange: (hours: number) => void;
  onMinutesChange: (minutes: number) => void;
};

export default function WeeklyStudyGoalPicker({
  hours,
  minutes,
  disabled = false,
  onHoursChange,
  onMinutesChange,
}: WeeklyStudyGoalPickerProps) {
  return (
    <div className="flex items-center justify-center gap-6 sm:gap-10">
      <TimeStepperColumn
        label="시간"
        value={hours}
        min={0}
        max={23}
        step={1}
        disabled={disabled}
        onChange={onHoursChange}
      />
      <TimeStepperColumn
        label="분"
        value={minutes}
        min={0}
        max={45}
        step={15}
        disabled={disabled}
        onChange={onMinutesChange}
      />
    </div>
  );
}
