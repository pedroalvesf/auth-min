import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "./infra/database/database.module";
import { CryptographyModule } from "./infra/cryptography/cryptography.module";
import { HttpModule } from "./infra/http/http.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    DatabaseModule,
    CryptographyModule,
    HttpModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
