import {
    Box,
    Button,
    FormControl,
    FormLabel,
    NumberInput,
    NumberInputField,
} from "@chakra-ui/react"
import { FC, useState } from "react"
import * as web3 from "@solana/web3.js"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import {
    kryptMint,
    ScroogeCoinMint,
    tokenSwapStateAccount,
    swapAuthority,
    poolKryptAccount,
    poolScroogeAccount,
    poolMint,
} from "../utils/constants"
import { TokenSwap, TOKEN_SWAP_PROGRAM_ID } from "@solana/spl-token-swap"
import * as token from "@solana/spl-token"
import { getAssociatedAccounts } from "../utils/tokenSwap"

export const DepositSingleTokenType: FC = (props: {
    onInputChange?: (val: number) => void
    onMintChange?: (account: string) => void
}) => {
    const [poolTokenAmount, setAmount] = useState(0)

    const { connection } = useConnection()
    const { publicKey, sendTransaction } = useWallet()

    const handleSubmit = (event: any) => {
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

        const instruction = TokenSwap.depositAllTokenTypesInstruction(
            tokenSwapStateAccount,
            swapAuthority,
            publicKey,
            kryptATA,
            scroogeATA,
            poolKryptAccount,
            poolScroogeAccount,
            poolMint,
            tokenAccountPool,
            TOKEN_SWAP_PROGRAM_ID,
            token.TOKEN_PROGRAM_ID,
            poolTokenAmount * 10 ** poolMintInfo.decimals,
            100e9,
            100e9,
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
            <form onSubmit={handleSubmit}>
                <div style={{ padding: "0px 10px 5px 7px" }}>
                    <FormControl isRequired>
                        <FormLabel color="gray.200">
                            LP-Tokens to receive for deposit to Liquidity Pool
                        </FormLabel>
                        <NumberInput
                            onChange={(valueString) =>
                                setAmount(parseInt(valueString))
                            }
                            style={{
                                fontSize: 20,
                            }}
                            placeholder="0.00"
                        >
                            <NumberInputField id="amount" color="gray.400" />
                        </NumberInput>
                        <Button width="full" mt={4} type="submit">
                            Deposit
                        </Button>
                    </FormControl>
                </div>
            </form>
        </Box>
    )
}
