import { OnEvent } from '@nestjs/event-emitter';
import { OrderStatusChangedEvent } from "../orders/order-status-changed.event";
import { AuditLogsService } from "./audit-logs.service";
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuditLogsListener {

   constructor(
      private readonly auditLogsService: AuditLogsService,
   ) {}

   @OnEvent(OrderStatusChangedEvent.name)
   async handle(event: OrderStatusChangedEvent) {

      await this.auditLogsService.create({

         entity: event.entity,

         entityId: event.entityId,

         action: event.action,

         before: event.before,

         after: event.after,

      });

   }

}
