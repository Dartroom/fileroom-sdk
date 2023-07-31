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

  // Add more test cases for different file types

  it('should reject unsupported file type', async () => {
    const file = { mimetype: 'application/xml' };
    await expect(classifyFile(file)).rejects.toEqual(FileType.UNSUPPORTED);
  });
});
