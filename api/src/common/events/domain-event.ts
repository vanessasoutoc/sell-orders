export interface DomainEvent {
    readonly event: string;
    readonly entity: string;
    readonly entityId: number | string;
    readonly action: string;
    readonly before?: unknown;
    readonly after?: unknown;
    readonly ip?: string;
    readonly metadata?: Record<string, unknown>;
    readonly occurredAt: Date;
}