import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Product } from './product.entity';

@Entity()
export class StockDecreaseLog extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id!: number;

  /*
   * Relation IDs
   */

  @Column({ type: 'varchar' })
  public orderId!: string;

  /*
   * Many-To-One Relationships
   */

  @ManyToOne(() => Product, (product) => product.stockDecreaseLogs)
  public product: Product;
}
