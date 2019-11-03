const express = require('express')
const fs = require('fs')

const app = express()
const port = 3000

if (!process.env.VIDEOS_PATH) {
    throw new Error("Please specify path to videos env var VIDEOS_PATH.")
}

const VIDEOS_PATH = process.env.VIDEOS_PATH

app.get('/video', (req,res) => {
    // const path = "../videos/SampleVideo_1280x720_1mb.mp4"
    fs.readdir(VIDEOS_PATH, (err, files) => {
        if (err) {
            console.error("An error occurred")
            console.error(err && err.stack || err)
        }
        else {
            res.json({
                videos: files,
            })
        }
    })
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
