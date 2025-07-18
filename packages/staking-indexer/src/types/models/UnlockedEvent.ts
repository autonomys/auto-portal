// Auto-generated , DO NOT EDIT
import { Entity, FunctionPropertyNames, FieldsExpression, GetOptions } from '@subql/types-core';
import assert from 'assert';

export type UnlockedEventProps = Omit<
  UnlockedEvent,
  NonNullable<FunctionPropertyNames<UnlockedEvent>> | '_name'
>;

export class UnlockedEvent implements Entity {
  constructor(
    id: string,
    domainId: string,
    operatorId: string,
    address: string,
    nominatorId: string,
    amount: bigint,
    storageFee: bigint,
    timestamp: Date,
    blockHeight: bigint,
    extrinsicId: string,
    eventId: string,
    processed: boolean,
  ) {
    this.id = id;
    this.domainId = domainId;
    this.operatorId = operatorId;
    this.address = address;
    this.nominatorId = nominatorId;
    this.amount = amount;
    this.storageFee = storageFee;
    this.timestamp = timestamp;
    this.blockHeight = blockHeight;
    this.extrinsicId = extrinsicId;
    this.eventId = eventId;
    this.processed = processed;
  }

  public id: string;
  public domainId: string;
  public operatorId: string;
  public address: string;
  public nominatorId: string;
  public amount: bigint;
  public storageFee: bigint;
  public timestamp: Date;
  public blockHeight: bigint;
  public extrinsicId: string;
  public eventId: string;
  public processed: boolean;

  get _name(): string {
    return 'UnlockedEvent';
  }

  async save(): Promise<void> {
    let id = this.id;
    assert(id !== null, 'Cannot save UnlockedEvent entity without an ID');
    await store.set('UnlockedEvent', id.toString(), this);
  }

  static async remove(id: string): Promise<void> {
    assert(id !== null, 'Cannot remove UnlockedEvent entity without an ID');
    await store.remove('UnlockedEvent', id.toString());
  }

  static async get(id: string): Promise<UnlockedEvent | undefined> {
    assert(id !== null && id !== undefined, 'Cannot get UnlockedEvent entity without an ID');
    const record = await store.get('UnlockedEvent', id.toString());
    if (record) {
      return this.create(record as UnlockedEventProps);
    } else {
      return;
    }
  }

  static async getByProcessed(processed: boolean): Promise<UnlockedEvent[] | undefined> {
    const records = await store.getByField('UnlockedEvent', 'processed', processed);
    return records.map(record => this.create(record as UnlockedEventProps));
  }

  /**
   * Gets entities matching the specified filters and options.
   *
   * ⚠️ This function will first search cache data followed by DB data. Please consider this when using order and offset options.⚠️
   * */
  static async getByFields(
    filter: FieldsExpression<UnlockedEventProps>[],
    options?: GetOptions<UnlockedEventProps>,
  ): Promise<UnlockedEvent[]> {
    const records = await store.getByFields('UnlockedEvent', filter, options);
    return records.map(record => this.create(record as UnlockedEventProps));
  }

  static create(record: UnlockedEventProps): UnlockedEvent {
    assert(typeof record.id === 'string', 'id must be provided');
    let entity = new this(
      record.id,
      record.domainId,
      record.operatorId,
      record.address,
      record.nominatorId,
      record.amount,
      record.storageFee,
      record.timestamp,
      record.blockHeight,
      record.extrinsicId,
      record.eventId,
      record.processed,
    );
    Object.assign(entity, record);
    return entity;
  }
}
