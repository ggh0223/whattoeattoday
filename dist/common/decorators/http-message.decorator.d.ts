import { CustomDecorator } from '@nestjs/common';
export declare const STATUS_MESSAGE_KEY = "statusMessage";
export declare const StatusMessage: (message: string) => CustomDecorator<string>;
