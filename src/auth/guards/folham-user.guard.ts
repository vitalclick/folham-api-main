import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { UsersService } from '../../users/users.service';
import { AdminAccess } from '../../users/types/users.types';
import { jwtConstants } from '../constants';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const jwt = require('jsonwebtoken');

@Injectable()
export class FolhamAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersService: UsersService,
  ) {}
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean | Promise<boolean> | Observable<boolean> | any> {
    const request: any = context.switchToHttp().getRequest<Request>();
    const decoratedRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    const authorization = request.headers.authorization.split(' ')[1];

    const fireUser = await this.validate(this.decodeToken(authorization));

    if (!fireUser) {
      request.user = { id: fireUser._id, new: true };
      return true;
    }

    if (!decoratedRoles && fireUser.userActiveStatus == 0) {
      request.user = fireUser;
      return true;
    }
    request.user = fireUser;

    if (
      this.matchRoles(decoratedRoles, fireUser.privilege) &&
      fireUser.userActiveStatus == 0
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

  matchRoles(decoratedRoles: string[], userRoles: AdminAccess): boolean {
    for (const role of decoratedRoles) {
      if (role == userRoles) {
        return true;
      }
    }
    throw new ForbiddenException('You are not authorized to access this route');
  }

  decodeToken(jwtToken: string) {
    try {
      const decodedToken = jwt.verify(jwtToken, jwtConstants.secret);
      return decodedToken;
    } catch (error) {
      console.error(error); // Handle errors here
    }
  }
}
