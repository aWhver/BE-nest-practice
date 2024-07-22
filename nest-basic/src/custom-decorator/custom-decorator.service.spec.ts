import { Test, TestingModule } from '@nestjs/testing';
import { CustomDecoratorService } from './custom-decorator.service';

describe('CustomDecoratorService', () => {
  let service: CustomDecoratorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomDecoratorService],
    }).compile();

    service = module.get<CustomDecoratorService>(CustomDecoratorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
