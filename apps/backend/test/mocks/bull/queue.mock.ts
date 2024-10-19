/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-constant-condition */

import {
  Job,
  JobCounts,
  JobId,
  JobInformation,
  JobOptions,
  JobStatus,
  JobStatusClean,
  Queue,
} from 'bull';
import { EventEmitter } from 'events';
import Redis, { Pipeline } from 'ioredis';
import { isString } from 'lodash';

export class QueueMock<T> implements Queue<T> {
  private closed = false;
  private maxJobId = 1;
  private handlers = {};
  private pendingJobs = [];
  private successJobs = [];
  private failedJobs = [];

  constructor(public name: string) {}

  async process(
    name: unknown,
    concurrency?: unknown,
    handler?: unknown,
  ): Promise<void> {
    if (!concurrency) {
      handler = name;
      concurrency = 1;
      name = JobMock.DEFAULT_JOB_NAME;
    } else if (!handler) {
      handler = concurrency;
      if (typeof name === 'string') {
        concurrency = 1;
      } else {
        concurrency = name;
        name = JobMock.DEFAULT_JOB_NAME;
      }
    }

    if (!handler) {
      throw new Error('Cannot set an undefined handler');
    }
    if (typeof handler === 'string') {
      throw new Error('Cannot set a string handler');
    }
    if (this.handlers[name as string]) {
      throw new Error('Cannot define the same handler twice ' + name);
    }
    this.handlers[name as string] = handler;

    void this.start(concurrency as number, name as string);
  }

  async add(name: unknown, data?: unknown, opts?: unknown): Promise<Job<T>> {
    if (!isString(name)) {
      opts = data;
      data = name;
      name = JobMock.DEFAULT_JOB_NAME;
    }
    if (!data) {
      opts = {};
      data = name;
      name = JobMock.DEFAULT_JOB_NAME;
    } else {
      opts = opts || {};
    }
    const job = new JobMock(
      (opts as JobOptions).jobId ?? this.maxJobId++,
      name as string,
      data as T,
      opts as JobOptions,
      this,
    );
    this.pendingJobs.push(job);
    return job;
  }

  async close(doNotWaitJobs?: boolean): Promise<void> {
    this.closed = true;
  }

  async getNextJob(): Promise<Job<T> | undefined> {
    const checkAndResolve = (resolve) => {
      if (this.closed) {
        resolve(undefined);
        return;
      }
      if (this.pendingJobs.length > 0) {
        resolve(this.pendingJobs.shift());
      } else {
        setTimeout(() => checkAndResolve(resolve), 0);
      }
    };

    return new Promise((resolve) => {
      checkAndResolve(resolve);
    });
  }

  private async start(concurrency: number, name: string) {
    for (let i = 0; i < concurrency; i++) {
      void this.processJob(name);
    }
  }

  private async processJob(name: string) {
    const handler = this.handlers[name];
    if (!handler) {
      throw new Error('No handler defined for ' + name);
    }
    while (true) {
      const job = await this.getNextJob();
      if (!job) {
        break;
      }
      if (job.name !== name) {
        setTimeout(() => this.pendingJobs.push(job), 0);
        continue;
      }
      try {
        await handler(job);
        this.successJobs.push(job);
      } catch (error) {
        this.failedJobs.push(job);
        console.error('Error processing job', error);
      }
    }
  }

  get client(): Redis {
    throw new Error('Method not implemented.');
  }

  isReady(): Promise<this> {
    throw new Error('Method not implemented.');
  }

