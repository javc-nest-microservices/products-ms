import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { Logger, ValidationPipe } from '@nestjs/common'
import { envs } from './config/envs'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'

async function bootstrap() {
  // * TCP
  // const app = await NestFactory.createMicroservice<MicroserviceOptions>(
  //   AppModule,
  //   {
  //     transport: Transport.TCP,
  //     options: {
  //       port: envs.port,
  //       retryAttempts: 5,
  //       retryDelay: 3000
  //     }
  //   }
  // )

  // * NATS
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.NATS,
      options: {
        servers: envs.natsServers
      }
    }
  )

  const logger = new Logger('ProductsBootstrap')
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true
    })
  )
  await app.listen()
  logger.log(`Products Microservice running on port ${envs.port}`)
}
bootstrap()
