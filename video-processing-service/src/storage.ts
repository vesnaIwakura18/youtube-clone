import { Storage } from "@google-cloud/storage";
import fs from 'fs';
import ffmpeg from "fluent-ffmpeg";

const storage = new Storage();

const rawVideoBucketName = "iwak-yt-raw-videos";
const processedVideoName = "iwak-yt-processed-videos"

const localRawVideoPath = "./raw-videos";
const localProcessedVideoPath = "./processed-videos";

export function setupDirectories() {
    ensureDirectoryExtistence(localRawVideoPath);
    ensureDirectoryExtistence(localProcessedVideoPath);
}

export function convertVideo(rawVideoName: string, processedVideoName: string) {
    return new Promise<void>((resolve, reject) => {
        ffmpeg(`${localRawVideoPath}/${rawVideoName}`)
        .outputOptions("-vf", "scale=480x360") // 360p
        .on("end", () => {
            console.log('Processing finished successfully.');
            resolve();
        })
        .on("error", (err) => {
            console.log(`An error occurred: ${err.message}`);
            reject(err);
        })
        .save(`${localProcessedVideoPath}/${processedVideoName}`);
    });
}

export async function downloadRawVideo(fileName: string) {
    await storage.bucket(rawVideoBucketName)
        .file(fileName)
        .download({ destination: `${localProcessedVideoPath}/${fileName}` });

    console.log(
        `gs://${rawVideoBucketName}/${fileName} downloaded to ${localProcessedVideoPath}/${fileName}}`
    );
}

export async function uploadProcessedVideo(fileName: string) {
    const bucket = storage.bucket(processedVideoName);

    await bucket.upload(`${localProcessedVideoPath}/${fileName}`, {
        destination: fileName
    });
    console.log(
        `gs://${localProcessedVideoPath}/${fileName} uploaded to ${processedVideoName}/${fileName}}`
    );

    await bucket.file(fileName).makePublic();
}

export function deleteRawVideo(fileName: string) {
    return deleteFile(`${localRawVideoPath}/${fileName}`);
}

export function deleteProceseedVideo(fileName: string) {
    return deleteFile(`${localProcessedVideoPath}/${fileName}`);
}

function deleteFile(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.log(`Failed to delete file at ${filePath}`, err);
                    reject(err);
                } else {
                    console.log(`File deleted at ${filePath}`);
                    resolve();
                }
            })
        } else {
            console.log(`File not found at ${filePath}, skipping the delete.`);
            resolve();
        }
    });
}

function ensureDirectoryExtistence(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`Directory created at ${dirPath}`);
    }
}