import { NextFunction, Request, Response } from "express";

export const checkBody = async (req: Request, res: Response, next: NextFunction) => {
    if(req.body==null){
        return res.status(403).json({
            success: false,
            message: "Must include body"
        })
    }
    next()
}