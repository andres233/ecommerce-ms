import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Order extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  public id!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  public price!: number;

  @Column({ type: 'integer', default:0 })
  public quantity!: number;

  /*
   * Relation IDs
   */

  @Column({ type: 'integer' })
  public productId!: number;

  @Column({ type: 'integer' })
  public userId!: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
