import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Rating } from './rating.entity'; // 나중에 만들 rating 엔티티 연결

@Entity('member')
export class Member {
  @PrimaryGeneratedColumn({ name: 'member_id' })
  memberId: number;

  @Column({ length: 254, unique: true })
  email: string;

  @Column({ length: 60 })
  password: string;

  @Column({ length: 50, unique: true })
  nickname: string;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToMany(() => Rating, (rating) => rating.member)
  ratings: Rating[];
}