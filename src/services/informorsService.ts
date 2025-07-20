import { Informor } from '../types/informor'

// Simulação de dados para desenvolvimento (substitua por chamadas reais de API)
const MOCK_INFORMORS: Informor[] = [
  { id: '1', nome: 'Aluguel', valor: 1200, vencimento: '2025-01-10' },
  { id: '2', nome: 'Luz', valor: 250, vencimento: '2025-01-15' },
  { id: '3', nome: 'Água', valor: 180, vencimento: '2025-01-20' }
]

// Simula latência de rede para demonstrar loading states
const simulateNetworkDelay = (ms: number = 800) => 
  new Promise(resolve => setTimeout(resolve, ms))

/**
 * Busca todos os Informors
 */
export async function fetchInformors(): Promise<Informor[]> {
  await simulateNetworkDelay()
  
  // Simula possível erro de rede (5% de chance)
  if (Math.random() < 0.05) {
    throw new Error('Erro de conexão com o servidor')
  }
  
  // Em produção, substitua por:
  // const response = await fetch('https://sua-api.com/informors')
  // if (!response.ok) throw new Error('Erro ao buscar Informors')
  // return response.json()
  
  return [...MOCK_INFORMORS]
}

/**
 * Salva um novo Informor
 */
export async function salvarInformor(dados: Omit<Informor, 'id'>): Promise<Informor> {
  await simulateNetworkDelay(600)
  
  // Simula possível erro de validação no servidor (3% de chance)
  if (Math.random() < 0.03) {
    throw new Error('Dados inválidos no servidor')
  }
  
  const novoInformor: Informor = {
    ...dados,
    id: Date.now().toString() // Em produção, o ID viria do servidor
  }
  
  // Adiciona ao mock local (em produção seria persistido no servidor)
  MOCK_INFORMORS.push(novoInformor)
  
  // Em produção, substitua por:
  // const response = await fetch('https://sua-api.com/informors', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(dados)
  // })
  // if (!response.ok) throw new Error('Erro ao salvar Informor')
  // return response.json()
  
  return novoInformor
}

/**
 * Exclui um Informor pelo ID
 */
export async function excluirInformor(id: string): Promise<void> {
  await simulateNetworkDelay(400)
  
  // Simula possível erro (2% de chance)
  if (Math.random() < 0.02) {
    throw new Error('Erro ao excluir Informor')
  }
  
  const index = MOCK_INFORMORS.findIndex(inf => inf.id === id)
  if (index === -1) {
    throw new Error('Informor não encontrado')
  }
  
  // Remove do mock local (em produção seria removido do servidor)
  MOCK_INFORMORS.splice(index, 1)
  
  // Em produção, substitua por:
  // const response = await fetch(`https://sua-api.com/informors/${id}`, {
  //   method: 'DELETE'
  // })
  // if (!response.ok) throw new Error('Erro ao excluir Informor')
}

/**
 * Atualiza um Informor existente
 */
export async function atualizarInformor(id: string, dados: Partial<Omit<Informor, 'id'>>): Promise<Informor> {
  await simulateNetworkDelay(500)
  
  const index = MOCK_INFORMORS.findIndex(inf => inf.id === id)
  if (index === -1) {
    throw new Error('Informor não encontrado')
  }
  
  const informorAtualizado = { ...MOCK_INFORMORS[index], ...dados }
  MOCK_INFORMORS[index] = informorAtualizado
  
  // Em produção, substitua por:
  // const response = await fetch(`https://sua-api.com/informors/${id}`, {
  //   method: 'PUT',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(dados)
  // })
  // if (!response.ok) throw new Error('Erro ao atualizar Informor')
  // return response.json()
  
  return informorAtualizado
}