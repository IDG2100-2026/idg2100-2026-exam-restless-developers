import crypto from "node:crypto";

const {APP_SALT: salt} = process.env;

export function hashPWD(pwd){
    const s2hash = pwd + salt;

    return crypto.createHash("md5").update(s2hash).digest("hex").toString();
}

export function checkPWD(pwd, existingHash){
    return hashPWD(pwd) === existingHash
}