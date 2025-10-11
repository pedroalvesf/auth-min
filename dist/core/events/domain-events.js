"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainEvents = void 0;
class DomainEvents {
    constructor() {
        this.handlersMap = {};
        this.markedAggregates = [];
    }
    static getInstance() {
        if (!DomainEvents.instance) {
            DomainEvents.instance = new DomainEvents();
        }
        return DomainEvents.instance;
    }
    markAggregateForDispatch(aggregate) {
        const aggregateFound = !!this.findMarkedAggregateByID(aggregate.id);
        if (!aggregateFound) {
            this.markedAggregates.push(aggregate);
        }
    }
    dispatchAggregateEvents(aggregate) {
        aggregate.domainEvents.forEach((event) => this.dispatch(event));
    }
    removeAggregateFromMarkedDispatchList(aggregate) {
        const index = this.markedAggregates.findIndex(a => a.equals(aggregate));
        this.markedAggregates.splice(index, 1);
    }
    findMarkedAggregateByID(id) {
        return this.markedAggregates.find(aggregate => aggregate.id.equals(id));
    }
    dispatchEventsForAggregate(id) {
        const aggregate = this.findMarkedAggregateByID(id);
        if (aggregate) {
            this.dispatchAggregateEvents(aggregate);
            aggregate.clearEvents();
            this.removeAggregateFromMarkedDispatchList(aggregate);
        }
    }
    register(callback, eventClassName) {
        const wasEventRegisteredBefore = eventClassName in this.handlersMap;
        if (!wasEventRegisteredBefore) {
            this.handlersMap[eventClassName] = [];
        }
        this.handlersMap[eventClassName].push(callback);
    }
    clearHandlers() {
        this.handlersMap = {};
    }
    clearMarkedAggregates() {
        this.markedAggregates = [];
    }
    dispatch(event) {
        const eventClassName = event.constructor.name;
        const isEventRegistered = eventClassName in this.handlersMap;
        if (isEventRegistered) {
            const handlers = this.handlersMap[eventClassName];
            for (const handler of handlers) {
                try {
                    handler(event);
                }
                catch (error) {
                    console.error('Erro ao executar o handler:', error);
                }
            }
        }
    }
}
exports.DomainEvents = DomainEvents;
