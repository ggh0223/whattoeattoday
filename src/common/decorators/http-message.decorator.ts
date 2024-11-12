import { SetMetadata, CustomDecorator } from '@nestjs/common';

export const STATUS_MESSAGE_KEY = 'statusMessage';
export const StatusMessage = (message: string): CustomDecorator<string> => SetMetadata(STATUS_MESSAGE_KEY, message);
