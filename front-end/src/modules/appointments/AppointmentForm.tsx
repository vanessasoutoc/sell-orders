'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation } from '@tanstack/react-query';
import ComponentCard from '@/components/common/ComponentCard';
import { PencilIcon } from '@/icons';
import {
  Appointment,
  getAppointmentStatuses,
  createAppointment,
  updateAppointment,
} from '@/modules/appointments/appointmentsService';
import { getOrders } from '@/modules/orders/ordersService';

interface FormValues {
  orderId: string;
  appointmentStatusId: string;
  deliveryDate: string;
  startTime: string;
  endTime: string;
}

interface Props {
  appointment?: Appointment;
  initialEditing?: boolean;
}

function appointmentToFormValues(a: Appointment): FormValues {
  return {
    orderId: String(a.orderId),
    appointmentStatusId: String(a.appointmentStatusId),
    deliveryDate: a.deliveryDate,
    startTime: a.startTime,
    endTime: a.endTime,
  };
}

export default function AppointmentForm({ appointment, initialEditing }: Props) {
  const router = useRouter();
  const isNew = !appointment;
  const [editing, setEditing] = useState(initialEditing ?? isNew);

  const { data: statuses } = useQuery({
    queryKey: ['appointment-statuses'],
    queryFn: getAppointmentStatuses,
  });

  const { data: ordersData } = useQuery({
    queryKey: ['orders-select'],
    queryFn: () => getOrders(1, 100),
  });

  const pendenteId = isNew && statuses
    ? String((statuses.find((s) => s.status === 'PENDENTE') ?? statuses[0])?.id ?? '')
    : undefined;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: appointment
      ? appointmentToFormValues(appointment)
      : { orderId: '', appointmentStatusId: '', deliveryDate: '', startTime: '', endTime: '' },
    values: appointment
      ? appointmentToFormValues(appointment)
      : pendenteId
        ? { orderId: '', appointmentStatusId: pendenteId, deliveryDate: '', startTime: '', endTime: '' }
        : undefined,
  });

  const mutation = useMutation({
    mutationFn: (data: FormValues) => {
      const payload = {
        orderId: Number(data.orderId),
        appointmentStatusId: Number(data.appointmentStatusId),
        deliveryDate: data.deliveryDate,
        startTime: data.startTime,
        endTime: data.endTime,
      };
      return isNew ? createAppointment(payload) : updateAppointment(appointment!.id, payload);
    },
    onSuccess: () => router.push('/appointments'),
  });

  const disabled = !editing;

  const inputClass = (extra = '') =>
    `h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 shadow-theme-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 disabled:cursor-not-allowed disabled:opacity-60 ${extra}`;

  const errorClass = 'mt-1 text-xs text-red-500';
  const labelClass = 'block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300';

  return (
    <div className="space-y-6">
      <ComponentCard
        title={isNew ? 'Novo Agendamento' : `Agendamento #${appointment!.id}`}
        action={
          !isNew && !editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
            >
              <PencilIcon className="size-4" />
              Editar
            </button>
          ) : undefined
        }
      >
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

            <div>
              <label className={labelClass}>Ordem - Cliente</label>
              <select
                className={inputClass()}
                disabled={disabled}
                {...register('orderId', { required: 'Selecione uma ordem' })}
              >
                <option value="">Selecione...</option>
                {ordersData?.data?.map((o) => (
                  <option key={o.id} value={o.id}>
                    #{o.id} — {o.customer?.name}
                  </option>
                ))}
              </select>
              {errors.orderId && <p className={errorClass}>{errors.orderId.message}</p>}
            </div>

            <div>
              <label className={labelClass}>Status do Agendamento</label>
              <select
                className={inputClass()}
                disabled={disabled}
                {...register('appointmentStatusId', { required: 'Selecione o status' })}
              >
                <option value="">Selecione...</option>
                {statuses?.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              {errors.appointmentStatusId && <p className={errorClass}>{errors.appointmentStatusId.message}</p>}
            </div>

            <div>
              <label className={labelClass}>Data de Entrega</label>
              <input
                type="date"
                className={inputClass()}
                disabled={disabled}
                {...register('deliveryDate', { required: 'Informe a data de entrega' })}
              />
              {errors.deliveryDate && <p className={errorClass}>{errors.deliveryDate.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Hora Início</label>
                <input
                  type="time"
                  className={inputClass()}
                  disabled={disabled}
                  {...register('startTime', { required: 'Informe a hora início' })}
                />
                {errors.startTime && <p className={errorClass}>{errors.startTime.message}</p>}
              </div>

              <div>
                <label className={labelClass}>Hora Fim</label>
                <input
                  type="time"
                  className={inputClass()}
                  disabled={disabled}
                  {...register('endTime', { required: 'Informe a hora fim' })}
                />
                {errors.endTime && <p className={errorClass}>{errors.endTime.message}</p>}
              </div>
            </div>

          </div>

          {!isNew && appointment?.confirmedAt && (
            <p className="text-sm text-green-600 dark:text-green-400">
              ✓ Confirmado em {new Date(appointment.confirmedAt).toLocaleString('pt-BR')}
            </p>
          )}

          {mutation.isError && (
            <p className="text-sm text-red-500">
              {(mutation.error as Error)?.message ?? 'Erro ao salvar agendamento.'}
            </p>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push('/appointments')}
              className="h-10 rounded-lg border border-gray-300 px-5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
            >
              Cancelar
            </button>
            {editing && (
              <button
                type="submit"
                disabled={mutation.isPending}
                className="h-10 rounded-lg bg-brand-500 px-5 text-sm text-white hover:bg-brand-600 disabled:opacity-60"
              >
                {mutation.isPending ? 'Salvando...' : 'Salvar Agendamento'}
              </button>
            )}
          </div>
        </form>
      </ComponentCard>
    </div>
  );
}
