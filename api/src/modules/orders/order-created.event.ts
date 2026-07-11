import { DomainEvent } from "src/common/events/domain-event";

export class OrderStatusChangedEvent implements DomainEvent {

    readonly event = 'order.status.changed';
    readonly entity = 'Order';
    readonly action = 'STATUS_CHANGED';
    readonly occurredAt = new Date();
    readonly before: { status: string };
    readonly after: { status: string };

    constructor(
        readonly entityId: number,
        before: string,
        after: string,
        readonly ip?: string,
    ) {
        this.before = { status: before };
        this.after = { status: after };
    }

}