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
        },
      ];

      mockFinanceService.findAllEntries.mockResolvedValue(mockEntries);

      // Act
      const result = await controller.findAllEntries();

      // Assert
      expect(result).toEqual(mockEntries);
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
      };

      mockFinanceService.findOneEntry.mockResolvedValue(mockEntry);

      // Act
      const result = await controller.findOneEntry(entryId);

      // Assert
      expect(result).toEqual(mockEntry);
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
  });
});