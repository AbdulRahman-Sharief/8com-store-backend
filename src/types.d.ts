import { UserDocument } from './user/entities/user.entity'; // Adjust the import path as needed

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        user: UserDocument;
      };
    }
  }
}
