'use client'

import { useState } from 'react';
import { X, Shield, Copy, Check, Download } from 'lucide-react';
import Image from 'next/image';

interface TwoFASetupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function TwoFASetup({ isOpen, onClose, onSuccess }: TwoFASetupProps) {
  const [step, setStep] = useState<'setup' | 'verify' | 'backup'>('setup');
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState(false);

  const handleSetup = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar 2FA');
      }

      const data = await response.json();
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setBackupCodes(data.backupCodes);
      setStep('verify');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao configurar 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Código deve ter 6 dígitos');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret,
          token: verificationCode,
          backupCodes
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Código inválido');
      }

      setStep('backup');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao verificar código');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: 'secret' | 'backup') => {
    navigator.clipboard.writeText(text);
    if (type === 'secret') {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    } else {
      setCopiedBackup(true);
      setTimeout(() => setCopiedBackup(false), 2000);
    }
  };

  const downloadBackupCodes = () => {
    const text = `CÓDIGOS DE BACKUP - LEADGRAM 2FA\n\n${backupCodes.join('\n')}\n\n⚠️ Guarde estes códigos em um lugar seguro!\nCada código pode ser usado apenas uma vez.`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leadgram-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFinish = () => {
    onSuccess();
    onClose();
    // Reset
    setStep('setup');
    setQrCode('');
    setSecret('');
    setBackupCodes([]);
    setVerificationCode('');
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Configurar 2FA
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Setup */}
          {step === 'setup' && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Proteja sua conta com 2FA
                </h3>
                <p className="text-gray-600 text-sm">
                  A autenticação de dois fatores adiciona uma camada extra de segurança à sua conta.
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-blue-900">O que você vai precisar:</p>
                <ul className="text-sm text-blue-800 space-y-1 ml-4 list-disc">
                  <li>Um app autenticador (Google Authenticator, Authy, etc.)</li>
                  <li>Acesso ao seu celular</li>
                  <li>2-3 minutos do seu tempo</li>
                </ul>
              </div>

              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleSetup}
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Gerando...' : 'Começar Configuração'}
              </button>
            </div>
          )}

          {/* Step 2: Verify */}
          {step === 'verify' && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Escaneie o QR Code
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Abra seu app autenticador e escaneie este código
                </p>

                {qrCode && (
                  <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                    <Image
                      src={qrCode}
                      alt="QR Code 2FA"
                      width={200}
                      height={200}
                      className="mx-auto"
                    />
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2 text-center">
                  Ou digite este código manualmente:
                </p>
                <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                  <code className="flex-1 text-center font-mono text-sm text-gray-900">
                    {secret}
                  </code>
                  <button
                    onClick={() => copyToClipboard(secret, 'secret')}
                    className="p-2 hover:bg-gray-200 rounded transition-colors"
                    title="Copiar código"
                  >
                    {copiedSecret ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Digite o código de 6 dígitos do app
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setVerificationCode(value);
                  }}
                  placeholder="000000"
                  className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={6}
                  autoFocus
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleVerify}
                disabled={loading || verificationCode.length !== 6}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verificando...' : 'Verificar e Ativar'}
              </button>
            </div>
          )}

          {/* Step 3: Backup Codes */}
          {step === 'backup' && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  2FA Ativado com Sucesso!
                </h3>
                <p className="text-gray-600 text-sm">
                  Guarde estes códigos de backup em um lugar seguro
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm font-medium text-yellow-900 mb-2">
                  ⚠️ Importante:
                </p>
                <p className="text-sm text-yellow-800">
                  Estes códigos permitem acesso à sua conta se você perder seu dispositivo.
                  Cada código pode ser usado apenas uma vez.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-900">
                    Códigos de Backup ({backupCodes.length})
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(backupCodes.join('\n'), 'backup')}
                      className="p-2 hover:bg-gray-200 rounded transition-colors"
                      title="Copiar todos"
                    >
                      {copiedBackup ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                    <button
                      onClick={downloadBackupCodes}
                      className="p-2 hover:bg-gray-200 rounded transition-colors"
                      title="Baixar códigos"
                    >
                      <Download className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, index) => (
                    <div
                      key={index}
                      className="bg-white px-3 py-2 rounded border border-gray-200 font-mono text-sm text-center"
                    >
                      {code}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleFinish}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                Concluir
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
