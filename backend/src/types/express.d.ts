import 'multer';

declare global {
  namespace Express {
    interface UserPayload {
      userId: string;
      email: string;
    }

    interface Request {
      user?: UserPayload;
      file?: Multer.File;
      files?: Multer.File[] | { [fieldname: string]: Multer.File[] };
    }
  }
}

export {};