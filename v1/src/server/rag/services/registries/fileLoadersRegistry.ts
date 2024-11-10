import { CsvLoadingStrategy } from '../strategies/load/CsvLoadingStrategy'
import { DocxLoadingStrategy } from '../strategies/load/DocxLoadingStrategy'
import { ILoadingStrategy } from '../strategies/load/ILoadingStrategy'
import { PdfLoadingStrategy } from '../strategies/load/PdfLoadingStrategy'
import { PptxLoadingStrategy } from '../strategies/load/PptxLoadingStrategy'
import { TextLoadingStrategy } from '../strategies/load/TextLoadingStrategy'
import { GenericRegistry } from '../utils/GenericRegistry'

const fileLoadersRegistry = new GenericRegistry<ILoadingStrategy>()
fileLoadersRegistry.register(new TextLoadingStrategy())
fileLoadersRegistry.register(new PdfLoadingStrategy())
fileLoadersRegistry.register(new DocxLoadingStrategy())
fileLoadersRegistry.register(new PptxLoadingStrategy())
fileLoadersRegistry.register(new CsvLoadingStrategy())

export { fileLoadersRegistry }
