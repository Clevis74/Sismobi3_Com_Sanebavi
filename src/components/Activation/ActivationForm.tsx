import React, { useState } from 'react';
import { Shield, Key, AlertTriangle, CheckCircle, Mail, Phone, Loader } from 'lucide-react';
import { useActivation } from '../../contexts/ActivationContext';
import { LoadingButton } from '../UI/LoadingSpinner';

export const ActivationForm: React.FC = () => {
  const { 
    isActivated, 
    isDemoMode, 
    isLoading, 
    developerContactInfo, 
    activateSystem,
    deactivateSystem 
  } = useActivation();
  
  const [activationKey, setActivationKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  const handleActivate = async () => {
    if (!activationKey.trim()) {
      return;
    }
    
    const success = await activateSystem(activationKey.trim());
    if (success) {
      setActivationKey(''); // Limpa o campo após sucesso
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleActivate();
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-center space-x-3">
          <Loader className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Verificando status de ativação...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <div className={`rounded-lg shadow-md p-6 border ${
        isActivated 
          ? 'bg-green-50 border-green-200' 
          : 'bg-yellow-50 border-yellow-200'
      }`}>
        <div className="flex items-center space-x-3 mb-4">
          {isActivated ? (
            <CheckCircle className="w-8 h-8 text-green-600" />
          ) : (
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
          )}
          <div>
            <h3 className={`text-lg font-semibold ${
              isActivated ? 'text-green-800' : 'text-yellow-800'
            }`}>
              {isActivated ? 'Sistema Ativado' : 'Modo DEMO'}
            </h3>
            <p className={`text-sm ${
              isActivated ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {isActivated 
                ? 'Todos os recursos estão disponíveis' 
                : 'Recursos limitados - Ative para acesso completo'
              }
            </p>
          </div>
        </div>

        {isDemoMode && (
          <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-yellow-800 mb-2">Limitações do Modo DEMO:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Máximo de 5 propriedades</li>
              <li>• Máximo de 10 inquilinos</li>
              <li>• Exportação de relatórios desabilitada</li>
              <li>• Backup automático indisponível</li>
            </ul>
          </div>
        )}
      </div>

      {/* Activation Form */}
      {!isActivated && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Ativar Sistema</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chave de Ativação
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={activationKey}
                  onChange={(e) => setActivationKey(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                  placeholder="Digite sua chave de ativação"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showKey ? '🙈' : '👁️'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                💡 Para teste, use: <code className="bg-gray-100 px-1 rounded">MINHA-CHAVE-SECRETA-DO-BOLT</code>
              </p>
            </div>

            <LoadingButton
              loading={isLoading}
              onClick={handleActivate}
              disabled={!activationKey.trim()}
              variant="primary"
              className="w-full py-3"
            >
              <Key className="w-4 h-4" />
              Ativar Sistema
            </LoadingButton>
          </div>
        </div>
      )}

      {/* Developer Contact */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h4 className="font-medium text-gray-800 mb-3">Contato do Desenvolvedor</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Mail className="w-4 h-4" />
            <span>{developerContactInfo.email}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Phone className="w-4 h-4" />
            <span>{developerContactInfo.phone}</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Entre em contato para obter sua chave de ativação ou suporte técnico.
        </p>
      </div>

      {/* Debug Controls (apenas para desenvolvimento) */}
      {isActivated && process.env.NODE_ENV === 'development' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-medium text-red-800 mb-2">Controles de Desenvolvimento</h4>
          <button
            onClick={deactivateSystem}
            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
          >
            Desativar Sistema (Teste)
          </button>
        </div>
      )}
    </div>
  );
};