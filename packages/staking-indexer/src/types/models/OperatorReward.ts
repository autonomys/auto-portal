// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames, FieldsExpression, GetOptions } from "@subql/types-core";
import assert from 'assert';



export type OperatorRewardProps = Omit<OperatorReward, NonNullable<FunctionPropertyNames<OperatorReward>>| '_name'>;

export class OperatorReward implements Entity {

    constructor(
        
        id: string,
        domainId: string,
        operatorId: string,
        amount: bigint,
        atBlockNumber: bigint,
        blockHeight: bigint,
        extrinsicId: string,
        eventId: string,
        processed: boolean,
    ) {
        this.id = id;
        this.domainId = domainId;
        this.operatorId = operatorId;
        this.amount = amount;
        this.atBlockNumber = atBlockNumber;
        this.blockHeight = blockHeight;
        this.extrinsicId = extrinsicId;
        this.eventId = eventId;
        this.processed = processed;
        
    }

    public id: string;
    public domainId: string;
    public operatorId: string;
    public amount: bigint;
    public atBlockNumber: bigint;
    public blockHeight: bigint;
    public extrinsicId: string;
    public eventId: string;
    public processed: boolean;
    

    get _name(): string {
        return 'OperatorReward';
    }

    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save OperatorReward entity without an ID");
        await store.set('OperatorReward', id.toString(), this);
    }

    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove OperatorReward entity without an ID");
        await store.remove('OperatorReward', id.toString());
    }

    static async get(id:string): Promise<OperatorReward | undefined>{
        assert((id !== null && id !== undefined), "Cannot get OperatorReward entity without an ID");
        const record = await store.get('OperatorReward', id.toString());
        if (record) {
            return this.create(record as OperatorRewardProps);
        } else {
            return;
        }
    }

    static async getByProcessed(processed: boolean): Promise<OperatorReward[] | undefined>{
      const records = await store.getByField('OperatorReward', 'processed', processed);
      return records.map(record => this.create(record as OperatorRewardProps));
    }


    /**
     * Gets entities matching the specified filters and options.
     *
     * ⚠️ This function will first search cache data followed by DB data. Please consider this when using order and offset options.⚠️
     * */
    static async getByFields(filter: FieldsExpression<OperatorRewardProps>[], options?: GetOptions<OperatorRewardProps>): Promise<OperatorReward[]> {
        const records = await store.getByFields('OperatorReward', filter, options);
        return records.map(record => this.create(record as OperatorRewardProps));
    }

    static create(record: OperatorRewardProps): OperatorReward {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new this(
            record.id,
            record.domainId,
            record.operatorId,
            record.amount,
            record.atBlockNumber,
            record.blockHeight,
            record.extrinsicId,
            record.eventId,
            record.processed,
        );
        Object.assign(entity,record);
        return entity;
    }
}
