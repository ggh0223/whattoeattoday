import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { Routers } from './router';

@Module({
    imports: [RouterModule.register(Routers)],
    controllers: [],
    providers: [],
})
export class AppRouterModule {}
