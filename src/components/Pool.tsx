import { FC, useEffect, useMemo, useState } from 'react'
import { IPool } from '../types/IPool'
import Web3 from 'web3'
import ERC20ABI from '../ERC20ABI.json'
import { TickMath, FullMath } from '@uniswap/v3-sdk'
import { JSBI } from '@uniswap/sdk'

const QuoterV2Address = '0x61fFE014bA17989E743c5F6cB21bF9697530B21e'
import QuoterV2ABI from '../utilities/QuoterV2ABI.json'
import TestAbi from '../utilities/TestAbi.json'
import { ethers } from 'ethers'
import { getPriceByUSD } from '../utilities/PriceFeed'

const web3 = new Web3(window.ethereum)
const provider = new ethers.providers.Web3Provider(window.ethereum)
const quoter = new ethers.Contract(QuoterV2Address, QuoterV2ABI, provider)


async function getReserves(pool: IPool): Promise<{ token0Reserve: number, token1Reserve: number }> {
    const token0Contract = new web3.eth.Contract(ERC20ABI, pool.token0.id)
    const token0Reserve = await token0Contract.methods.balanceOf(pool.id).call()
    const token1Contract = new web3.eth.Contract(ERC20ABI, pool.token1.id)
    const token1Reserve = await token1Contract.methods.balanceOf(pool.id).call()
    return {
        token0Reserve: Number(token0Reserve),
        token1Reserve: Number(token1Reserve)
    }
}
function getOutput(pool: IPool, amount: number): number {
    const currentTick = Number(pool.tick)
    const inputAmount = amount
    const baseTokenDecimals = pool.token0.decimals
    const quoteTokenDecimals = pool.token1.decimals
    const sqrtRatioX96 = TickMath.getSqrtRatioAtTick(currentTick)
    const ratioX192 = JSBI.multiply(sqrtRatioX96, sqrtRatioX96)
    const baseAmount = JSBI.BigInt(inputAmount * (10 ** baseTokenDecimals))
    const shift = JSBI.leftShift(JSBI.BigInt(1), JSBI.BigInt(192))
    const quoteAmount = FullMath.mulDivRoundingUp(ratioX192, baseAmount, shift)
    const output = Number(quoteAmount.toString()) / (10 ** quoteTokenDecimals)

    return output
}
async function getQuote(params: any[]): any {
    const result = await quoter.callStatic.quoteExactOutputSingle(params)
    return result
}
function sqrtToPrice(sqrt: number, baseTokenDecimals: number, quoteTokenDecimals: number, zeroForOne: boolean): number {
    const numenator = sqrt ** 2
    const denominator = 2 ** 192
    let ratio = numenator / denominator
    const shiftDecimals = Math.pow(10, quoteTokenDecimals - baseTokenDecimals)
    ratio = ratio * shiftDecimals
    if (zeroForOne) {
        ratio = 1 / ratio
    }
    return ratio
}

const Pool: FC<{ pool: IPool, baseAmount: number }> = ({ pool, baseAmount }) => {
    const [token0Reserve, setToken0Reserve] = useState<number>(0)
    const [token1Reserve, setToken1Reserve] = useState<number>(0)
    const [gasEstimate, setGasEstimate] = useState<number>(0)
    const [priceImpact, setPriceImpact] = useState<number>(0)
    const [subtotal, setSubtotal] = useState<number>(0)
    const [token1UsdPrice, setToken1UsdPrice] = useState<number>(0)
    const params = useMemo(() => [
        pool.token0.id,
        pool.token1.id,
        baseAmount,
        pool.feeTier,
        "0"
    ], [pool, baseAmount])
    const price = useMemo(() => sqrtToPrice(Number(pool.sqrtPrice), pool.token0.decimals, pool.token1.decimals, false), [pool])
    const priceByUsd = useMemo(() => {
        let answer = 0
        getPriceByUSD(pool.token1.id).then(res => {
            answer = res
        }).catch(e => {
            console.info(`no data for ${pool.token1.symbol}`)
        })
        return answer
    }, [pool])
    useEffect(() => {
        if (!baseAmount) return
        getQuote(params).then((res: { amountIn: string, gasEstimate: string, sqrtPriceX96After: string }) => {
            setGasEstimate(Number(res.gasEstimate))
            const sqrtPriceX96After = res.sqrtPriceX96After
            const priceAfter = sqrtToPrice(Number(sqrtPriceX96After), pool.token0.decimals, pool.token1.decimals, false)
            const absoluteChange = price - priceAfter
            const percentageChange = (absoluteChange / price) * 100
            setPriceImpact(percentageChange)
        })
    }, [params, baseAmount])
    // const price = useMemo(() => , [pool])
    // const priceAfter = useMemo(() => sqrtToPrice(Number(pool.sqrtPrice), pool.token0.decimals, pool.token1.decimals, true), [pool])
    // getQuote(pool, baseAmount).then((res) => {
    //     // setGasEstimate(res.gasEstimate)
    //     const sqrtPriceX96After = res.sqrtPriceX96After
    //     const price = sqrtToPrice(sqrtPriceX96After, pool.token0.decimals, pool.token1.decimals, true)
    // })
    // getReserves(pool).then((res) => {
    //     setToken0Reserve(res.token0Reserve)
    //     setToken1Reserve(res.token1Reserve)
    // })
    const swap = async () => {
        const poolContract = new ethers.Contract(pool.id, TestAbi, provider)
        const params = [
            '0xc543eE20dB5c8De803FF631704F3D86cF4Ef8f55',
            false,
            100,
            0,
            ''
        ]
        const result = await poolContract.callStatic.swap(
            '0xc543eE20dB5c8De803FF631704F3D86cF4Ef8f55',
            false,
            100,
            0,
            []
        )
        console.log(result)
    }
    // swap()
    setSubtotal(getOutput(pool, baseAmount))

    return (
        <>
            <pre>pool address: {pool.id}</pre>
            <pre>token0 address: {pool.token0.id}</pre>
            <pre>token1 address: {pool.token1.id}</pre>
            <pre>1 {pool.token0.symbol} = {pool.token0Price} {pool.token1.symbol}</pre>
            <pre>1 {pool.token1.symbol} = {pool.token1Price} {pool.token0.symbol}</pre>
            {/* <pre>token0 reserve: {token0Reserve}</pre> */}
            {/* <pre>token1 reserve: {token1Reserve}</pre> */}
            {/* <pre>K: {token0Reserve * token1Reserve}</pre> */}
            <pre>liquidity: {pool.liquidity}</pre>
            <pre>feeTier: {pool.feeTier / 10000}%</pre>
            <pre>Gas Estimate: {Number(gasEstimate)}</pre>
            <pre>Price Impact: {priceImpact.toFixed(2)}%</pre>
            <h2>{`${baseAmount} ${pool.token0.symbol} --> ${subtotal * 0.997} ${pool.token1.symbol} (${subtotal * token1UsdPrice})`}</h2>
            <button onClick={swap} >SWAP!</button>
        </>
    )
}

export default Pool