# 🙏 Iglesia Platform

### Sistema de Gestión Integral para Iglesias Cristianas

<p align="center">
  <a href="http://nestjs.com/" target="_blank">
    <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="NestJS Logo" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/nestjs-11.0.1-e0234e" alt="NestJS Version" />
  <img src="https://img.shields.io/badge/prisma-6.12.0-2D3748" alt="Prisma Version" />
  <img src="https://img.shields.io/badge/postgresql-15+-336791" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License" />
</p>

---

Sistema de gestión integral para iglesias cristianas.  
Desarrollado con **NestJS**, **Prisma** y **PostgreSQL**, ofrece herramientas modernas para la administración de **miembros, finanzas, gestión de blog, eventos, y calendario** eclesiásticas.

[👉 Ver Frontend del Proyecto](https://github.com/Sebastian-Elias/gestor-comunidad-frontend)

✨ Características Principales
👥 Gestión de Miembros

    Registro completo de información de miembros

    Validación de RUT chileno

    Historial espiritual (bautismo, incorporación)

    Fotos de perfil y datos de contacto

💰 Sistema Financiero

    Control de ingresos y egresos

    Múltiples métodos de pago (efectivo, transferencia, cheque)

    Soporte para múltiples monedas (CLP, USD, EUR)

    Categorización de transacciones

    Auditoría completa de movimientos

🛡️ Sistema de Autenticación

    Autenticación JWT segura

    Roles de usuario (Admin, Pastor, Líder, Miembro)

    Recuperación de contraseñas

    Invitación de nuevos usuarios

📁 Gestión de Recursos

    Almacenamiento en Cloudinary

    Subida de archivos y documentos

    Organización y categorización

📊 Dashboard y Reportes

    Métricas financieras

    Estadísticas de miembros

    Reportes personalizables

🚀 Comenzando
Prerrequisitos

    Node.js 18.19.1, 20.11.1 o superior

    PostgreSQL 15+

    npm o yarn

Instalación

    Clonar el repositorio

bash

git clone <repository-url>
cd iglesia-platform

    Instalar dependencias

bash

npm install

    Configurar variables de entorno

bash

cp .env.example .env

Editar .env con tus configuraciones:
env

DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/iglesia_platform"
JWT_SECRET="tu-clave-secreta-jwt"
SMTP_HOST="smtp.gmail.com"
SMTP_USER="tu-email@gmail.com"
SMTP_PASS="tu-contraseña-app"
CLOUDINARY_CLOUD_NAME="tu-cloud-name"
CLOUDINARY_API_KEY="tu-api-key"
CLOUDINARY_API_SECRET="tu-api-secret"

    Configurar la base de datos

bash

# Generar cliente Prisma

npx prisma generate

# Ejecutar migraciones

npx prisma migrate dev

# Poblar datos iniciales

npm run seed

    Ejecutar la aplicación

bash

# Desarrollo

npm run start:dev

# Producción

npm run build
npm run start:prod

La aplicación estará disponible en http://localhost:3000
📚 Documentación de API

Una vez ejecutada la aplicación, accede a la documentación Swagger en:
text

http://localhost:3000/api/docs

🏗️ Estructura del Proyecto
text

src/
├── auth/ # Autenticación y autorización
├── user/ # Gestión de usuarios
├── member/ # Gestión de miembros
├── finance/ # Sistema financiero
├── dashboard/ # Reportes y métricas
├── mail/ # Sistema de correo
├── prisma/ # Configuración de base de datos
└── common/ # Utilidades compartidas

🛠️ Comandos Disponibles
bash

# Desarrollo

npm run start:dev # Modo desarrollo con watch
npm run start:debug # Modo debug

# Build

npm run build # Compilar proyecto
npm run start:prod # Ejecutar en producción

# Calidad de código

npm run lint # ESLint con auto-fix
npm run format # Formateo con Prettier

# Testing

npm run test # Tests unitarios
npm run test:watch # Tests con watch
npm run test:e2e # Tests end-to-end
npm run test:cov # Cobertura de tests

# Base de datos

npx prisma migrate dev # Crear y aplicar migración
npx prisma generate # Generar cliente Prisma
npx prisma studio # Abrir interfaz de base de datos

🔐 Roles del Sistema

    ADMIN: Acceso completo al sistema

    PASTOR/PASTORA: Gestión espiritual + finanzas + miembros

    LIDER: Gestión limitada de miembros + recursos

    MIEMBRO: Acceso básico, información personal

📦 Dependencias Principales
Runtime

    @nestjs/* - Framework NestJS

    @prisma/client - ORM para PostgreSQL

    cloudinary - Almacenamiento de archivos

    bcrypt - Encriptación de contraseñas

    passport-jwt - Autenticación JWT

    nodemailer - Envío de correos

Desarrollo

    prisma - CLI y herramientas de base de datos

    typescript - Tipado estático

    jest - Suite de testing

    eslint - Linting de código

🗄️ Base de Datos

El proyecto utiliza Prisma como ORM con PostgreSQL. El esquema de base de datos se define en prisma/schema.prisma y incluye:

    Usuarios y autenticación

    Miembros y información personal

    Transacciones financieras

    Recursos y archivos

    Categorías y configuración

🔧 Configuración
Variables de Entorno Requeridas
env

# Base de Datos

DATABASE_URL="postgresql://..."

# Seguridad

JWT_SECRET="clave-secreta-para-jwt"

# Email

SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="email@gmail.com"
SMTP_PASS="contraseña-app"

# Cloudinary

CLOUDINARY_CLOUD_NAME="cloud-name"
CLOUDINARY_API_KEY="api-key"
CLOUDINARY_API_SECRET="api-secret"

# Aplicación

NODE_ENV="development"
PORT="3000"

🤝 Contribución

¡Las contribuciones son bienvenidas! Este proyecto está diseñado para ser utilizado por cualquier iglesia cristiana.

    Fork el proyecto

    Crear una rama para tu feature (git checkout -b feature/AmazingFeature)

    Commit tus cambios (git commit -m 'Add some AmazingFeature')

    Push a la rama (git push origin feature/AmazingFeature)

    Abrir un Pull Request

📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo LICENSE para más detalles.
🆘 Soporte

    Crear un issue para reportar bugs

    Consultar la documentación

    Unirse a nuestra comunidad para soporte

Desarrollado con ❤️ para la comunidad de iglesias cristianas
