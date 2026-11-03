interface Props {
  value: number | null
  onChange: (v: number | null) => void
}

const MAX = 12

export default function PlayerStepper({ value, onChange }: Props) {
  const dec = () => onChange(value == null || value <= 1 ? null : value - 1)
  const inc = () => onChange(value == null ? 2 : Math.min(MAX, value + 1))

  return (
    <div className="stepper" role="group" aria-label="Players at the table">
      <button type="button" className="stepper-btn" onClick={dec} disabled={value == null} aria-label="Fewer players">
        &minus;
      </button>
      <div className="stepper-face" aria-live="polite">
        <span className="stepper-num">{value ?? 'Any'}</span>
        <span className="stepper-cap">{value == null ? 'any number of players' : value === 1 ? 'player tonight' : 'players tonight'}</span>
        <span className="stepper-pips" aria-hidden="true">
          {Array.from({ length: MAX }, (_, i) => (
            <i key={i} className={value != null && i < value ? 'on' : ''} />
          ))}
        </span>
      </div>
      <button type="button" className="stepper-btn" onClick={inc} disabled={value === MAX} aria-label="More players">
        +
      </button>
    </div>
  )
}
