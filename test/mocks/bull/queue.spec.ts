import { QueueMock } from "./queue.mock";

describe("test queue", () => {
  let queue: QueueMock<{foo: string}>;
  let processSeq: string[];

  beforeEach(() => {
    queue = new QueueMock<{foo: string}>('foo');
    processSeq = [];
  });

  afterEach(async () => {
    await queue.close();
  });

  it("job with default name", async () => {
    void queue.process(2, async (job) => {
      processSeq.push('BEGIN ' + job.data.foo);
      await new Promise((resolve) => setTimeout(resolve, 10));
      processSeq.push('END ' + job.data.foo);
    });
    await queue.add({ foo: 'bar' });
    await queue.add({ foo: 'baz' });
    await queue.add({ foo: 'foobar' });

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(processSeq).toEqual([
      'BEGIN bar',
      'BEGIN baz',
      'END bar',
      'BEGIN foobar',
      'END baz',
      'END foobar'
    ]);
  });

  it("job with custom name", async () => {
    void queue.process('foo', 2, async (job) => {
      processSeq.push('BEGIN ' + job.data.foo);
      await new Promise((resolve) => setTimeout(resolve, 10));
      processSeq.push('END ' + job.data.foo);
    });
    await queue.add('foo', { foo: 'bar' });
    await queue.add({ foo: 'baz' });
    await queue.add('foo', { foo: 'foobar' });

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(processSeq).toEqual([
      'BEGIN bar',
      'BEGIN foobar',
      'END bar',
      'END foobar',
    ]);
  });

});