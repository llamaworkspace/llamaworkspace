import { createReadStream } from 'fs'
import { access, readFile, writeFile } from 'fs/promises'
import path from 'path'

// A function to create a read stream from a file path
// This function is safe from path traversal attacks
// by restricting the file path to a base directory.
// It also prevents TS error: lint TP1004 fs.createReadStream(???*0*) is very dynamic
// which is caused by using the method too loosely, with a dynamic path.

export const createReadStreamSafe = async (filePath: string) => {
  // Define a base directory to prevent path traversal
  const baseDir = path.resolve(process.cwd(), 'tmp')

  // Resolve the full path
  const fullPath = path.resolve(baseDir, filePath)

  // Ensure the resolved path is within the base directory
  if (!fullPath.startsWith(baseDir)) {
    throw new Error('Invalid file path')
  }

  try {
    // Check if the file exists
    await access(fullPath)

    // Create and return the read stream
    return createReadStream(fullPath)
  } catch (err) {
    throw new Error('File does not exist')
  }
}

export const readFileSafeAsUtf8 = async (filePath: string) => {
  // Define a base directory to prevent path traversal
  const baseDir = path.resolve(process.cwd(), 'tmp')

  // Resolve the full path
  const fullPath = path.resolve(baseDir, filePath)

  // Ensure the resolved path is within the base directory
  if (!fullPath.startsWith(baseDir)) {
    throw new Error('Invalid file path')
  }

  try {
    // Check if the file exists
    await access(fullPath)

    // Create and return the read stream
    return readFile(fullPath, 'utf-8')
  } catch (err) {
    throw new Error('File does not exist')
  }
}

export const readFileSafeAsUint8Array = async (
  filePath: string,
): Promise<Uint8Array> => {
  const baseDir = path.resolve(process.cwd(), 'tmp')
  const fullPath = path.resolve(baseDir, filePath)

  if (!fullPath.startsWith(baseDir)) {
    throw new Error('Invalid file path')
  }

  try {
    await access(fullPath)
    const fileBuffer = await readFile(fullPath)

    return new Uint8Array(fileBuffer)
  } catch (err) {
    throw new Error('File does not exist')
  }
}

export const writeFileSafeAsUtf8 = async (
  filePath: string,
  contents: string,
) => {
  // Define a base directory to prevent path traversal
  const baseDir = path.resolve(process.cwd(), 'tmp')

  // Resolve the full path
  const fullPath = path.resolve(baseDir, filePath)

  // Ensure the resolved path is within the base directory
  if (!fullPath.startsWith(baseDir)) {
    throw new Error('Invalid file path')
  }

  return await writeFile(fullPath, contents)
}

export const fileOrFolderExists = async (filePath: string) => {
  try {
    await access(filePath)
    return true
  } catch (error) {
    if (isErrnoException(error)) {
      return false
    }
    throw error
  }
}

function isErrnoException(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error
}
