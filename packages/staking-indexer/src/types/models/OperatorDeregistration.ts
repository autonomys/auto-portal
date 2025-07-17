// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames, FieldsExpression, GetOptions } from "@subql/types-core";
import assert from 'assert';



export type OperatorDeregistrationProps = Omit<OperatorDeregistration, NonNullable<FunctionPropertyNames<OperatorDeregistration>> | '_name'>;

/*
 * Compat types allows for support of alternative `id` types without refactoring the node
 */
type CompatOperatorDeregistrationProps = Omit<OperatorDeregistrationProps, 'id'> & { id: string; };
type CompatEntity = Omit<Entity, 'id'> & { id: string; };

export class OperatorDeregistration implements CompatEntity {

    constructor(
        
        id: string,
        owner: string,
        domainId: string,
        blockHeight: bigint,
        extrinsicId: string,
        eventId: string,
    ) {
        this.id = id;
        this.owner = owner;
        this.domainId = domainId;
        this.blockHeight = blockHeight;
        this.extrinsicId = extrinsicId;
        this.eventId = eventId;
        
    }

    public id: string;
    public owner: string;
    public domainId: string;
    public blockHeight: bigint;
    public extrinsicId: string;
    public eventId: string;
    

    get _name(): string {
        return 'OperatorDeregistration';
    }

    async save(): Promise<void> {
        const id = this.id;
        assert(id !== null, "Cannot save OperatorDeregistration entity without an ID");
        await store.set('OperatorDeregistration', id.toString(), this as unknown as CompatOperatorDeregistrationProps);
    }

    static async remove(id: string): Promise<void> {
        assert(id !== null, "Cannot remove OperatorDeregistration entity without an ID");
        await store.remove('OperatorDeregistration', id.toString());
    }

    static async get(id: string): Promise<OperatorDeregistration | undefined> {
        assert((id !== null && id !== undefined), "Cannot get OperatorDeregistration entity without an ID");
        const record = await store.get('OperatorDeregistration', id.toString());
        if (record) {
            return this.create(record as unknown as OperatorDeregistrationProps);
        } else {
            return;
        }
    }


    /**
     * Gets entities matching the specified filters and options.
     *
     * ⚠️ This function will first search cache data followed by DB data. Please consider this when using order and offset options.⚠️
     * */
    static async getByFields(filter: FieldsExpression<OperatorDeregistrationProps>[], options: GetOptions<OperatorDeregistrationProps>): Promise<OperatorDeregistration[]> {
        const records = await store.getByFields<CompatOperatorDeregistrationProps>('OperatorDeregistration', filter  as unknown as FieldsExpression<CompatOperatorDeregistrationProps>[], options as unknown as GetOptions<CompatOperatorDeregistrationProps>);
        return records.map(record => this.create(record as unknown as OperatorDeregistrationProps));
    }

    static create(record: OperatorDeregistrationProps): OperatorDeregistration {
        assert(record.id !== undefined && record.id !== null, "id must be provided");
        const entity = new this(
            record.id,
            record.owner,
            record.domainId,
            record.blockHeight,
            record.extrinsicId,
            record.eventId,
        );
        Object.assign(entity,record);
        return entity;
    }
}
