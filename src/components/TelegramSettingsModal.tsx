import React, { useState } from 'react';
import { TelegramConfig } from '../types/football';
import { 
  sendTelegramTestAlert, 
  sendTelegramMessage 
} from '../services/telegramService';
import { 
  Send, 
  X, 
  Bell, 
  ShieldCheck, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Sparkles,
  Flame,
  Radio,
  Sliders,
  ExternalLink
} from 'lucide-react';

interface TelegramSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: TelegramConfig;
  onSave: (newConfig: TelegramConfig) => void;
}

export const TelegramSettingsModal: React.FC<TelegramSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave
}) => {
  const [formData, setFormData] = useState<TelegramConfig>({ ...config });
  const [showToken, setShowToken] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [showHelp, setShowHelp] = useState(false);

  if (!isOpen) return null;

  const handleTestBot = async () => {
    if (!formData.botToken.trim() || !formData.chatId.trim()) {
      setTestStatus('error');
      setStatusMessage('Заполните токен бота и Chat ID перед проверкой.');
      return;
    }

    setTestStatus('testing');
    setStatusMessage('Отправка проверочного сообщения в Telegram...');

    try {
      const res = await sendTelegramTestAlert(formData.botToken, formData.chatId);
      if (res.success) {
        setTestStatus('success');
        setStatusMessage('Тестовое сообщение успешно доставлено в Telegram!');
      } else {
        setTestStatus('error');
        setStatusMessage(res.message || 'Ошибка отправки. Проверьте правильность токена и Chat ID.');
      }
    } catch (err: any) {
      setTestStatus('error');
      setStatusMessage(err?.message || 'Сбой подключения к Telegram.');
    }
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 dark:text-sky-400 flex items-center justify-center shrink-0">
              <Send className="w-5 h-5 -rotate-12 translate-x-0.5" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <span>Интеграция с Telegram</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold">
                  PUSH УВЕДОМЛЕНИЯ
                </span>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Автоматическая отправка горячих сигналов и голов прямо в ваш Telegram
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* 1. Master Toggle */}
          <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700/60">
            <div className="space-y-0.5">
              <div className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <Bell className="w-4 h-4 text-sky-500" />
                <span>Включить рассылку сигналов в Telegram</span>
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                При включении бот будет присылать события согласно вашим правилам
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData.enabled} 
                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })} 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
            </label>
          </div>

          {/* 2. Bot Token & Chat ID */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Токен Telegram-бота (Bot Token)
                </label>
                <button
                  type="button"
                  onClick={() => setShowHelp(!showHelp)}
                  className="text-xs text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Как получить токен?</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                  value={formData.botToken}
                  onChange={(e) => setFormData({ ...formData, botToken: e.target.value })}
                  className="w-full px-3.5 py-2.5 pr-10 text-sm font-mono bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none text-neutral-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                >
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Ваш Chat ID или ID канала
              </label>
              <input
                type="text"
                placeholder="Например: 123456789 или @my_channel"
                value={formData.chatId}
                onChange={(e) => setFormData({ ...formData, chatId: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm font-mono bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none text-neutral-900 dark:text-white"
              />
              <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
                Можно узнать через бота <code className="px-1 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-sky-600">@userinfobot</code> или <code className="px-1 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-sky-600">@getmyid_bot</code>
              </p>
            </div>
          </div>

          {/* Collapsible Quick Guide */}
          {showHelp && (
            <div className="p-4 bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/60 rounded-xl text-xs space-y-2 text-neutral-700 dark:text-neutral-300">
              <div className="font-bold text-sky-800 dark:text-sky-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Инструкция по настройке за 1 минуту:</span>
              </div>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Откройте Telegram и найдите официального бота <strong>@BotFather</strong></li>
                <li>Отправьте команду <code>/newbot</code> и придумайте имя боту.</li>
                <li>Скопируйте полученный <strong>API token</strong> и вставьте в поле выше.</li>
                <li>Нажмите <strong>Start</strong> в диалоге со своим новым ботом.</li>
                <li>Узнайте свой ID через <strong>@userinfobot</strong> и укажите его в поле <strong>Chat ID</strong>.</li>
              </ol>
            </div>
          )}

          {/* 3. Alert Conditions & Triggers */}
          <div className="space-y-3 pt-2 border-t border-neutral-200 dark:border-neutral-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Параметры сигналов и фильтры
            </h4>

            {/* Threshold Slider */}
            <div className="p-3.5 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-200 dark:border-neutral-700/60 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-sky-500" />
                  <span>Порог вероятности гола для алерта:</span>
                </span>
                <span className="text-sm font-bold font-mono text-sky-600 dark:text-sky-400">
                  {formData.minGoalProbability}%
                </span>
              </div>
              <input
                type="range"
                min="60"
                max="90"
                step="1"
                value={formData.minGoalProbability}
                onChange={(e) => setFormData({ ...formData, minGoalProbability: parseInt(e.target.value, 10) })}
                className="w-full accent-sky-600 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                <span>60% (чаще)</span>
                <span>75% (оптимально)</span>
                <span>90% (только отборные)</span>
              </div>
            </div>

            {/* Triggers check list */}
            <div className="space-y-2.5">
              <label className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-200 dark:border-neutral-700/60 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800/70 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.notifyOnLatePressure}
                  onChange={(e) => setFormData({ ...formData, notifyOnLatePressure: e.target.checked })}
                  className="w-4 h-4 text-sky-600 rounded border-neutral-300 focus:ring-sky-500"
                />
                <div className="text-xs">
                  <div className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-rose-500" />
                    <span>Опасная концовка матча (интервал 76-90+')</span>
                  </div>
                  <div className="text-neutral-500 dark:text-neutral-400 text-[11px]">
                    Уведомлять при наступлении финального интервала с высоким риском позднего гола
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-200 dark:border-neutral-700/60 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800/70 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.notifyOnGoals}
                  onChange={(e) => setFormData({ ...formData, notifyOnGoals: e.target.checked })}
                  className="w-4 h-4 text-sky-600 rounded border-neutral-300 focus:ring-sky-500"
                />
                <div className="text-xs">
                  <div className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Голы в режиме реального времени (Live Score)</span>
                  </div>
                  <div className="text-neutral-500 dark:text-neutral-400 text-[11px]">
                    Мгновенное оповещение с автором гола и текущей минутой матча
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-200 dark:border-neutral-700/60 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800/70 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.notifyOnOver25}
                  onChange={(e) => setFormData({ ...formData, notifyOnOver25: e.target.checked })}
                  className="w-4 h-4 text-sky-600 rounded border-neutral-300 focus:ring-sky-500"
                />
                <div className="text-xs">
                  <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                    Сигналы на Тотал Больше 2.5 (ТБ 2.5)
                  </div>
                  <div className="text-neutral-500 dark:text-neutral-400 text-[11px]">
                    Отправлять матчи, превышающие заданный порог статистической вероятности
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Test Status Feedback Banner */}
          {testStatus !== 'idle' && (
            <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
              testStatus === 'testing' 
                ? 'bg-neutral-100 dark:bg-neutral-800 border-neutral-300 text-neutral-700 dark:text-neutral-300'
                : testStatus === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
            }`}>
              {testStatus === 'testing' && <Radio className="w-4 h-4 animate-spin shrink-0 mt-0.5" />}
              {testStatus === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />}
              {testStatus === 'error' && <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />}
              <div>
                <p className="font-semibold">{statusMessage}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3 bg-neutral-50 dark:bg-neutral-900/80">
          <button
            type="button"
            onClick={handleTestBot}
            disabled={testStatus === 'testing'}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Проверить связь с ботом</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-sky-600 hover:bg-sky-500 text-white shadow-md transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Сохранить настройки</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
