import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WidgetsController } from './widgets.controller';
import { WidgetsRepository } from './widgets.repository';
import { WidgetsService } from './widgets.service';
import { Widgets, WidgetsSchema } from './schema/widgets.schema';
import { ActivityLogModule } from '../activity-log/activity-log.module';
import { AdScreenModule } from '../ad-screens/ad-screens.module';
import { CommonModule } from '../common/common.module';
import { PublicAdvertsModule } from '../public-adverts/public-adverts.module';
import { QueuesModule } from '../queues/queues.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Widgets.name, schema: WidgetsSchema }]),
    ActivityLogModule,
    AdScreenModule,
    CommonModule,
    forwardRef(() => PublicAdvertsModule),
    forwardRef(() => QueuesModule),
  ],
  controllers: [WidgetsController],
  providers: [WidgetsService, WidgetsRepository],
  exports: [WidgetsService],
})
export class WidgetsModule {}
