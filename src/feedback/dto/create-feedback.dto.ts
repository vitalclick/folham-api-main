import { ApiProperty } from '@nestjs/swagger';
import { FeedbackType } from '../../common/enums/feedback.enum';
import { IsDefined, IsNotEmpty, IsString, IsEnum } from 'class-validator';

export class CreateFeedbackDto {
  @ApiProperty()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ enum: FeedbackType })
  @IsDefined()
  @IsEnum(FeedbackType)
  type: FeedbackType;
}
