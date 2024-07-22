import { Test, TestingModule } from '@nestjs/testing';
import { CustomDecoratorController } from './custom-decorator.controller';
import { CustomDecoratorService } from './custom-decorator.service';

describe('CustomDecoratorController', () => {
  let controller: CustomDecoratorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomDecoratorController],
      providers: [CustomDecoratorService],
    }).compile();

    controller = module.get<CustomDecoratorController>(CustomDecoratorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
