'use client';

import { useMutation } from '@tanstack/react-query';
import { Appointment, confirmAppointment } from '@/modules/appointments/appointmentsService';

interface Props {
  appointment: Appointment;
  orderId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ConfirmAppointmentModal({ appointment, orderId, onClose, onSuccess }: Props) {
  const mutation = useMutation({
    mutationFn: () => confirmAppointment(appointment.id),
    onSuccess,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
        <h2 className="mb-2 text-base font-semibold text-gray-800 dark:text-white">
          Confirmar Agendamento
        </h2>
        <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
          Deseja confirmar o agendamento da Ordem #{orderId}?
        </p>
        <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
          Data de entrega: <span className="font-medium text-gray-700 dark:text-gray-300">{appointment.deliveryDate}</span>
          {' '}das <span className="font-medium text-gray-700 dark:text-gray-300">{appointment.startTime}</span>
          {' '}às <span className="font-medium text-gray-700 dark:text-gray-300">{appointment.endTime}</span>
        </p>

        {mutation.isError && (
          <p className="mb-3 text-xs text-red-500">
            {(mutation.error as Error)?.message ?? 'Erro ao confirmar agendamento.'}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-lg border border-gray-300 px-5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="h-10 rounded-lg bg-green-500 px-5 text-sm text-white hover:bg-green-600 disabled:opacity-60"
          >
            {mutation.isPending ? 'Confirmando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}
