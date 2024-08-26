import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { WebsocketService } from './websocket.service';
import { CreateWebsocketDto } from './dto/create-websocket.dto';
import { UpdateWebsocketDto } from './dto/update-websocket.dto';
import { Observable } from 'rxjs';

@WebSocketGateway()
export class WebsocketGateway {
  constructor(private readonly websocketService: WebsocketService) {}

  @SubscribeMessage('createWebsocket')
  create(@MessageBody() createWebsocketDto: CreateWebsocketDto) {
    return this.websocketService.create(createWebsocketDto);
  }

  @SubscribeMessage('findAllWebsocket')
  findAll() {
    return this.websocketService.findAll();
  }

  @SubscribeMessage('findOneWebsocket')
  findOne(@MessageBody() id: number) {
    return this.websocketService.findOne(id);
  }

  @SubscribeMessage('updateWebsocket')
  update(@MessageBody() updateWebsocketDto: UpdateWebsocketDto) {
    return this.websocketService.update(
      updateWebsocketDto.id,
      updateWebsocketDto,
    );
  }

  @SubscribeMessage('removeWebsocket')
  remove(@MessageBody() id: number) {
    return this.websocketService.remove(id);
  }

  @SubscribeMessage('customemit')
  customEvent() {
    return {
      event: 'custom',
      data: '这是自定义的消息返回事件',
    };
  }

  @SubscribeMessage('asyncmessage')
  asyncmessage() {
    return new Observable((sub) => {
      sub.next({ event: 'asyncmessage', data: '初始的消息' });
      setTimeout(() => {
        sub.next({ event: 'asyncmessage', data: '有新消息了，进行推送' });
      }, 5000);
    });
  }
}
