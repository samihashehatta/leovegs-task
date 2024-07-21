// serializers/jsonapi-serializer.service.ts
import { Injectable } from '@nestjs/common';
import { Serializer } from 'jsonapi-serializer';

@Injectable()
export class JsonApiSerializerService {
  private serializers: { [key: string]: Serializer } = {};

  constructor() {
    // Define your serializers here
    this.serializers['User'] = new Serializer('users', {
      attributes: [
        'name',
        'email',
        'role',
        'accessToken',
        'createdAt',
        'updatedAt',
      ],
      keyForAttribute: 'camelCase',
    });
  }

  serialize(type: string, data: any) {
    const serializer = this.serializers[type];
    if (!serializer) {
      throw new Error(`Serializer for type '${type}' not found`);
    }
    return serializer.serialize(data);
  }
}
