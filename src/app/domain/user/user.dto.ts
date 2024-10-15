export class UserDTO {
  name: string;
  jsonColumn: Record<string, unknown>;
  varcharColumn: string;
  uuidColumn: string;
  booleanColumn: boolean;
}

export class ListDTO {
  number: number;
}