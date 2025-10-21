import 'reflect-metadata'
import 'dotenv/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  
  // Enable CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
  })

  const port = parseInt(process.env.PORT || '3000')
  
  await app.listen(port)
  
  console.log(`🚀 Auth service running on port ${port}`)
  console.log(`📦 NestJS DI configurado`)
  console.log(`💾 Memory usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`)
}

bootstrap().catch(console.error)