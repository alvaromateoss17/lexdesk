import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

export default function AutocompleteInput({ value, onChange, options, placeholder, required }) {
  const [query, setQuery] = useState(value || '');
  const [abierto, setAbierto] = useState(false);
  const [resaltado, setResaltado] = useState(-1);
  const inputRef = useRef(null);
  const listaRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  const opcionesFiltradas = query.length === 0
    ? options
    : options.filter(op =>
        op.label.toLowerCase()
          .normalize('NFD').replace(/[̀-ͯ]/g, '')
          .includes(
            query.toLowerCase()
              .normalize('NFD').replace(/[̀-ͯ]/g, '')
          )
      );

  const opcionesAgrupadas = opcionesFiltradas.reduce((acc, op) => {
    const grupo = op.group || 'Otros';
    if (!acc[grupo]) acc[grupo] = [];
    acc[grupo].push(op);
    return acc;
  }, {});

  const seleccionar = (opcion) => {
    setQuery(opcion.label);
    onChange(opcion.label);
    setAbierto(false);
    setResaltado(-1);
  };

  const limpiar = () => {
    setQuery('');
    onChange('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    const total = opcionesFiltradas.length;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setResaltado(prev => Math.min(prev + 1, total - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setResaltado(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && resaltado >= 0) {
      e.preventDefault();
      seleccionar(opcionesFiltradas[resaltado]);
    } else if (e.key === 'Escape') {
      setAbierto(false);
    }
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (!wrapperRef.current?.contains(e.target)) {
        setAbierto(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (resaltado >= 0 && listaRef.current) {
      const items = listaRef.current.querySelectorAll('[data-option]');
      items[resaltado]?.scrollIntoView({ block: 'nearest' });
    }
  }, [resaltado]);

  const numGrupos = Object.keys(opcionesAgrupadas).length;

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      {/* Input */}
      <div style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setAbierto(true);
            setResaltado(-1);
          }}
          onFocus={() => setAbierto(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || 'Escribe para buscar...'}
          required={required}
          autoComplete="off"
          style={{
            width: '100%', height: 34, borderRadius: 6,
            background: 'var(--bg)', border: '1px solid var(--border-2)',
            color: 'var(--text)', fontFamily: 'inherit', fontSize: 13,
            padding: '0 56px 0 10px', outline: 0, boxSizing: 'border-box',
            transition: 'border-color 0.15s',
          }}
          onFocusCapture={e => { e.target.style.borderColor = '#4F7EFF' }}
          onBlurCapture={e => { e.target.style.borderColor = 'var(--border-2)' }}
        />
        <div style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: 2 }}>
          {query && (
            <button
              type="button"
              onClick={limpiar}
              style={{ width: 20, height: 20, display: 'grid', placeItems: 'center', background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--text-3)', borderRadius: 3 }}
            >
              <X size={12} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setAbierto(!abierto)}
            style={{ width: 20, height: 20, display: 'grid', placeItems: 'center', background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--text-3)', borderRadius: 3 }}
          >
            <ChevronDown size={12} style={{ transform: abierto ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
          </button>
        </div>
      </div>

      {/* Dropdown */}
      {abierto && (
        <div
          ref={listaRef}
          style={{
            position: 'absolute', zIndex: 200, width: '100%', marginTop: 4,
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            maxHeight: 256, overflowY: 'auto',
          }}
        >
          {opcionesFiltradas.length === 0 ? (
            <div style={{ padding: '10px 12px', fontSize: 13, color: 'var(--text-3)' }}>
              No se encontraron resultados
            </div>
          ) : (
            Object.entries(opcionesAgrupadas).map(([grupo, items]) => (
              <div key={grupo}>
                {numGrupos > 1 && (
                  <div style={{
                    padding: '6px 12px 4px',
                    fontSize: 10, color: 'var(--text-3)', fontWeight: 600,
                    textTransform: 'uppercase', letterSpacing: '0.09em',
                    background: 'var(--bg)',
                    position: 'sticky', top: 0, zIndex: 1,
                  }}>
                    {grupo}
                  </div>
                )}
                {items.map((op) => {
                  const globalIdx = opcionesFiltradas.indexOf(op);
                  const isHighlighted = globalIdx === resaltado;
                  return (
                    <button
                      key={op.label}
                      type="button"
                      data-option="true"
                      onClick={() => seleccionar(op)}
                      style={{
                        width: '100%', textAlign: 'left', padding: '8px 12px',
                        fontSize: 13, display: 'flex', alignItems: 'center', gap: 8,
                        background: isHighlighted ? 'rgba(79,126,255,0.15)' : 'transparent',
                        border: 0, cursor: 'pointer', fontFamily: 'inherit',
                        color: isHighlighted ? 'var(--text)' : 'var(--text-2)',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={e => { if (!isHighlighted) e.currentTarget.style.background = 'var(--surface-2)' }}
                      onMouseLeave={e => { if (!isHighlighted) e.currentTarget.style.background = 'transparent' }}
                    >
                      {op.color && (
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: op.color, flexShrink: 0 }} />
                      )}
                      {resaltarCoincidencia(op.label, query)}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function resaltarCoincidencia(texto, query) {
  if (!query) return texto;
  const queryNorm = query.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const textoNorm = texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const idx = textoNorm.indexOf(queryNorm);
  if (idx === -1) return texto;
  return (
    <>
      {texto.slice(0, idx)}
      <span style={{ color: '#4F7EFF', fontWeight: 600 }}>{texto.slice(idx, idx + query.length)}</span>
      {texto.slice(idx + query.length)}
    </>
  );
}
