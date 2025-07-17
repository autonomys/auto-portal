// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames, FieldsExpression, GetOptions } from "@subql/types-core";
import assert from 'assert';



export type NominatorsUnlockedEventProps = Omit<NominatorsUnlockedEvent, NonNullable<FunctionPropertyNames<NominatorsUnlockedEvent>> | '_name'>;

/*
 * Compat types allows for support of alternative `id` types without refactoring the node
 */
type CompatNominatorsUnlockedEventProps = Omit<NominatorsUnlockedEventProps, 'id'> & { id: string; };
type CompatEntity = Omit<Entity, 'id'> & { id: string; };

export class NominatorsUnlockedEvent implements CompatEntity {

    constructor(
        
        id: string,
        domainId: string,
        operatorId: string,
        blockHeight: bigint,
        extrinsicId: string,
        eventId: string,
    ) {
        this.id = id;
        this.domainId = domainId;
        this.operatorId = operatorId;
        this.blockHeight = blockHeight;
        this.extrinsicId = extrinsicId;
        this.eventId = eventId;
        
    }

    public id: string;
    public domainId: string;
    public operatorId: string;
    public blockHeight: bigint;
    public extrinsicId: string;
    public eventId: string;
    

    get _name(): string {
        return 'NominatorsUnlockedEvent';
    }

    async save(): Promise<void> {
        const id = this.id;
        assert(id !== null, "Cannot save NominatorsUnlockedEvent entity without an ID");
        await store.set('NominatorsUnlockedEvent', id.toString(), this as unknown as CompatNominatorsUnlockedEventProps);
    }

    static async remove(id: string): Promise<void> {
        assert(id !== null, "Cannot remove NominatorsUnlockedEvent entity without an ID");
        await store.remove('NominatorsUnlockedEvent', id.toString());
    }

    static async get(id: string): Promise<NominatorsUnlockedEvent | undefined> {
        assert((id !== null && id !== undefined), "Cannot get NominatorsUnlockedEvent entity without an ID");
        const record = await store.get('NominatorsUnlockedEvent', id.toString());
        if (record) {
            return this.create(record as unknown as NominatorsUnlockedEventProps);
        } else {
            return;
        }
    }


    /**
     * Gets entities matching the specified filters and options.
     *
     * ⚠️ This function will first search cache data followed by DB data. Please consider this when using order and offset options.⚠️
     * */
    static async getByFields(filter: FieldsExpression<NominatorsUnlockedEventProps>[], options: GetOptions<NominatorsUnlockedEventProps>): Promise<NominatorsUnlockedEvent[]> {
        const records = await store.getByFields<CompatNominatorsUnlockedEventProps>('NominatorsUnlockedEvent', filter  as unknown as FieldsExpression<CompatNominatorsUnlockedEventProps>[], options as unknown as GetOptions<CompatNominatorsUnlockedEventProps>);
        return records.map(record => this.create(record as unknown as NominatorsUnlockedEventProps));
    }

    static create(record: NominatorsUnlockedEventProps): NominatorsUnlockedEvent {
        assert(record.id !== undefined && record.id !== null, "id must be provided");
        const entity = new this(
            record.id,
            record.domainId,
            record.operatorId,
            record.blockHeight,
            record.extrinsicId,
            record.eventId,
        );
        Object.assign(entity,record);
        return entity;
    }
}
