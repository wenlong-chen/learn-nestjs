import { Field, Int, ObjectType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class UserDTO {
  @Field(() => Int)
  id: number;

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
