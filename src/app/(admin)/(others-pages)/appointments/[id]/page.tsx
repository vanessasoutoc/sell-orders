import { notFound } from 'next/navigation';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import AppointmentForm from '@/modules/appointments/AppointmentForm';
import { getAppointment } from '@/modules/appointments/appointmentsService';

export default async function AppointmentDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const { id } = await params;
  const { edit } = await searchParams;
  const appointment = await getAppointment(Number(id)).catch(() => null);
  if (!appointment) notFound();

  return (
    <div>
      <PageBreadcrumb pageTitle={`Agendamento #${appointment.id}`} />
      <AppointmentForm appointment={appointment} initialEditing={edit === 'true'} />
    </div>
  );
}
