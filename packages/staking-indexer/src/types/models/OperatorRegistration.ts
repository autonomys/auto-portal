// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames, FieldsExpression, GetOptions } from "@subql/types-core";
import assert from 'assert';



export type OperatorRegistrationProps = Omit<OperatorRegistration, NonNullable<FunctionPropertyNames<OperatorRegistration>>| '_name'>;

export class OperatorRegistration implements Entity {

    constructor(
        
        id: string,
        owner: string,
        domainId: string,
        signingKey: string,
        minimumNominatorStake: bigint,
        nominationTax: number,
        blockHeight: bigint,
        extrinsicId: string,
        eventId: string,
        processed: boolean,
    ) {
        this.id = id;
        this.owner = owner;
        this.domainId = domainId;
        this.signingKey = signingKey;
        this.minimumNominatorStake = minimumNominatorStake;
        this.nominationTax = nominationTax;
        this.blockHeight = blockHeight;
        this.extrinsicId = extrinsicId;
        this.eventId = eventId;
        this.processed = processed;
        
    }

    public id: string;
    public owner: string;
    public domainId: string;
    public signingKey: string;
    public minimumNominatorStake: bigint;
    public nominationTax: number;
    public blockHeight: bigint;
    public extrinsicId: string;
    public eventId: string;
    public processed: boolean;
    

    get _name(): string {
        return 'OperatorRegistration';
    }

    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save OperatorRegistration entity without an ID");
        await store.set('OperatorRegistration', id.toString(), this);
    }

    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove OperatorRegistration entity without an ID");
        await store.remove('OperatorRegistration', id.toString());
    }

    static async get(id:string): Promise<OperatorRegistration | undefined>{
        assert((id !== null && id !== undefined), "Cannot get OperatorRegistration entity without an ID");
        const record = await store.get('OperatorRegistration', id.toString());
        if (record) {
            return this.create(record as OperatorRegistrationProps);
        } else {
            return;
        }
    }

    static async getByProcessed(processed: boolean): Promise<OperatorRegistration[] | undefined>{
      const records = await store.getByField('OperatorRegistration', 'processed', processed);
      return records.map(record => this.create(record as OperatorRegistrationProps));
    }


    /**
     * Gets entities matching the specified filters and options.
     *
     * ⚠️ This function will first search cache data followed by DB data. Please consider this when using order and offset options.⚠️
     * */
    static async getByFields(filter: FieldsExpression<OperatorRegistrationProps>[], options?: GetOptions<OperatorRegistrationProps>): Promise<OperatorRegistration[]> {
        const records = await store.getByFields('OperatorRegistration', filter, options);
        return records.map(record => this.create(record as OperatorRegistrationProps));
    }

    static create(record: OperatorRegistrationProps): OperatorRegistration {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new this(
            record.id,
            record.owner,
            record.domainId,
            record.signingKey,
            record.minimumNominatorStake,
            record.nominationTax,
            record.blockHeight,
            record.extrinsicId,
            record.eventId,
            record.processed,
        );
        Object.assign(entity,record);
        return entity;
    }
}
