// Auto-generated , DO NOT EDIT
import { Entity, FunctionPropertyNames, FieldsExpression, GetOptions } from '@subql/types-core';
import assert from 'assert';

export type DomainInstantiationProps = Omit<
  DomainInstantiation,
  NonNullable<FunctionPropertyNames<DomainInstantiation>> | '_name'
>;

export class DomainInstantiation implements Entity {
  constructor(
    id: string,
    name: string,
    runtimeId: number,
    runtime: string,
    runtimeInfo: string,
    createdBy: string,
    blockHeight: bigint,
    extrinsicId: string,
    eventId: string,
  ) {
    this.id = id;
    this.name = name;
    this.runtimeId = runtimeId;
    this.runtime = runtime;
    this.runtimeInfo = runtimeInfo;
    this.createdBy = createdBy;
    this.blockHeight = blockHeight;
    this.extrinsicId = extrinsicId;
    this.eventId = eventId;
  }

  public id: string;
  public name: string;
  public runtimeId: number;
  public runtime: string;
  public runtimeInfo: string;
  public createdBy: string;
  public blockHeight: bigint;
  public extrinsicId: string;
  public eventId: string;

  get _name(): string {
    return 'DomainInstantiation';
  }

  async save(): Promise<void> {
    let id = this.id;
    assert(id !== null, 'Cannot save DomainInstantiation entity without an ID');
    await store.set('DomainInstantiation', id.toString(), this);
  }

  static async remove(id: string): Promise<void> {
    assert(id !== null, 'Cannot remove DomainInstantiation entity without an ID');
    await store.remove('DomainInstantiation', id.toString());
  }

  static async get(id: string): Promise<DomainInstantiation | undefined> {
    assert(id !== null && id !== undefined, 'Cannot get DomainInstantiation entity without an ID');
    const record = await store.get('DomainInstantiation', id.toString());
    if (record) {
      return this.create(record as DomainInstantiationProps);
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
    filter: FieldsExpression<DomainInstantiationProps>[],
    options?: GetOptions<DomainInstantiationProps>,
  ): Promise<DomainInstantiation[]> {
    const records = await store.getByFields('DomainInstantiation', filter, options);
    return records.map(record => this.create(record as DomainInstantiationProps));
  }

  static create(record: DomainInstantiationProps): DomainInstantiation {
    assert(typeof record.id === 'string', 'id must be provided');
    let entity = new this(
      record.id,
      record.name,
      record.runtimeId,
      record.runtime,
      record.runtimeInfo,
      record.createdBy,
      record.blockHeight,
      record.extrinsicId,
      record.eventId,
    );
    Object.assign(entity, record);
    return entity;
  }
}
