import { Role } from '../models/role.enum';

export class UserDto {
  id!: number;
  email!: string;
  name?: string | null;
  role!: Role;
  createdAt!: string; // ISO string for REST
}
