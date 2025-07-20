import { useState, useEffect } from 'react'
import { Informor } from '../types'

export function useInformors() {
  const [informors, setInformors] = useState<Informor[]>([])

  useEffect(() => {
    // Simulando carregamento inicial dos Informors
    const dadosMock = [
      { id: '1', nome: 'Aluguel', valor: 1200, vencimento: '2025-07-10' },
      { id: '2', nome: 'Luz', valor: 250, vencimento: '2025-07-15' }
    ]
    setInformors(dadosMock)
  }, [])

  const salvarInformor = (novo: Informor) => {
    setInformors((prev) => [...prev, novo])
  }

  return { informors, salvarInformor }
}