// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames, FieldsExpression, GetOptions } from "@subql/types-core";
import assert from 'assert';



export type OperatorEpochSharePriceProps = Omit<OperatorEpochSharePrice, NonNullable<FunctionPropertyNames<OperatorEpochSharePrice>>| '_name'>;

export class OperatorEpochSharePrice implements Entity {

    constructor(
        
        id: string,
        operatorId: string,
        domainId: string,
        epochIndex: number,
        sharePrice: bigint,
        totalStake: bigint,
        totalShares: bigint,
        timestamp: Date,
        blockHeight: bigint,
    ) {
        this.id = id;
        this.operatorId = operatorId;
        this.domainId = domainId;
        this.epochIndex = epochIndex;
        this.sharePrice = sharePrice;
        this.totalStake = totalStake;
        this.totalShares = totalShares;
        this.timestamp = timestamp;
        this.blockHeight = blockHeight;
        
    }

    public id: string;
    public operatorId: string;
    public domainId: string;
    public epochIndex: number;
    public sharePrice: bigint;
    public totalStake: bigint;
    public totalShares: bigint;
    public timestamp: Date;
    public blockHeight: bigint;
    

    get _name(): string {
        return 'OperatorEpochSharePrice';
    }

    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save OperatorEpochSharePrice entity without an ID");
        await store.set('OperatorEpochSharePrice', id.toString(), this);
    }

    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove OperatorEpochSharePrice entity without an ID");
        await store.remove('OperatorEpochSharePrice', id.toString());
    }

    static async get(id:string): Promise<OperatorEpochSharePrice | undefined>{
        assert((id !== null && id !== undefined), "Cannot get OperatorEpochSharePrice entity without an ID");
        const record = await store.get('OperatorEpochSharePrice', id.toString());
        if (record) {
            return this.create(record as OperatorEpochSharePriceProps);
        } else {
            return;
        }
    }

    static async getByOperatorId(operatorId: string): Promise<OperatorEpochSharePrice[] | undefined>{
      const records = await store.getByField('OperatorEpochSharePrice', 'operatorId', operatorId);
      return records.map(record => this.create(record as OperatorEpochSharePriceProps));
    }

    static async getByDomainId(domainId: string): Promise<OperatorEpochSharePrice[] | undefined>{
      const records = await store.getByField('OperatorEpochSharePrice', 'domainId', domainId);
      return records.map(record => this.create(record as OperatorEpochSharePriceProps));
    }

    static async getByEpochIndex(epochIndex: number): Promise<OperatorEpochSharePrice[] | undefined>{
      const records = await store.getByField('OperatorEpochSharePrice', 'epochIndex', epochIndex);
      return records.map(record => this.create(record as OperatorEpochSharePriceProps));
    }


    /**
     * Gets entities matching the specified filters and options.
     *
     * ⚠️ This function will first search cache data followed by DB data. Please consider this when using order and offset options.⚠️
     * */
    static async getByFields(filter: FieldsExpression<OperatorEpochSharePriceProps>[], options?: GetOptions<OperatorEpochSharePriceProps>): Promise<OperatorEpochSharePrice[]> {
        const records = await store.getByFields('OperatorEpochSharePrice', filter, options);
        return records.map(record => this.create(record as OperatorEpochSharePriceProps));
    }

    static create(record: OperatorEpochSharePriceProps): OperatorEpochSharePrice {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new this(
            record.id,
            record.operatorId,
            record.domainId,
            record.epochIndex,
            record.sharePrice,
            record.totalStake,
            record.totalShares,
            record.timestamp,
            record.blockHeight,
        );
        Object.assign(entity,record);
        return entity;
    }
}
