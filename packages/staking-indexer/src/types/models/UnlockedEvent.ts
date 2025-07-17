// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames, FieldsExpression, GetOptions } from "@subql/types-core";
import assert from 'assert';



export type UnlockedEventProps = Omit<UnlockedEvent, NonNullable<FunctionPropertyNames<UnlockedEvent>> | '_name'>;

/*
 * Compat types allows for support of alternative `id` types without refactoring the node
 */
type CompatUnlockedEventProps = Omit<UnlockedEventProps, 'id'> & { id: string; };
type CompatEntity = Omit<Entity, 'id'> & { id: string; };

export class UnlockedEvent implements CompatEntity {

    constructor(
        
        id: string,
        domainId: string,
        operatorId: string,
        accountId: string,
        nominatorId: string,
        amount: bigint,
        storageFee: bigint,
        timestamp: Date,
        blockHeight: bigint,
        extrinsicId: string,
        eventId: string,
    ) {
        this.id = id;
        this.domainId = domainId;
        this.operatorId = operatorId;
        this.accountId = accountId;
        this.nominatorId = nominatorId;
        this.amount = amount;
        this.storageFee = storageFee;
        this.timestamp = timestamp;
        this.blockHeight = blockHeight;
        this.extrinsicId = extrinsicId;
        this.eventId = eventId;
        
    }

    public id: string;
    public domainId: string;
    public operatorId: string;
    public accountId: string;
    public nominatorId: string;
    public amount: bigint;
    public storageFee: bigint;
    public timestamp: Date;
    public blockHeight: bigint;
    public extrinsicId: string;
    public eventId: string;
    

    get _name(): string {
        return 'UnlockedEvent';
    }

    async save(): Promise<void> {
        const id = this.id;
        assert(id !== null, "Cannot save UnlockedEvent entity without an ID");
        await store.set('UnlockedEvent', id.toString(), this as unknown as CompatUnlockedEventProps);
    }

    static async remove(id: string): Promise<void> {
        assert(id !== null, "Cannot remove UnlockedEvent entity without an ID");
        await store.remove('UnlockedEvent', id.toString());
    }

    static async get(id: string): Promise<UnlockedEvent | undefined> {
        assert((id !== null && id !== undefined), "Cannot get UnlockedEvent entity without an ID");
        const record = await store.get('UnlockedEvent', id.toString());
        if (record) {
            return this.create(record as unknown as UnlockedEventProps);
        } else {
            return;
        }
    }


    /**
     * Gets entities matching the specified filters and options.
     *
     * ⚠️ This function will first search cache data followed by DB data. Please consider this when using order and offset options.⚠️
     * */
    static async getByFields(filter: FieldsExpression<UnlockedEventProps>[], options: GetOptions<UnlockedEventProps>): Promise<UnlockedEvent[]> {
        const records = await store.getByFields<CompatUnlockedEventProps>('UnlockedEvent', filter  as unknown as FieldsExpression<CompatUnlockedEventProps>[], options as unknown as GetOptions<CompatUnlockedEventProps>);
        return records.map(record => this.create(record as unknown as UnlockedEventProps));
    }

    static create(record: UnlockedEventProps): UnlockedEvent {
        assert(record.id !== undefined && record.id !== null, "id must be provided");
        const entity = new this(
            record.id,
            record.domainId,
            record.operatorId,
            record.accountId,
            record.nominatorId,
            record.amount,
            record.storageFee,
            record.timestamp,
            record.blockHeight,
            record.extrinsicId,
            record.eventId,
        );
        Object.assign(entity,record);
        return entity;
    }
}
