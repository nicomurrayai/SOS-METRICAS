import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { Pen, Save, X } from 'lucide-react'
import { api } from '../convex/_generated/api'
import {
  calculateTotalProbability,
  createLegacyProbabilityPayload,
  normalizeSlotPrizesFromProbabilities,
  normalizeSlotPrizes,
  validateSlotPrizes,
  type SlotPrizeConfig,
  type SlotPrizeId,
} from './shared/slotConfig'

type InputValues = Record<SlotPrizeId, string>

function createInputValues(prizes: SlotPrizeConfig[]): InputValues {
  return prizes.reduce((acc, prize) => {
    acc[prize.id] = (prize.probability * 100).toString()
    return acc
  }, {} as InputValues)
}

export default function Probability() {
  const probabilities = useQuery(api.leads.getProbabilities)
  const updateAllProbabilities = useMutation(api.leads.updateAllProbabilities)
  const [localPrizes, setLocalPrizes] = useState<SlotPrizeConfig[]>(() =>
    normalizeSlotPrizes(null),
  )
  const [inputValues, setInputValues] = useState<InputValues>(() =>
    createInputValues(normalizeSlotPrizes(null)),
  )
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (probabilities === undefined) {
      return
    }

    const nextPrizes = normalizeSlotPrizesFromProbabilities(probabilities)
    setLocalPrizes(nextPrizes)
    setInputValues(createInputValues(nextPrizes))
  }, [probabilities])

  const totalProbability = useMemo(
    () => calculateTotalProbability(localPrizes),
    [localPrizes],
  )
  const lossPercentage = Math.max(0, 1 - totalProbability) * 100

  function updatePrize(
    prizeId: SlotPrizeId,
    updater: (prize: SlotPrizeConfig) => SlotPrizeConfig,
  ) {
    setLocalPrizes((currentPrizes) =>
      currentPrizes.map((prize) =>
        prize.id === prizeId ? updater(prize) : prize,
      ),
    )
    setError(null)
    setSuccess(false)
  }

  function handleEnabledChange(prizeId: SlotPrizeId) {
    updatePrize(prizeId, (prize) => ({ ...prize, enabled: !prize.enabled }))
  }

  function handleValueChange(prizeId: SlotPrizeId, value: string) {
    if (value === '' || value === '.') {
      setInputValues((currentValues) => ({
        ...currentValues,
        [prizeId]: value,
      }))
      updatePrize(prizeId, (prize) => ({ ...prize, probability: 0 }))
      return
    }

    const numericValue = Number.parseFloat(value)

    if (Number.isNaN(numericValue)) {
      return
    }

    const nextPercentage = Math.min(Math.max(numericValue, 0), 100)
    setInputValues((currentValues) => ({
      ...currentValues,
      [prizeId]: nextPercentage.toString(),
    }))
    updatePrize(prizeId, (prize) => ({
      ...prize,
      probability: nextPercentage / 100,
    }))
  }

  function handleBlur(prizeId: SlotPrizeId) {
    const currentValue = inputValues[prizeId]

    if (currentValue === '' || currentValue === '.') {
      setInputValues((currentValues) => ({
        ...currentValues,
        [prizeId]: '0',
      }))
      return
    }

    const numericValue = Number.parseFloat(currentValue)

    if (!Number.isNaN(numericValue)) {
      setInputValues((currentValues) => ({
        ...currentValues,
        [prizeId]: numericValue.toFixed(numericValue % 1 === 0 ? 0 : 1),
      }))
    }
  }

  async function handleSave() {
    setError(null)
    setSuccess(false)

    const validationError = validateSlotPrizes(localPrizes)

    if (validationError) {
      setError(validationError)
      return
    }

    setIsSaving(true)

    try {
      await updateAllProbabilities(
        createLegacyProbabilityPayload(localPrizes, probabilities),
      )
      setSuccess(true)
      setIsEditing(false)
      window.setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setIsSaving(false)
    }
  }

  function handleCancel() {
    const nextPrizes = normalizeSlotPrizesFromProbabilities(probabilities)
    setLocalPrizes(nextPrizes)
    setInputValues(createInputValues(nextPrizes))
    setIsEditing(false)
    setError(null)
    setSuccess(false)
  }

  if (probabilities === undefined) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-1/3 rounded bg-gray-100" />
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-12 rounded bg-gray-100" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-950 md:text-lg">
            Configuracion de premios y probabilidades
          </h2>
          <p className="text-sm text-gray-500">
            Los cambios se reflejan en el juego conectado al mismo backend.
          </p>
        </div>

        {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-orange-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
          >
            Editar
            <Pen size={15} />
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
              <X size={15} />
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || totalProbability > 1}
              className="inline-flex items-center gap-2 rounded-md bg-green-700 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? 'Guardando...' : 'Guardar'}
              <Save size={15} />
            </button>
          </div>
        )}
      </div>

      {error ? (
        <div className="mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mb-3 rounded border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-green-700">
          Configuracion actualizada exitosamente
        </div>
      ) : null}

      <div className="space-y-3">
        {localPrizes.map((prize) => {
          const percentage = (prize.probability * 100).toFixed(0)

          return (
            <div
              key={prize.id}
              className="grid gap-3 border-b border-gray-100 pb-3 last:border-0 md:grid-cols-[1fr_auto] md:items-center"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="h-10 w-1.5 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: prize.color }}
                />
                <img
                  src={prize.imageSrc}
                  alt=""
                  className="h-10 w-10 flex-shrink-0 object-contain"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {prize.label}
                  </p>
                  <p className="text-xs font-medium text-gray-500">
                    ID: {prize.id}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 md:justify-end">
                {isEditing ? (
                  <button
                    type="button"
                    onClick={() => handleEnabledChange(prize.id)}
                    className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                      prize.enabled
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {prize.enabled ? 'Activo' : 'Pausado'}
                  </button>
                ) : (
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                      prize.enabled
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {prize.enabled ? 'Activo' : 'Pausado'}
                  </span>
                )}

                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={inputValues[prize.id]}
                        onChange={(event) =>
                          handleValueChange(prize.id, event.target.value)
                        }
                        onBlur={() => handleBlur(prize.id)}
                        className="w-20 rounded-md border border-gray-300 px-2 py-2 text-right text-sm font-semibold outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                      />
                      <span className="text-xs font-semibold text-gray-500">
                        %
                      </span>
                    </div>
                  ) : (
                    <span className="w-16 text-right text-sm font-semibold text-gray-900">
                      {percentage}%
                    </span>
                  )}

                  <div className="h-2 w-28 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        backgroundColor: prize.color,
                        width: `${Math.min(Number(percentage), 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-4">
        <span className="text-sm font-semibold text-gray-600">Total</span>
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="font-semibold text-green-700">
            Ganar: {(totalProbability * 100).toFixed(0)}%
          </span>
          <span className="font-semibold text-red-600">
            Perder: {lossPercentage.toFixed(0)}%
          </span>
        </div>
      </div>
    </section>
  )
}
