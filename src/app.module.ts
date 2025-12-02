//app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { MemberModule } from './member/member.module';
import { FinanceModule } from './finance/finance.module';
import { ResourceModule } from './resource/resource.module';
import { PrismaModule } from './prisma/prisma.module';
import { MailModule } from './mail/mail.module';
import { BlogModule } from './blog/blog.module';
import { EventModule } from './event/event.module';
import { MeetingsModule } from './meetings/meetings.module';

@Module({
  imports: [
    ConfigModule.forRoot({ // Configuración del módulo de variables de entorno
      isGlobal: true, // Hace que ConfigModule esté disponible en toda la aplicación
      envFilePath: '.env', // Especifica la ruta de tu archivo .env
    }),
    AuthModule, 
    UserModule,
    DashboardModule,
    MemberModule,
    FinanceModule,
    ResourceModule,
    PrismaModule,
    MailModule,
    BlogModule,
    EventModule,
    MeetingsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
