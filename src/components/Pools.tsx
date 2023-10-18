import { FC } from "react";
import { IPool } from "../types/IPool";
import Pool from "./Pool";

const Pools: FC<{ pools: IPool[], amount: number }> = ({ pools, amount }) => {
    return (
        <>
            <ul>
                {pools.map((pool: IPool, index: number) => {
                    return (
                        <li key={index}>
                            <Pool pool={pool} baseAmount={amount} />
                        </li>
                    )
                })}
            </ul>
        </>
    )
}

export default Pools