import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { PokeApiResponse } from './interfaces/poke-api-response.interface';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { PokemonService } from 'src/pokemon/pokemon.service';
import { CreatePokemonDto } from 'src/pokemon/dto/create-pokemon.dto';

@Injectable()
export class SeedService {
  constructor(
    private readonly httpService: HttpService,
    private readonly pokemonService: PokemonService,
  ) {}

  async seed() {
    const { data } = await firstValueFrom(
      this.httpService
        .get<PokeApiResponse>('https://pokeapi.co/api/v2/pokemon?limit=650')
        .pipe(
          catchError((error: AxiosError) => {
            console.error(error.response.data);
            throw 'Something went wrong';
          }),
        ),
    );
    // map over the results
    const pokemons: CreatePokemonDto[] = data.results.map(({ name, url }) => {
      // get the no from the url
      const segments = url.split('/');
      const no = +segments[segments.length - 2];
      // create pokemon dto
      const pokemon: CreatePokemonDto = { no, name };
      return pokemon;
    });
    // create pokemons in database
    await this.pokemonService.populateWithSeedData(pokemons);

    return 'Seed executed successfully';
  }
}
