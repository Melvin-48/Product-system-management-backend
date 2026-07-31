import * as dns from 'node:dns';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

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
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
