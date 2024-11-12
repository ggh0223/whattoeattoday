import { Entity, PrimaryGeneratedColumn, Column,   CreateDateColumn, 
    UpdateDateColumn  } from 'typeorm';
import { Transform } from 'class-transformer';
import { IsNumber, validateOrReject } from 'class-validator';

export type SocialPostSource = 'instagram' | 'kakao';

@Entity({ name: 'menus' })
export class Menu {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: 'varchar', length: 255 })
    title: string;
  
    @Column({ type: 'text' })
    content: string;
  
    @Column('simple-array')
    imageUrls: string[];
  
    @Column({
      type: 'enum',
      enum: ['instagram', 'kakao'],
      enumName: 'social_post_source'
    })
    source: SocialPostSource;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

}

  
 
 
  