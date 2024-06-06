// import { InjectQueue } from '@nestjs/bull';
// import { Injectable } from '@nestjs/common';
// import { Queue } from 'bull';
// import { QueuesRegistered } from './types/queues.type';

// @Injectable()
// export class QueueService {
//   constructor(
//     @InjectQueue(QueuesRegistered.deviceLog)
//     private queue: Queue,
//   ) {}

//   async addToQueue(data) {
//     return this.queue.add(data, {
//       removeOnComplete: true,
//       attempts: 3,
//       backoff: {
//         type: 'exponential', // Backoff type, which can be either `fixed` or `exponential`. A custom backoff strategy can also be specified in `backoffStrategies` on the queue settings.
//         delay: 10000, // Backoff delay, in milliseconds.
//       },
//     });
//   }
// }
