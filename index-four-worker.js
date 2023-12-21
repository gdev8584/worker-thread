const express = require('express');
const { Worker } = require("worker_threads")

const app = express()
const port = process.env.PORT || 3000;
const THREAD_COUNT = 4;

app.get("/non-blocking", (req,res)=>{
    res.status(200).send('THis page is non-blocking');
})

function createWorker() {
    return new Promise((resolve,rejects)=>{
        const worker = new Worker('./four-worker.js', {
            workerData: {thread_count: THREAD_COUNT}
        })
        worker.on('message', (data)=>{
            resolve(data)
        })
        worker.on('error', (error)=>{
            rejects(error)
        })
    })
}

app.get("/blocking", async (req, res)=>{
   const workerPromises = [];
   for(let i=0;i< THREAD_COUNT; i++){
    workerPromises.push(createWorker())
   }
   const thread_result = await Promise.all(workerPromises)
   const total = thread_result[0] + thread_result[1] + thread_result[2] + thread_result[3];
   res.status(200).send(`result is ${total}`)
})

app.listen(port, () =>{
    console.log(`App is listening ${port} `)
})