import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor, renderHook, act } from '@testing-library/react';
import { ActivationProvider, useActivation } from '../ActivationContext';
import React from 'react';

// Mock do toast
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  }
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

describe('🔐 ActivationContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('ActivationProvider', () => {
    it('should provide activation context to children', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const TestComponent = () => {
        const { isActivated, isDemoMode } = useActivation();
        return (
          <div>
            <span data-testid="activated">{isActivated ? 'true' : 'false'}</span>
            <span data-testid="demo">{isDemoMode ? 'true' : 'false'}</span>
          </div>
        );
      };

      render(
        <ActivationProvider>
          <TestComponent />
        </ActivationProvider>
      );

      // Aguardar loading inicial
      act(() => {
        vi.advanceTimersByTime(800);
      });

      await waitFor(() => {
        expect(screen.getByTestId('activated')).toHaveTextContent('false');
        expect(screen.getByTestId('demo')).toHaveTextContent('true');
      });
    });

    it('should initialize as activated when valid key exists', async () => {
      mockLocalStorage.getItem.mockReturnValue('VALID-KEY-FROM-SERVER');

      const TestComponent = () => {
        const { isActivated, isLoading } = useActivation();
        if (isLoading) return <div data-testid="loading">Loading...</div>;
        return <div data-testid="activated">{isActivated ? 'true' : 'false'}</div>;
      };

      render(
        <ActivationProvider>
          <TestComponent />
        </ActivationProvider>
      );

      expect(screen.getByTestId('loading')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(800);
      });

      await waitFor(() => {
        expect(screen.getByTestId('activated')).toHaveTextContent('true');
      });
    });

    it('should provide developer contact info', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const TestComponent = () => {
        const { developerContactInfo } = useActivation();
        return (
          <div>
            <span data-testid="email">{developerContactInfo.email}</span>
            <span data-testid="phone">{developerContactInfo.phone}</span>
          </div>
        );
      };

      render(
        <ActivationProvider>
          <TestComponent />
        </ActivationProvider>
      );

      expect(screen.getByTestId('email')).toHaveTextContent('suporte@sismobi.com');
      expect(screen.getByTestId('phone')).toHaveTextContent('(99) 9999-9999');
    });
  });

  describe('useActivation Hook', () => {
    it('should throw error when used outside provider', () => {
      const TestComponent = () => {
        useActivation();
        return <div>Test</div>;
      };

      expect(() => render(<TestComponent />)).toThrow(
        'useActivation must be used within an ActivationProvider'
      );
    });

    it('should provide activation functions', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useActivation(), {
        wrapper: ActivationProvider
      });

      // Aguardar loading inicial
      act(() => {
        vi.advanceTimersByTime(800);
      });

      await waitFor(() => {
        expect(result.current).toHaveProperty('isActivated');
        expect(result.current).toHaveProperty('isDemoMode');
        expect(result.current).toHaveProperty('isLoading');
        expect(result.current).toHaveProperty('activateSystem');
        expect(result.current).toHaveProperty('deactivateSystem');
        expect(result.current).toHaveProperty('developerContactInfo');
      });
    });
  });

  describe('System Activation', () => {
    it('should activate system with correct key', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      const { toast } = await import('react-toastify');

      const { result } = renderHook(() => useActivation(), {
        wrapper: ActivationProvider
      });

      // Aguardar loading inicial
      act(() => {
        vi.advanceTimersByTime(800);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let activationResult: boolean = false;

      await act(async () => {
        const activationPromise = result.current.activateSystem('MINHA-CHAVE-SECRETA-DO-BOLT');
        vi.advanceTimersByTime(1500); // Simular latência
        activationResult = await activationPromise;
      });

      expect(activationResult).toBe(true);
      expect(result.current.isActivated).toBe(true);
      expect(result.current.isDemoMode).toBe(false);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'sismobi-activation-key',
        'VALID-KEY-FROM-SERVER'
      );
      expect(toast.success).toHaveBeenCalledWith(
        '🎉 Sistema ativado com sucesso! Todos os recursos foram liberados.'
      );
    });

    it('should reject activation with incorrect key', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      const { toast } = await import('react-toastify');

      const { result } = renderHook(() => useActivation(), {
        wrapper: ActivationProvider
      });

      // Aguardar loading inicial
      act(() => {
        vi.advanceTimersByTime(800);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let activationResult: boolean = true;

      await act(async () => {
        const activationPromise = result.current.activateSystem('WRONG-KEY');
        vi.advanceTimersByTime(1500);
        activationResult = await activationPromise;
      });

      expect(activationResult).toBe(false);
      expect(result.current.isActivated).toBe(false);
      expect(result.current.isDemoMode).toBe(true);
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith(
        '❌ Chave inválida. Contate o desenvolvedor: suporte@sismobi.com'
      );
    });

    it('should handle activation errors gracefully', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      // Simular erro no localStorage
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      const { toast } = await import('react-toastify');

      const { result } = renderHook(() => useActivation(), {
        wrapper: ActivationProvider
      });

      // Aguardar loading inicial
      act(() => {
        vi.advanceTimersByTime(800);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let activationResult: boolean = true;

      await act(async () => {
        const activationPromise = result.current.activateSystem('MINHA-CHAVE-SECRETA-DO-BOLT');
        vi.advanceTimersByTime(1500);
        activationResult = await activationPromise;
      });

      expect(activationResult).toBe(false);
      expect(toast.error).toHaveBeenCalledWith(
        '🔧 Erro na comunicação. Tente novamente ou contate o suporte: (99) 9999-9999'
      );
    });

    it('should show loading state during activation', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useActivation(), {
        wrapper: ActivationProvider
      });

      // Aguardar loading inicial
      act(() => {
        vi.advanceTimersByTime(800);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.activateSystem('MINHA-CHAVE-SECRETA-DO-BOLT');
      });

      expect(result.current.isLoading).toBe(true);

      act(() => {
        vi.advanceTimersByTime(1500);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('System Deactivation', () => {
    it('should deactivate system and enter demo mode', async () => {
      mockLocalStorage.getItem.mockReturnValue('VALID-KEY-FROM-SERVER');
      const { toast } = await import('react-toastify');

      const { result } = renderHook(() => useActivation(), {
        wrapper: ActivationProvider
      });

      // Aguardar loading inicial (sistema deve estar ativado)
      act(() => {
        vi.advanceTimersByTime(800);
      });

      await waitFor(() => {
        expect(result.current.isActivated).toBe(true);
      });

      act(() => {
        result.current.deactivateSystem();
      });

      expect(result.current.isActivated).toBe(false);
      expect(result.current.isDemoMode).toBe(true);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('sismobi-activation-key');
      expect(toast.info).toHaveBeenCalledWith('Sistema desativado. Modo DEMO ativado.');
    });
  });

  describe('Context Value Memoization', () => {
    it('should memoize context value to prevent unnecessary re-renders', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const TestComponent = () => {
        const context = useActivation();
        return <div data-testid="context">{JSON.stringify(Object.keys(context))}</div>;
      };

      const { rerender } = render(
        <ActivationProvider>
          <TestComponent />
        </ActivationProvider>
      );

      act(() => {
        vi.advanceTimersByTime(800);
      });

      const firstRender = screen.getByTestId('context').textContent;

      rerender(
        <ActivationProvider>
          <TestComponent />
        </ActivationProvider>
      );

      const secondRender = screen.getByTestId('context').textContent;

      expect(firstRender).toBe(secondRender);
    });
  });

  describe('Loading State Management', () => {
    it('should manage loading state correctly during initialization', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useActivation(), {
        wrapper: ActivationProvider
      });

      // Inicialmente deve estar carregando
      expect(result.current.isLoading).toBe(true);

      // Após 800ms deve parar de carregar
      act(() => {
        vi.advanceTimersByTime(800);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should handle multiple activation attempts correctly', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useActivation(), {
        wrapper: ActivationProvider
      });

      // Aguardar loading inicial
      act(() => {
        vi.advanceTimersByTime(800);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Primeira tentativa
      act(() => {
        result.current.activateSystem('WRONG-KEY');
      });

      expect(result.current.isLoading).toBe(true);

      act(() => {
        vi.advanceTimersByTime(1500);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Segunda tentativa
      act(() => {
        result.current.activateSystem('MINHA-CHAVE-SECRETA-DO-BOLT');
      });

      expect(result.current.isLoading).toBe(true);

      act(() => {
        vi.advanceTimersByTime(1500);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isActivated).toBe(true);
      });
    });
  });
});