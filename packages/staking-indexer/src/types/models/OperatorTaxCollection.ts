// Auto-generated , DO NOT EDIT
import { Entity, FunctionPropertyNames, FieldsExpression, GetOptions } from '@subql/types-core';
import assert from 'assert';

export type OperatorTaxCollectionProps = Omit<
  OperatorTaxCollection,
  NonNullable<FunctionPropertyNames<OperatorTaxCollection>> | '_name'
>;

export class OperatorTaxCollection implements Entity {
  constructor(
    id: string,
    domainId: string,
    operatorId: string,
    amount: bigint,
    blockHeight: bigint,
    extrinsicId: string,
    eventId: string,
    processed: boolean,
  ) {
    this.id = id;
    this.domainId = domainId;
    this.operatorId = operatorId;
    this.amount = amount;
    this.blockHeight = blockHeight;
    this.extrinsicId = extrinsicId;
    this.eventId = eventId;
    this.processed = processed;
  }

  public id: string;
  public domainId: string;
  public operatorId: string;
  public amount: bigint;
  public blockHeight: bigint;
  public extrinsicId: string;
  public eventId: string;
  public processed: boolean;

  get _name(): string {
    return 'OperatorTaxCollection';
  }

  async save(): Promise<void> {
    let id = this.id;
    assert(id !== null, 'Cannot save OperatorTaxCollection entity without an ID');
    await store.set('OperatorTaxCollection', id.toString(), this);
  }

  static async remove(id: string): Promise<void> {
    assert(id !== null, 'Cannot remove OperatorTaxCollection entity without an ID');
    await store.remove('OperatorTaxCollection', id.toString());
  }

  static async get(id: string): Promise<OperatorTaxCollection | undefined> {
    assert(
      id !== null && id !== undefined,
      'Cannot get OperatorTaxCollection entity without an ID',
    );
    const record = await store.get('OperatorTaxCollection', id.toString());
    if (record) {
      return this.create(record as OperatorTaxCollectionProps);
    } else {
      return;
    }
  }

  static async getByProcessed(processed: boolean): Promise<OperatorTaxCollection[] | undefined> {
    const records = await store.getByField('OperatorTaxCollection', 'processed', processed);
    return records.map(record => this.create(record as OperatorTaxCollectionProps));
  }

  /**
   * Gets entities matching the specified filters and options.
   *
   * ⚠️ This function will first search cache data followed by DB data. Please consider this when using order and offset options.⚠️
   * */
  static async getByFields(
    filter: FieldsExpression<OperatorTaxCollectionProps>[],
    options?: GetOptions<OperatorTaxCollectionProps>,
  ): Promise<OperatorTaxCollection[]> {
    const records = await store.getByFields('OperatorTaxCollection', filter, options);
    return records.map(record => this.create(record as OperatorTaxCollectionProps));
  }

  static create(record: OperatorTaxCollectionProps): OperatorTaxCollection {
    assert(typeof record.id === 'string', 'id must be provided');
    let entity = new this(
      record.id,
      record.domainId,
      record.operatorId,
      record.amount,
      record.blockHeight,
      record.extrinsicId,
      record.eventId,
      record.processed,
    );
    Object.assign(entity, record);
    return entity;
  }
}
