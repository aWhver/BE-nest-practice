import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ArticleService } from 'src/article/article.service';

@Injectable()
export class TaskService {
  @Inject(ArticleService)
  protected readonly articleService: ArticleService;

  @Cron(CronExpression.EVERY_30_SECONDS)
  updateArticleViewCount() {
    this.articleService.flushRedis2Db();
  }
}
