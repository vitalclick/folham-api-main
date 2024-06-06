import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { jwtConstants } from '../constants';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private usersService: UsersService,
    private reflector: Reflector,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean | Promise<boolean> | Observable<boolean> | any> {
    const request: any = context.switchToHttp().getRequest<Request>();
    const decoratedRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    // try {
    const fireUser = await this.validate(request.headers.authorization);

    if (!fireUser) {
      request.user = { id: fireUser._id, new: true };
      return true;
    }

    if (!decoratedRoles && fireUser.userActiveStatus) {
      request.user = fireUser;
      return true;
    }
    request.user = fireUser;

    if (
      this.matchRoles(decoratedRoles, fireUser.privilege) &&
      fireUser.userActiveStatus
    ) {
      return true;
    }
    throw new ForbiddenException('You are not authorized to access this route');
  }

  async validate(payload: any) {
    const user = await this.usersService.getUserById(payload.sub);
    return {
      ...user,
      _id: payload.sub,
      email: payload.email,
    };
  }
}
