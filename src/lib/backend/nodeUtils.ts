import { createReadStream } from 'fs'
import { access } from 'fs/promises'
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
