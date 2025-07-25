import React, { useState, useCallback } from 'react';
import { FileText, Download, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

interface LazyDocumentViewerProps {
  documentId: string;
  fileName?: string;
  hasFile: boolean;
  onLoadContent: (documentId: string) => Promise<{ file_url: string | null; file_name: string | null } | null>;
  className?: string;
}

/**
 * Componente para visualização lazy de documentos
 * Carrega o conteúdo apenas quando solicitado pelo usuário
 */
export function LazyDocumentViewer({
  documentId,
  fileName,
  hasFile,
  onLoadContent,
  className = ''
}: LazyDocumentViewerProps) {
  const [isContentLoaded, setIsContentLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState<{ file_url: string | null; file_name: string | null } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Função para carregar o conteúdo do documento
  const loadContent = useCallback(async () => {
    if (isContentLoaded || isLoading || !hasFile) return;

    setIsLoading(true);
    setError(null);

    try {
      const documentContent = await onLoadContent(documentId);
      setContent(documentContent);
      setIsContentLoaded(true);
    } catch (err) {
      setError('Erro ao carregar o documento');
      console.error('Erro ao carregar documento:', err);
    } finally {
      setIsLoading(false);
    }
  }, [documentId, onLoadContent, isContentLoaded, isLoading, hasFile]);

  // Função para download do documento
  const handleDownload = useCallback(async () => {
    if (!content?.file_url) {
      await loadContent();
      return;
    }

    try {
      // Se for base64, criar blob e download
      if (content.file_url.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = content.file_url;
        link.download = content.file_name || fileName || 'documento';
        link.click();
      } else {
        // Se for URL externa, abrir em nova aba
        window.open(content.file_url, '_blank');
      }
    } catch (err) {
      setError('Erro ao baixar o documento');
      console.error('Erro ao baixar documento:', err);
    }
  }, [content, fileName, loadContent]);

  // Função para visualizar o documento
  const handleView = useCallback(async () => {
    if (!content?.file_url) {
      await loadContent();
      return;
    }

    try {
      if (content.file_url.startsWith('data:')) {
        // Para base64, abrir em nova aba
        const newWindow = window.open();
        if (newWindow) {
          newWindow.document.write(`
            <html>
              <head>
                <title>${content.file_name || fileName || 'Documento'}</title>
              </head>
              <body style="margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh;">
                <img src="${content.file_url}" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
              </body>
            </html>
          `);
        }
      } else {
        // Para URLs externas
        window.open(content.file_url, '_blank');
      }
    } catch (err) {
      setError('Erro ao visualizar o documento');
      console.error('Erro ao visualizar documento:', err);
    }
  }, [content, fileName, loadContent]);

  // Se não há arquivo
  if (!hasFile) {
    return (
      <div className={`flex items-center space-x-2 text-gray-400 ${className}`}>
        <FileText className="h-4 w-4" />
        <span className="text-sm">Sem arquivo anexado</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Ícone do arquivo */}
      <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
      
      {/* Nome do arquivo */}
      <span className="text-sm text-gray-700 truncate flex-1">
        {fileName || 'Documento'}
      </span>

      {/* Botões de ação */}
      <div className="flex items-center space-x-1 flex-shrink-0">
        {/* Botão de visualizar */}
        <button
          onClick={handleView}
          disabled={isLoading}
          className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
          title="Visualizar documento"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>

        {/* Botão de download */}
        <button
          onClick={handleDownload}
          disabled={isLoading}
          className="p-1 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
          title="Baixar documento"
        >
          <Download className="h-4 w-4" />
        </button>
      </div>

      {/* Indicador de erro */}
      {error && (
        <div className="flex items-center space-x-1 text-red-500" title={error}>
          <AlertCircle className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}

// Componente para preview lazy de documentos (para listas)
export function LazyDocumentPreview({
  documentId,
  fileName,
  hasFile,
  onLoadContent,
  className = ''
}: LazyDocumentViewerProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const loadPreview = useCallback(async () => {
    if (previewUrl || isLoading || !hasFile) return;

    setIsLoading(true);
    try {
      const content = await onLoadContent(documentId);
      if (content?.file_url) {
        setPreviewUrl(content.file_url);
      }
    } catch (err) {
      console.error('Erro ao carregar preview:', err);
    } finally {
      setIsLoading(false);
    }
  }, [documentId, onLoadContent, previewUrl, isLoading, hasFile]);

  const togglePreview = useCallback(() => {
    if (!showPreview && !previewUrl) {
      loadPreview();
    }
    setShowPreview(!showPreview);
  }, [showPreview, previewUrl, loadPreview]);

  if (!hasFile) {
    return (
      <div className={`text-gray-400 text-sm ${className}`}>
        Sem arquivo
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Botão de toggle preview */}
      <button
        onClick={togglePreview}
        className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : showPreview ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
        <span>{showPreview ? 'Ocultar' : 'Visualizar'}</span>
      </button>

      {/* Preview do documento */}
      {showPreview && previewUrl && (
        <div className="mt-2 border rounded-lg overflow-hidden bg-gray-50">
          {previewUrl.startsWith('data:image') ? (
            <img 
              src={previewUrl} 
              alt={fileName || 'Documento'} 
              className="w-full h-48 object-contain"
              loading="lazy"
            />
          ) : (
            <div className="p-4 text-center text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-2" />
              <p>Preview não disponível</p>
              <button
                onClick={() => window.open(previewUrl, '_blank')}
                className="mt-2 text-blue-600 hover:underline text-sm"
              >
                Abrir documento
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}