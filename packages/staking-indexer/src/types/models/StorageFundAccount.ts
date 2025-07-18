// Auto-generated , DO NOT EDIT
import { Entity, FunctionPropertyNames, FieldsExpression, GetOptions } from '@subql/types-core';
import assert from 'assert';

export type StorageFundAccountProps = Omit<
  StorageFundAccount,
  NonNullable<FunctionPropertyNames<StorageFundAccount>> | '_name'
>;

export class StorageFundAccount implements Entity {
  constructor(
    id: string,
    operatorId: string,
    address: string,
    balance: bigint,
    timestamp: Date,
    blockHeight: bigint,
  ) {
    this.id = id;
    this.operatorId = operatorId;
    this.address = address;
    this.balance = balance;
    this.timestamp = timestamp;
    this.blockHeight = blockHeight;
  }

  public id: string;
  public operatorId: string;
  public address: string;
  public balance: bigint;
  public timestamp: Date;
  public blockHeight: bigint;

  get _name(): string {
    return 'StorageFundAccount';
  }

  async save(): Promise<void> {
    let id = this.id;
    assert(id !== null, 'Cannot save StorageFundAccount entity without an ID');
    await store.set('StorageFundAccount', id.toString(), this);
  }

  static async remove(id: string): Promise<void> {
    assert(id !== null, 'Cannot remove StorageFundAccount entity without an ID');
    await store.remove('StorageFundAccount', id.toString());
  }

  static async get(id: string): Promise<StorageFundAccount | undefined> {
    assert(id !== null && id !== undefined, 'Cannot get StorageFundAccount entity without an ID');
    const record = await store.get('StorageFundAccount', id.toString());
    if (record) {
      return this.create(record as StorageFundAccountProps);
    } else {
      return;
    }
  }

  static async getByOperatorId(operatorId: string): Promise<StorageFundAccount[] | undefined> {
    const records = await store.getByField('StorageFundAccount', 'operatorId', operatorId);
    return records.map(record => this.create(record as StorageFundAccountProps));
  }

  /**
   * Gets entities matching the specified filters and options.
   *
   * ⚠️ This function will first search cache data followed by DB data. Please consider this when using order and offset options.⚠️
   * */
  static async getByFields(
    filter: FieldsExpression<StorageFundAccountProps>[],
    options?: GetOptions<StorageFundAccountProps>,
  ): Promise<StorageFundAccount[]> {
    const records = await store.getByFields('StorageFundAccount', filter, options);
    return records.map(record => this.create(record as StorageFundAccountProps));
  }

  static create(record: StorageFundAccountProps): StorageFundAccount {
    assert(typeof record.id === 'string', 'id must be provided');
    let entity = new this(
      record.id,
      record.operatorId,
      record.address,
      record.balance,
      record.timestamp,
      record.blockHeight,
    );
    Object.assign(entity, record);
    return entity;
  }
}
