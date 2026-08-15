import { useState } from 'react'
import type { City } from '../../types'
import type { CurrencyData, NormalizedResult } from '../../core/types'

interface Props {
  city: City
  currency: NormalizedResult<CurrencyData>
}

/** Live currency converter (spec §6.7) — reads the rate from the aggregator. */
export default function CurrencyView({ city, currency }: Props) {
  const [amount, setAmount] = useState('100')
  const [reversed, setReversed] = useState(false)

  const rate = currency.data?.rate ?? null
  const hasRate = typeof rate === 'number'
  const fromUnit = reversed ? city.cur : '₪'
  const toUnit = reversed ? '₪' : city.cur
  const n = Number(amount)
  const result = hasRate
    ? (reversed ? n / rate! : n * rate!).toLocaleString('he', { maximumFractionDigits: 1 }) + ' ' + toUnit
    : '—'

  const rateLine = hasRate
    ? `1 ₪ = ${rate!.toFixed(3)} ${city.cur} · שער ECB חי (Frankfurter)`
    : `שער ל-${city.cur} לא זמין במקור החינמי — בייצור נשלים ממקור אחר.`

  return (
    <div className="rise">
      <div className="vh">💱 המרת מטבע</div>
      <div className="card">
        <div className="conv">
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <span className="eq">{fromUnit} =</span>
          <span className="res">{result}</span>
          <button
            className="swap"
            onClick={() => setReversed((v) => !v)}
            title="הפוך כיוון"
            aria-label="הפוך כיוון המרה"
          >
            ⇄
          </button>
        </div>
        <div className="rate">{rateLine}</div>
      </div>
    </div>
  )
}
