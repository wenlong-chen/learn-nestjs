import { Args, Mutation, Resolver, Query, ResolveField, Parent, Subscription } from "@nestjs/graphql";
import { UserDTO } from './user.dto';
import { UserService } from '../../domain/user/user.service';
import { UserEntity } from '../../domain/user/user.entity';
import { CreateUserInput } from './create-user.input';
import { PubSub } from "graphql-subscriptions";

@Resolver()
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly pubSub: PubSub,
  ) {}

  @Query(() => [UserDTO])
  async users(): Promise<UserEntity[]> {
    return await this.userService.getUsers();
  }

  @Subscription(() => UserDTO, {resolve: value => value})
  userCreated() {
    return this.pubSub.asyncIterator('userCreated');
  }

  @Mutation(() => UserDTO)
  async createUser(@Args('user') user: CreateUserInput) {
    return this.userService.createUser(user);
  }
}
