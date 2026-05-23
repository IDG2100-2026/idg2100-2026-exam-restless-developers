import express from "express";

const nonApiRouter = express.Router();

nonApiRouter.get("/", (req, res)=>{
	res.send("Sjekk ut Hocus Pokus Spanish Pokus siden ved å skrive /api");
});

export default nonApiRouter;