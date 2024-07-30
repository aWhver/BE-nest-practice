import { AppDataSource } from './data-source';
import { Article } from './entity/Article';
import { Tag } from './entity/Tag';
/* 多对多关系在 Entity 里怎么映射，是通过 @ManyToMany 和 @JoinTable 来声明的。

但如果双方都保留了对方的引用，需要第二个参数来指定关联的外键列在哪，也就是如何查找当前 entity。

多对多关系的修改只要查出来之后修改下属性，然后 save，TypeORM 会自动去更新中间表。 */
AppDataSource.initialize()
  .then(async () => {
    /* const a1 = new Article();
  a1.title = 'title1';
  a1.content = 'Many to many relations';

  const a2 = new Article();
  a2.title = 'title2';
  a2.content = 'Many to many relations content1';

  const t1 = new Tag();
  t1.name = 'sql';

  const t2 = new Tag();
  t2.name = 'nest';

  const t3 = new Tag();
  t3.name = 'docker';

  a1.tags = [t1, t2];
  a2.tags = [t2, t3];

  await AppDataSource.manager.getRepository(Tag).save([t1, t2, t3]);
  await AppDataSource.manager.getRepository(Article).save([a1, a2]); */

    // ----------
    const articles = await AppDataSource.manager.find(Article, {
      relations: {
        tags: true,
      },
    });
    console.log('articles', articles);
    console.log(
      'tags',
      articles.map((article) => article.tags)
    );

    console.log(
      'tagsRels',
      await AppDataSource.manager
        .createQueryBuilder(Tag, 't')
        .leftJoinAndSelect('t.articles', 'a')
        .getMany()
    );
  })
  .catch((error) => console.log(error));
