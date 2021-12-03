export interface TextSource {
    getText(chapter: string): Promise<Array<[paragraphId: string | number, text: string, prefix?: any]>>
}