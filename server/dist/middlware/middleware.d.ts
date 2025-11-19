import { Request, Response, NextFunction } from "express";
declare module "express" {
    interface Request {
        userId?: string;
        userEmail?: string;
    }
}
declare const userMiddleware: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export default userMiddleware;
//# sourceMappingURL=middleware.d.ts.map