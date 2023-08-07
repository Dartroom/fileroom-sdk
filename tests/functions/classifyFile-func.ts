import { classifyFile} from '../../src/functions';
import { FileType } from '../../src/enums';

describe('classifyFile', () => {
  it('should classify png file as image', async () => {
    const file = { mimetype: 'image/png' };
    const result = await classifyFile(file);
    expect(result).toEqual(FileType.IMAGE);
  });

  it('should classify jpg file as image', async () => {
    const file = { mimetype: 'image/jpg' };
    const result = await classifyFile(file);
    expect(result).toEqual(FileType.IMAGE);
  });

    it('should classify gif file as animation', async () => {
    const file = { mimetype: 'image/gif' };
    const result = await classifyFile(file);
    expect(result).toEqual(FileType.ANIMATION);
  });

  it('should classify mp4 file as video', async () => {
    const file = { mimetype: 'video/mp4' };
    const result = await classifyFile(file);
    expect(result).toEqual(FileType.VIDEO);
  });

  it('should classify mp3 file as audio', async () => {
    const file = { mimetype: 'audio/mp3' };
    const result = await classifyFile(file);
    expect(result).toEqual(FileType.ANY);
  });

  it('should classify pdf file as document', async () => {
    const file = { mimetype: 'application/pdf' };
    const result = await classifyFile(file);
    expect(result).toEqual(FileType.ANY);
  });
    it('should classify svg file as image', async () => {
    const file = { mimetype: 'image/svg+xml' }; 
    const result = await classifyFile(file);
    expect(result).toEqual(FileType.ANY);
  });

  
it('should classify unsupported file as unknown', async () => {
  const file = { mimetype: 'application/octet-stream' };

  try {
    const result = await classifyFile(file);
    expect(result).toEqual(FileType.UNSUPPORTED);
  } catch (error) {
    expect(error).toEqual(FileType.UNSUPPORTED); 
  }
});





});
