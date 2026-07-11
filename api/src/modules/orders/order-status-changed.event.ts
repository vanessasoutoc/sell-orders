import { DomainEvents } from "src/common/events/domain-events";
import { OrderStatus } from "../order-status/order-status.model";
import { DomainEvent } from "src/common/events/domain-event";

export class OrderStatusChangedEvent implements DomainEvent {
  readonly event = DomainEvents.ORDER_STATUS_CHANGED;
  readonly entity = 'Order';
  readonly action = 'STATUS_CHANGED';
  readonly occurredAt = new Date();

  constructor(
    public readonly entityId: number,
    public readonly before: { status: OrderStatus },
    public readonly after: { status: OrderStatus },
    public readonly userId?: number,
  ) {}
}