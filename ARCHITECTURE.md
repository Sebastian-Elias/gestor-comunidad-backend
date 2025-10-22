Arquitectura del Sistema - Plataforma Iglesia
📋 Información del Proyecto

Nombre: iglesia-platform
Versión: 0.0.1
Stack: NestJS 11 + PostgreSQL + Prisma + Cloudinary
Node.js: ^18.19.1 || ^20.11.1 || >=22.0.0
Licencia: UNLICENSED
🏗️ Diagrama de Arquitectura
text

┌─────────────────┐ ┌──────────────────┐ ┌─────────────────┐
│ Client │ │ NestJS API │ │ PostgreSQL │
│ (Web/Mobile) │◄──►│ v11.0.1 │◄──►│ Database │
│ │ │ │ │ │
└─────────────────┘ └──────────────────┘ └─────────────────┘
│
┌─────────┼─────────┐
▼ ▼ ▼
┌─────────┐ ┌───────┐ ┌─────────┐
│Cloudinary│ │Email │ │Swagger │
│(Storage)│ │Service│ │(Docs) │
└─────────┘ └───────┘ └─────────┘

📁 Estructura del Proyecto
text

src/
├── 🛡️ auth/ # Autenticación & Autorización
│ ├── dto/  
│ │ ├── login.dto.ts # { email, password }
│ │ └── register.dto.ts # User registration
│ ├── jwt/
│ │ ├── jwt.guard.ts # JWT protection guard
│ │ └── jwt.strategy.ts # Passport JWT strategy
│ ├── roles.decorator.ts # @Roles() decorator
│ └── roles.guard.ts # Role-based authorization
│
├── 👤 user/ # User Management
│ ├── dto/
│ │ ├── create-user.dto.ts # User creation DTO
│ │ └── update-user.dto.ts # User update DTO
│ ├── user.controller.ts # User endpoints
│ ├── user.service.ts # User business logic
│ └── user.module.ts # User module
│
├── 👥 member/ # Member Management
│ ├── dto/
│ │ ├── create-member.dto.ts # Member creation
│ │ └── update-member.dto.ts # Member update
│ ├── pipes/
│ │ └── clean-rut.pipe.ts # Chilean RUT validation
│ ├── member.controller.ts # Member endpoints
│ ├── member.service.ts # Member business logic
│ └── member.module.ts # Member module
│
├── 💰 finance/ # Financial System
│ ├── dto/
│ │ ├── create-finance-entry.dto.ts # Finance entry creation
│ │ └── update-finance-entry.dto.ts # Finance entry update
│ ├── finance.controller.ts # Finance endpoints
│ ├── finance.service.ts # Finance business logic
│ └── finance.module.ts # Finance module
│
├── 📊 dashboard/ # Dashboard & Analytics
│ ├── dashboard.controller.ts # Dashboard endpoints
│ ├── dashboard.service.ts # Reporting logic
│ └── dashboard.module.ts # Dashboard module
│
├── 📧 mail/ # Email System
│ ├── templates/  
│ │ ├── reset-password.hbs # Password reset template
│ │ └── user-invitation.hbs # User invitation template
│ ├── mail.service.ts # Email sending service
│ └── mail.module.ts # Mail module
│
├── 🗃️ prisma/ # Data Layer
│ ├── prisma.service.ts # Prisma service
│ ├── prisma.module.ts # Prisma module
│ └── schema.prisma # Database schema
│
├── 🎯 common/ # Common Utilities
│ └── validators/
│ └── is-rut.validator.ts # Custom RUT validator
│
├── 🏠 app.module.ts # Root application module
├── main.ts # Application entry point
└── app.controller.ts # Main controller

🗄️ Database Schema (Prisma)
Core Models
prisma

// USER MANAGEMENT
model User {
id Int @id @default(autoincrement())
email String @unique
password String?
role Role @default(MIEMBRO)
createdAt DateTime @default(now())
// Relations
member Member?
resources Resource[]
passwordResetTokens PasswordResetToken[]
createdFinanceEntries FinanceEntry[] @relation("FinanceCreatedBy")
updatedFinanceEntries FinanceEntry[] @relation("FinanceUpdatedBy")
}

// MEMBER MANAGEMENT  
model Member {
id Int @id @default(autoincrement())
firstName String
lastName String
rut String? @unique // Chilean RUT
phone String?
address String?
incorporationDate DateTime? // Membership date
baptismDate DateTime? // Baptism date
photoUrl String? // Cloudinary URL
birthDate DateTime?
email String?
passport String? @unique // For foreigners
isMale Boolean?
isActive Boolean @default(true)
// Relations
user User?
}

// FINANCIAL SYSTEM
model FinanceEntry {
id Int @id @default(autoincrement())
type FinanceType // INCOME/EXPENSE
amount Float
currency Currency @default(CLP)
date DateTime
description String
paymentMethod PaymentMethod // CASH/TRANSFER/CHECK/CARD/OTHER
// Additional fields
referenceNumber String?
donorName String?
beneficiary String?
comments String?
// Audit
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
// Relations
category FinanceCategory @relation(fields: [categoryId], references: [id])
categoryId Int
createdBy User? @relation("FinanceCreatedBy", fields: [createdById], references: [id])
createdById Int?
updatedBy User? @relation("FinanceUpdatedBy", fields: [updatedById], references: [id])
updatedById Int?
}

// FILE MANAGEMENT
model Resource {
id Int @id @default(autoincrement())
title String
description String?
fileUrl String // Cloudinary URL
uploadedAt DateTime @default(now())
// Relations
uploadedBy User @relation(fields: [uploadedById], references: [id])
uploadedById Int
}

Enums
prisma

enum Role {
ADMIN
LIDER
MIEMBRO
PASTOR
PASTORA
}

