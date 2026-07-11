import { DomainEvent } from "src/common/events/domain-event";

export class AppointmentConfirmedEvent implements DomainEvent {
    readonly event = 'appointment.confirmed';
    readonly entity = 'Appointment';
    readonly action = 'CONFIRMED';
    readonly occurredAt = new Date();

    constructor(
        readonly entityId: number,
        readonly ip?: string,
    ) {}
}
