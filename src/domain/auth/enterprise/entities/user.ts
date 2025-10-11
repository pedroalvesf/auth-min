import { Entity } from "../../../../core/entities/entity";
import { UniqueEntityID } from "../../../../core/entities/unique-entity-id";
import { Role } from "./role";

export interface UserProps {
  email: string;
  password: string;
  name?: string;
  role: Role;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class User extends Entity<UserProps> {
  get email() {
    return this.props.email;
  }

  get password() {
    return this.props.password;
  }

  get name() {
    return this.props.name;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get role() {
    return this.props.role;
  }

  get isActive() {
    return this.props.isActive;
  }

  get lastLoginAt() {
    return this.props.lastLoginAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  set password(password: string) {
    this.props.password = password;
    this.touch();
  }

  set name(name: string | undefined) {
    this.props.name = name;
    this.touch();
  }

  set role(role: Role) {
    this.props.role = role;
    this.touch();
  }

  set isActive(isActive: boolean) {
    this.props.isActive = isActive;
    this.touch();
  }

  updateLastLogin() {
    this.props.lastLoginAt = new Date();
    this.touch();
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  static create(
    props: Omit<UserProps, "createdAt" | "updatedAt" | "role" | "isActive">,
    id?: UniqueEntityID
  ) {
    const now = new Date();
    return new User(
      {
        ...props,
        role: Role.USER,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      id
    );
  }

  static reconstruct(props: UserProps, id?: UniqueEntityID) {
    return new User(props, id);
  }
}
