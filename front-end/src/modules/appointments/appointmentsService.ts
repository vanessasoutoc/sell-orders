import { Order } from '../orders/ordersService';

export interface AppointmentStatus {
  id: number;
  name: string;
  status: string;
}

export interface Appointment {
  id: number;
  orderId: number;
  order: Order;
  appointmentStatusId: number;
  appointmentStatus: AppointmentStatus;
  deliveryDate: string;
  startTime: string;
  endTime: string;
  confirmedAt: string | null;
  createdAt: string;
}

export interface PaginatedAppointments {
  data: Appointment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateAppointmentDto {
  orderId: number;
  appointmentStatusId: number;
  deliveryDate: string;
  startTime: string;
  endTime: string;
}

const BASE = 'http://localhost:3000';

export async function getAppointments(page = 1, limit = 10): Promise<PaginatedAppointments> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  const res = await fetch(`${BASE}/appointments?${params}`);
  if (!res.ok) throw new Error('Erro ao buscar agendamentos');
  return res.json();
}

export async function getAppointment(id: number): Promise<Appointment> {
  const res = await fetch(`${BASE}/appointments/${id}`);
  if (!res.ok) throw new Error('Erro ao buscar agendamento');
  return res.json();
}

export async function createAppointment(data: CreateAppointmentDto): Promise<Appointment> {
  const res = await fetch(`${BASE}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? 'Erro ao criar agendamento');
  }
  return res.json();
}

export async function updateAppointment(id: number, data: Partial<CreateAppointmentDto>): Promise<Appointment> {
  const res = await fetch(`${BASE}/appointments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? 'Erro ao atualizar agendamento');
  }
  return res.json();
}

export async function confirmAppointment(id: number): Promise<Appointment> {
  const res = await fetch(`${BASE}/appointments/${id}/confirm`, { method: 'PATCH' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? 'Erro ao confirmar agendamento');
  }
  return res.json();
}

export async function getAppointmentStatuses(): Promise<AppointmentStatus[]> {
  const res = await fetch(`${BASE}/appointment-status?page=1&limit=100`);
  if (!res.ok) throw new Error('Erro ao buscar status de agendamento');
  const json = await res.json();
  return json.data;
}

export async function getOrders(page = 1, search = ''): Promise<{ data: { id: number; customer: { name: string } }[]; totalPages: number }> {
  const params = new URLSearchParams({ page: String(page), limit: '10' });
  if (search) params.set('search', search);
  const res = await fetch(`${BASE}/orders?${params}`);
  if (!res.ok) throw new Error('Erro ao buscar ordens');
  return res.json();
}
