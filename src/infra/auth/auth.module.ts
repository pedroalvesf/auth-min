import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "./jwt.strategy";
import { APP_GUARD } from "@nestjs/core";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { EnvModule } from "@/infra/env/env.module";
import { EnvService } from "@/infra/env/env.service";
import { DatabaseModule } from "@/infra/database/database.module";

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "jwt" }),
    DatabaseModule,
    EnvModule,
    JwtModule.registerAsync({
      imports: [EnvModule],
      inject: [EnvService],
      global: true,
      useFactory(env: EnvService) {
        const privateKeyBase64 = env.get("JWT_PRIVATE_KEY");
        const publicKeyBase64 = env.get("JWT_PUBLIC_KEY");

        return {
          signOptions: { algorithm: "RS256" },
          privateKey: Buffer.from(privateKeyBase64, "base64").toString("utf-8"),
          publicKey: Buffer.from(publicKeyBase64, "base64").toString("utf-8"),
        };
      },
    }),
  ],
  providers: [JwtStrategy, JwtAuthGuard],
  exports: [JwtAuthGuard],
})
export class AuthModule {}
