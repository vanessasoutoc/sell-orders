export class AuditEvent {
  constructor(
    public readonly entity: string,
    public readonly entityId: number,
    public readonly action: string,
    public readonly before: object | null,
    public readonly after: object | null,
    public readonly ip?: string,
    public readonly metadata?: object,
  ) {}
}
