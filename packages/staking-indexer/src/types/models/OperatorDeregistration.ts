// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames, FieldsExpression, GetOptions } from "@subql/types-core";
import assert from 'assert';



export type OperatorDeregistrationProps = Omit<OperatorDeregistration, NonNullable<FunctionPropertyNames<OperatorDeregistration>>| '_name'>;

export class OperatorDeregistration implements Entity {

    constructor(
        
        id: string,
        owner: string,
        domainId: string,
        blockHeight: bigint,
        extrinsicId: string,
        eventId: string,
        processed: boolean,
    ) {
        this.id = id;
        this.owner = owner;
        this.domainId = domainId;
        this.blockHeight = blockHeight;
        this.extrinsicId = extrinsicId;
        this.eventId = eventId;
        this.processed = processed;
        
    }

    public id: string;
    public owner: string;
    public domainId: string;
    public blockHeight: bigint;
    public extrinsicId: string;
    public eventId: string;
    public processed: boolean;
    

    get _name(): string {
        return 'OperatorDeregistration';
    }

    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save OperatorDeregistration entity without an ID");
        await store.set('OperatorDeregistration', id.toString(), this);
    }

    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove OperatorDeregistration entity without an ID");
        await store.remove('OperatorDeregistration', id.toString());
    }

    static async get(id:string): Promise<OperatorDeregistration | undefined>{
        assert((id !== null && id !== undefined), "Cannot get OperatorDeregistration entity without an ID");
        const record = await store.get('OperatorDeregistration', id.toString());
        if (record) {
            return this.create(record as OperatorDeregistrationProps);
        } else {
            return;
        }
    }

    static async getByProcessed(processed: boolean): Promise<OperatorDeregistration[] | undefined>{
      const records = await store.getByField('OperatorDeregistration', 'processed', processed);
      return records.map(record => this.create(record as OperatorDeregistrationProps));
    }


    /**
     * Gets entities matching the specified filters and options.
     *
     * ⚠️ This function will first search cache data followed by DB data. Please consider this when using order and offset options.⚠️
     * */
    static async getByFields(filter: FieldsExpression<OperatorDeregistrationProps>[], options?: GetOptions<OperatorDeregistrationProps>): Promise<OperatorDeregistration[]> {
        const records = await store.getByFields('OperatorDeregistration', filter, options);
        return records.map(record => this.create(record as OperatorDeregistrationProps));
    }

    static create(record: OperatorDeregistrationProps): OperatorDeregistration {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new this(
            record.id,
            record.owner,
            record.domainId,
            record.blockHeight,
            record.extrinsicId,
            record.eventId,
            record.processed,
        );
        Object.assign(entity,record);
        return entity;
    }
}
