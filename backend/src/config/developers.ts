export const DEVELOPERS: string[] = [
    //'328819524365320192',

];

export const isDeveloper = (discordId: string): boolean => {
    return DEVELOPERS.includes(discordId);
};