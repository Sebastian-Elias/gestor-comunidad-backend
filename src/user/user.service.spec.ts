//user.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { Role } from '@prisma/client';

// Mock de las dependencias
const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  passwordResetToken: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

const mockMailService = {
  sendResetPasswordEmail: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
};

const mockConfigService = {
  get: jest.fn().mockImplementation((key: string) => {
    const config = {
      'JWT_SECRET': 'test-secret',
      'JWT_EXPIRES_IN': '1h',
    };
    return config[key];
  }),
};

// Mock de bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
}));

// Mock de crypto
jest.mock('crypto', () => ({
  randomBytes: jest.fn().mockReturnValue({
    toString: jest.fn().mockReturnValue('random-token-hex'),
  }),
}));

describe('UserService', () => {
  let service: UserService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: MailService, useValue: mockMailService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      // Arrange
      const mockUsers = [
        { 
          id: 1, 
          email: 'test1@example.com', 
          firstName: 'Test',
          lastName: 'User 1',
          role: Role.MIEMBRO,
          createdAt: new Date(),
          memberId: null,
        },
      ];
      
      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual(mockUsers);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no users exist', async () => {
      // Arrange
      mockPrismaService.user.findMany.mockResolvedValue([]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual([]);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      // Arrange
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: Role.MIEMBRO,
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      // Act
      const result = await service.findOne(1);

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 }
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow('User not found');
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 999 }
      });
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      // Arrange
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: Role.MIEMBRO,
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      // Act
      const result = await service.findByEmail('test@example.com');

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' }
      });
    });

    it('should throw NotFoundException when user by email not found', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findByEmail('nonexistent@example.com')).rejects.toThrow(NotFoundException);
      await expect(service.findByEmail('nonexistent@example.com')).rejects.toThrow('User not found');
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' }
      });
    });
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      // Arrange
      const createUserDto = {
        email: 'newuser@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: Role.MIEMBRO,
      };

      const mockUser = {
        id: 1,
        ...createUserDto,
        password: '',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrismaService.user.create.mockResolvedValue(mockUser);

      // Act
      const result = await service.create(createUserDto);

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          firstName: createUserDto.firstName,
          lastName: createUserDto.lastName,
          email: createUserDto.email,
          role: 'MIEMBRO',
          password: ''
        }
      });
    });

    it('should throw ConflictException when user with email already exists', async () => {
      // Arrange
      const createUserDto = {
        email: 'existing@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: Role.MIEMBRO,
      };

      const prismaError = {
        code: 'P2002',
        meta: { target: ['email'] }
      };

      mockPrismaService.user.create.mockRejectedValue(prismaError);

      // Act & Assert
      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
      await expect(service.create(createUserDto)).rejects.toThrow('El email ya está registrado');
    });
  });

  describe('createPasswordResetToken', () => {
    it('should create a password reset token successfully', async () => {
      // Arrange
      const userId = 1;
      const mockToken = 'random-token-hex';

      mockPrismaService.passwordResetToken.create.mockResolvedValue({
        token: mockToken,
        userId,
        expiresAt: new Date(),
      });

      // Act
      const result = await service.createPasswordResetToken(userId);

      // Assert
      expect(result).toBe(mockToken);
      expect(mockPrismaService.passwordResetToken.create).toHaveBeenCalledWith({
        data: {
          token: mockToken,
          userId,
          expiresAt: expect.any(Date),
        },
      });
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully with valid token', async () => {
      // Arrange
      const token = 'valid-token';
      const newPassword = 'newPassword123';
      const mockTokenRecord = {
        token,
        userId: 1,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hora en el futuro
        used: false,
      };

      mockPrismaService.passwordResetToken.findUnique.mockResolvedValue(mockTokenRecord);
      mockPrismaService.user.update.mockResolvedValue({});
      mockPrismaService.passwordResetToken.update.mockResolvedValue({});

      // Act
      const result = await service.resetPassword(token, newPassword);

      // Assert
      expect(result).toEqual({ message: 'Contraseña actualizada exitosamente' });
      expect(mockPrismaService.passwordResetToken.findUnique).toHaveBeenCalledWith({
        where: { token },
      });
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockTokenRecord.userId },
        data: { password: 'hashedPassword' },
      });
      expect(mockPrismaService.passwordResetToken.update).toHaveBeenCalledWith({
        where: { token },
        data: { used: true },
      });
    });

    it('should throw BadRequestException when token is invalid', async () => {
      // Arrange
      const token = 'invalid-token';
      const newPassword = 'newPassword123';

      mockPrismaService.passwordResetToken.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.resetPassword(token, newPassword)).rejects.toThrow(BadRequestException);
      await expect(service.resetPassword(token, newPassword)).rejects.toThrow('Token inválido');
    });

    it('should throw BadRequestException when token is expired', async () => {
      // Arrange
      const token = 'expired-token';
      const newPassword = 'newPassword123';
      const mockTokenRecord = {
        token,
        userId: 1,
        expiresAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hora en el pasado
        used: false,
      };

      mockPrismaService.passwordResetToken.findUnique.mockResolvedValue(mockTokenRecord);

      // Act & Assert
      await expect(service.resetPassword(token, newPassword)).rejects.toThrow(BadRequestException);
      await expect(service.resetPassword(token, newPassword)).rejects.toThrow('Token expirado');
    });

    it('should throw BadRequestException when token is already used', async () => {
      // Arrange
      const token = 'used-token';
      const newPassword = 'newPassword123';
      const mockTokenRecord = {
        token,
        userId: 1,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hora en el futuro
        used: true,
      };

      mockPrismaService.passwordResetToken.findUnique.mockResolvedValue(mockTokenRecord);

      // Act & Assert
      await expect(service.resetPassword(token, newPassword)).rejects.toThrow(BadRequestException);
      await expect(service.resetPassword(token, newPassword)).rejects.toThrow('Token ya usado');
    });
  });
});