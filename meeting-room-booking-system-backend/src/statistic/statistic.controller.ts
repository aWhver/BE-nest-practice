import { Controller, Get, Query } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { ApiTags } from '@nestjs/swagger';
import { UserBookingCountDto } from './dto/statistic.dto';
import { UserBookingCountVo, MeetingRoomUsageFreqVo } from './vo/statistic.vo';
import { StatisticQueryPipe } from 'src/common/pipe';

@ApiTags('数据统计')
@Controller('statistic')
export class StatisticController {
  constructor(private readonly statisticService: StatisticService) {}

  /** 统计用户预定数 */
  @Get('userBookingCount')
  async userBookingCount(
    @Query(StatisticQueryPipe) userBookingCountDto: UserBookingCountDto,
  ) {
    const data = await this.statisticService.userBookingCount(
      userBookingCountDto.startTime,
      userBookingCountDto.endTime,
    );
    return data.map((item) => {
      const userBookingCountVo = new UserBookingCountVo();
      userBookingCountVo.nickName = item.nickName;
      userBookingCountVo.userId = item.userId;
      userBookingCountVo.bookingCount = +item.bookingCount;
      return userBookingCountVo;
    });
  }

  /** 会议室使用频率 */
  @Get('meetingRoomUsageFreq')
  async meetingRoomUsageFreq(
    @Query(StatisticQueryPipe) userBookingCountDto: UserBookingCountDto,
  ) {
    const data = await this.statisticService.meetingRoomUsageFreq(
      userBookingCountDto.startTime,
      userBookingCountDto.endTime,
    );
    return data.map((item) => {
      const meetingRoomUsageFreqVo = new MeetingRoomUsageFreqVo();
      meetingRoomUsageFreqVo.meetingRoomId = item.meetingRoomId;
      meetingRoomUsageFreqVo.meetingRoomName = item.meetingRoomName;
      meetingRoomUsageFreqVo.usageCount = item.usageCount;
      return meetingRoomUsageFreqVo;
    });
  }
}
