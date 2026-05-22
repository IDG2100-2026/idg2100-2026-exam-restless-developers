
export const falseAuth = (req, res, next) => {
    const role = req.headers["role"];

    if(!role) {
        req.user = {role: "anonymous"};
    } else {
        req.user = { role };
    }
    next();
};

export const isAdmin = (req, res, next) => {
    if(req.user.role !== "admin") {
        return res.status(403).json({error: "Admin access required"});
    }
    next();
};