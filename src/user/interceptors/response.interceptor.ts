// interceptors/jsonapi.interceptor.ts
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { JsonApiSerializerService } from '../services/json-api-serializer.service';

@Injectable()
export class JsonApiInterceptor implements NestInterceptor {
  constructor(
    private readonly jsonApiSerializerService: JsonApiSerializerService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(
        map((data) => this.jsonApiSerializerService.serialize('User', data)),
      );
  }
}
