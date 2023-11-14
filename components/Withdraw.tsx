import {
    Box,
    Button,
    FormControl,
    FormLabel,
    NumberInput,
    NumberInputField,
} from "@chakra-ui/react"
import { FC, useState } from "react"
import * as Web3 from "@solana/web3.js"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import {
    kryptMint,
    ScroogeCoinMint,
    tokenSwapStateAccount,
    swapAuthority,
    poolKryptAccount,
    poolScroogeAccount,
    poolMint,
    feeAccount,
} from "../utils/constants"
import { TokenSwap, TOKEN_SWAP_PROGRAM_ID } from "@solana/spl-token-swap"
import * as token from "@solana/spl-token"
import { TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { getAssociatedAccounts } from "../utils/tokenSwap"

export const WithdrawSingleTokenType: FC = (props: {
    onInputChange?: (val: number) => void
    onMintChange?: (account: string) => void
}) => {
    const [poolTokenAmount, setAmount] = useState(0)
    const { connection } = useConnection()
    const { publicKey, sendTransaction } = useWallet()

    const handleWithdrawSubmit = (event: any) => {
        event.preventDefault()
        handleTransactionSubmit()
    }

    const handleTransactionSubmit = async () => {
        if (!publicKey) {
            alert("Please connect your wallet!")
            return
        }

        const [
            kryptATA, 
            scroogeATA, 
            tokenAccountPool, 
            poolMintInfo, 
            transaction
        ] = await getAssociatedAccounts(publicKey, connection)

        const instruction = TokenSwap.withdrawAllTokenTypesInstruction(
            tokenSwapStateAccount,
            swapAuthority,
            publicKey,
            poolMint,
            feeAccount,
            tokenAccountPool,
            poolKryptAccount,
            poolScroogeAccount,
            kryptATA,
            scroogeATA,
            TOKEN_SWAP_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            poolTokenAmount * 10 ** poolMintInfo.decimals,
            0,
            0,
        )

        transaction.add(instruction)
        try {
            const txid = await sendTransaction(transaction, connection)
            const txString = `Transaction submitted {https://explorer.solana.com/tx/${txid}?cluster=devnet}`
            alert(txString)
            console.log(txString)
        } catch (error) {
            alert(JSON.stringify(error))
            console.log(JSON.stringify(error))
        }
    }

    return (
        <Box
            p={4}
            display={{ md: "flex" }}
            maxWidth="32rem"
            margin={2}
            justifyContent="center"
        >
            <form onSubmit={handleWithdrawSubmit}>
                <FormControl isRequired>
                    <FormLabel color="gray.200">
                        LP-Token Withdrawal Amount
                    </FormLabel>
                    <NumberInput
                        max={10000}
                        min={1}
                        onChange={(valueString) =>
                            setAmount(parseInt(valueString))
                        }
                    >
                        <NumberInputField id="amount" color="gray.400" />
                    </NumberInput>
                </FormControl>
                <Button width="full" mt={4} type="submit">
                    Withdraw
                </Button>
            </form>
        </Box>
    )
}
