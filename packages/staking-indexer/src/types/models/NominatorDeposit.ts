// Auto-generated , DO NOT EDIT
import { Entity, FunctionPropertyNames, FieldsExpression, GetOptions } from '@subql/types-core';
import assert from 'assert';

export type NominatorDepositProps = Omit<
  NominatorDeposit,
  NonNullable<FunctionPropertyNames<NominatorDeposit>> | '_name'
>;

export class NominatorDeposit implements Entity {
  constructor(
    id: string,
    address: string,
    operatorId: string,
    domainId: string,
    knownShares: bigint,
    knownStorageFeeDeposit: bigint,
    pendingAmount: bigint,
    pendingStorageFeeDeposit: bigint,
    pendingEffectiveDomainEpoch: bigint,
    extrinsicIds: string,
    eventIds: string,
    timestamp: Date,
    blockHeights: string,
    blockHeight: bigint,
    processed: boolean,
  ) {
    this.id = id;
    this.address = address;
    this.operatorId = operatorId;
    this.domainId = domainId;
    this.knownShares = knownShares;
    this.knownStorageFeeDeposit = knownStorageFeeDeposit;
    this.pendingAmount = pendingAmount;
    this.pendingStorageFeeDeposit = pendingStorageFeeDeposit;
    this.pendingEffectiveDomainEpoch = pendingEffectiveDomainEpoch;
    this.extrinsicIds = extrinsicIds;
    this.eventIds = eventIds;
    this.timestamp = timestamp;
    this.blockHeights = blockHeights;
    this.blockHeight = blockHeight;
    this.processed = processed;
  }

  public id: string;
  public address: string;
  public operatorId: string;
  public domainId: string;
  public knownShares: bigint;
  public knownStorageFeeDeposit: bigint;
  public pendingAmount: bigint;
  public pendingStorageFeeDeposit: bigint;
  public pendingEffectiveDomainEpoch: bigint;
  public extrinsicIds: string;
  public eventIds: string;
  public timestamp: Date;
  public blockHeights: string;
  public blockHeight: bigint;
  public processed: boolean;

  get _name(): string {
    return 'NominatorDeposit';
  }

  async save(): Promise<void> {
    let id = this.id;
    assert(id !== null, 'Cannot save NominatorDeposit entity without an ID');
    await store.set('NominatorDeposit', id.toString(), this);
  }

  static async remove(id: string): Promise<void> {
    assert(id !== null, 'Cannot remove NominatorDeposit entity without an ID');
    await store.remove('NominatorDeposit', id.toString());
  }

  static async get(id: string): Promise<NominatorDeposit | undefined> {
    assert(id !== null && id !== undefined, 'Cannot get NominatorDeposit entity without an ID');
    const record = await store.get('NominatorDeposit', id.toString());
    if (record) {
      return this.create(record as NominatorDepositProps);
    } else {
      return;
    }
  }

  static async getByAddress(address: string): Promise<NominatorDeposit[] | undefined> {
    const records = await store.getByField('NominatorDeposit', 'address', address);
    return records.map(record => this.create(record as NominatorDepositProps));
  }

  static async getByOperatorId(operatorId: string): Promise<NominatorDeposit[] | undefined> {
    const records = await store.getByField('NominatorDeposit', 'operatorId', operatorId);
    return records.map(record => this.create(record as NominatorDepositProps));
  }

  static async getByDomainId(domainId: string): Promise<NominatorDeposit[] | undefined> {
    const records = await store.getByField('NominatorDeposit', 'domainId', domainId);
    return records.map(record => this.create(record as NominatorDepositProps));
  }

  static async getByProcessed(processed: boolean): Promise<NominatorDeposit[] | undefined> {
    const records = await store.getByField('NominatorDeposit', 'processed', processed);
    return records.map(record => this.create(record as NominatorDepositProps));
  }

  /**
   * Gets entities matching the specified filters and options.
   *
   * ⚠️ This function will first search cache data followed by DB data. Please consider this when using order and offset options.⚠️
   * */
  static async getByFields(
    filter: FieldsExpression<NominatorDepositProps>[],
    options?: GetOptions<NominatorDepositProps>,
  ): Promise<NominatorDeposit[]> {
    const records = await store.getByFields('NominatorDeposit', filter, options);
    return records.map(record => this.create(record as NominatorDepositProps));
  }

  static create(record: NominatorDepositProps): NominatorDeposit {
    assert(typeof record.id === 'string', 'id must be provided');
    let entity = new this(
      record.id,
      record.address,
      record.operatorId,
      record.domainId,
      record.knownShares,
      record.knownStorageFeeDeposit,
      record.pendingAmount,
      record.pendingStorageFeeDeposit,
      record.pendingEffectiveDomainEpoch,
      record.extrinsicIds,
      record.eventIds,
      record.timestamp,
      record.blockHeights,
      record.blockHeight,
      record.processed,
    );
    Object.assign(entity, record);
    return entity;
  }
}
