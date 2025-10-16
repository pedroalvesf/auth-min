"use strict";
// import { Entity } from "@/core/entities/entity";
// import { UniqueEntityID } from "@/core/entities/unique-entity-id";
// interface PermissionProps {
//   name: string;
//   description: string;
//   createdAt: Date;
//   updatedAt?: Date;
// }
// export class Permission extends Entity<PermissionProps> {
//   get name() {
//     return this.props.name;
//   }
//   get description() {
//     return this.props.description;
//   }
//   get createdAt() {
//     return this.props.createdAt;
//   }
//   get updatedAt() {
//     return this.props.updatedAt;
//   }
//   set description(description: string) {
//     this.props.description = description;
//     this.touch();
//   }
//   private touch() {
//     this.props.updatedAt = new Date();
//   }
//   static create(props: PermissionProps, id?: UniqueEntityID) {
//     const permission = new Permission(props, id);
//     return permission;
//   }
// }
