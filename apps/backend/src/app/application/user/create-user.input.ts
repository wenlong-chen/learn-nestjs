import { Field, InputType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class CreateUserInput {
  @Field(() => String)
  name: string;

  @Field(() => GraphQLJSON)
  jsonColumn: Record<string, unknown>;

  @Field(() => [GraphQLJSON])
  arrayColumn: Record<string, unknown>[];

  @Field(() => String)
  varcharColumn: string;

  @Field(() => String)
  uuidColumn: string;

  @Field(() => Boolean)
  booleanColumn: boolean;
}
