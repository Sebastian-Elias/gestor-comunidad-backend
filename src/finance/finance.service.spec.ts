import { Test, TestingModule } from '@nestjs/testing';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';
import { CreateFinanceEntryDto } from './dto/create-finance-entry.dto';
import { UpdateFinanceEntryDto } from './dto/update-finance-entry.dto';
import { FinanceType, PaymentMethod, Currency } from '@prisma/client';

// Mock del servicio
const mockFinanceService = {
  createEntry: jest.fn(),
  findAllEntries: jest.fn(),
  findOneEntry: jest.fn(),
  updateEntry: jest.fn(),
  removeEntry: jest.fn(),
  findAllCategories: jest.fn(),
};

describe('FinanceController', () => {
  let controller: FinanceController;
  let service: FinanceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FinanceController],
      providers: [
        {
          provide: FinanceService,
          useValue: mockFinanceService,
        },
      ],
    }).compile();

    controller = module.get<FinanceController>(FinanceController);
    service = module.get<FinanceService>(FinanceService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createEntry', () => {
    it('should create a finance entry successfully', async () => {
      // Arrange
      const createFinanceEntryDto: CreateFinanceEntryDto = {
        type: FinanceType.INCOME,
        amount: 1000,
        currency: Currency.CLP,
        date: '2024-01-15',
        description: 'Diezmo mensual',
        paymentMethod: PaymentMethod.CASH,
        categoryId: 1,
        referenceNumber: 'REF-001',
        donorName: 'Juan Pérez',
        donorContact: 'juan@email.com',
        beneficiary: 'Iglesia Local',
        accountNumber: '123456789',
        bankName: 'Banco Test',
        invoiceNumber: 'INV-001',
        subItem: 'Subitem 1',
        comments: 'Comentarios adicionales',
      };

      const userId = 1;
      const mockCreatedEntry = {
        id: 1,
        ...createFinanceEntryDto,
        date: new Date(createFinanceEntryDto.date),
        createdById: userId,
        category: { id: 1, name: 'Diezmos' },
        createdBy: { id: 1, firstName: 'Admin', lastName: 'User' },
      };

      mockFinanceService.createEntry.mockResolvedValue(mockCreatedEntry);

      // Act
      const result = await controller.createEntry(createFinanceEntryDto, userId);

      // Assert
      expect(result).toEqual(mockCreatedEntry);
      expect(mockFinanceService.createEntry).toHaveBeenCalledWith(
        createFinanceEntryDto,
        userId
      );
    });

    it('should create entry with minimal required fields', async () => {
      // Arrange
      const createFinanceEntryDto: CreateFinanceEntryDto = {
        type: FinanceType.EXPENSE,
        amount: 500,
        currency: Currency.CLP,
        date: '2024-01-10',
        description: 'Pago de servicios básicos',
        paymentMethod: PaymentMethod.TRANSFER,
        categoryId: 2,
      };

      const userId = 1;
      const mockCreatedEntry = {
        id: 2,
        ...createFinanceEntryDto,
        date: new Date(createFinanceEntryDto.date),
        createdById: userId,
        category: { id: 2, name: 'Gastos Operacionales' },
        createdBy: { id: 1, firstName: 'Admin', lastName: 'User' },
      };

      mockFinanceService.createEntry.mockResolvedValue(mockCreatedEntry);

      // Act
      const result = await controller.createEntry(createFinanceEntryDto, userId);

      // Assert
      expect(result).toEqual(mockCreatedEntry);
      expect(mockFinanceService.createEntry).toHaveBeenCalledWith(
        createFinanceEntryDto,
        userId
      );
    });
  });

  describe('findAllEntries', () => {
    it('should return all finance entries', async () => {
      // Arrange
      const mockEntries = [
        {
          id: 1,
          type: FinanceType.INCOME,
          amount: 1000,
          currency: Currency.CLP,
          date: new Date('2024-01-15'),
          description: 'Diezmo mensual',
          paymentMethod: PaymentMethod.CASH,
          category: { id: 1, name: 'Diezmos' },
          createdBy: { id: 1, firstName: 'Admin', lastName: 'User' },
          updatedBy: null,
        },
        {
          id: 2,
          type: FinanceType.EXPENSE,
          amount: 500,
          currency: Currency.CLP,
          date: new Date('2024-01-10'),
          description: 'Pago de servicios',
          paymentMethod: PaymentMethod.TRANSFER,
          category: { id: 2, name: 'Gastos Operacionales' },
          createdBy: { id: 1, firstName: 'Admin', lastName: 'User' },
          updatedBy: { id: 1, firstName: 'Admin', lastName: 'User' },
        },
      ];

      mockFinanceService.findAllEntries.mockResolvedValue(mockEntries);

      // Act
      const result = await controller.findAllEntries();

      // Assert
      expect(result).toEqual(mockEntries);
      expect(mockFinanceService.findAllEntries).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no entries exist', async () => {
      // Arrange
      mockFinanceService.findAllEntries.mockResolvedValue([]);

      // Act
      const result = await controller.findAllEntries();

      // Assert
      expect(result).toEqual([]);
      expect(mockFinanceService.findAllEntries).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOneEntry', () => {
    it('should return a finance entry by id', async () => {
      // Arrange
      const entryId = 1;
      const mockEntry = {
        id: entryId,
        type: FinanceType.INCOME,
        amount: 1000,
        currency: Currency.CLP,
        date: new Date('2024-01-15'),
        description: 'Diezmo mensual',
        paymentMethod: PaymentMethod.CASH,
        category: { id: 1, name: 'Diezmos' },
        createdBy: { id: 1, firstName: 'Admin', lastName: 'User' },
        updatedBy: null,
      };

      mockFinanceService.findOneEntry.mockResolvedValue(mockEntry);

      // Act
      const result = await controller.findOneEntry(entryId);

      // Assert
      expect(result).toEqual(mockEntry);
      expect(mockFinanceService.findOneEntry).toHaveBeenCalledWith(entryId);
    });

    it('should return null when entry not found', async () => {
      // Arrange
      const entryId = 999;
      mockFinanceService.findOneEntry.mockResolvedValue(null);

      // Act
      const result = await controller.findOneEntry(entryId);

      // Assert
      expect(result).toBeNull();
      expect(mockFinanceService.findOneEntry).toHaveBeenCalledWith(entryId);
    });
  });

  describe('updateEntry', () => {
    it('should update a finance entry successfully', async () => {
      // Arrange
      const entryId = 1;
      const userId = 1;
      const updateFinanceEntryDto: UpdateFinanceEntryDto = {
        description: 'Diezmo mensual actualizado',
        amount: 1500,
        comments: 'Actualización de monto',
      };

      const mockUpdatedEntry = {
        id: entryId,
        type: FinanceType.INCOME,
        amount: 1500,
        currency: Currency.CLP,
        date: new Date('2024-01-15'),
        description: 'Diezmo mensual actualizado',
        paymentMethod: PaymentMethod.CASH,
        categoryId: 1,
        updatedById: userId,
        comments: 'Actualización de monto',
      };

      mockFinanceService.updateEntry.mockResolvedValue(mockUpdatedEntry);

      // Act
      const result = await controller.updateEntry(entryId, updateFinanceEntryDto, userId);

      // Assert
      expect(result).toEqual(mockUpdatedEntry);
      expect(mockFinanceService.updateEntry).toHaveBeenCalledWith(
        entryId,
        updateFinanceEntryDto,
        userId
      );
    });
  });

  describe('removeEntry', () => {
    it('should remove a finance entry successfully', async () => {
      // Arrange
      const entryId = 1;
      const mockDeletedEntry = {
        id: entryId,
        type: FinanceType.INCOME,
        amount: 1000,
        description: 'Diezmo mensual',
      };

      mockFinanceService.removeEntry.mockResolvedValue(mockDeletedEntry);

      // Act
      const result = await controller.removeEntry(entryId);

      // Assert
      expect(result).toEqual(mockDeletedEntry);
      expect(mockFinanceService.removeEntry).toHaveBeenCalledWith(entryId);
    });
  });

  describe('findAllCategories', () => {
    it('should return all finance categories', async () => {
      // Arrange
      const mockCategories = [
        {
          id: 1,
          name: 'Diezmos',
          description: 'Contribuciones de los miembros',
          entries: [
            { id: 1, amount: 1000, type: FinanceType.INCOME },
            { id: 2, amount: 500, type: FinanceType.INCOME },
          ],
        },
        {
          id: 2,
          name: 'Gastos Operacionales',
          description: 'Gastos de funcionamiento',
          entries: [
            { id: 3, amount: 300, type: FinanceType.EXPENSE },
          ],
        },
      ];

      mockFinanceService.findAllCategories.mockResolvedValue(mockCategories);

      // Act
      const result = await controller.findAllCategories();

      // Assert
      expect(result).toEqual(mockCategories);
      expect(mockFinanceService.findAllCategories).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no categories exist', async () => {
      // Arrange
      mockFinanceService.findAllCategories.mockResolvedValue([]);

      // Act
      const result = await controller.findAllCategories();

      // Assert
      expect(result).toEqual([]);
      expect(mockFinanceService.findAllCategories).toHaveBeenCalledTimes(1);
    });
  });
});