// Auto-generated , DO NOT EDIT
import { Entity, FunctionPropertyNames, FieldsExpression, GetOptions } from '@subql/types-core';
import assert from 'assert';

export type NominatorWithdrawalProps = Omit<
  NominatorWithdrawal,
  NonNullable<FunctionPropertyNames<NominatorWithdrawal>> | '_name'
>;

export class NominatorWithdrawal implements Entity {
  constructor(
    id: string,
    address: string,
    operatorId: string,
    domainId: string,
    withdrawalInSharesAmount: bigint,
    withdrawalInSharesStorageFeeRefund: bigint,
    withdrawalInSharesDomainEpoch: string,
    withdrawalInSharesUnlockBlock: bigint,
    totalWithdrawalAmount: bigint,
    totalStorageFeeWithdrawal: bigint,
    withdrawalsJson: string,
    totalPendingWithdrawals: bigint,
    extrinsicIds: string,
    eventIds: string,
    timestamp: Date,
    blockHeight: bigint,
    blockHeights: string,
    processed: boolean,
  ) {
    this.id = id;
    this.address = address;
    this.operatorId = operatorId;
    this.domainId = domainId;
    this.withdrawalInSharesAmount = withdrawalInSharesAmount;
    this.withdrawalInSharesStorageFeeRefund = withdrawalInSharesStorageFeeRefund;
    this.withdrawalInSharesDomainEpoch = withdrawalInSharesDomainEpoch;
    this.withdrawalInSharesUnlockBlock = withdrawalInSharesUnlockBlock;
    this.totalWithdrawalAmount = totalWithdrawalAmount;
    this.totalStorageFeeWithdrawal = totalStorageFeeWithdrawal;
    this.withdrawalsJson = withdrawalsJson;
    this.totalPendingWithdrawals = totalPendingWithdrawals;
    this.extrinsicIds = extrinsicIds;
    this.eventIds = eventIds;
    this.timestamp = timestamp;
    this.blockHeight = blockHeight;
    this.blockHeights = blockHeights;
    this.processed = processed;
  }

  public id: string;
  public address: string;
  public operatorId: string;
  public domainId: string;
  public withdrawalInSharesAmount: bigint;
  public withdrawalInSharesStorageFeeRefund: bigint;
  public withdrawalInSharesDomainEpoch: string;
  public withdrawalInSharesUnlockBlock: bigint;
  public totalWithdrawalAmount: bigint;
  public totalStorageFeeWithdrawal: bigint;
  public withdrawalsJson: string;
  public totalPendingWithdrawals: bigint;
  public extrinsicIds: string;
  public eventIds: string;
  public timestamp: Date;
  public blockHeight: bigint;
  public blockHeights: string;
  public processed: boolean;

  get _name(): string {
    return 'NominatorWithdrawal';
  }

  async save(): Promise<void> {
    let id = this.id;
    assert(id !== null, 'Cannot save NominatorWithdrawal entity without an ID');
    await store.set('NominatorWithdrawal', id.toString(), this);
  }

  static async remove(id: string): Promise<void> {
    assert(id !== null, 'Cannot remove NominatorWithdrawal entity without an ID');
    await store.remove('NominatorWithdrawal', id.toString());
  }

  static async get(id: string): Promise<NominatorWithdrawal | undefined> {
    assert(id !== null && id !== undefined, 'Cannot get NominatorWithdrawal entity without an ID');
    const record = await store.get('NominatorWithdrawal', id.toString());
    if (record) {
      return this.create(record as NominatorWithdrawalProps);
    } else {
      return;
    }
  }

  static async getByAddress(address: string): Promise<NominatorWithdrawal[] | undefined> {
    const records = await store.getByField('NominatorWithdrawal', 'address', address);
    return records.map(record => this.create(record as NominatorWithdrawalProps));
  }

  static async getByOperatorId(operatorId: string): Promise<NominatorWithdrawal[] | undefined> {
    const records = await store.getByField('NominatorWithdrawal', 'operatorId', operatorId);
    return records.map(record => this.create(record as NominatorWithdrawalProps));
  }

  static async getByDomainId(domainId: string): Promise<NominatorWithdrawal[] | undefined> {
    const records = await store.getByField('NominatorWithdrawal', 'domainId', domainId);
    return records.map(record => this.create(record as NominatorWithdrawalProps));
  }

  static async getByProcessed(processed: boolean): Promise<NominatorWithdrawal[] | undefined> {
    const records = await store.getByField('NominatorWithdrawal', 'processed', processed);
    return records.map(record => this.create(record as NominatorWithdrawalProps));
  }

  /**
   * Gets entities matching the specified filters and options.
   *
   * ⚠️ This function will first search cache data followed by DB data. Please consider this when using order and offset options.⚠️
   * */
  static async getByFields(
    filter: FieldsExpression<NominatorWithdrawalProps>[],
    options?: GetOptions<NominatorWithdrawalProps>,
  ): Promise<NominatorWithdrawal[]> {
    const records = await store.getByFields('NominatorWithdrawal', filter, options);
    return records.map(record => this.create(record as NominatorWithdrawalProps));
  }

  static create(record: NominatorWithdrawalProps): NominatorWithdrawal {
    assert(typeof record.id === 'string', 'id must be provided');
    let entity = new this(
      record.id,
      record.address,
      record.operatorId,
      record.domainId,
      record.withdrawalInSharesAmount,
      record.withdrawalInSharesStorageFeeRefund,
      record.withdrawalInSharesDomainEpoch,
      record.withdrawalInSharesUnlockBlock,
      record.totalWithdrawalAmount,
      record.totalStorageFeeWithdrawal,
      record.withdrawalsJson,
      record.totalPendingWithdrawals,
      record.extrinsicIds,
      record.eventIds,
      record.timestamp,
      record.blockHeight,
      record.blockHeights,
      record.processed,
    );
    Object.assign(entity, record);
    return entity;
  }
}
