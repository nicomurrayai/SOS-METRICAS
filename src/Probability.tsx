import { useState, useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Pen } from 'lucide-react';

interface PrizeConfig {
  id: 'sos' | 'grua' | 'moto' | 'moura' | 'lusqtoff';
  label: string;
  color: string;
}

const PRIZES: PrizeConfig[] = [
  { id: 'sos', label: 'SOS', color: 'bg-orange-500' },
  { id: 'grua', label: 'Grúa', color: 'bg-blue-500' },
  { id: 'moto', label: 'Moto', color: 'bg-red-500' },
  { id: 'moura', label: 'Moura', color: 'bg-yellow-500' },
  { id: 'lusqtoff', label: 'Lüsqtoff', color: 'bg-green-500' },
];

export default function Probability() {
  const probabilities = useQuery(api.leads.getProbabilities);
  const updateAll = useMutation(api.leads.updateAllProbabilities);
  
  // Valores numéricos internos (0-1)
  const [localValues, setLocalValues] = useState({
    sos: 0.05,
    grua: 0.1,
    moto: 0.15,
    moura: 0.2,
    lusqtoff: 0.25,
  });
  
  // Valores de texto para los inputs (0-100)
  const [inputValues, setInputValues] = useState({
    sos: '5',
    grua: '10',
    moto: '15',
    moura: '20',
    lusqtoff: '25',
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (probabilities) {
      const newValues = {
        sos: probabilities.sos ?? 0.05,
        grua: probabilities.grua ?? 0.1,
        moto: probabilities.moto ?? 0.15,
        moura: probabilities.moura ?? 0.2,
        lusqtoff: probabilities.lusqtoff ?? 0.25,
      };
      
      setLocalValues(newValues);
      
      // Actualizar inputs con valores formateados
      setInputValues({
        sos: (newValues.sos * 100).toString(),
        grua: (newValues.grua * 100).toString(),
        moto: (newValues.moto * 100).toString(),
        moura: (newValues.moura * 100).toString(),
        lusqtoff: (newValues.lusqtoff * 100).toString(),
      });
    }
  }, [probabilities]);

  const totalProbability = Object.values(localValues).reduce((sum, val) => sum + val, 0);
  const lossPercentage = (1 - totalProbability) * 100;

  const handleValueChange = (prize: keyof typeof localValues, value: string) => {
    // Permitir campo vacío o valores numéricos válidos
    if (value === '' || value === '.') {
      setInputValues(prev => ({ ...prev, [prize]: value }));
      setLocalValues(prev => ({ ...prev, [prize]: 0 }));
      setError(null);
      setSuccess(false);
      return;
    }
    
    // Validar que sea un número válido
    const numValue = parseFloat(value);
    
    if (isNaN(numValue)) {
      return; // No actualizar si no es un número válido
    }
    
    // Limitar a rango 0-100
    if (numValue < 0) {
      setInputValues(prev => ({ ...prev, [prize]: '0' }));
      setLocalValues(prev => ({ ...prev, [prize]: 0 }));
    } else if (numValue > 100) {
      setInputValues(prev => ({ ...prev, [prize]: '100' }));
      setLocalValues(prev => ({ ...prev, [prize]: 1 }));
    } else {
      // Actualizar con el valor ingresado (mantener el texto original)
      setInputValues(prev => ({ ...prev, [prize]: value }));
      setLocalValues(prev => ({ ...prev, [prize]: numValue / 100 }));
    }
    
    setError(null);
    setSuccess(false);
  };

  const handleBlur = (prize: keyof typeof localValues) => {
    // Al salir del input, formatear el valor si es necesario
    const currentValue = inputValues[prize];
    
    if (currentValue === '' || currentValue === '.') {
      setInputValues(prev => ({ ...prev, [prize]: '0' }));
      setLocalValues(prev => ({ ...prev, [prize]: 0 }));
      return;
    }
    
    const numValue = parseFloat(currentValue);
    if (!isNaN(numValue)) {
      // Formatear a un decimal si tiene decimales innecesarios
      const formatted = numValue.toFixed(numValue % 1 === 0 ? 0 : 1);
      setInputValues(prev => ({ ...prev, [prize]: formatted }));
    }
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(false);
    
    const sum = Object.values(localValues).reduce((acc, val) => acc + val, 0);
    if (sum > 1) {
      setError(`La suma de probabilidades (${(sum * 100).toFixed(0)}%) no puede superar 100%`);
      return;
    }

    setIsSaving(true);
    
    try {
      await updateAll(localValues);
      setSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (probabilities) {
      const newValues = {
        sos: probabilities.sos ?? 0.05,
        grua: probabilities.grua ?? 0.1,
        moto: probabilities.moto ?? 0.15,
        moura: probabilities.moura ?? 0.2,
        lusqtoff: probabilities.lusqtoff ?? 0.25,
      };
      
      setLocalValues(newValues);
      setInputValues({
        sos: (newValues.sos * 100).toString(),
        grua: (newValues.grua * 100).toString(),
        moto: (newValues.moto * 100).toString(),
        moura: (newValues.moura * 100).toString(),
        lusqtoff: (newValues.lusqtoff * 100).toString(),
      });
    }
    setIsEditing(false);
    setError(null);
  };

  if (!probabilities) {
    return (
      <div className="bg-white border border-gray-200 rounded p-4">
        <div className="animate-pulse space-y-2">
          <div className="h-3 bg-gray-100 rounded w-1/4"></div>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-8 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded p-4">
      <div className="flex flex-col gap-4 md:gap-0 md:flex-row justify-between items-center mb-4">
        <h2 className="text-base md:text-lg font-semibold text-gray-900">
          Configuración de Probabilidades
        </h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-orange-500 flex items-center gap-2 text-white px-3 py-1 text-sm font-medium border border-gray-300 rounded transition-colors"
          >
            Editar
            <Pen size={15} />
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="px-3 py-1 text-xs font-medium text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || totalProbability > 1}
              className="px-3 py-1 text-xs font-medium text-white bg-green-700 rounded hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-3 px-3 py-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-3 px-3 py-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded">
          Probabilidades actualizadas exitosamente
        </div>
      )}

      <div className="space-y-2">
        {PRIZES.map((prize) => {
          const percentage = (localValues[prize.id] * 100).toFixed(0);
          
          return (
            <div key={prize.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
              <div className={`w-1 h-8 ${prize.color} rounded-full flex-shrink-0`}></div>
              
              <div className="flex-1 flex items-center justify-between">
                <label htmlFor={`prob-${prize.id}`} className="text-sm font-medium text-gray-700 min-w-[80px]">
                  {prize.label}
                </label>
                
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        inputMode="decimal"
                        id={`prob-${prize.id}`}
                        value={inputValues[prize.id]}
                        onChange={(e) => handleValueChange(prize.id, e.target.value)}
                        onBlur={() => handleBlur(prize.id)}
                        className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                      />
                      <span className="text-xs text-gray-500">%</span>
                    </div>
                  ) : (
                    <span className="text-sm font-medium text-gray-900 w-16 text-right">{percentage}%</span>
                  )}
                  
                  <div className="w-24 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full ${prize.color} transition-all duration-300`}
                      style={{ width: `${Math.min(parseFloat(percentage), 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
        <span className="text-xs text-gray-600">Total</span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">Ganar:</span>
            <span className="text-sm font-semibold text-green-600">
              {(totalProbability * 100).toFixed(0)}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">Perder:</span>
            <span className="text-sm font-semibold text-red-600">
              {lossPercentage.toFixed(0)}%
            </span>
          </div>
          {totalProbability > 1 && <span className="text-xs">⚠️</span>}
        </div>
      </div>
    </div>
  );
}