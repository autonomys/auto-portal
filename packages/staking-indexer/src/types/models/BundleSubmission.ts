// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames, FieldsExpression, GetOptions } from "@subql/types-core";
import assert from 'assert';



export type BundleSubmissionProps = Omit<BundleSubmission, NonNullable<FunctionPropertyNames<BundleSubmission>> | '_name'>;

/*
 * Compat types allows for support of alternative `id` types without refactoring the node
 */
type CompatBundleSubmissionProps = Omit<BundleSubmissionProps, 'id'> & { id: string; };
type CompatEntity = Omit<Entity, 'id'> & { id: string; };

export class BundleSubmission implements CompatEntity {

    constructor(
        
        id: string,
        accountId: string,
        bundleId: string,
        domainId: string,
        domainBlockId: string,
        operatorId: string,
        domainBlockNumber: bigint,
        domainBlockHash: string,
        domainBlockExtrinsicRoot: string,
        epoch: bigint,
        consensusBlockNumber: bigint,
        consensusBlockHash: string,
        totalTransfersIn: bigint,
        transfersInCount: bigint,
        totalTransfersOut: bigint,
        transfersOutCount: bigint,
        totalRejectedTransfersClaimed: bigint,
        rejectedTransfersClaimedCount: bigint,
        totalTransfersRejected: bigint,
        transfersRejectedCount: bigint,
        totalVolume: bigint,
        consensusStorageFee: bigint,
        domainExecutionFee: bigint,
        burnedBalance: bigint,
        blockHeight: bigint,
        extrinsicId: string,
        eventId: string,
    ) {
        this.id = id;
        this.accountId = accountId;
        this.bundleId = bundleId;
        this.domainId = domainId;
        this.domainBlockId = domainBlockId;
        this.operatorId = operatorId;
        this.domainBlockNumber = domainBlockNumber;
        this.domainBlockHash = domainBlockHash;
        this.domainBlockExtrinsicRoot = domainBlockExtrinsicRoot;
        this.epoch = epoch;
        this.consensusBlockNumber = consensusBlockNumber;
        this.consensusBlockHash = consensusBlockHash;
        this.totalTransfersIn = totalTransfersIn;
        this.transfersInCount = transfersInCount;
        this.totalTransfersOut = totalTransfersOut;
        this.transfersOutCount = transfersOutCount;
        this.totalRejectedTransfersClaimed = totalRejectedTransfersClaimed;
        this.rejectedTransfersClaimedCount = rejectedTransfersClaimedCount;
        this.totalTransfersRejected = totalTransfersRejected;
        this.transfersRejectedCount = transfersRejectedCount;
        this.totalVolume = totalVolume;
        this.consensusStorageFee = consensusStorageFee;
        this.domainExecutionFee = domainExecutionFee;
        this.burnedBalance = burnedBalance;
        this.blockHeight = blockHeight;
        this.extrinsicId = extrinsicId;
        this.eventId = eventId;
        
    }

    public id: string;
    public accountId: string;
    public bundleId: string;
    public domainId: string;
    public domainBlockId: string;
    public operatorId: string;
    public domainBlockNumber: bigint;
    public domainBlockHash: string;
    public domainBlockExtrinsicRoot: string;
    public epoch: bigint;
    public consensusBlockNumber: bigint;
    public consensusBlockHash: string;
    public totalTransfersIn: bigint;
    public transfersInCount: bigint;
    public totalTransfersOut: bigint;
    public transfersOutCount: bigint;
    public totalRejectedTransfersClaimed: bigint;
    public rejectedTransfersClaimedCount: bigint;
    public totalTransfersRejected: bigint;
    public transfersRejectedCount: bigint;
    public totalVolume: bigint;
    public consensusStorageFee: bigint;
    public domainExecutionFee: bigint;
    public burnedBalance: bigint;
    public blockHeight: bigint;
    public extrinsicId: string;
    public eventId: string;
    

    get _name(): string {
        return 'BundleSubmission';
    }

    async save(): Promise<void> {
        const id = this.id;
        assert(id !== null, "Cannot save BundleSubmission entity without an ID");
        await store.set('BundleSubmission', id.toString(), this as unknown as CompatBundleSubmissionProps);
    }

    static async remove(id: string): Promise<void> {
        assert(id !== null, "Cannot remove BundleSubmission entity without an ID");
        await store.remove('BundleSubmission', id.toString());
    }

    static async get(id: string): Promise<BundleSubmission | undefined> {
        assert((id !== null && id !== undefined), "Cannot get BundleSubmission entity without an ID");
        const record = await store.get('BundleSubmission', id.toString());
        if (record) {
            return this.create(record as unknown as BundleSubmissionProps);
        } else {
            return;
        }
    }


    /**
     * Gets entities matching the specified filters and options.
     *
     * ⚠️ This function will first search cache data followed by DB data. Please consider this when using order and offset options.⚠️
     * */
    static async getByFields(filter: FieldsExpression<BundleSubmissionProps>[], options: GetOptions<BundleSubmissionProps>): Promise<BundleSubmission[]> {
        const records = await store.getByFields<CompatBundleSubmissionProps>('BundleSubmission', filter  as unknown as FieldsExpression<CompatBundleSubmissionProps>[], options as unknown as GetOptions<CompatBundleSubmissionProps>);
        return records.map(record => this.create(record as unknown as BundleSubmissionProps));
    }

    static create(record: BundleSubmissionProps): BundleSubmission {
        assert(record.id !== undefined && record.id !== null, "id must be provided");
        const entity = new this(
            record.id,
            record.accountId,
            record.bundleId,
            record.domainId,
            record.domainBlockId,
            record.operatorId,
            record.domainBlockNumber,
            record.domainBlockHash,
            record.domainBlockExtrinsicRoot,
            record.epoch,
            record.consensusBlockNumber,
            record.consensusBlockHash,
            record.totalTransfersIn,
            record.transfersInCount,
            record.totalTransfersOut,
            record.transfersOutCount,
            record.totalRejectedTransfersClaimed,
            record.rejectedTransfersClaimedCount,
            record.totalTransfersRejected,
            record.transfersRejectedCount,
            record.totalVolume,
            record.consensusStorageFee,
            record.domainExecutionFee,
            record.burnedBalance,
            record.blockHeight,
            record.extrinsicId,
            record.eventId,
        );
        Object.assign(entity,record);
        return entity;
    }
}
