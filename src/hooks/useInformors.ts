import { useState, useEffect } from 'react'
import { Informor } from '../types'
import { informorSchema } from '../schemas/informorSchema'

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
    // Validar os dados antes de salvar
    const resultado = informorSchema.safeParse(novo)
    
    if (!resultado.success) {
      console.error('Erro de validação:', resultado.error.format())
      // Aqui você pode exibir mensagens no toast, console ou tooltip!
      return false // Indica que a validação falhou
    } else {
      const dadosValidados = resultado.data
      // Gerar ID se não fornecido
      const informorComId = {
        ...dadosValidados,
        id: dadosValidados.id || Date.now().toString()
      }
      setInformors((prev) => [...prev, informorComId])
      return true // Indica que foi salvo com sucesso
    }
  }

  return { informors, salvarInformor }
}