import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, default: 10 })
  limit?: number = 10;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function paginate<T>(rows: T[], count: number, page: number, limit: number): PaginatedResult<T> {
  return {
    data: rows,
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
  };
}
