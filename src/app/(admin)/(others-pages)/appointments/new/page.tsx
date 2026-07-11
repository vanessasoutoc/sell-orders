import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import AppointmentForm from '@/modules/appointments/AppointmentForm';

export default function NewAppointment() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Novo Agendamento" />
      <AppointmentForm />
    </div>
  );
}
