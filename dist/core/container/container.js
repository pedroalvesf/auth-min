"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.container = exports.Container = void 0;
class Container {
    constructor() {
        this.services = new Map();
        this.factories = new Map();
    }
    // Registrar instância singleton
    register(token, instance) {
        this.services.set(token, instance);
    }
    // Registrar factory
    registerFactory(token, factory) {
        this.factories.set(token, factory);
    }
    // Registrar classe para auto-instanciação
    registerClass(token, constructor, dependencies = []) {
        this.registerFactory(token, () => {
            const deps = dependencies.map(dep => this.resolve(dep));
            return new constructor(...deps);
        });
    }
    // Resolver dependência
    resolve(token) {
        // Primeiro verifica se é uma instância
        if (this.services.has(token)) {
            return this.services.get(token);
        }
        // Depois verifica se é uma factory
        if (this.factories.has(token)) {
            const factory = this.factories.get(token);
            const instance = factory();
            // Cache como singleton
            this.services.set(token, instance);
            return instance;
        }
        throw new Error(`Service not found: ${String(token)}`);
    }
    // Verificar se existe
    has(token) {
        return this.services.has(token) || this.factories.has(token);
    }
}
exports.Container = Container;
// Container global
exports.container = new Container();
