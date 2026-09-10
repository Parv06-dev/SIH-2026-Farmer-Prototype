import { PIPELINE_STEPS } from "../services/bookingService";

export default function StatusPipeline({ activeIndex }) {
  return (
    <ol className="pipeline">
      {PIPELINE_STEPS.map((step, index) => {
        const state =
          activeIndex < 0
            ? "idle"
            : index < activeIndex
              ? "done"
              : index === activeIndex
                ? "current"
                : "idle";
        return (
          <li key={step.id} className={state}>
            <span className="dot" />
            <span>{step.label}</span>
          </li>
        );
      })}
    </ol>
  );
}
