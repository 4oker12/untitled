import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { GlobalHttpExceptionFilter } from './common/http-exception.filter';
import { exec } from 'node:child_process';
import { platform } from 'node:os';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

function getConfiguredPort(): number {
  const raw = process.env.PORT;
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) && n > 0 ? n : 4001;
}

function freePort(port: number): Promise<void> {
  return new Promise((resolve) => {
    const isWin = platform() === 'win32';
    if (isWin) {
      // Find PIDs listening on :port, then taskkill them forcefully. findstr is fine on Windows.
      const findCmd = `netstat -ano | findstr :${port}`;
      exec(findCmd, { windowsHide: true }, (err, stdout) => {
        if (err || !stdout) return resolve();
        const pids = Array.from(new Set(stdout
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter(Boolean)
          .map((line) => line.split(/\s+/).pop())
        )).filter((x): x is string => !!x);
        if (pids.length === 0) return resolve();
        let remaining = pids.length;
        pids.forEach((pid) => {
          exec(`taskkill /PID ${pid} /F`, { windowsHide: true }, () => {
            remaining -= 1;
            if (remaining === 0) resolve();
          });
        });
      });
    } else {
      // On POSIX, lsof may not be installed in some environments, so ignore errors.
      const killCmd = `sh -c "pids=\`lsof -ti :${port} 2>/dev/null\`; if [ -n \"$pids\" ]; then kill -9 $pids 2>/dev/null || true; fi"`;
      exec(killCmd, () => resolve());
    }
  });
}

async function findAvailablePort(start: number, attempts = 10): Promise<number> {
  const net = await import('node:net');
  const tryPort = (port: number) =>
    new Promise<boolean>((resolve) => {
      const server = net.createServer();
      server.once('error', () => resolve(false));
      server.once('listening', () => {
        server.close(() => resolve(true));
      });
      server.listen(port, '0.0.0.0');
    });

  let port = start;
  for (let i = 0; i < attempts; i++) {
    // eslint-disable-next-line no-await-in-loop
    const free = await tryPort(port);
    if (free) return port;
    port += 1;
  }
  return start; // fallback to start; app.listen may still throw if all were busy
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for future frontend consumption
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000', process.env.FRONTEND_URL].filter(Boolean) as string[],
    credentials: true
  });

  // Use cookie-parser middleware
  app.use(cookieParser());

  // Use helmet middleware for security headers
  app.use(helmet({ crossOriginResourcePolicy: false }));

  // Global validation and error filter
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new GlobalHttpExceptionFilter());

  const config = app.get(ConfigService);
  const desiredPort = Number(config.get('PORT')) || 4001;
  const port = await findAvailablePort(desiredPort);

  // Register shutdown handlers before listen()
  const configured = getConfiguredPort();
  const handleSignal = async (sig: NodeJS.Signals) => {
    // eslint-disable-next-line no-console
    console.log(
      JSON.stringify(
        {
          status: 'stopping',
          signal: sig,
          message: `Shutting down, freeing port ${configured}`,
        },
        null,
        2,
      ),
    );
    try {
      await app.close();
    } catch {
      // ignore
    }
    await freePort(configured).catch(() => undefined);
    process.exit(0);
  };
  process.once('SIGINT', handleSignal);
  process.once('SIGTERM', handleSignal);

  // Startup JSON banner
  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify(
      {
        status: 'starting',
        env: process.env.NODE_ENV ?? 'development',
        graphql: `http://localhost:${port}/graphql`,
        rest: ['GET /health', 'GET /debug', 'GET /users', 'GET /users/:id'],
        db: 'sqlite:backend/prisma/dev.db',
        port,
        requestedPort: desiredPort,
        note: port !== desiredPort ? 'requested port busy, using next available' : undefined,
      },
      null,
      2,
    ),
  );

  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://localhost:${port}`);
}
bootstrap();
