// Auto-generated , DO NOT EDIT
import { Entity, FunctionPropertyNames, FieldsExpression, GetOptions } from '@subql/types-core';
import assert from 'assert';

export type RuntimeCreationProps = Omit<
  RuntimeCreation,
  NonNullable<FunctionPropertyNames<RuntimeCreation>> | '_name'
>;

export class RuntimeCreation implements Entity {
  constructor(
    id: string,
    name: string,
    type: string,
    createdBy: string,
    blockHeight: bigint,
    extrinsicId: string,
    eventId: string,
  ) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.createdBy = createdBy;
    this.blockHeight = blockHeight;
    this.extrinsicId = extrinsicId;
    this.eventId = eventId;
  }

  public id: string;
  public name: string;
  public type: string;
  public createdBy: string;
  public blockHeight: bigint;
  public extrinsicId: string;
  public eventId: string;

  get _name(): string {
    return 'RuntimeCreation';
  }

  async save(): Promise<void> {
    let id = this.id;
    assert(id !== null, 'Cannot save RuntimeCreation entity without an ID');
    await store.set('RuntimeCreation', id.toString(), this);
  }

  static async remove(id: string): Promise<void> {
    assert(id !== null, 'Cannot remove RuntimeCreation entity without an ID');
    await store.remove('RuntimeCreation', id.toString());
  }

  static async get(id: string): Promise<RuntimeCreation | undefined> {
    assert(id !== null && id !== undefined, 'Cannot get RuntimeCreation entity without an ID');
    const record = await store.get('RuntimeCreation', id.toString());
    if (record) {
      return this.create(record as RuntimeCreationProps);
    } else {
      return;
    }
  }

  /**
   * Gets entities matching the specified filters and options.
   *
   * ⚠️ This function will first search cache data followed by DB data. Please consider this when using order and offset options.⚠️
   * */
  static async getByFields(
    filter: FieldsExpression<RuntimeCreationProps>[],
    options?: GetOptions<RuntimeCreationProps>,
  ): Promise<RuntimeCreation[]> {
    const records = await store.getByFields('RuntimeCreation', filter, options);
    return records.map(record => this.create(record as RuntimeCreationProps));
  }

  static create(record: RuntimeCreationProps): RuntimeCreation {
    assert(typeof record.id === 'string', 'id must be provided');
    let entity = new this(
      record.id,
      record.name,
      record.type,
      record.createdBy,
      record.blockHeight,
      record.extrinsicId,
      record.eventId,
    );
    Object.assign(entity, record);
    return entity;
  }
}
