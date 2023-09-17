import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { Model, isValidObjectId } from 'mongoose';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PokemonService {
  private defaultLimit: number;

  constructor(
    @InjectModel(Pokemon.name) private pokemonModel: Model<Pokemon>,
    private readonly configService: ConfigService,
  ) {
    this.defaultLimit = this.configService.get<number>('default_limit');
  }

  async create(createPokemonDto: CreatePokemonDto): Promise<Pokemon> {
    try {
      // create pokemon in database
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      // success
      return pokemon;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async findAll(paginatioDto: PaginationDto): Promise<Pokemon[]> {
    const { limit = this.defaultLimit, offset = 0 } = paginatioDto;
    return (
      this.pokemonModel
        .find()
        .limit(limit)
        .skip(offset)
        // sort by pokemon no in ascending order
        .sort({ no: 1 })
        // exclude _id and __v from results
        .select('-_id -__v')
    );
  }

  async findOne(id: string): Promise<Pokemon> {
    let pokemon: Pokemon;
    // if id is a number, query by pokemon no
    if (!isNaN(+id)) {
      pokemon = await this.pokemonModel.findOne({ no: id });
    }
    // if id is a mongo object id, query by id
    if (!pokemon && isValidObjectId(id)) {
      pokemon = await this.pokemonModel.findById(id);
    }
    // if id is a string, query by pokemon name
    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({ name: id });
    }
    // throw not found exception if pokemon is not found
    if (!pokemon) {
      throw new NotFoundException(`Pokemon with id ${id} not found`);
    }

    return pokemon;
  }

  async update(
    id: string,
    updatePokemonDto: UpdatePokemonDto,
  ): Promise<Pokemon> {
    try {
      // this is another way to find and update a pokemon
      const pokemon = await this.pokemonModel.findOneAndUpdate(
        // find pokemon
        {
          $or: [
            // if id is a number, query by pokemon no
            { no: !isNaN(+id) ? +id : null },
            // if id is a mongo object id, query by id
            { _id: isValidObjectId(id) ? id : null },
            // if id is a string, query by pokemon name
            { name: id },
          ],
        },
        // update pokemon
        { $set: updatePokemonDto },
        // return updated pokemon
        { new: true },
      );

      if (!pokemon) {
        // this will throw a not found exception so this is going to be caught by the catch block
        throw new NotFoundException(`Pokemon with id ${id} not found`);
      }

      return pokemon;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async remove(id: string) {
    try {
      const pokemon = await this.pokemonModel.findOneAndDelete({
        $or: [
          // if id is a number, query by pokemon no
          { no: !isNaN(+id) ? +id : null },
          // if id is a mongo object id, query by id
          { _id: isValidObjectId(id) ? id : null },
          // if id is a string, query by pokemon name
          { name: id },
        ],
      });

      if (!pokemon) {
        // this will throw a not found exception so this is going to be caught by the catch block
        throw new NotFoundException(`Pokemon with id ${id} not found`);
      }
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async removeById(id: string) {
    return id;
  }

  async populateWithSeedData(pokemons: CreatePokemonDto[]) {
    // remove all pokemons
    await this.pokemonModel.deleteMany({});
    // insert all pokemons
    await this.pokemonModel.insertMany(pokemons);
  }

  private handleExceptions(error: any) {
    console.error({ error });
    // check if pokemon already exists in database
    if (error.code === 11000) {
      throw new BadRequestException(
        `Pokemon already exists in database ${error.keyValue}`,
      );
    }
    // throw not found exception if pokemon is not found
    if (error instanceof NotFoundException) {
      throw new NotFoundException(error.message);
    }
    // throw internal server error if error is not related to pokemon already existing
    throw new InternalServerErrorException(`Something went wrong, check logs`);
  }
}
