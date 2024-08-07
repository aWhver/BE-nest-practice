import { Inject, Injectable } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Article } from './entities/article.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class ArticleService {
  @InjectRepository(Article)
  articleRepository: Repository<Article>;

  @Inject(RedisService)
  private redisService: RedisService;

  create(createArticleDto: CreateArticleDto) {
    return 'This action adds a new article';
  }

  findAll() {
    // const a = new Article();
    // a.title = '但是科技大厦';
    // a.tags = 'sql';
    // a.content =
    //   '绑定手机规范化金额我刚好大部分结婚的个房间换个地方火锅的机会官方';
    // this.articleRepository.save(a);
    return this.articleRepository.find();
  }

  findOne(id: number) {
    return this.articleRepository.findOne({
      where: {
        id,
      },
    });
  }

  remove(id: number) {
    return `This action removes a #${id} article`;
  }

  async view(id: number, user: string) {
    const articleKey = `article_${id}`;
    const key = `user_${user}_article_${id}`;
    const viewCount = await this.redisService.hget(articleKey, 'viewCount');
    console.log('viewCount', viewCount);
    if (viewCount === undefined) {
      const article = await this.findOne(id);
      this.articleRepository.update(id, {
        viewCount: 1,
      });
      this.redisService.hset(articleKey, 'viewCount', 1, 24 * 60 * 60);
      this.redisService.hset(key, 'viewCount', 1, 5 * 60);
      return article.viewCount || 1;
    }
    const flag = await this.redisService.hget(key, 'viewCount');
    if (flag) {
      return viewCount;
    }
    this.redisService.hset(
      articleKey,
      'viewCount',
      Number(viewCount) + 1,
      24 * 60 * 60,
    );
    this.redisService.hset(key, 'viewCount', 1, 5 * 60);

    return Number(viewCount) + 1;
  }

  async flushRedis2Db() {
    const keys = await this.redisService.keys('article_*');
    for (let i = 0; i < keys.length; i++) {
      const [, id] = keys[i].split('_');
      const viewCount = await this.redisService.hget(keys[i], 'viewCount');
      this.articleRepository.update(+id, { viewCount: +viewCount });
    }
  }
}
