import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PokemonModule } from './pokemon/pokemon.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModule } from './common/common.module';
import { SeedModule } from './seed/seed.module';
import { ConfigModule } from '@nestjs/config';
import { EnvConfiguration } from './config/app.config';
import { JoiValidationSchema } from './config/joi.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [EnvConfiguration], // map env variables to configuration object
      validationSchema: JoiValidationSchema, // validate env variables
    }), // load .env
    ServeStaticModule.forRoot({ rootPath: join(__dirname, '..', 'public') }), // serve static files
    MongooseModule.forRoot(process.env.MONGODB, {
      dbName: 'pokemons-db',
    }), // connect to MongoDB
    PokemonModule,
    CommonModule,
    SeedModule,
  ],
})
export class AppModule {}
