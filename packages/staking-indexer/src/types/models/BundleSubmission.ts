// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames, FieldsExpression, GetOptions } from "@subql/types-core";
import assert from 'assert';



export type BundleSubmissionProps = Omit<BundleSubmission, NonNullable<FunctionPropertyNames<BundleSubmission>>| '_name'>;

export class BundleSubmission implements Entity {

    constructor(
        
        id: string,
        proposer: string,
        bundleId: string,
        domainId: string,
        operatorId: string,
        domainBlockNumber: bigint,
        epoch: bigint,
        consensusBlockNumber: bigint,
        extrinsicId: string,
        eventId: string,
        blockHeight: bigint,
        processed: boolean,
    ) {
        this.id = id;
        this.proposer = proposer;
        this.bundleId = bundleId;
        this.domainId = domainId;
        this.operatorId = operatorId;
        this.domainBlockNumber = domainBlockNumber;
        this.epoch = epoch;
        this.consensusBlockNumber = consensusBlockNumber;
        this.extrinsicId = extrinsicId;
        this.eventId = eventId;
        this.blockHeight = blockHeight;
        this.processed = processed;
        
    }

    public id: string;
    public proposer: string;
    public bundleId: string;
    public domainId: string;
    public operatorId: string;
    public domainBlockNumber: bigint;
    public epoch: bigint;
    public consensusBlockNumber: bigint;
    public extrinsicId: string;
    public eventId: string;
    public blockHeight: bigint;
    public processed: boolean;
    

    get _name(): string {
        return 'BundleSubmission';
    }

    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save BundleSubmission entity without an ID");
        await store.set('BundleSubmission', id.toString(), this);
    }

    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove BundleSubmission entity without an ID");
        await store.remove('BundleSubmission', id.toString());
    }

    static async get(id:string): Promise<BundleSubmission | undefined>{
        assert((id !== null && id !== undefined), "Cannot get BundleSubmission entity without an ID");
        const record = await store.get('BundleSubmission', id.toString());
        if (record) {
            return this.create(record as BundleSubmissionProps);
        } else {
            return;
        }
    }

    static async getByProcessed(processed: boolean): Promise<BundleSubmission[] | undefined>{
      const records = await store.getByField('BundleSubmission', 'processed', processed);
      return records.map(record => this.create(record as BundleSubmissionProps));
    }


    /**
     * Gets entities matching the specified filters and options.
     *
     * ⚠️ This function will first search cache data followed by DB data. Please consider this when using order and offset options.⚠️
     * */
    static async getByFields(filter: FieldsExpression<BundleSubmissionProps>[], options?: GetOptions<BundleSubmissionProps>): Promise<BundleSubmission[]> {
        const records = await store.getByFields('BundleSubmission', filter, options);
        return records.map(record => this.create(record as BundleSubmissionProps));
    }

    static create(record: BundleSubmissionProps): BundleSubmission {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new this(
            record.id,
            record.proposer,
            record.bundleId,
            record.domainId,
            record.operatorId,
            record.domainBlockNumber,
            record.epoch,
            record.consensusBlockNumber,
            record.extrinsicId,
            record.eventId,
            record.blockHeight,
            record.processed,
        );
        Object.assign(entity,record);
        return entity;
    }
}
