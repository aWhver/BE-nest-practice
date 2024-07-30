import { Inject, Injectable } from '@nestjs/common';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { City } from './entities/city.entity';

@Injectable()
export class CityService {
  // 下面２种方式都可以获取 Entity,但是InjectRepository获取的是固定的 Entity
  // EntityManager可以传递Ｅntity，比较灵活，但是需要写很多遍 Entity
  @Inject(EntityManager)
  entityManager: EntityManager;

  @InjectRepository(City)
  cityRepository: Repository<City>;

  create(createCityDto: CreateCityDto) {
    return 'This action adds a new city';
  }

  async generateCity(data: string[]) {
    const levels = [...data];
    let parent = null;
    while (levels.length) {
      const level = levels.shift();
      const curCity = await this.entityManager.findOne(City, {
        where: {
          name: level,
        },
      });
      if (curCity) {
        parent = curCity;
        continue;
      }
      const city = new City();
      city.name = level;
      if (parent) {
        city.parent = parent;
      }
      parent = city;
      await this.cityRepository.save(city);
    }
  }

  async findAll() {
    /* const city = new City();
    city.name = '华南';
    // await this.entityManager.save(city);
    this.cityRepository.save(city);
    const cityChild = new City();
    cityChild.name = '广东';
    const parent = await this.entityManager.findOne(City, {
      where: {
        name: '华南',
      },
    });
    // this.cityRepository.findOne({
    //   where: {
    //     name: '华南',
    //   },
    // });
    if (parent) {
      cityChild.parent = parent;
    }
    await this.cityRepository.save(cityChild);
    // await this.entityManager.save(City, cityChild); */
    // await this.generateCity(['华东', '浙江', '杭州']);
    const treeRepository = this.entityManager.getTreeRepository(City);
    // const cities = await this.entityManager.getTreeRepository(City).findTrees();
    // 查询所有根节点
    // const cities = await this.entityManager.getTreeRepository(City).findRoots();
    const city = await this.cityRepository.findOneBy({ name: '万宁' });
    // 找到指定节点所有后代节点
    // const cities = await treeRepository.findDescendantsTree(city);
    // 找到指定节点所有后代节点（扁平结构）
    // const cities = await treeRepository.findDescendants(city);
    // 找到指定节点所有祖先节点
    const cities = await treeRepository.findAncestorsTree(city);
    return cities;
  }

  findOne(id: number) {
    return `This action returns a #${id} city`;
  }

  update(id: number, updateCityDto: UpdateCityDto) {
    return `This action updates a #${id} city`;
  }

  remove(id: number) {
    return `This action removes a #${id} city`;
  }
}
