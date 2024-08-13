import { IsDate, IsDefined, IsString } from 'class-validator';
import { Entity, ObjectId, ObjectIdColumn } from 'typeorm';

@Entity('dlq')
export class DLQEntity {
  @ObjectIdColumn()
  _id: ObjectId;

  @IsString()
  @IsDefined()
  value: string; // TODO: could be an JSON Object?

  @IsString()
  @IsDefined()
  topic: string;

  @IsDate()
  @IsDefined()
  createdAt: Date;
}
