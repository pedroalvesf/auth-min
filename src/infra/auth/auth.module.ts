import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ThrottlerModule } from "@nestjs/throttler";
import { JwtStrategy } from "./jwt.strategy";
import { APP_GUARD } from "@nestjs/core";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { CustomThrottlerGuard } from "./guards/throttler.guard";
import { EnvModule } from "@/infra/env/env.module";
import { EnvService } from "@/infra/env/env.service";
import { DatabaseModule } from "@/infra/database/database.module";

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "jwt" }),
    DatabaseModule,
    EnvModule,
    ThrottlerModule.forRootAsync({
      inject: [EnvService],
      useFactory: (envService: EnvService) => ({
        throttlers: [
          {
            name: 'short',
            ttl: 1000,
            limit: 10,
          },
          {
            name: 'medium',
            ttl: 60000,
            limit: 100,
          },
          {
            name: 'long',
            ttl: 3600000,
            limit: 1000,
          },
          {
            name: 'auth',
            ttl: 900000,
            limit: 5,
          }
        ],
        skipIf: () => process.env.NODE_ENV === 'test',
      }),
    }),
    JwtModule.registerAsync({
      imports: [EnvModule],
      inject: [EnvService],
      global: true,
      useFactory(env: EnvService) {
        return {
          secret: env.get("JWT_SECRET"),
          signOptions: { algorithm: "HS256" },
        };
      },
    }),
  ],
  providers: [
    JwtStrategy, 
    JwtAuthGuard,
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
  exports: [JwtAuthGuard, CustomThrottlerGuard],
})
export class AuthModule {}
