import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { getNow } from 'src/common/util.service';
import { IS_PUBLIC_KEY } from 'src/common/decorators/http-public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly reflector: Reflector,
    ) {}
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const token = request.headers.authorization?.split(' ')[1]; // Bearer token

        if (!token) {
            return false;
        } else {
            try {
                const decodedToken = this.jwtService.verifyAsync(token);
                request.user = decodedToken; // Save user information in request.user
            } catch (error) {
                console.log(`[${getNow()}] Invalid token : \n`, error);
                return false;
            }
            return true;
        }
    }
}
