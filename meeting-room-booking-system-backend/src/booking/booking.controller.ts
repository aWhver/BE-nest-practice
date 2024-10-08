import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  Query,
  DefaultValuePipe,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { ApproveDto, CreateBookingDto, UrgeDto } from './dto/create-booking.dto';
import { Request } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { BookingListDto } from './dto/booking-list.dto';
import { generateParseIntPipe } from 'src/common/pipe';
import { BookingItemVo, BookingListVo } from './vo/booking-list.vo';
import { Between, LessThanOrEqual, MoreThanOrEqual, Or } from 'typeorm';
import { MeetingRoomsService } from 'src/meeting-rooms/meeting-rooms.service';
import { Status } from './entities/booking.entity';

@ApiTags('预定管理')
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Inject(MeetingRoomsService)
  private meetingRoomService: MeetingRoomsService;

  /** 创建预定 */
  @Post('create')
  async create(
    @Body() createBookingDto: CreateBookingDto,
    @Req() req: Request,
  ) {
    const meetingRoom = await this.meetingRoomService.findOne(
      createBookingDto.meetingRoomId,
    );
    if (!meetingRoom) {
      throw new BadRequestException('该会议室不存在');
    }
    // todo, 这里的查询语句有点问题
    // const booking = await this.bookingService.findOneBy({
    //   where: {
    //     meetingRoom: {
    //       id: meetingRoom.id,
    //     },
    //     startTime: LessThanOrEqual(new Date(createBookingDto.startTime)),
    //     endTime: MoreThanOrEqual(new Date(createBookingDto.endTime)),
    //   },
    // });
    const booking = await this.bookingService.findOneBooking(
      meetingRoom.id,
      createBookingDto.startTime,
      createBookingDto.endTime,
    );
    console.log('booking', booking);
    if (booking) {
      throw new BadRequestException('该时间段已有预定');
    }
    return this.bookingService.create(createBookingDto, req.user.userId);
  }

  /** 获取预定列表 */
  @Get('list')
  async getBookingList(
    @Query('pageNo', new DefaultValuePipe(1), generateParseIntPipe('pageNo'))
    pageNo: number,
    @Query(
      'pageSize',
      new DefaultValuePipe(10),
      generateParseIntPipe('pageSize'),
    )
    pageSize: number,
    @Query() bookingListDto: BookingListDto,
    @Req() req: Request,
  ) {
    const [bookings, total] = await this.bookingService.getListByPage({
      ...bookingListDto,
      pageNo,
      pageSize,
      userId: req.user.isAdmin ? undefined : req.user.userId,
    });
    const bookingList = bookings.map((booking) => {
      const bookingItem = new BookingItemVo();
      bookingItem.id = booking.id;
      bookingItem.startTime = booking.startTime;
      bookingItem.endTime = booking.endTime;
      bookingItem.note = booking.note;
      bookingItem.status = booking.status;
      bookingItem.createTime = booking.createTime;
      bookingItem.userId = booking.user.id;
      bookingItem.email = booking.user.email;
      bookingItem.bookingNickName = booking.user.nickName;
      bookingItem.meetingRoomId = booking.meetingRoom.id;
      bookingItem.meetingRoomName = booking.meetingRoom.name;
      bookingItem.meetingRoomLocation = booking.meetingRoom.location;
      return bookingItem;
    });
    const bookingListVo = new BookingListVo();
    bookingListVo.bookingList = bookingList;
    bookingListVo.total = total;
    return bookingListVo;
  }

  /** 审核通过 */
  @Post('approve')
  async approve(@Body() approveDto: ApproveDto) {
    return this.bookingService.approve(approveDto);
  }

  /** 驳回申请 */
  @Get('reject/:id')
  async reject(@Param('id') id: string) {
    await this.bookingService.updateBookingStatus(+id, Status.Rejected);
    return '申请驳回';
  }

  /** 取消预定 */
  @Get('cancel/:id')
  async cancel(@Param('id') id: string) {
    await this.bookingService.updateBookingStatus(+id, Status.Cancel);
    return '取消成功';
  }

  /** 催办 */
  @Post('urge')
  async urge(@Body() urgeDto: UrgeDto) {
    await this.bookingService.urge(urgeDto);
    return '催办成功';
  }
}
