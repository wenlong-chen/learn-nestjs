import { Field, Int, ObjectType } from "@nestjs/graphql";
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class UserDTO {
  @Field((type) => Int)
  id: number;

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
