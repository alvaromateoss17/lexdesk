import { useState } from 'react';

export function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return { toast, showToast };
}

export function Toast({ toast }) {
  if (!toast) return null;
  const colors = {
    success: { bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.3)', color: '#34D399' },
    error:   { bg: 'rgba(226,75,74,0.12)',  border: 'rgba(226,75,74,0.3)',  color: '#E24B4A' },
  };
  const c = colors[toast.type] || colors.success;
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 999,
      background: c.bg, border: `1px solid ${c.border}`,
      color: c.color, borderRadius: 10,
      padding: '12px 20px', fontSize: 13, fontWeight: 500,
      backdropFilter: 'blur(8px)',
      animation: 'slideUp .2s ease',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    }}>
      {toast.message}
    </div>
  );
}
