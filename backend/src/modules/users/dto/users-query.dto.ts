import { IsInt, IsOptional, IsString, Matches, Min } from 'class-validator';

export class UsersQueryDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  skip?: number = 0;

  @IsOptional()
  @IsInt()
  @Min(1)
  take?: number = 20;

  @IsOptional()
  @IsString()
  search?: string;

  // format: "id:asc" | "id:desc" | "createdAt:asc" | "createdAt:desc"
  @IsOptional()
  @Matches(/^(id|createdAt):(asc|desc)$/i)
  order?: string = 'id:asc';
}
