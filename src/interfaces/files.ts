import { PinStatus } from '../enums';
import { FileDoc, Color } from '../types';
export interface listOptions {
  limit?: number;
  skip?: number;
  sortDsc?: boolean;
  sortBy?: string;
}

/**Expected Response from list */

export interface listResponse {
  data: {
    docs: FileDoc[]; // list of available files
    totalDocs: number; // total number of files
    limit: number;
    offest: number;
    totalPages: number;
    page: number;
    pagingCounter: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    prevPage: number;
    nextPage: number;
  };
}

export interface existsResponse {
  data: {
    exists: boolean; // true if the file exists
  };
}

/**Expected Response from awaitUpload */

export interface awaitUploadResponse {
  data: FileDoc; // the uploaded file
}

/**deleteOne Options */
export interface deleteOneOptions {
  cid?: string;
  docID?: string;
}

/**Expected Response from deleteOne */

export interface deleteResponse {
  data: {
    deleted?: boolean; // true if the file was delete
    docID?: FileDoc; // the updated document (when docID is provided)
    modified?: FileDoc; //  modified duplicates (when cid is provided)
    deletedItems?: string[]; // list of cids of deleted files
    filesDeleted?: number; // number of files deleted
    storageSaved?: number; // amount of storage saved
    duplicatesDeleted?: number; // number of duplicates deleted
  };
}

/**Tus-metadata options */

export interface uploadOptions {
  resize?: string[]; // preview sizes
  replaceId?: string; // The ObjectID or cid of the file to replace
  resizeOptions?: SharpResizeOptions; // resize options
  name?: string;
}
/**Sharp Resize Options */
interface SharpResizeOptions {
  /** How the image should be resized to fit both provided dimensions, one of cover, contain, fill, inside or outside. (optional, default 'cover') */
  fit?: keyof FitEnum | undefined;
  /** Position, gravity or strategy to use when fit is cover or contain. (optional, default 'centre') */
  position?: number | string | undefined;
  /** Background colour when using a fit of contain, parsed by the color module, defaults to black without transparency. (optional, default {r:0,g:0,b:0,alpha:1}) */
  background?: Color | undefined;
  /** The kernel to use for image reduction. (optional, default 'lanczos3') */
  kernel?: keyof KernelEnum | undefined;
  /** Do not enlarge if the width or height are already less than the specified dimensions, equivalent to GraphicsMagick's > geometry option. (optional, default false) */
  withoutEnlargement?: boolean | undefined;
  /** Do not reduce if the width or height are already greater than the specified dimensions, equivalent to GraphicsMagick's < geometry option. (optional, default false) */
  withoutReduction?: boolean | undefined;
  /** Take greater advantage of the JPEG and WebP shrink-on-load feature, which can lead to a slight moiré pattern on some images. (optional, default true) */
  fastShrinkOnLoad?: boolean | undefined;
}

interface FitEnum {
  contain: 'contain';
  cover: 'cover';
  fill: 'fill';
  inside: 'inside';
  outside: 'outside';
}
interface KernelEnum {
  nearest: 'nearest';
  cubic: 'cubic';
  mitchell: 'mitchell';
  lanczos2: 'lanczos2';
  lanczos3: 'lanczos3';
}

export interface RGBA {
  r?: number | undefined;
  g?: number | undefined;
  b?: number | undefined;
  alpha?: number | undefined;
}
