import { forwardRef, Inject, Injectable, Logger, Param } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  DeviceLog,
  IAdvertUpdateData,
  IScreenStatusData,
  IScrollingAdvertData,
} from './event.types';
import { LogQueueService } from '../log-queue.service';
@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  allowEIO3: true,
  namespace: '/devicelogs',
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() wss: Server;

  constructor(
    @Inject(forwardRef(() => LogQueueService))
    private deviceLogQueue: LogQueueService,
  ) {}

  private logger: Logger = new Logger('EventsGateway');

  afterInit() {
    this.logger.log('Initialized!');
  }

  async handleConnection(@ConnectedSocket() client: Socket): Promise<void> {
    this.logger.log(`Client connected: ${client.id}`);
  }
  async handleDisconnect(@ConnectedSocket() client: Socket): Promise<void> {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('devicelogs')
  async listenForDeviceLogs(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: DeviceLog[] | DeviceLog,
  ): Promise<void> {
    if (Array.isArray(payload)) {
      for (const log of payload) {
        await this.deviceLogQueue.processListenProgressDetailsQueue(log);
      }
    } else {
      await this.deviceLogQueue.processListenProgressDetailsQueue(payload);
    }
    client.emit('msgToClient', 'received');
  }

  @SubscribeMessage('connectionCount') // get number of systems / connections a User has
  getLiveUserCount(
    @MessageBody() deviceId: string,
    @ConnectedSocket() client: Socket,
  ): void {
    this.wss
      .in(deviceId)
      .allSockets()
      .then((res) => client.emit(`clientCount`, res.size));
  }

  @SubscribeMessage('joinSocket') // join room for device logs
  handleStartDeviceLogging(
    @ConnectedSocket() client: Socket,
    @MessageBody() deviceId: string,
  ): void {
    deviceId
      ? (client.join(deviceId), client.emit(`${deviceId}`, deviceId))
      : null;
    client.to(deviceId).emit('clientCount', 1);
  }

  // @SubscribeMessage('updateAdEvent') // join room for device logs
  emitUpdatedAds(
    @MessageBody()
    payload: IAdvertUpdateData,
  ): void {
    const listener = `${payload.config.deviceId}-updateAdEvent`;
    this.wss.to(payload.config.deviceId).emit(listener, payload);
  }

  // emitScrollingAds(
  //   @MessageBody()
  //   payload: IScrollingAdvertData,
  // ): void {
  //   const listener = `${payload.config.deviceId}-scrollingAdEvent`;
  //   this.wss.to(payload.config.deviceId).emit(listener, payload);
  // }

  emitScreenStatus(
    @MessageBody()
    payload: IScreenStatusData | any,
  ): void {
    this.wss.emit('deviceStatus', payload);
  }
}
