import IORedis from 'ioredis'

// Configuration for Redis connection
const connection = new IORedis(
  {
    host: 'localhost',
    port: 6379,
  },
  { maxRetriesPerRequest: null },
)

// Define a queue
// const myQueue = new Queue('my-queue', { connection })

// Define a worker to process jobs
// const worker = new Worker(
//   'my-queue',
//   async (job) => {
//     console.log(`Processing job ${job.id}:`, job.data)

//     // Example job processing logic
//     // const result = job.data.someField * 2

//     return true
//   },
//   { connection },
// )

// // Error Handling
// worker.on('failed', (job, err) => {
//   console.error(`Job ${job.id} failed with error:`, err)
// })

// worker.on('completed', (job) => {
//   console.log(`Job ${job.id} completed successfully.`)
// })

// worker.on('error', (err) => {
//   console.error('Worker encountered an error:', err)
// })

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('Shutting down gracefully...')
  // await worker.close()
  await myQueue.close()
  process.exit(0)
}

// Listen for shutdown signals
process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)

console.log('Worker is running...')
