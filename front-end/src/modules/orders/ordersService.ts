import { Appointment } from "../appointments/appointmentsService";
import { getApiBaseUrl } from "../../lib/api";

export interface OrderStatus {
  id: number;
  name: string;
  status: string;
}

export interface Customer {
  id: number;
  name: string;
}

export interface TransportType {
  id: number;
  name: string;
  type: string;
}

export interface OrderItem {
  id: number;
  name: string;
  OrderItem: { quantity: number };
}

export interface Order {
  id: number;
  customerId: number;
  customer: Customer;
  transportTypeId: number;
  transportType: TransportType;
  orderStatusId: number;
  orderStatus: OrderStatus;
  items: OrderItem[];
  appointment: Appointment | null;
  createdAt: string;
}

export interface PaginatedOrders {
  data: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Item {
  id: number;
  name: string;
  description: string;
}

export interface CreateOrderItemDto {
  itemId: number;
  quantity: number;
}

export interface CreateOrderDto {
  customerId: number;
  transportTypeId: number;
  orderStatusId: number;
  items: CreateOrderItemDto[];
}

export interface OrderFilters {
  orderStatusId?: number;
  customerId?: number;
  transportTypeId?: number;
  date?: string;
  sortOrder?: 'asc' | 'desc';
}

export async function getOrders(page = 1, limit = 10, filters: OrderFilters = {}): Promise<PaginatedOrders> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (filters.orderStatusId) params.set('orderStatusId', String(filters.orderStatusId));
  if (filters.customerId) params.set('customerId', String(filters.customerId));
  if (filters.transportTypeId) params.set('transportTypeId', String(filters.transportTypeId));
  if (filters.date) params.set('date', filters.date);
  if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);

  const res = await fetch(`${getApiBaseUrl()}/orders?${params.toString()}`);
  if (!res.ok) throw new Error('Erro ao buscar ordens');
  return res.json();
}

export async function getOrderStatuses(): Promise<OrderStatus[]> {
  const res = await fetch(`${getApiBaseUrl()}/order-status?page=1&limit=100`);
  if (!res.ok) throw new Error('Erro ao buscar status');
  const json = await res.json();
  return json.data;
}

export async function getCustomers(page = 1, limit = 10, search = ''): Promise<{ data: Customer[]; totalPages: number }> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) params.set('name', search);
  const res = await fetch(`${getApiBaseUrl()}/customers?${params.toString()}`);
  if (!res.ok) throw new Error('Erro ao buscar clientes');
  return res.json();
}

export async function searchCustomers(page = 1, search = ''): Promise<{ data: Customer[]; totalPages: number }> {
  const params = new URLSearchParams({ page: String(page), limit: '10' });
  if (search) params.set('search', search);
  const res = await fetch(`${getApiBaseUrl()}/customers/autocomplete?${params.toString()}`);
  if (!res.ok) throw new Error('Erro ao buscar clientes');
  return res.json();
}

export async function getTransportTypes(): Promise<TransportType[]> {
  const res = await fetch(`${getApiBaseUrl()}/transport-types?page=1&limit=100`);
  if (!res.ok) throw new Error('Erro ao buscar tipos de transporte');
  const json = await res.json();
  return json.data;
}

export async function getAuthorizedTransportTypes(customerId: number): Promise<TransportType[]> {
  const res = await fetch(`${getApiBaseUrl()}/customers/${customerId}/transport-types/active`);
  if (!res.ok) throw new Error('Erro ao buscar transportes autorizados');
  return res.json();
}

export async function getItems(page = 1, limit = 10, search = ''): Promise<{ data: Item[]; totalPages: number }> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) params.set('name', search);
  const res = await fetch(`${getApiBaseUrl()}/items?${params.toString()}`);
  if (!res.ok) throw new Error('Erro ao buscar itens');
  return res.json();
}

export async function searchItems(page = 1, search = ''): Promise<{ data: Item[]; totalPages: number }> {
  const params = new URLSearchParams({ page: String(page), limit: '10' });
  if (search) params.set('search', search);
  const res = await fetch(`${getApiBaseUrl()}/items/autocomplete?${params.toString()}`);
  if (!res.ok) throw new Error('Erro ao buscar itens');
  return res.json();
}

export async function getOrder(id: number): Promise<Order> {
  const res = await fetch(`${getApiBaseUrl()}/orders/${id}`);
  if (!res.ok) throw new Error('Erro ao buscar ordem');
  return res.json();
}

export async function updateOrder(id: number, data: CreateOrderDto): Promise<Order> {
  const res = await fetch(`${getApiBaseUrl()}/orders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message ?? 'Erro ao atualizar ordem');
  }
  return res.json();
}

export async function createOrder(data: CreateOrderDto): Promise<Order> {
  const res = await fetch(`${getApiBaseUrl()}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message ?? 'Erro ao criar ordem');
  }
  return res.json();
}
