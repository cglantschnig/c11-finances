type SideToggleProps = {
  onChange: (value: 'buy' | 'sell') => void
  value: 'buy' | 'sell'
}

export default function SideToggle({ onChange, value }: SideToggleProps) {
  const isBuy = value === 'buy'

  return (
    <button
      type="button"
      onClick={() => onChange(isBuy ? 'sell' : 'buy')}
      style={
        isBuy
          ? {
              backgroundColor:
                'color-mix(in oklch, oklch(0.64 0.156 149.56) 12%, transparent)',
              borderColor: 'oklch(0.64 0.156 149.56)',
              color: 'oklch(0.44 0.13 149.56)',
            }
          : {
              backgroundColor:
                'color-mix(in oklch, oklch(0.637 0.237 25.331) 12%, transparent)',
              borderColor: 'oklch(0.637 0.237 25.331)',
              color: 'oklch(0.52 0.2 25.331)',
            }
      }
      aria-label={isBuy ? 'Buy (click to switch to Sell)' : 'Sell (click to switch to Buy)'}
      className="flex h-9 w-24 cursor-pointer items-center justify-center border px-4 text-[13px] font-semibold tracking-[0.03em] whitespace-nowrap transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      {isBuy ? '▲ Buy' : '▼ Sell'}
    </button>
  )
}
