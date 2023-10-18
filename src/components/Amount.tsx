import { FC, useState } from 'react'
import styles from './Amount.module.css'
const Amount: FC<{ onSetAmount: React.Dispatch<number>, balance: number }> = ({ onSetAmount, balance }) => {
    const [amount, setAmount] = useState<number>(0)
    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAmount(Number(e.target.value))
        onSetAmount(Number(e.target.value))
    }
    const setMax = () => {
        setAmount(balance)
    }
    const setHalf = () => {
        setAmount(balance / 2)
    }
    return (
        <>
            <input className={amount > balance ? styles.red : styles.green} onChange={(e) => { handleOnChange(e) }} value={amount} />
            <button onClick={setMax}>Max</button>
            <button onClick={setHalf}>1/2</button>
        </>
    )
}

export default Amount