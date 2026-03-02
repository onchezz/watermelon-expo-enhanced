import { Model } from '@nozbe/watermelondb';

export class Task extends Model {
  static table = 'tasks';

  get name(): string {
    return this._getRaw('name') as string;
  }

  set name(value: string) {
    this._setRaw('name', value);
  }

  get isDone(): boolean {
    return this._getRaw('is_done') as boolean;
  }

  set isDone(value: boolean) {
    this._setRaw('is_done', value);
  }

  get createdAt(): number {
    return this._getRaw('created_at') as number;
  }

  set createdAt(value: number) {
    this._setRaw('created_at', value);
  }
}
