import { Injectable } from "@nestjs/common";
import { DomainEvent } from "./domain-event";
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class EventPublisher {

    constructor(
        private readonly emitter: EventEmitter2,
    ) {}

    publish(event: DomainEvent) {

        this.emitter.emit(event.event, event);

    }

}