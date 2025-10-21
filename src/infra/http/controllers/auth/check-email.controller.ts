import { CheckEmailUseCase } from '@/domain/auth/application/use-cases/check-email'
import { Controller, Get, Query } from '@nestjs/common'
import { CheckEmailDto } from '../dto/check-email-dto'
import { Public } from '@/infra/auth/public'

@Controller('register/check-email')
@Public()
export class CheckEmailController {
  constructor(private checkEmailUseCase: CheckEmailUseCase) {}

  @Get()
  async handle(@Query() query: CheckEmailDto) {
    const result = await this.checkEmailUseCase.execute({ email: query.email })

    return {
      taken: result.value?.user ? true : false,
      message: result.value?.user !== null ? 'E-mail já cadastrado.' : 'E-mail não encontrado.'
    }
  }
}
