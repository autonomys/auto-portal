// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames, FieldsExpression, GetOptions } from "@subql/types-core";
import assert from 'assert';



export type OperatorRewardProps = Omit<OperatorReward, NonNullable<FunctionPropertyNames<OperatorReward>> | '_name'>;

/*
 * Compat types allows for support of alternative `id` types without refactoring the node
 */
type CompatOperatorRewardProps = Omit<OperatorRewardProps, 'id'> & { id: string; };
type CompatEntity = Omit<Entity, 'id'> & { id: string; };

export class OperatorReward implements CompatEntity {

    constructor(
        
        id: string,
        domainId: string,
        operatorId: string,
        amount: bigint,
        atBlockNumber: bigint,
        blockHeight: bigint,
        extrinsicId: string,
        eventId: string,
    ) {
        this.id = id;
        this.domainId = domainId;
        this.operatorId = operatorId;
        this.amount = amount;
        this.atBlockNumber = atBlockNumber;
        this.blockHeight = blockHeight;
        this.extrinsicId = extrinsicId;
        this.eventId = eventId;
        
    }

    public id: string;
    public domainId: string;
    public operatorId: string;
    public amount: bigint;
    public atBlockNumber: bigint;
    public blockHeight: bigint;
    public extrinsicId: string;
    public eventId: string;
    

    get _name(): string {
        return 'OperatorReward';
    }

    async save(): Promise<void> {
        const id = this.id;
        assert(id !== null, "Cannot save OperatorReward entity without an ID");
        await store.set('OperatorReward', id.toString(), this as unknown as CompatOperatorRewardProps);
    }

    static async remove(id: string): Promise<void> {
        assert(id !== null, "Cannot remove OperatorReward entity without an ID");
        await store.remove('OperatorReward', id.toString());
    }

    static async get(id: string): Promise<OperatorReward | undefined> {
        assert((id !== null && id !== undefined), "Cannot get OperatorReward entity without an ID");
        const record = await store.get('OperatorReward', id.toString());
        if (record) {
            return this.create(record as unknown as OperatorRewardProps);
        } else {
            return;
        }
    }


    /**
     * Gets entities matching the specified filters and options.
     *
     * ⚠️ This function will first search cache data followed by DB data. Please consider this when using order and offset options.⚠️
     * */
    static async getByFields(filter: FieldsExpression<OperatorRewardProps>[], options: GetOptions<OperatorRewardProps>): Promise<OperatorReward[]> {
        const records = await store.getByFields<CompatOperatorRewardProps>('OperatorReward', filter  as unknown as FieldsExpression<CompatOperatorRewardProps>[], options as unknown as GetOptions<CompatOperatorRewardProps>);
        return records.map(record => this.create(record as unknown as OperatorRewardProps));
    }

    static create(record: OperatorRewardProps): OperatorReward {
        assert(record.id !== undefined && record.id !== null, "id must be provided");
        const entity = new this(
            record.id,
            record.domainId,
            record.operatorId,
            record.amount,
            record.atBlockNumber,
            record.blockHeight,
            record.extrinsicId,
            record.eventId,
        );
        Object.assign(entity,record);
        return entity;
    }
}
