'use client';

import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { useQuery, useMutation } from '@tanstack/react-query';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import Autocomplete, { AutocompleteOption } from '@/components/ui/autocomplete/Autocomplete';
import {
  getOrderStatuses,
  searchCustomers,
  searchItems,
  createOrder,
  getAuthorizedTransportTypes,
} from '@/modules/orders/ordersService';

interface ItemRow {
  item: AutocompleteOption | null;
  quantity: number;
}

interface FormValues {
  customer: AutocompleteOption | null;
  transportTypeId: string;
  orderStatusId: string;
  items: ItemRow[];
}

export default function NewOrder() {
  const router = useRouter();

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      customer: null,
      transportTypeId: '',
      orderStatusId: '',
      items: [{ item: null, quantity: 1 }],
    },
  });

  const selectedCustomer = watch('customer');

  const { data: transportTypes } = useQuery({
    queryKey: ['transport-types', selectedCustomer?.id],
    queryFn: () =>
      selectedCustomer
        ? getAuthorizedTransportTypes(selectedCustomer.id)
        : Promise.resolve([]),
    enabled: !!selectedCustomer,
  });
  const { data: statuses } = useQuery({ queryKey: ['order-statuses'], queryFn: getOrderStatuses });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const mutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => router.push('/orders'),
  });

  const onSubmit = (data: FormValues) => {
    if (!data.customer) return;
    mutation.mutate({
      customerId: data.customer.id,
      transportTypeId: Number(data.transportTypeId),
      orderStatusId: Number(data.orderStatusId),
      items: data.items
        .filter((r) => r.item !== null)
        .map((r) => ({ itemId: r.item!.id, quantity: r.quantity })),
    });
  };

  const selectClass =
    'h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 shadow-theme-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300';

  const errorClass = 'mt-1 text-xs text-red-500';
  const labelClass = 'block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300';

  return (
    <div>
      <PageBreadcrumb pageTitle="Nova Ordem" />
      <div className="space-y-6">
        <ComponentCard title="Dados da Ordem">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div>
                <label className={labelClass}>Cliente</label>
                <Controller
                  control={control}
                  name="customer"
                  rules={{ required: 'Selecione um cliente' }}
                  render={({ field }) => (
                    <Autocomplete
                      queryKey="customers"
                      fetcher={searchCustomers}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Buscar cliente..."
                    />
                  )}
                />
                {errors.customer && <p className={errorClass}>{errors.customer.message}</p>}
              </div>

              <div>
                <label className={labelClass}>Tipo de Transporte</label>
                <select
                  className={selectClass}
                  {...register('transportTypeId', { required: 'Selecione o tipo de transporte' })}
                >
                  <option value="">Selecione...</option>
                  {transportTypes?.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                {errors.transportTypeId && <p className={errorClass}>{errors.transportTypeId.message}</p>}
              </div>

              <div>
                <label className={labelClass}>Status</label>
                <select
                  className={selectClass}
                  {...register('orderStatusId', { required: 'Selecione o status' })}
                >
                  <option value="">Selecione...</option>
                  {statuses?.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                {errors.orderStatusId && <p className={errorClass}>{errors.orderStatusId.message}</p>}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Itens</span>
                <button
                  type="button"
                  onClick={() => append({ item: null, quantity: 1 })}
                  className="text-sm text-brand-500 hover:underline dark:text-brand-400"
                >
                  + Adicionar item
                </button>
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-[1fr_120px_36px] gap-3 items-start">
                    <div>
                      <Controller
                        control={control}
                        name={`items.${index}.item`}
                        rules={{ required: 'Selecione um item' }}
                        render={({ field: f }) => (
                          <Autocomplete
                            queryKey={`item-${index}`}
                            fetcher={searchItems}
                            value={f.value}
                            onChange={f.onChange}
                            placeholder="Buscar item..."
                          />
                        )}
                      />
                      {errors.items?.[index]?.item && (
                        <p className={errorClass}>{errors.items[index].item?.message}</p>
                      )}
                    </div>

                    <div>
                      <input
                        type="number"
                        min={1}
                        className={selectClass}
                        placeholder="Qtd"
                        {...register(`items.${index}.quantity`, {
                          required: 'Obrigatório',
                          min: { value: 1, message: 'Mínimo 1' },
                          valueAsNumber: true,
                        })}
                      />
                      {errors.items?.[index]?.quantity && (
                        <p className={errorClass}>{errors.items[index].quantity?.message}</p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                      className="mt-0 flex h-10 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-400 hover:border-red-400 hover:text-red-500 disabled:opacity-30 dark:border-gray-700"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {mutation.isError && (
              <p className="text-sm text-red-500">Erro ao criar ordem. Tente novamente.</p>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => router.push('/orders')}
                className="h-10 rounded-lg border border-gray-300 px-5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="h-10 rounded-lg bg-brand-500 px-5 text-sm text-white hover:bg-brand-600 disabled:opacity-60"
              >
                {mutation.isPending ? 'Salvando...' : 'Salvar Ordem'}
              </button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </div>
  );
}
