import { AggregateRoot } from '../entities/aggregate-root';
import { UniqueEntityID } from '../entities/unique-entity-id';
import { DomainEvent } from './domain-event';

type DomainEventCallback = (event: DomainEvent) => void;

export class DomainEvents {
  private static instance: DomainEvents;
  private handlersMap: Record<string, DomainEventCallback[]> = {};
  private markedAggregates: AggregateRoot<unknown>[] = [];

  private constructor() {}

  public static getInstance(): DomainEvents {
    if (!DomainEvents.instance) {
      DomainEvents.instance = new DomainEvents();
    }
    return DomainEvents.instance;
  }

  public markAggregateForDispatch(aggregate: AggregateRoot<unknown>) {
    const aggregateFound = !!this.findMarkedAggregateByID(aggregate.id);

    if (!aggregateFound) {
      this.markedAggregates.push(aggregate);
    }
  }

  private dispatchAggregateEvents(aggregate: AggregateRoot<unknown>) {
    aggregate.domainEvents.forEach((event: DomainEvent) =>
      this.dispatch(event)
    );
  }

  private removeAggregateFromMarkedDispatchList(
    aggregate: AggregateRoot<unknown>
  ) {
    const index = this.markedAggregates.findIndex((a) => a.equals(aggregate));
    this.markedAggregates.splice(index, 1);
  }

  private findMarkedAggregateByID(
    id: UniqueEntityID
  ): AggregateRoot<unknown> | undefined {
    return this.markedAggregates.find((aggregate) => aggregate.id.equals(id));
  }

  public dispatchEventsForAggregate(id: UniqueEntityID) {
    const aggregate = this.findMarkedAggregateByID(id);

    if (aggregate) {
      this.dispatchAggregateEvents(aggregate);
      aggregate.clearEvents();
      this.removeAggregateFromMarkedDispatchList(aggregate);
    }
  }

  public register(callback: DomainEventCallback, eventClassName: string) {
    const wasEventRegisteredBefore = eventClassName in this.handlersMap;

    if (!wasEventRegisteredBefore) {
      this.handlersMap[eventClassName] = [];
    }

    this.handlersMap[eventClassName].push(callback);
  }

  public clearHandlers() {
    this.handlersMap = {};
  }

  public clearMarkedAggregates() {
    this.markedAggregates = [];
  }

  private dispatch(event: DomainEvent) {
    const eventClassName: string = event.constructor.name;
    const isEventRegistered = eventClassName in this.handlersMap;

    if (isEventRegistered) {
      const handlers = this.handlersMap[eventClassName];

      for (const handler of handlers) {
        try {
          handler(event);
        } catch (error) {
          console.error('Error executing event handler:', error);
        }
      }
    }
  }
}
