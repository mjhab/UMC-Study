import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Book } from './book.entity';

@Entity('category')
export class Category {
  @PrimaryGeneratedColumn({ name: 'category_id' })
  id: number;

  @Column({ length: 50 })
  name: string;

  // Book 엔티티와 일대다(1:N) 관계를 연결하여 에러를 해결합니다.
  @OneToMany(() => Book, (book) => book.category)
  books: Book[];
}