// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames, FieldsExpression, GetOptions } from "@subql/types-core";
import assert from 'assert';



export type DomainStakingHistoryProps = Omit<DomainStakingHistory, NonNullable<FunctionPropertyNames<DomainStakingHistory>> | '_name'>;

/*
 * Compat types allows for support of alternative `id` types without refactoring the node
 */
type CompatDomainStakingHistoryProps = Omit<DomainStakingHistoryProps, 'id'> & { id: string; };
type CompatEntity = Omit<Entity, 'id'> & { id: string; };

export class DomainStakingHistory implements CompatEntity {

    constructor(
        
        id: string,
        domainId: string,
        currentEpochIndex: number,
        currentTotalStake: bigint,
        currentTotalShares: bigint,
        sharePrice: bigint,
        timestamp: Date,
        blockHeight: bigint,
    ) {
        this.id = id;
        this.domainId = domainId;
        this.currentEpochIndex = currentEpochIndex;
        this.currentTotalStake = currentTotalStake;
        this.currentTotalShares = currentTotalShares;
        this.sharePrice = sharePrice;
        this.timestamp = timestamp;
        this.blockHeight = blockHeight;
        
    }

    public id: string;
    public domainId: string;
    public currentEpochIndex: number;
    public currentTotalStake: bigint;
    public currentTotalShares: bigint;
    public sharePrice: bigint;
    public timestamp: Date;
    public blockHeight: bigint;
    

    get _name(): string {
        return 'DomainStakingHistory';
    }

    async save(): Promise<void> {
        const id = this.id;
        assert(id !== null, "Cannot save DomainStakingHistory entity without an ID");
        await store.set('DomainStakingHistory', id.toString(), this as unknown as CompatDomainStakingHistoryProps);
    }

    static async remove(id: string): Promise<void> {
        assert(id !== null, "Cannot remove DomainStakingHistory entity without an ID");
        await store.remove('DomainStakingHistory', id.toString());
    }

    static async get(id: string): Promise<DomainStakingHistory | undefined> {
        assert((id !== null && id !== undefined), "Cannot get DomainStakingHistory entity without an ID");
        const record = await store.get('DomainStakingHistory', id.toString());
        if (record) {
            return this.create(record as unknown as DomainStakingHistoryProps);
        } else {
            return;
        }
    }


    /**
     * Gets entities matching the specified filters and options.
     *
     * ⚠️ This function will first search cache data followed by DB data. Please consider this when using order and offset options.⚠️
     * */
    static async getByFields(filter: FieldsExpression<DomainStakingHistoryProps>[], options: GetOptions<DomainStakingHistoryProps>): Promise<DomainStakingHistory[]> {
        const records = await store.getByFields<CompatDomainStakingHistoryProps>('DomainStakingHistory', filter  as unknown as FieldsExpression<CompatDomainStakingHistoryProps>[], options as unknown as GetOptions<CompatDomainStakingHistoryProps>);
        return records.map(record => this.create(record as unknown as DomainStakingHistoryProps));
    }

    static create(record: DomainStakingHistoryProps): DomainStakingHistory {
        assert(record.id !== undefined && record.id !== null, "id must be provided");
        const entity = new this(
            record.id,
            record.domainId,
            record.currentEpochIndex,
            record.currentTotalStake,
            record.currentTotalShares,
            record.sharePrice,
            record.timestamp,
            record.blockHeight,
        );
        Object.assign(entity,record);
        return entity;
    }
}
