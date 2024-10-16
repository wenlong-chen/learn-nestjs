export class UserDTO {
  name: string;
  jsonColumn: Record<string, unknown>;
  arrayColumn: Record<string, unknown>[];
  varcharColumn: string;
  uuidColumn: string;
  booleanColumn: boolean;
}
