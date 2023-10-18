import { ethers } from 'ethers'
import FeedRegistryInterfaceABI from './FeedRegistryInterfaceABI'

const getPriceByUSD = async (baseTokenAddress: string) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const feedRegistryAbi = FeedRegistryInterfaceABI
    const feedRegistryContractAddress = '0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf'
    const feedContract = new ethers.Contract(feedRegistryContractAddress, feedRegistryAbi, provider)
    const USDAddress = '0x0000000000000000000000000000000000000348'
    const price = await feedContract.callStatic.latestRoundData(baseTokenAddress, USDAddress)
    const decimals = await feedContract.callStatic.decimals(baseTokenAddress, USDAddress)
    return price.answer / 10 ** decimals
}

export { getPriceByUSD }