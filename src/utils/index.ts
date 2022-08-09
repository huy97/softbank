import * as crypto from "crypto";

export const sha1 = (str: string) => {
    const shasum = crypto.createHash("sha1");
    shasum.update(str);
    return shasum.digest("hex");
};
