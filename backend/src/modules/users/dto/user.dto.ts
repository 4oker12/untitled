export class UserDto {
  id!: number;
  email!: string;
  name?: string | null;
  createdAt!: string; // ISO string for REST
}
