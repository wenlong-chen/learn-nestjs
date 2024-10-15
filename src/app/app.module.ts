import { DynamicModule, Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';

export const dynamicModules: Record<string, DynamicModule> = {
  TypeOrmModule: TypeOrmModule.forRootAsync({
    useFactory: () => ({
      type: 'sqlite',
      database: 'db.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      columnTypes: {
        jsonb: 'text',
      },
    }),
  }),
};

@Module({
  imports: [
    // type orm for sqlite
    dynamicModules['TypeOrmModule'],
    UserModule,
  ],
})
export class AppModule {}
