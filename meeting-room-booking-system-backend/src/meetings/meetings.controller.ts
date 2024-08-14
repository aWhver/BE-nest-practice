import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Next,
  UseGuards,
  Query,
  SetMetadata,
} from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { PermissionGuard } from 'src/common/guard';
import { skipAuth } from 'src/common/decorator';
import { ROLE_PERMISSION } from 'src/common/const';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('会议室管理')
@Controller('meetings')
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Post()
  create(@Body() createMeetingDto: CreateMeetingDto) {
    return this.meetingsService.create(createMeetingDto);
  }

  @Get()
  @SetMetadata(ROLE_PERMISSION, ['frontend'])
  @UseGuards(PermissionGuard)
  findAll(@Next() next, @Query('id') id) {
    console.log('id', id);
    // next();
    return this.meetingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.meetingsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMeetingDto: UpdateMeetingDto) {
    return this.meetingsService.update(+id, updateMeetingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.meetingsService.remove(+id);
  }
}
