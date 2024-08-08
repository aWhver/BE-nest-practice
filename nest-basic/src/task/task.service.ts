import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ArticleService } from 'src/article/article.service';

@Injectable()
export class TaskService {
  @Inject(ArticleService)
  protected readonly articleService: ArticleService;

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  updateArticleViewCount() {
    this.articleService.flushRedis2Db();
  }
}
