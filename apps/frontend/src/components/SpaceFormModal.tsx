'use client';

import { useState, useActionState, useEffect } from 'react';
import {
  createSpaceAction,
  updateSpaceAction,
  type SpaceActionState,
} from '@/app/actions/spaces';
import Modal from '@/components/Modal';
import type { Espacio } from '@/types';

const init: SpaceActionState = { error: null };

const inputCls =
  'w-full px-[14px] py-[10px] border border-[#e2e8f0] rounded-[8px] text-sm text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:border-[#0d9488] transition-colors';
const labelCls = 'block text-[13px] font-medium text-[#1e293b] mb-1.5';

interface SpaceFormModalProps {
  mode: 'create' | 'edit'
  espacio?: Espacio
}

export default function SpaceFormModal({ mode, espacio }: SpaceFormModalProps) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(
    mode === 'create' ? createSpaceAction : updateSpaceAction,
    init,
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (state.success) setOpen(false);
  }, [state.success]);

  const isEdit = mode === 'edit';

  return (
    <>
      {isEdit ? (
        <button
          onClick={() => setOpen(true)}
          className="flex-1 text-[13px] font-medium px-3 py-2 rounded-[8px] border border-[#e2e8f0] text-[#1e293b] hover:bg-[#f8fafc] transition-colors"
        >
          Editar
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-[#0d9488] text-white text-sm font-medium px-5 py-[10px] rounded-[8px] hover:bg-[#0f766e] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Espacio
        </button>
      )}

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={isEdit ? 'Editar Espacio' : 'Nuevo Espacio'}
      >
        <form action={action} className="space-y-4">
          {isEdit && <input type="hidden" name="id" value={espacio!.id} />}

          <div>
            <label className={labelCls}>Nombre</label>
            <input
              name="nombre"
              type="text"
              required
              defaultValue={espacio?.nombre}
              placeholder="Sala de Juntas B"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Descripción</label>
            <textarea
              name="descripcion"
              rows={3}
              defaultValue={espacio?.descripcion}
              placeholder="Detalles, mobiliario o recursos del espacio…"
              className={`${inputCls} resize-y`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Capacidad</label>
              <input
                name="capacidad"
                type="number"
                min={1}
                required
                defaultValue={espacio?.capacidad}
                placeholder="6"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Precio por hora</label>
              <input
                name="precioPorHora"
                type="number"
                min={0}
                step="0.01"
                required
                defaultValue={espacio?.precio_por_hora}
                placeholder="45.00"
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>
              Foto {isEdit && <span className="text-[#94a3b8] font-normal">(opcional)</span>}
            </label>
            <input
              name="foto"
              type="file"
              accept="image/*"
              required={!isEdit}
              className="w-full text-sm text-[#64748b] file:mr-3 file:py-2 file:px-4 file:rounded-[8px] file:border-0 file:text-sm file:font-medium file:bg-[#f0fdfa] file:text-[#0d9488] hover:file:bg-[#ccfbf1] file:cursor-pointer"
            />
            {isEdit && (
              <p className="text-[12px] text-[#94a3b8] mt-1.5">
                Deja el campo vacío para conservar la imagen actual.
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <input
              name="necesitaVerificacion"
              id="necesitaVerificacion"
              type="checkbox"
              value="true"
              defaultChecked={espacio?.necesita_verificacion ?? false}
              className="w-4 h-4 rounded border-[#e2e8f0] text-[#0d9488] focus:ring-[#0d9488]"
            />
            <label htmlFor="necesitaVerificacion" className={labelCls + ' mb-0'}>
              Requiere verificación antes de reservar
            </label>
          </div>

          {state.error && (
            <p className="text-[13px] text-[#dc2626] bg-[#fee2e2] border border-[#fecaca] rounded-[8px] px-4 py-3">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-[#0d9488] hover:bg-[#0f766e] text-white font-medium text-sm py-[10px] rounded-[8px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {pending ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear Espacio'}
          </button>
        </form>
      </Modal>
    </>
  );
}
