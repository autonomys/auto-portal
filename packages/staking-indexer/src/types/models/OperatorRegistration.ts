// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames, FieldsExpression, GetOptions } from "@subql/types-core";
import assert from 'assert';



export type OperatorRegistrationProps = Omit<OperatorRegistration, NonNullable<FunctionPropertyNames<OperatorRegistration>> | '_name'>;

/*
 * Compat types allows for support of alternative `id` types without refactoring the node
 */
type CompatOperatorRegistrationProps = Omit<OperatorRegistrationProps, 'id'> & { id: string; };
type CompatEntity = Omit<Entity, 'id'> & { id: string; };

export class OperatorRegistration implements CompatEntity {

    constructor(
        
        id: string,
        sortId: string,
        owner: string,
        domainId: string,
        signingKey: string,
        minimumNominatorStake: bigint,
        nominationTax: number,
        blockHeight: bigint,
        extrinsicId: string,
        eventId: string,
    ) {
        this.id = id;
        this.sortId = sortId;
        this.owner = owner;
        this.domainId = domainId;
        this.signingKey = signingKey;
        this.minimumNominatorStake = minimumNominatorStake;
        this.nominationTax = nominationTax;
        this.blockHeight = blockHeight;
        this.extrinsicId = extrinsicId;
        this.eventId = eventId;
        
    }

    public id: string;
    public sortId: string;
    public owner: string;
    public domainId: string;
    public signingKey: string;
    public minimumNominatorStake: bigint;
    public nominationTax: number;
    public blockHeight: bigint;
    public extrinsicId: string;
    public eventId: string;
    

    get _name(): string {
        return 'OperatorRegistration';
    }

    async save(): Promise<void> {
        const id = this.id;
        assert(id !== null, "Cannot save OperatorRegistration entity without an ID");
        await store.set('OperatorRegistration', id.toString(), this as unknown as CompatOperatorRegistrationProps);
    }

    static async remove(id: string): Promise<void> {
        assert(id !== null, "Cannot remove OperatorRegistration entity without an ID");
        await store.remove('OperatorRegistration', id.toString());
    }

    static async get(id: string): Promise<OperatorRegistration | undefined> {
        assert((id !== null && id !== undefined), "Cannot get OperatorRegistration entity without an ID");
        const record = await store.get('OperatorRegistration', id.toString());
        if (record) {
            return this.create(record as unknown as OperatorRegistrationProps);
        } else {
            return;
        }
    }


    /**
     * Gets entities matching the specified filters and options.
     *
     * ⚠️ This function will first search cache data followed by DB data. Please consider this when using order and offset options.⚠️
     * */
    static async getByFields(filter: FieldsExpression<OperatorRegistrationProps>[], options: GetOptions<OperatorRegistrationProps>): Promise<OperatorRegistration[]> {
        const records = await store.getByFields<CompatOperatorRegistrationProps>('OperatorRegistration', filter  as unknown as FieldsExpression<CompatOperatorRegistrationProps>[], options as unknown as GetOptions<CompatOperatorRegistrationProps>);
        return records.map(record => this.create(record as unknown as OperatorRegistrationProps));
    }

    static create(record: OperatorRegistrationProps): OperatorRegistration {
        assert(record.id !== undefined && record.id !== null, "id must be provided");
        const entity = new this(
            record.id,
            record.sortId,
            record.owner,
            record.domainId,
            record.signingKey,
            record.minimumNominatorStake,
            record.nominationTax,
            record.blockHeight,
            record.extrinsicId,
            record.eventId,
        );
        Object.assign(entity,record);
        return entity;
    }
}
