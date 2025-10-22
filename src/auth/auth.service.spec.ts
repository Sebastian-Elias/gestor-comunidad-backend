//auth/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { ForbiddenException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '@prisma/client';

// Mock de bcrypt
jest.mock('bcrypt');

// Mock de las dependencias
const mockPrismaService = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

const mockJwtService = {
  signAsync: jest.fn(),
  verifyAsync: jest.fn(),
  sign: jest.fn(),
};

const mockMailService = {
  sendUserInvitation: jest.fn(),
};

const mockConfigService = {
  get: jest.fn().mockImplementation((key: string) => {
    const config = {
      'JWT_INVITATION_SECRET': 'invitation-secret',
      'JWT_SECRET': 'jwt-secret',
      'FRONTEND_URL': 'http://localhost:5173',
    };
    return config[key];
  }),
};

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let mailService: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: MailService, useValue: mockMailService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    mailService = module.get<MailService>(MailService);

    // Limpiar todos los mocks antes de cada test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      // Arrange
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      const mockToken = {
        access_token: 'jwt-token',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('jwt-token');

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(result).toEqual(mockToken);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
      expect(mockJwtService.signAsync).toHaveBeenCalled();
    });

    it('should throw ForbiddenException when user does not exist', async () => {
      // Arrange
      const loginDto: LoginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(ForbiddenException);
      await expect(service.login(loginDto)).rejects.toThrow('Credenciales incorrectas');
    });

    it('should throw ForbiddenException when user has no password', async () => {
      // Arrange
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: null, // Usuario sin contraseña (invitado)
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when password is incorrect', async () => {
      // Arrange
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Arrange
      const registerDto: RegisterDto = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: Role.MIEMBRO,
      };

      const mockUser = {
        id: 1,
        ...registerDto,
        password: 'hashedPassword',
      };

      const mockToken = {
        access_token: 'jwt-token',
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('jwt-token');

      // Act
      const result = await service.register(registerDto);

      // Assert
      expect(result).toEqual(mockToken);
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: registerDto.email,
          password: 'hashedPassword',
          role: registerDto.role,
          firstName: registerDto.firstName,
          lastName: registerDto.lastName,
        },
      });
    });
  });

  describe('inviteUser', () => {
    it('should invite user successfully', async () => {
      // Arrange
      const inviteDto = {
        email: 'invited@example.com',
        role: Role.MIEMBRO,
      };

      const mockUser = {
        id: 1,
        email: 'invited@example.com',
        role: Role.MIEMBRO,
        password: null,
      };

      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('invitation-token');
      mockMailService.sendUserInvitation.mockResolvedValue(undefined);

      // Act
      const result = await service.inviteUser(inviteDto);

      // Assert
      expect(result).toEqual({ success: true });
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: inviteDto.email,
          role: inviteDto.role,
          password: null,
        },
      });
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        { sub: mockUser.id, email: mockUser.email },
        { 
          secret: 'invitation-secret',
          expiresIn: '2d' 
        }
      );
      expect(mockMailService.sendUserInvitation).toHaveBeenCalledWith(
        mockUser.email,
        'http://localhost:5173/set-password?token=invitation-token'
      );
    });
  });

  describe('setPassword', () => {
    it('should set password successfully with valid token', async () => {
      // Arrange
      const token = 'valid-token';
      const newPassword = 'newPassword123';
      const payload = { sub: 1 };

      mockJwtService.verifyAsync.mockResolvedValue(payload);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockPrismaService.user.update.mockResolvedValue({});

      // Act
      const result = await service.setPassword(token, newPassword);

      // Assert
      expect(result).toEqual({ success: true });
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(token, {
        secret: 'invitation-secret',
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: payload.sub },
        data: { password: 'hashedPassword' },
      });
    });
  });

  describe('getProfile', () => {
    it('should return user profile without sensitive data', async () => {
      // Arrange
      const userId = 1;
      const mockProfile = {
        id: 1,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: Role.MIEMBRO,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockProfile);

      // Act
      const result = await service.getProfile(userId);

      // Assert
      expect(result).toEqual(mockProfile);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      });
    });
  });
});