import { AppDataSource } from './data-source';
import { IdCard } from './entity/IdCard';
import { User } from './entity/User';
// 一对一的关系
AppDataSource.initialize()
  .then(async () => {
    console.log('Inserting a new user into the database...');
    /* const user = new User()
    user.firstName = "juntong"
    user.lastName = "zhao"
    user.age = 29

    const idCard = new IdCard();
    idCard.cardNo = '43089328'
    idCard.user = user;

    await AppDataSource.manager.save(idCard) */
    // --------
    // 查询的几种方式
    // const ids = await AppDataSource.manager.find(IdCard, {
    //   // 不声明关系，搜查出来的数据不会带上关联的表
    //   relations: {
    //     user: true,
    //   },
    // });
    // const ids = await AppDataSource.manager
    //   .getRepository(IdCard)
    //   .createQueryBuilder('ic')
    //   .leftJoinAndSelect('ic.user', 'u')// 这个和上面的 relations的作用一样
    //   .getMany();
    // const ids = await AppDataSource.manager
    //   .createQueryBuilder(IdCard, 'ic')
    //   .leftJoinAndSelect('ic.user', 'u')
    //   .getMany();
    // console.log('ids', ids);
    // ---------

    // ---------
    // 设置了级联删除，有关系的会自动删除
    // await AppDataSource.manager.delete(User, 1);
    // ---------
    // console.log("Saved a new user with id: " + user.id)
    const ids = await AppDataSource.manager.find(User, {
      // 不声明关系，搜查出来的数据不会带上关联的表
      relations: {
        idCard: true,
      },
    });
    console.log('ids', ids);
    // console.log("Loading users from the database...")
    // const users = await AppDataSource.manager.find(User)
    // console.log("Loaded users: ", users)

    // console.log("Here you can setup and run express / fastify / any other framework.")
  })
  .catch((error) => console.log(error));
