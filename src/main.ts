//main.ts
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { CleanRutPipe } from './member/pipes/clean-rut.pipe';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  dotenv.config();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  //Middleware de logging
  app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
  });

    //Configuración de Cors
  app.enableCors({
    origin: 'http://localhost:5173', // Asegúrate que coincida con tu puerto frontend
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    preflightContinue: false, // Importante para manejar OPTIONS correctamente
    optionsSuccessStatus: 204
  });

  // ⚠️ Servir archivos estáticos desde /uploads (SE COMENTA YA QUE SE IMPLEMENTÓ https://console.cloudinary.com/)
 // Esto hace que los archivos sean accesibles públicamente desde /uploads
  // app.useStaticAssets(join(__dirname, '..', 'uploads'), {
//   prefix: '/uploads',
// });


  // ✅ Pipes globales
  app.useGlobalPipes(
    new CleanRutPipe(),
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ✅ Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('API de Miembros')
    .setDescription('Documentación completa de los endpoints de la API para gestión de miembros')
    .setVersion('1.0')
    .addTag('miembros', 'Operaciones relacionadas con miembros')
    .addTag('users', 'Operaciones relacionadas con usuarios') // Agrega más tags según tus controladores
    .addBearerAuth( // Si usas autenticación JWT
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingresa el token JWT',
        in: 'header',
      },
      'JWT-auth', // Este nombre debe coincidir con el usado en @ApiBearerAuth('JWT-auth')
    )
    .addServer(`http://localhost:${process.env.PORT ?? 3000}`, 'Servidor local')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  // Configuración mejorada de Swagger UI
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'API Documentation',
    swaggerOptions: {
      persistAuthorization: true, // Mantiene el token entre recargas
      tagsSorter: 'alpha', // Ordena los tags alfabéticamente
      operationsSorter: 'alpha', // Ordena las operaciones alfabéticamente
    },
    customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .information-container { background-color: #fafafa; }
    `,
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation available at: http://localhost:${port}/api/docs`);
}

bootstrap();