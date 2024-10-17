import { Field, InputType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class CreateUserInput {
  @Field((type) => String)
  name: string;

  @Field((type) => GraphQLJSON)
  jsonColumn: Record<string, unknown>;

  @Field((type) => [GraphQLJSON])
  arrayColumn: Record<string, unknown>[];

  @Field((type) => String)
  varcharColumn: string;

  @Field((type) => String)
  uuidColumn: string;

  @Field((type) => Boolean)
  booleanColumn: boolean;
}
