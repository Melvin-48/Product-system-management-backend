import * as dns from 'node:dns';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

function configureDns() {
  const loopback = new Set(['127.0.0.1', '::1']);
  const servers = dns.getServers().filter((s) => !loopback.has(s));
  if (servers.length > 0) {
    dns.setServers(servers);
    return;
  }
  const fallback = (process.env.DNS_SERVERS ?? '8.8.8.8,8.8.4.4')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  dns.setServers(fallback);
  console.warn(`[dns] Using fallback DNS servers: ${fallback.join(', ')}`);
}

async function bootstrap() {
  configureDns();
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = [
    'http://localhost:4200',
    process.env.FRONTEND_URL,
  ].filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalFilters(new AllExceptionsFilter());

  const config = new DocumentBuilder()
    .setTitle('Product Management System API')
    .setDescription('Backend API for the PMS project')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();