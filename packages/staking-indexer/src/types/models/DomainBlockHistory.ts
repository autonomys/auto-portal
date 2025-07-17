// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames, FieldsExpression, GetOptions } from "@subql/types-core";
import assert from 'assert';



export type DomainBlockHistoryProps = Omit<DomainBlockHistory, NonNullable<FunctionPropertyNames<DomainBlockHistory>> | '_name'>;

/*
 * Compat types allows for support of alternative `id` types without refactoring the node
 */
type CompatDomainBlockHistoryProps = Omit<DomainBlockHistoryProps, 'id'> & { id: string; };
type CompatEntity = Omit<Entity, 'id'> & { id: string; };

export class DomainBlockHistory implements CompatEntity {

    constructor(
        
        id: string,
        domainId: string,
        domainBlockNumber: bigint,
        timestamp: Date,
        blockHeight: bigint,
    ) {
        this.id = id;
        this.domainId = domainId;
        this.domainBlockNumber = domainBlockNumber;
        this.timestamp = timestamp;
        this.blockHeight = blockHeight;
        
    }

    public id: string;
    public domainId: string;
    public domainBlockNumber: bigint;
    public timestamp: Date;
    public blockHeight: bigint;
    

    get _name(): string {
        return 'DomainBlockHistory';
    }

    async save(): Promise<void> {
        const id = this.id;
        assert(id !== null, "Cannot save DomainBlockHistory entity without an ID");
        await store.set('DomainBlockHistory', id.toString(), this as unknown as CompatDomainBlockHistoryProps);
    }

    static async remove(id: string): Promise<void> {
        assert(id !== null, "Cannot remove DomainBlockHistory entity without an ID");
        await store.remove('DomainBlockHistory', id.toString());
    }

    static async get(id: string): Promise<DomainBlockHistory | undefined> {
        assert((id !== null && id !== undefined), "Cannot get DomainBlockHistory entity without an ID");
        const record = await store.get('DomainBlockHistory', id.toString());
        if (record) {
            return this.create(record as unknown as DomainBlockHistoryProps);
        } else {
            return;
        }
    }


    /**
     * Gets entities matching the specified filters and options.
     *
     * ⚠️ This function will first search cache data followed by DB data. Please consider this when using order and offset options.⚠️
     * */
    static async getByFields(filter: FieldsExpression<DomainBlockHistoryProps>[], options: GetOptions<DomainBlockHistoryProps>): Promise<DomainBlockHistory[]> {
        const records = await store.getByFields<CompatDomainBlockHistoryProps>('DomainBlockHistory', filter  as unknown as FieldsExpression<CompatDomainBlockHistoryProps>[], options as unknown as GetOptions<CompatDomainBlockHistoryProps>);
        return records.map(record => this.create(record as unknown as DomainBlockHistoryProps));
    }

    static create(record: DomainBlockHistoryProps): DomainBlockHistory {
        assert(record.id !== undefined && record.id !== null, "id must be provided");
        const entity = new this(
            record.id,
            record.domainId,
            record.domainBlockNumber,
            record.timestamp,
            record.blockHeight,
        );
        Object.assign(entity,record);
        return entity;
    }
}
