'use client';

import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Order } from './ordersService';
import { createAppointment, getAppointmentStatuses } from '@/modules/appointments/appointmentsService';

interface Props {
  order: Order;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormValues {
  appointmentStatusId: string;
  deliveryDate: string;
  startTime: string;
  endTime: string;
}

const inputClass =
  'h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 shadow-theme-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 disabled:opacity-60';
const labelClass = 'block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300';
const errorClass = 'mt-1 text-xs text-red-500';

export default function AppointmentModal({ order, onClose, onSuccess }: Props) {
  const { data: statuses } = useQuery({
    queryKey: ['appointment-statuses'],
    queryFn: getAppointmentStatuses,
  });

  const pendenteId = statuses ? String((statuses.find((s) => s.status === 'PENDENTE') ?? statuses[0])?.id ?? '') : '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { appointmentStatusId: pendenteId, deliveryDate: '', startTime: '', endTime: '' },
    values: { appointmentStatusId: pendenteId, deliveryDate: '', startTime: '', endTime: '' },
  });

  const mutation = useMutation({
    mutationFn: (data: FormValues) =>
      createAppointment({
        orderId: order.id,
        appointmentStatusId: Number(data.appointmentStatusId),
        deliveryDate: data.deliveryDate,
        startTime: data.startTime,
        endTime: data.endTime,
      }),
    onSuccess,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white">
            Agendar Ordem #{order.id} — {order.customer?.name}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
          <div>
            <label className={labelClass}>Status do Agendamento</label>
            <select
              className={inputClass}
              {...register('appointmentStatusId', { required: 'Selecione o status' })}
            >
              {statuses?.filter((s) => s.id === Number(pendenteId)).map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            {errors.appointmentStatusId && <p className={errorClass}>{errors.appointmentStatusId.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Data de Entrega</label>
            <input
              type="date"
              className={inputClass}
              {...register('deliveryDate', { required: 'Informe a data de entrega' })}
            />
            {errors.deliveryDate && <p className={errorClass}>{errors.deliveryDate.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Hora Início</label>
              <input
                type="time"
                className={inputClass}
                {...register('startTime', { required: 'Informe a hora início' })}
              />
              {errors.startTime && <p className={errorClass}>{errors.startTime.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Hora Fim</label>
              <input
                type="time"
                className={inputClass}
                {...register('endTime', { required: 'Informe a hora fim' })}
              />
              {errors.endTime && <p className={errorClass}>{errors.endTime.message}</p>}
            </div>
          </div>

          {mutation.isError && (
            <p className={errorClass}>
              {(mutation.error as Error)?.message ?? 'Erro ao criar agendamento.'}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-lg border border-gray-300 px-5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="h-10 rounded-lg bg-brand-500 px-5 text-sm text-white hover:bg-brand-600 disabled:opacity-60"
            >
              {mutation.isPending ? 'Salvando...' : 'Confirmar Agendamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
