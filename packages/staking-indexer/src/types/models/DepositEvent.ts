// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames, FieldsExpression, GetOptions } from "@subql/types-core";
import assert from 'assert';



export type DepositEventProps = Omit<DepositEvent, NonNullable<FunctionPropertyNames<DepositEvent>> | '_name'>;

/*
 * Compat types allows for support of alternative `id` types without refactoring the node
 */
type CompatDepositEventProps = Omit<DepositEventProps, 'id'> & { id: string; };
type CompatEntity = Omit<Entity, 'id'> & { id: string; };

export class DepositEvent implements CompatEntity {

    constructor(
        
        id: string,
        sortId: string,
        accountId: string,
        domainId: string,
        operatorId: string,
        nominatorId: string,
        amount: bigint,
        storageFeeDeposit: bigint,
        totalAmount: bigint,
        estimatedShares: bigint,
        timestamp: Date,
        blockHeight: bigint,
        extrinsicId: string,
        eventId: string,
    ) {
        this.id = id;
        this.sortId = sortId;
        this.accountId = accountId;
        this.domainId = domainId;
        this.operatorId = operatorId;
        this.nominatorId = nominatorId;
        this.amount = amount;
        this.storageFeeDeposit = storageFeeDeposit;
        this.totalAmount = totalAmount;
        this.estimatedShares = estimatedShares;
        this.timestamp = timestamp;
        this.blockHeight = blockHeight;
        this.extrinsicId = extrinsicId;
        this.eventId = eventId;
        
    }

    public id: string;
    public sortId: string;
    public accountId: string;
    public domainId: string;
    public operatorId: string;
    public nominatorId: string;
    public amount: bigint;
    public storageFeeDeposit: bigint;
    public totalAmount: bigint;
    public estimatedShares: bigint;
    public timestamp: Date;
    public blockHeight: bigint;
    public extrinsicId: string;
    public eventId: string;
    

    get _name(): string {
        return 'DepositEvent';
    }

    async save(): Promise<void> {
        const id = this.id;
        assert(id !== null, "Cannot save DepositEvent entity without an ID");
        await store.set('DepositEvent', id.toString(), this as unknown as CompatDepositEventProps);
    }

    static async remove(id: string): Promise<void> {
        assert(id !== null, "Cannot remove DepositEvent entity without an ID");
        await store.remove('DepositEvent', id.toString());
    }

    static async get(id: string): Promise<DepositEvent | undefined> {
        assert((id !== null && id !== undefined), "Cannot get DepositEvent entity without an ID");
        const record = await store.get('DepositEvent', id.toString());
        if (record) {
            return this.create(record as unknown as DepositEventProps);
        } else {
            return;
        }
    }


    /**
     * Gets entities matching the specified filters and options.
     *
     * ⚠️ This function will first search cache data followed by DB data. Please consider this when using order and offset options.⚠️
     * */
    static async getByFields(filter: FieldsExpression<DepositEventProps>[], options: GetOptions<DepositEventProps>): Promise<DepositEvent[]> {
        const records = await store.getByFields<CompatDepositEventProps>('DepositEvent', filter  as unknown as FieldsExpression<CompatDepositEventProps>[], options as unknown as GetOptions<CompatDepositEventProps>);
        return records.map(record => this.create(record as unknown as DepositEventProps));
    }

    static create(record: DepositEventProps): DepositEvent {
        assert(record.id !== undefined && record.id !== null, "id must be provided");
        const entity = new this(
            record.id,
            record.sortId,
            record.accountId,
            record.domainId,
            record.operatorId,
            record.nominatorId,
            record.amount,
            record.storageFeeDeposit,
            record.totalAmount,
            record.estimatedShares,
            record.timestamp,
            record.blockHeight,
            record.extrinsicId,
            record.eventId,
        );
        Object.assign(entity,record);
        return entity;
    }
}
