import { Injectable } from '@nestjs/common';
import { Either, right } from '@/core/either';
import { Permission } from '../../enterprise/entities/permission';
import { PermissionsRepository } from '../repositories/permissions-repository';

type ListPermissionsUseCaseResponse = Either<
  never,
  {
    permissions: Permission[];
  }
>;

@Injectable()
export class ListPermissionsUseCase {
  constructor(private permissionsRepository: PermissionsRepository) {}

  async execute(): Promise<ListPermissionsUseCaseResponse> {
    const permissions = await this.permissionsRepository.findMany();

    return right({ permissions });
  }
}
