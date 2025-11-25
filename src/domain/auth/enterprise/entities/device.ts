import { Entity } from '@/core/entities/entity';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Optional } from '@/core/types/optional';

export interface DeviceProps {
  userId: UniqueEntityID;
  name: string;
  type: string;
  operatingSystem: string;
  ipAddress: string;
  browser: string;
  location: string;
  lastLogin: Date;
  createdAt: Date;
  updatedAt?: Date;
  active: boolean;
}

export class Device extends Entity<DeviceProps> {
  get userId() {
    return this.props.userId;
  }

  get name() {
    return this.props.name;
  }

  get type() {
    return this.props.type;
  }

  get operatingSystem() {
    return this.props.operatingSystem;
  }

  get ipAddress() {
    return this.props.ipAddress;
  }

  get lastLogin() {
    return this.props.lastLogin;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  get active() {
    return this.props.active;
  }

  get browser() {
    return this.props.browser;
  }

  get location() {
    return this.props.location;
  }

  set lastLogin(lastLogin: Date) {
    this.props.lastLogin = lastLogin;
    this.touch();
  }

  set active(active: boolean) {
    this.props.active = active;
    this.touch();
  }

  deactivate() {
    this.props.active = false;
    this.touch();
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  static create(
    props: Optional<DeviceProps, 'createdAt' | 'lastLogin'>,
    id?: UniqueEntityID
  ) {
    const device = new Device(
      {
        ...props,
        location: props.location ?? 'unknown',
        createdAt: props.createdAt ?? new Date(),
        lastLogin: props.lastLogin ?? new Date(),
      },
      id
    );

    return device;
  }
}
