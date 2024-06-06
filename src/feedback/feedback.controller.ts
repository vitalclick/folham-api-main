import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FeedbackService } from './feedback.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthUser } from '../common/decorators/user.decorator';

@ApiTags('feedback')
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  createFeedback(
    @AuthUser() user,
    @Body() createFeedbackDto: CreateFeedbackDto,
  ) {
    return this.feedbackService.createFeedback(user, createFeedbackDto);
  }
}
