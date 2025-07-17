// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames, FieldsExpression, GetOptions } from "@subql/types-core";
import assert from 'assert';



export type OperatorTaxCollectionProps = Omit<OperatorTaxCollection, NonNullable<FunctionPropertyNames<OperatorTaxCollection>> | '_name'>;

/*
 * Compat types allows for support of alternative `id` types without refactoring the node
 */
type CompatOperatorTaxCollectionProps = Omit<OperatorTaxCollectionProps, 'id'> & { id: string; };
type CompatEntity = Omit<Entity, 'id'> & { id: string; };

export class OperatorTaxCollection implements CompatEntity {

    constructor(
        
        id: string,
        domainId: string,
        operatorId: string,
        amount: bigint,
        blockHeight: bigint,
        extrinsicId: string,
        eventId: string,
    ) {
        this.id = id;
        this.domainId = domainId;
        this.operatorId = operatorId;
        this.amount = amount;
        this.blockHeight = blockHeight;
        this.extrinsicId = extrinsicId;
        this.eventId = eventId;
        
    }

    public id: string;
    public domainId: string;
    public operatorId: string;
    public amount: bigint;
    public blockHeight: bigint;
    public extrinsicId: string;
    public eventId: string;
    

    get _name(): string {
        return 'OperatorTaxCollection';
    }

    async save(): Promise<void> {
        const id = this.id;
        assert(id !== null, "Cannot save OperatorTaxCollection entity without an ID");
        await store.set('OperatorTaxCollection', id.toString(), this as unknown as CompatOperatorTaxCollectionProps);
    }

    static async remove(id: string): Promise<void> {
        assert(id !== null, "Cannot remove OperatorTaxCollection entity without an ID");
        await store.remove('OperatorTaxCollection', id.toString());
    }

    static async get(id: string): Promise<OperatorTaxCollection | undefined> {
        assert((id !== null && id !== undefined), "Cannot get OperatorTaxCollection entity without an ID");
        const record = await store.get('OperatorTaxCollection', id.toString());
        if (record) {
            return this.create(record as unknown as OperatorTaxCollectionProps);
        } else {
            return;
        }
    }


    /**
     * Gets entities matching the specified filters and options.
     *
     * ⚠️ This function will first search cache data followed by DB data. Please consider this when using order and offset options.⚠️
     * */
    static async getByFields(filter: FieldsExpression<OperatorTaxCollectionProps>[], options: GetOptions<OperatorTaxCollectionProps>): Promise<OperatorTaxCollection[]> {
        const records = await store.getByFields<CompatOperatorTaxCollectionProps>('OperatorTaxCollection', filter  as unknown as FieldsExpression<CompatOperatorTaxCollectionProps>[], options as unknown as GetOptions<CompatOperatorTaxCollectionProps>);
        return records.map(record => this.create(record as unknown as OperatorTaxCollectionProps));
    }

    static create(record: OperatorTaxCollectionProps): OperatorTaxCollection {
        assert(record.id !== undefined && record.id !== null, "id must be provided");
        const entity = new this(
            record.id,
            record.domainId,
            record.operatorId,
            record.amount,
            record.blockHeight,
            record.extrinsicId,
            record.eventId,
        );
        Object.assign(entity,record);
        return entity;
    }
}
