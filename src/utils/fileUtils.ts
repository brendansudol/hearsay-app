import axios from "axios"
import crypto from "crypto"

export async function getFileMetadata(url: string) {
  try {
    const { headers } = await axios.head(url)
    const contentType = headers["content-type"]
    const contentLength = Number(headers["content-length"]) || undefined
    return { contentType, contentLength }
  } catch (error) {
    console.log("error getting file metadata: ", error)
  }
}

export async function hashFile(url: string) {
  try {
    const hash = crypto.createHash("sha256")
    const response = await axios.get(url, { responseType: "stream" })

    return new Promise((resolve, reject) => {
      response.data.on("data", (chunk: any) => {
        hash.update(chunk)
      })

      response.data.on("end", () => {
        const fileHash = hash.digest("hex")
        resolve(fileHash)
      })

      response.data.on("error", (error: Error) => {
        console.error("error reading the audio file:", error.message)
        reject(error)
      })
    })
  } catch (error) {
    console.log("error hashing file: ", error)
  }
}

export async function hashPartialFile(url: string, maxChunks: number = 10) {
  try {
    const hash = crypto.createHash("sha256")
    const response = await axios.get(url, { responseType: "stream" })

    return new Promise<string>((resolve, reject) => {
      let chunksProcessed = 0

      const onFinish = () => {
        const fileHash = hash.digest("hex")
        resolve(fileHash)
      }

      response.data.on("data", (chunk: any) => {
        if (chunksProcessed < maxChunks) {
          hash.update(chunk)
          chunksProcessed++
        } else {
          response.data.destroy()
        }
      })

      response.data.on("end", onFinish)
      response.data.on("close", onFinish)
      response.data.on("error", reject)
    })
  } catch (error) {
    console.log("error hashing file: ", error)
  }
}
