/*
 * SISTEMA DE CONTAINERIZAÇÃO CUSTOMIZADO
 * Este código foi substituído pelo sistema de DI do NestJS
 * Mantido comentado para referência futura
 */

export type Constructor<T = any> = new (...args: any[]) => T;
export type Factory<T = any> = () => T;

export class Container {
  private services = new Map<string | symbol, any>();
  private factories = new Map<string | symbol, Factory>();

  // Registrar instância singleton
  register<T>(token: string | symbol, instance: T): void {
    this.services.set(token, instance);
  }

  // Registrar factory
  registerFactory<T>(token: string | symbol, factory: Factory<T>): void {
    this.factories.set(token, factory);
  }

  // Registrar classe para auto-instanciação
  registerClass<T>(token: string | symbol, constructor: Constructor<T>, dependencies: (string | symbol)[] = []): void {
    this.registerFactory(token, () => {
      const deps = dependencies.map(dep => this.resolve(dep));
      return new constructor(...deps);
    });
  }

  // Resolver dependência
  resolve<T>(token: string | symbol): T {
    // Primeiro verifica se é uma instância
    if (this.services.has(token)) {
      return this.services.get(token);
    }

    // Depois verifica se é uma factory
    if (this.factories.has(token)) {
      const factory = this.factories.get(token)!;
      const instance = factory();
      // Cache como singleton
      this.services.set(token, instance);
      return instance;
    }

    throw new Error(`Service not found: ${String(token)}`);
  }

  // Verificar se existe
  has(token: string | symbol): boolean {
    return this.services.has(token) || this.factories.has(token);
  }
}

// Container global
export const container = new Container();