enum FinanceType {
INCOME
EXPENSE
}

enum PaymentMethod {
CASH
TRANSFER
CHECK
CARD
OTHER
}

enum Currency {
CLP
USD
EUR
}

🛡️ Security & Authentication
JWT Flow
text

Login → JWT Generation → Route Protection → Role Validation → Access

Role Hierarchy
Role Permissions
ADMIN Full system access
PASTOR/PASTORA Spiritual + financial + member management
LIDER Limited member + resource management
MIEMBRO Basic access, personal information
Security Guards

    JwtGuard: JWT token validation

    RolesGuard: Role-based authorization

📧 Email System
Templates

    reset-password.hbs: Password recovery

    user-invitation.hbs: User invitation

Configuration
typescript

// Required environment variables
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-password

☁️ File Storage (Cloudinary)
Configuration
typescript

// Cloudinary setup for file uploads
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

📚 API Documentation
Swagger Integration

    Path: /api/docs

    Package: @nestjs/swagger v11.2.0

    UI: swagger-ui-express v5.0.1

🔧 Technical Stack
Core Dependencies
json

{
"@nestjs/common": "^11.0.1",
"@nestjs/core": "^11.0.1",
"@prisma/client": "^6.12.0",
"cloudinary": "^1.41.3",
"bcrypt": "^6.0.0",
"passport-jwt": "^4.0.1",
"nodemailer": "^7.0.5"
}

Development Dependencies
json

{
"@nestjs/cli": "^11.0.0",
"prisma": "^6.12.0",
"typescript": "^5.7.3",
"jest": "^29.7.0",
"eslint": "^9.18.0"
}

⚙️ Environment Configuration
Required Variables
env

# Database

DATABASE_URL="postgresql://user:pass@host:5432/dbname"

# JWT

JWT_SECRET="your-jwt-secret-key"

# Email

SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Cloudinary

CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Application

NODE_ENV="development"
PORT="3000"

🎯 Development Patterns
Module Structure
typescript

@Module({
imports: [PrismaModule, /* feature modules */],
controllers: [FeatureController],
providers: [FeatureService],
exports: [FeatureService],
})
export class FeatureModule {}

Service Pattern
typescript

@Injectable()
export class FeatureService {
constructor(private prisma: PrismaService) {}

async create(dto: CreateFeatureDto, userId: number) {
try {
// Business validation
// Prisma operation
const result = await this.prisma.model.create({
data: { ...dto, createdById: userId },
include: { relations: true }
});
return result;
} catch (error) {
throw new HttpException('Operation failed', HttpStatus.BAD_REQUEST);
}
}
}

Controller Pattern
typescript

@Controller('features')
@UseGuards(JwtGuard, RolesGuard)
export class FeatureController {
constructor(private featureService: FeatureService) {}

@Post()
@Roles(Role.ADMIN)
async create(@Body() dto: CreateFeatureDto, @Req() req: Request) {
return this.featureService.create(dto, req.user.sub);
}
}

🔄 Business Flows

1. User Registration
   text

Invitation → User Creation → Password Setup → JWT Generation

2. Member Management
   text

Member Creation → RUT Validation → User Association → Profile Completion

3. Financial Process
   text

Entry Creation → Category Validation → Amount Processing → Audit Trail

4. File Management
   text

File Upload → Cloudinary Storage → Database Record → Access Control

📝 AI Assistant Guidelines
✅ REQUIRED BEHAVIORS

    Module Structure

        Follow existing file organization

        Use NestJS modules, services, controllers pattern

        Maintain separation of concerns

    Data Validation

        Implement DTOs with class-validator

        Use custom pipes when needed

        Validate Chilean RUT with existing validators

    Security

        Apply role guards on sensitive endpoints

        Never expose passwords in responses

        Validate user permissions before operations

    Database Operations

        Use Prisma for all DB operations

        Implement relations correctly

        Handle transactions when necessary

    Error Handling

        Use try/catch in all async operations

        Provide appropriate error messages

        Log errors for debugging

❌ PROHIBITED BEHAVIORS

    Schema Modification

        Do not modify schema.prisma without migration

        Do not remove existing relations

        Do not change enums without code updates

    Security

        Do not skip role validation

        Do not store passwords in plain text

        Do not expose sensitive information in logs

    Architecture

        Do not create endpoints without validation DTOs

        Do not omit service layer for business logic

        Do not implement logic directly in controllers

    Code Quality

        Do not use any types in TypeScript

        Do not omit error handling

        Do not duplicate existing functionality

🔧 CODE TEMPLATES

Service Template:
typescript

@Injectable()
export class FeatureService {
constructor(private prisma: PrismaService) {}

async create(data: CreateDto, userId: number) {
try {
// Business validation
// Prisma operation
const result = await this.prisma.model.create({
data: { ...data, createdById: userId },
include: { relations: true }
});
return result;
} catch (error) {
throw new HttpException('Error message', HttpStatus.BAD_REQUEST);
}
}
}

Controller Template:
typescript

@Controller('features')
@UseGuards(JwtGuard, RolesGuard)
export class FeatureController {
constructor(private featureService: FeatureService) {}

@Post()
@Roles(Role.ADMIN)
async create(@Body() dto: CreateFeatureDto, @Req() req: Request) {
return this.featureService.create(dto, req.user.sub);
}
}

🚀 Available Scripts
bash

# Development

npm run start:dev # Development mode with watch
npm run start:debug # Debug mode

# Building

npm run build # Build project
npm run start:prod # Production start

# Code Quality

npm run lint # ESLint with auto-fix
npm run format # Prettier formatting

# Testing

npm run test # Unit tests
npm run test:watch # Tests with watch
npm run test:e2e # E2E tests
