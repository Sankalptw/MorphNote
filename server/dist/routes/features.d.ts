declare const featuresRouter: import("express-serve-static-core").Router;
declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}
export default featuresRouter;
//# sourceMappingURL=features.d.ts.map