// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames, FieldsExpression, GetOptions } from "@subql/types-core";
import assert from 'assert';



export type NominatorsUnlockedEventProps = Omit<NominatorsUnlockedEvent, NonNullable<FunctionPropertyNames<NominatorsUnlockedEvent>>| '_name'>;

export class NominatorsUnlockedEvent implements Entity {

    constructor(
        
        id: string,
        domainId: string,
        operatorId: string,
        address: string,
        blockHeight: bigint,
        extrinsicId: string,
        eventId: string,
        processed: boolean,
    ) {
        this.id = id;
        this.domainId = domainId;
        this.operatorId = operatorId;
        this.address = address;
        this.blockHeight = blockHeight;
        this.extrinsicId = extrinsicId;
        this.eventId = eventId;
        this.processed = processed;
        
    }

    public id: string;
    public domainId: string;
    public operatorId: string;
    public address: string;
    public blockHeight: bigint;
    public extrinsicId: string;
    public eventId: string;
    public processed: boolean;
    

    get _name(): string {
        return 'NominatorsUnlockedEvent';
    }

    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save NominatorsUnlockedEvent entity without an ID");
        await store.set('NominatorsUnlockedEvent', id.toString(), this);
    }

    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove NominatorsUnlockedEvent entity without an ID");
        await store.remove('NominatorsUnlockedEvent', id.toString());
    }

    static async get(id:string): Promise<NominatorsUnlockedEvent | undefined>{
        assert((id !== null && id !== undefined), "Cannot get NominatorsUnlockedEvent entity without an ID");
        const record = await store.get('NominatorsUnlockedEvent', id.toString());
        if (record) {
            return this.create(record as NominatorsUnlockedEventProps);
        } else {
            return;
        }
    }

    static async getByAddress(address: string): Promise<NominatorsUnlockedEvent[] | undefined>{
      const records = await store.getByField('NominatorsUnlockedEvent', 'address', address);
      return records.map(record => this.create(record as NominatorsUnlockedEventProps));
    }

    static async getByProcessed(processed: boolean): Promise<NominatorsUnlockedEvent[] | undefined>{
      const records = await store.getByField('NominatorsUnlockedEvent', 'processed', processed);
      return records.map(record => this.create(record as NominatorsUnlockedEventProps));
    }


    /**
     * Gets entities matching the specified filters and options.
     *
     * ⚠️ This function will first search cache data followed by DB data. Please consider this when using order and offset options.⚠️
     * */
    static async getByFields(filter: FieldsExpression<NominatorsUnlockedEventProps>[], options?: GetOptions<NominatorsUnlockedEventProps>): Promise<NominatorsUnlockedEvent[]> {
        const records = await store.getByFields('NominatorsUnlockedEvent', filter, options);
        return records.map(record => this.create(record as NominatorsUnlockedEventProps));
    }

    static create(record: NominatorsUnlockedEventProps): NominatorsUnlockedEvent {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new this(
            record.id,
            record.domainId,
            record.operatorId,
            record.address,
            record.blockHeight,
            record.extrinsicId,
            record.eventId,
            record.processed,
        );
        Object.assign(entity,record);
        return entity;
    }
}
