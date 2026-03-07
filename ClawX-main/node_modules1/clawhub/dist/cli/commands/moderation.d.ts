import type { GlobalOpts } from '../types.js';
export declare function cmdBanUser(opts: GlobalOpts, identifierArg: string, options: {
    yes?: boolean;
    id?: boolean;
}, inputAllowed: boolean): Promise<{
    ok: true;
    alreadyBanned: boolean;
    deletedSkills: number;
} | undefined>;
