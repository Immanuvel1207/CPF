import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);

  const notify = useCallback((message, type = 'info', timeout = 4000) => {
    const id = Date.now() + Math.random().toString(36).slice(2, 9);
    const t = { id, message, type };
    setToasts(s => [t, ...s]);
    if (timeout > 0) {
      setTimeout(() => {
        setToasts(s => s.filter(x => x.id !== id));
      }, timeout);
    }
    return id;
  }, []);

  const remove = useCallback((id) => {
    setToasts(s => s.filter(x => x.id !== id));
  }, []);

  const confirm = useCallback((message, title = '') => {
    return new Promise((resolve) => {
      setConfirmState({ message, title, resolve });
    });
  }, []);

  // confetti / celebration: small DOM-based implementation (no extra deps)
  const celebrate = useCallback((opts = {}) => {
    const { particleCount = 250, colors } = opts;
    const palette = colors || ['#ef4444','#f97316','#facc15','#4ade80','#60a5fa','#a78bfa'];

    const container = document.createElement('div');
    container.className = 'confetti-container';
    Object.assign(container.style, {
      position: 'fixed',
      left: '0',
      top: '0',
      width: '100%',
      height: '0',
      pointerEvents: 'none',
      overflow: 'visible',
      zIndex: 9999
    });

    for (let i = 0; i < particleCount; i++) {
      const el = document.createElement('div');
      const size = Math.floor(Math.random() * 10) + 6;
      const left = Math.random() * 100;
      const delay = Math.random() * 0.6;
      const rotate = Math.random() * 360;
      el.className = 'confetti-piece';
      Object.assign(el.style, {
        position: 'absolute',
        left: `${left}%`,
        top: '-10px',
        width: `${size}px`,
        height: `${size * 0.6}px`,
        background: palette[Math.floor(Math.random() * palette.length)],
        opacity: String(0.9 - Math.random() * 0.4),
        transform: `rotate(${rotate}deg)`,
        borderRadius: '2px',
        willChange: 'transform, opacity',
        animation: `confetti-fall ${2 + Math.random() * 1.5}s ${delay}s linear forwards`
      });
      container.appendChild(el);
    }

    // ensure keyframes exist once
    if (!document.getElementById('confetti-keyframes')) {
      const style = document.createElement('style');
      style.id = 'confetti-keyframes';
      style.innerHTML = `
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1 }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0 }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(container);
    // remove after animation finishes
    setTimeout(() => {
      container.remove();
    }, 3500);
  }, []);

  const handleConfirm = (result) => {
    if (confirmState && typeof confirmState.resolve === 'function') {
      confirmState.resolve(result);
    }
    setConfirmState(null);
  };

  return (
    <NotificationsContext.Provider value={{ notify, remove, confirm, celebrate }}>
      {children}
      <div aria-live="polite" className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 items-end">
        {toasts.map(t => (
          <div key={t.id} className={`max-w-sm w-full px-4 py-3 rounded-lg shadow-lg text-sm text-white ${t.type === 'success' ? 'bg-green-500' : t.type === 'error' ? 'bg-red-500' : 'bg-indigo-600'}`}>
            {t.message}
          </div>
        ))}
      </div>

      {confirmState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            {confirmState.title && <h3 className="text-lg font-semibold mb-2">{confirmState.title}</h3>}
            <p className="text-sm text-gray-700 mb-4">{confirmState.message}</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => handleConfirm(false)} className="px-4 py-2 rounded-lg bg-gray-100">Cancel</button>
              <button onClick={() => handleConfirm(true)} className="px-4 py-2 rounded-lg bg-indigo-600 text-white">OK</button>
            </div>
          </div>
        </div>
      )}
    </NotificationsContext.Provider>
  );
}

export function useNotification() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotification must be used within NotificationsProvider');
  return ctx;
}

export default NotificationsProvider;
