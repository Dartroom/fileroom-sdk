import { EventProgress, RGBA } from '../interfaces';
import { PinStatus } from '../enums';
/**Events recieved from  fileroom*/
export type EventName =
  | 'Tus Upload'
  | 'Original Processed'
  | 'InterFs Upload'
  | 'InterFs Download'
  | 'IPfs Upload'
  | 'IPfs Download'
  | 'CDN Upload'
  | 'Pin Status'
  | 'Video Transcode'
  | 'Preview Completed';

type OverallProgress = {
  overallProgress: number;
};
export type ProgressEvent = Record<EventName, EventProgress> & OverallProgress;

export type UploadEvents = 'progress' | 'completed' | 'error' | 'success';

export type Color = string | RGBA;

export type FileDoc = {
  _id: string;
  userId: string;
  totalSize: number;
  duplicate: boolean;
  duplicateFiles: string[];
  trackingId: string;
  expectedPreviewCount: number;
  currentPreviewCount: number;
  pinningStatus: PinStatus;
  original: {
    cid: string;
    mimetype: string;
    size: number;
    integrityHash: string;
    resolution: {
      width: number;
      height: number;
    };
    frameRate: number;
  };
  previews: Array<{
    cid: string;
    width: number;
    height: number;
    mimetype: string;
    size: number;
  }>;
};

export type UploadResult = {
  file: FileDoc;
  deleted?: UploadDeleteResponse | null | any[];
  previewsFound?: boolean;
  listenTo?: {
    wsUrl: string;
    event: string;
  };
} & FileDoc;

export type UploadDeleteResponse = {
  file?: FileDoc | null;
  deleted: true;
};