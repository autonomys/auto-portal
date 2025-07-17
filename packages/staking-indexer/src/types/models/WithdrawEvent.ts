// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames, FieldsExpression, GetOptions } from "@subql/types-core";
import assert from 'assert';



export type WithdrawEventProps = Omit<WithdrawEvent, NonNullable<FunctionPropertyNames<WithdrawEvent>> | '_name'>;

/*
 * Compat types allows for support of alternative `id` types without refactoring the node
 */
type CompatWithdrawEventProps = Omit<WithdrawEventProps, 'id'> & { id: string; };
type CompatEntity = Omit<Entity, 'id'> & { id: string; };

export class WithdrawEvent implements CompatEntity {

    constructor(
        
        id: string,
        sortId: string,
        accountId: string,
        domainId: string,
        operatorId: string,
        nominatorId: string,
        toWithdraw: string,
        shares: bigint,
        storageFeeRefund: bigint,
        estimatedAmount: bigint,
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
        this.toWithdraw = toWithdraw;
        this.shares = shares;
        this.storageFeeRefund = storageFeeRefund;
        this.estimatedAmount = estimatedAmount;
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
    public toWithdraw: string;
    public shares: bigint;
    public storageFeeRefund: bigint;
    public estimatedAmount: bigint;
    public timestamp: Date;
    public blockHeight: bigint;
    public extrinsicId: string;
    public eventId: string;
    

    get _name(): string {
        return 'WithdrawEvent';
    }

    async save(): Promise<void> {
        const id = this.id;
        assert(id !== null, "Cannot save WithdrawEvent entity without an ID");
        await store.set('WithdrawEvent', id.toString(), this as unknown as CompatWithdrawEventProps);
    }

    static async remove(id: string): Promise<void> {
        assert(id !== null, "Cannot remove WithdrawEvent entity without an ID");
        await store.remove('WithdrawEvent', id.toString());
    }

    static async get(id: string): Promise<WithdrawEvent | undefined> {
        assert((id !== null && id !== undefined), "Cannot get WithdrawEvent entity without an ID");
        const record = await store.get('WithdrawEvent', id.toString());
        if (record) {
            return this.create(record as unknown as WithdrawEventProps);
        } else {
            return;
        }
    }


    /**
     * Gets entities matching the specified filters and options.
     *
     * ⚠️ This function will first search cache data followed by DB data. Please consider this when using order and offset options.⚠️
     * */
    static async getByFields(filter: FieldsExpression<WithdrawEventProps>[], options: GetOptions<WithdrawEventProps>): Promise<WithdrawEvent[]> {
        const records = await store.getByFields<CompatWithdrawEventProps>('WithdrawEvent', filter  as unknown as FieldsExpression<CompatWithdrawEventProps>[], options as unknown as GetOptions<CompatWithdrawEventProps>);
        return records.map(record => this.create(record as unknown as WithdrawEventProps));
    }

    static create(record: WithdrawEventProps): WithdrawEvent {
        assert(record.id !== undefined && record.id !== null, "id must be provided");
        const entity = new this(
            record.id,
            record.sortId,
            record.accountId,
            record.domainId,
            record.operatorId,
            record.nominatorId,
            record.toWithdraw,
            record.shares,
            record.storageFeeRefund,
            record.estimatedAmount,
            record.timestamp,
            record.blockHeight,
            record.extrinsicId,
            record.eventId,
        );
        Object.assign(entity,record);
        return entity;
    }
}
