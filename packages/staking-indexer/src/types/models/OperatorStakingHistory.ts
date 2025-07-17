// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames, FieldsExpression, GetOptions } from "@subql/types-core";
import assert from 'assert';



export type OperatorStakingHistoryProps = Omit<OperatorStakingHistory, NonNullable<FunctionPropertyNames<OperatorStakingHistory>> | '_name'>;

/*
 * Compat types allows for support of alternative `id` types without refactoring the node
 */
type CompatOperatorStakingHistoryProps = Omit<OperatorStakingHistoryProps, 'id'> & { id: string; };
type CompatEntity = Omit<Entity, 'id'> & { id: string; };

export class OperatorStakingHistory implements CompatEntity {

    constructor(
        
        id: string,
        operatorId: string,
        operatorOwner: string,
        signingKey: string,
        currentDomainId: string,
        currentTotalStake: bigint,
        currentTotalShares: bigint,
        depositsInEpoch: bigint,
        withdrawalsInEpoch: bigint,
        totalStorageFeeDeposit: bigint,
        sharePrice: bigint,
        partialStatus: string,
        timestamp: Date,
        blockHeight: bigint,
    ) {
        this.id = id;
        this.operatorId = operatorId;
        this.operatorOwner = operatorOwner;
        this.signingKey = signingKey;
        this.currentDomainId = currentDomainId;
        this.currentTotalStake = currentTotalStake;
        this.currentTotalShares = currentTotalShares;
        this.depositsInEpoch = depositsInEpoch;
        this.withdrawalsInEpoch = withdrawalsInEpoch;
        this.totalStorageFeeDeposit = totalStorageFeeDeposit;
        this.sharePrice = sharePrice;
        this.partialStatus = partialStatus;
        this.timestamp = timestamp;
        this.blockHeight = blockHeight;
        
    }

    public id: string;
    public operatorId: string;
    public operatorOwner: string;
    public signingKey: string;
    public currentDomainId: string;
    public currentTotalStake: bigint;
    public currentTotalShares: bigint;
    public depositsInEpoch: bigint;
    public withdrawalsInEpoch: bigint;
    public totalStorageFeeDeposit: bigint;
    public sharePrice: bigint;
    public partialStatus: string;
    public timestamp: Date;
    public blockHeight: bigint;
    

    get _name(): string {
        return 'OperatorStakingHistory';
    }

    async save(): Promise<void> {
        const id = this.id;
        assert(id !== null, "Cannot save OperatorStakingHistory entity without an ID");
        await store.set('OperatorStakingHistory', id.toString(), this as unknown as CompatOperatorStakingHistoryProps);
    }

    static async remove(id: string): Promise<void> {
        assert(id !== null, "Cannot remove OperatorStakingHistory entity without an ID");
        await store.remove('OperatorStakingHistory', id.toString());
    }

    static async get(id: string): Promise<OperatorStakingHistory | undefined> {
        assert((id !== null && id !== undefined), "Cannot get OperatorStakingHistory entity without an ID");
        const record = await store.get('OperatorStakingHistory', id.toString());
        if (record) {
            return this.create(record as unknown as OperatorStakingHistoryProps);
        } else {
            return;
        }
    }


    /**
     * Gets entities matching the specified filters and options.
     *
     * ⚠️ This function will first search cache data followed by DB data. Please consider this when using order and offset options.⚠️
     * */
    static async getByFields(filter: FieldsExpression<OperatorStakingHistoryProps>[], options: GetOptions<OperatorStakingHistoryProps>): Promise<OperatorStakingHistory[]> {
        const records = await store.getByFields<CompatOperatorStakingHistoryProps>('OperatorStakingHistory', filter  as unknown as FieldsExpression<CompatOperatorStakingHistoryProps>[], options as unknown as GetOptions<CompatOperatorStakingHistoryProps>);
        return records.map(record => this.create(record as unknown as OperatorStakingHistoryProps));
    }

    static create(record: OperatorStakingHistoryProps): OperatorStakingHistory {
        assert(record.id !== undefined && record.id !== null, "id must be provided");
        const entity = new this(
            record.id,
            record.operatorId,
            record.operatorOwner,
            record.signingKey,
            record.currentDomainId,
            record.currentTotalStake,
            record.currentTotalShares,
            record.depositsInEpoch,
            record.withdrawalsInEpoch,
            record.totalStorageFeeDeposit,
            record.sharePrice,
            record.partialStatus,
            record.timestamp,
            record.blockHeight,
        );
        Object.assign(entity,record);
        return entity;
    }
}
