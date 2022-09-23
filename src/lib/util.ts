export const generateResourceRandomPart = () : string => {
    const str = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const len = 8
    let rnd = crypto.getRandomValues(new Uint32Array(len));
    return Array.from(rnd).map((n) => str[n%str.length]).join("");
}
