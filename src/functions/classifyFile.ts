import { FileType } from '../enums';

/** 
 * classifies a file according our specifications for resizing. (**FileType**)
 *@param {mimeType} mimeType  the mime type of the file
 *@returns {string} -  FileType.IMAGE or others

 */
export function classifyFile(file: { mimetype: string }): Promise<string> {
  return new Promise((resolve, reject) => {
    let fileFormat = file.mimetype.split('/')[1] as string;
    // use a regExp instead of a switch statements to make it compatible and readable.
    let supportedAudio =
      /(mpeg)|(mp3)|(mp4)|(ogg)|(wav)|(webm)|(flac)|(aac)|(weba)|(amr)|(opus)|(m4a)|(oga)/g;
    // ACC audio -> acc


     
    if (
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/webp' ||
      file.mimetype === 'image/avif' ||
      file.mimetype === 'image/tiff'
    ) {
      resolve(FileType.IMAGE);
    } else if (
      file.mimetype === 'image/gif' ||
      file.mimetype === 'image/webp'
    ) {
      resolve(FileType.ANIMATION);
    } else if (file.mimetype === 'video/mp4') {
      resolve(FileType.VIDEO);
    } else if (
      (file.mimetype.includes('audio') && supportedAudio.test(fileFormat)) ||
      (file.mimetype.includes('application/') &&
        ['pdf', 'json'].includes(fileFormat)) ||
      file.mimetype === 'image/svg+xml'
    ) {
      resolve(FileType.ANY);
    } else {
      reject(FileType.UNSUPPORTED);
    }
  });
}
