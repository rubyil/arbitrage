import { IToken } from "./IToken";
export type IPool = {
    id: string;
    token0Price: string;
    token1Price: string;
    token0: IToken;
    token1: IToken;
    reserve0?: string;
    reserve1?: string;
    sqrtPrice?: string;
    feeTier?: number;
    tick?: string;
    liquidity?: string;
}