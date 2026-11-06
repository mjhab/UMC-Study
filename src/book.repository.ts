import { Injectable, Inject } from '@nestjs/common';
import type { Pool } from 'mysql2/promise';
import { DATABASE_CONNECTION } from './database.provider';

@Injectable()
export class BookRepository {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly pool: Pool,
  ) {}

  // [실습 1] 전체 도서 조회
  async findAll(): Promise<any> {
    const sql = 'SELECT * FROM book';
    const [rows] = await this.pool.query(sql);
    return rows;
  }

  // [실습 2] 신규 도서 등록
  async create(body: Record<string, any>): Promise<any> {
    const sql =
      'INSERT INTO book (category_id, title, description, is_available) VALUES (?, ?, ?, true)';
    const [result] = await this.pool.execute(sql, [
      body.categoryId,
      body.title,
      body.description,
    ]);
    return result;
  }

  // [미션 1] 특정 카테고리 도서 목록 조회 (GET /books/category/:categoryId)
  async findByCategoryId(categoryId: number): Promise<any> {
    const sql = 'SELECT * FROM book WHERE category_id = ?';
    const [rows] = await this.pool.execute(sql, [categoryId]);
    return rows;
  }

  // [미션 2] 신규 도서 대여 기록 생성 (POST /rentals)
  async createRental(userId: number, bookId: number): Promise<any> {
    const sql = `
      INSERT INTO rental (user_id, book_id, rented_at, due_at)
      VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY))
    `;
    const [result] = await this.pool.execute(sql, [userId, bookId]);
    return result;
  }
}