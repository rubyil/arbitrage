import { gql, useQuery } from "@apollo/client";
import React, { FC, FunctionComponent, useEffect, useState } from "react";
import { Fetcher, Token } from "@uniswap/sdk";
import { IPool } from "../types/IPool";
import Web3, { Contract } from "web3";
import ERC20ABI from '../ERC20ABI.json'

const web3 = new Web3(window.ethereum)

async function getReserves(pool: IPool): Promise<{ token0Reserve: number, token1Reserve: number }> {
    const token0Contract = new web3.eth.Contract(ERC20ABI, pool.token0.id)
    const token0Reserve = await token0Contract.methods.balanceOf(pool.id).call()
    const token1Contract = new web3.eth.Contract(ERC20ABI, pool.token1.id)
    const token1Reserve = await token1Contract.methods.balanceOf(pool.id).call()
    console.log(token0Reserve, token1Reserve)
    return {
        token0Reserve: Number(token0Reserve),
        token1Reserve: Number(token1Reserve)
    }
}
const Pools: FC<{ pools: IPool[] }> = ({ pools }) => {
    const [token0Reserve, setToken0Reserve] = useState<number>('')
    const [token1Reserve, setToken1Reserve] = useState<number>('')
    return (
        <>
            <ul>
                {pools.map((pool: IPool, index: number) => {
                    getReserves(pool).then((res) => {
                        setToken0Reserve(res.token0Reserve / 10 ** pool.token0.decimals)
                        setToken1Reserve(res.token1Reserve / 10 ** pool.token1.decimals)
                    })
                    return (
                        <li key={index}>
                            <pre>pool address: {pool.id}</pre>
                            <pre>token0 address: {pool.token0.id}</pre>
                            <pre>token0 price {pool.token0Price}</pre>
                            <pre>token1 address: {pool.token1.id}</pre>
                            <pre>token1 price {pool.token1Price}</pre>
                            <pre>token0 reserve: {token0Reserve}</pre>
                            <pre>token1 reserve: {token1Reserve}</pre>
                            <pre>K: {token0Reserve * token1Reserve}</pre>
                            <h2>{`${pool.token0.symbol} / ${pool.token1.symbol} --> `}</h2>
                        </li>
                    )
                })}
            </ul>
        </>
    )
}

export default Pools