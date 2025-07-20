import { useState, useEffect } from 'react'
import { Informor } from '../types/informor'
import { informorSchema } from '../schemas/informorSchema'
import { toast } from 'react-toastify'

export function useInformors() {
  const [informors, setInformors] = useState<Informor[]>([])
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    // Simulando carregamento inicial dos Informors
    const dadosMock = [
      { id: '1', nome: 'Aluguel', valor: 1200, vencimento: '2025-07-10' },
      { id: '2', nome: 'Luz', valor: 250, vencimento: '2025-07-15' }
    ]
    setInformors(dadosMock)
  }, [])

  const salvarInformor = async (novo: Informor): Promise<boolean> => {
    setCarregando(true)
    
    try {
      // Simular operação assíncrona (ex: chamada para API)
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Validar os dados antes de salvar
      const resultado = informorSchema.safeParse(novo)
      
      if (!resultado.success) {
        console.error('Erro de validação:', resultado.error.format())
        toast.error('Dados inválidos! Verifique os campos preenchidos.')
        return false // Indica que a validação falhou
      } else {
        const dadosValidados = resultado.data
        // Gerar ID se não fornecido
        const informorComId = {
          ...dadosValidados,
          id: dadosValidados.id || Date.now().toString()
        }
        
        setInformors((prev) => [...prev, informorComId])
        toast.success(`Informor "${informorComId.nome}" salvo com sucesso!`)
        return true // Indica que foi salvo com sucesso
      }
    } catch (error) {
      console.error('Erro ao salvar informor:', error)
      toast.error('Erro inesperado ao salvar informor. Tente novamente.')
      return false
    } finally {
      setCarregando(false)
    }
  }

  const excluirInformor = async (id: string): Promise<boolean> => {
    setCarregando(true)
    
    try {
      // Simular operação assíncrona
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const informorExistente = informors.find(inf => inf.id === id)
      if (!informorExistente) {
        toast.error('Informor não encontrado!')
        return false
      }
      
      setInformors((prev) => prev.filter(inf => inf.id !== id))
      toast.success(`Informor "${informorExistente.nome}" excluído com sucesso!`)
      return true
    } catch (error) {
      console.error('Erro ao excluir informor:', error)
      toast.error('Erro ao excluir informor. Tente novamente.')
      return false
    } finally {
      setCarregando(false)
    }
  }

  const salvarInformor2 = async (novo: Informor): Promise<boolean> => {
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

  return { 
    informors, 
    salvarInformor, 
    excluirInformor,
    carregando 
  }
}