  addBulk(
    jobs: {
      name?: string | undefined;
      data: T;
      opts?: Omit<JobOptions, 'repeat'> | undefined;
    }[],
  ): Promise<Job<T>[]> {
    throw new Error('Method not implemented.');
  }
  pause(isLocal?: boolean, doNotWaitActive?: boolean): Promise<void> {
    throw new Error('Method not implemented.');
  }
  resume(isLocal?: boolean): Promise<void> {
    throw new Error('Method not implemented.');
  }
  isPaused(isLocal?: boolean): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  count(): Promise<number> {
    throw new Error('Method not implemented.');
  }
  empty(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  getCountsPerPriority(
    priorities: number[],
  ): Promise<{ [index: string]: number }> {
    throw new Error('Method not implemented.');
  }
  getJob(jobId: JobId): Promise<Job<T>> {
    throw new Error('Method not implemented.');
  }
  getWaiting(start?: number, end?: number): Promise<Job<T>[]> {
    throw new Error('Method not implemented.');
  }
  getActive(start?: number, end?: number): Promise<Job<T>[]> {
    throw new Error('Method not implemented.');
  }
  getDelayed(start?: number, end?: number): Promise<Job<T>[]> {
    throw new Error('Method not implemented.');
  }
  getCompleted(start?: number, end?: number): Promise<Job<T>[]> {
    throw new Error('Method not implemented.');
  }
  getFailed(start?: number, end?: number): Promise<Job<T>[]> {
    throw new Error('Method not implemented.');
  }
  getRepeatableJobs(
    start?: number,
    end?: number,
    asc?: boolean,
  ): Promise<JobInformation[]> {
    throw new Error('Method not implemented.');
  }
  nextRepeatableJob(
    name: string,
    data: any,
    opts: JobOptions,
  ): Promise<Job<T>> {
    throw new Error('Method not implemented.');
  }
  removeRepeatable(name: unknown, repeat?: unknown): Promise<void> {
    throw new Error('Method not implemented.');
  }
  removeRepeatableByKey(key: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  getJobs(
    types: JobStatus[],
    start?: number,
    end?: number,
    asc?: boolean,
  ): Promise<Job<T>[]> {
    throw new Error('Method not implemented.');
  }
  getMetrics(
    type: unknown,
    start?: unknown,
    end?: unknown,
  ): Promise<{
    meta: { count: number; prevTS: number; prevCount: number };
    data: number[];
    count: number;
  }> {
    throw new Error('Method not implemented.');
  }
  getJobLogs(
    jobId: JobId,
    start?: number,
    end?: number,
  ): Promise<{ logs: string[]; count: number }> {
    throw new Error('Method not implemented.');
  }
  getJobCounts(): Promise<JobCounts> {
    throw new Error('Method not implemented.');
  }
  getJobCountByTypes(types: JobStatus[] | JobStatus): Promise<number> {
    throw new Error('Method not implemented.');
  }
  getCompletedCount(): Promise<number> {
    throw new Error('Method not implemented.');
  }
  getFailedCount(): Promise<number> {
    throw new Error('Method not implemented.');
  }
  getDelayedCount(): Promise<number> {
    throw new Error('Method not implemented.');
  }
  getWaitingCount(): Promise<number> {
    throw new Error('Method not implemented.');
  }
  getPausedCount(): Promise<number> {
    throw new Error('Method not implemented.');
  }
  getActiveCount(): Promise<number> {
    throw new Error('Method not implemented.');
  }
  getRepeatableCount(): Promise<number> {
    throw new Error('Method not implemented.');
  }
  clean(
    grace: number,
    status?: JobStatusClean,
    limit?: number,
  ): Promise<Job<T>[]> {
    throw new Error('Method not implemented.');
  }
  multi(): Pipeline {
    throw new Error('Method not implemented.');
  }
  toKey(queueType: string): string {
    throw new Error('Method not implemented.');
  }
  obliterate(ops?: { force: boolean }): Promise<void> {
    throw new Error('Method not implemented.');
  }
  on(event: unknown, callback: unknown): this {
    throw new Error('Method not implemented.');
  }
  clients: Redis[];
  setWorkerName(): Promise<any> {
    throw new Error('Method not implemented.');
  }
  getWorkers(): Promise<{ [index: string]: string }[]> {
    throw new Error('Method not implemented.');
  }
  base64Name(): string {
    throw new Error('Method not implemented.');
  }
  clientName(): string {
    throw new Error('Method not implemented.');
  }
  parseClientList(list: string): { [index: string]: string }[][] {
    throw new Error('Method not implemented.');
  }
  whenCurrentJobsFinished(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  removeJobs(pattern: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  [EventEmitter.captureRejectionSymbol]?<K>(
    error: Error,
    event: string | symbol,
    ...args: any[]
  ): void {
    throw new Error('Method not implemented.');
  }
  addListener<K>(
    eventName: string | symbol,
    listener: (...args: any[]) => void,
  ): this {
    throw new Error('Method not implemented.');
  }
  once<K>(
    eventName: string | symbol,
    listener: (...args: any[]) => void,
  ): this {
    throw new Error('Method not implemented.');
  }
  removeListener<K>(
    eventName: string | symbol,
    listener: (...args: any[]) => void,
  ): this {
    throw new Error('Method not implemented.');
  }
  off<K>(eventName: string | symbol, listener: (...args: any[]) => void): this {
    throw new Error('Method not implemented.');
  }
  removeAllListeners(eventName?: string | symbol): this {
    throw new Error('Method not implemented.');
  }
  setMaxListeners(n: number): this {
    throw new Error('Method not implemented.');
  }
  getMaxListeners(): number {
    throw new Error('Method not implemented.');
  }
  listeners<K>(eventName: string | symbol): Function[] {
    throw new Error('Method not implemented.');
  }
  rawListeners<K>(eventName: string | symbol): Function[] {
    throw new Error('Method not implemented.');
  }
  emit<K>(eventName: string | symbol, ...args: any[]): boolean {
    throw new Error('Method not implemented.');
  }
  listenerCount<K>(eventName: string | symbol, listener?: Function): number {
    throw new Error('Method not implemented.');
  }
  prependListener<K>(
    eventName: string | symbol,
    listener: (...args: any[]) => void,
  ): this {
    throw new Error('Method not implemented.');
  }
  prependOnceListener<K>(
    eventName: string | symbol,
    listener: (...args: any[]) => void,
  ): this {
    throw new Error('Method not implemented.');
  }
  eventNames(): (string | symbol)[] {
    throw new Error('Method not implemented.');
  }
}

export class JobMock<T> implements Job<T> {
  static DEFAULT_JOB_NAME = '__default_mock__';

  id: JobId;
  data: T;
  opts: JobOptions;
  attemptsMade: number;
  processedOn?: number;
  finishedOn?: number;
  queue: Queue<T>;
  timestamp: number;
  name: string;
  stacktrace: string[];
  returnvalue: any;
  failedReason?: string;

  constructor(
    id: number | string,
    name: string,
    data: T,
    opts: JobOptions,
    queue: QueueMock<T>,
  ) {
    this.id = id;
    this.name = name;
    this.data = JSON.parse(JSON.stringify(data));
    this.opts = opts;
    this.queue = queue;
  }

  progress(value?: unknown): any {
    throw new Error('Method not implemented.');
  }
  log(row: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
  isCompleted(): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  isFailed(): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  isDelayed(): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  isActive(): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  isWaiting(): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  isPaused(): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  isStuck(): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  getState(): Promise<JobStatus | 'stuck'> {
    throw new Error('Method not implemented.');
  }
  update(data: T): Promise<void> {
    throw new Error('Method not implemented.');
  }
  remove(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  retry(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  discard(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  finished(): Promise<any> {
    throw new Error('Method not implemented.');
  }
  moveToCompleted(
    returnValue?: string,
    ignoreLock?: boolean,
    notFetch?: boolean,
  ): Promise<[any, JobId] | null> {
    throw new Error('Method not implemented.');
  }
  moveToFailed(
    errorInfo: { message: string },
    ignoreLock?: boolean,
  ): Promise<[any, JobId] | null> {
    throw new Error('Method not implemented.');
  }
  promote(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  lockKey(): string {
    throw new Error('Method not implemented.');
  }
  releaseLock(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  takeLock(): Promise<number | false> {
    throw new Error('Method not implemented.');
  }
  extendLock(duration: number): Promise<number> {
    throw new Error('Method not implemented.');
  }
  toJSON(): {
    id: JobId;
    name: string;
    data: T;
    opts: JobOptions;
    progress: number;
    delay: number;
    timestamp: number;
    attemptsMade: number;
    failedReason: any;
    stacktrace: string[] | null;
    returnvalue: any;
    finishedOn: number | null;
    processedOn: number | null;
  } {
    throw new Error('Method not implemented.');
  }
}
