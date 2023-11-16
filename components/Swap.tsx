import {
    Box,
    Select,
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
import { getAssociatedAccounts, getSwapInstruction } from "../utils/tokenSwap"

export const SwapToken: FC = () => {
    const [amount, setAmount] = useState(0)
    const [mint, setMint] = useState("")

    const { connection } = useConnection()
    const { publicKey, sendTransaction } = useWallet()

    const handleSwapSubmit = (event: any) => {
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
        
        const kryptMintInfo = await token.getMint(connection, kryptMint);
        const scroogeMintInfo = await token.getMint(connection, ScroogeCoinMint)

        let swapInstruction = null
        if (mint == 'kryptToScrooge') {
            swapInstruction = getSwapInstruction(
                publicKey,
                kryptATA,
                poolKryptAccount,
                poolScroogeAccount,
                scroogeATA,
                scroogeMintInfo,
                amount,
            )
        } else if (mint == 'scroogeToKrypt') {
            swapInstruction = getSwapInstruction(
                publicKey,
                scroogeATA,
                poolScroogeAccount,
                poolKryptAccount,
                kryptATA,
                scroogeMintInfo,
                amount,
            )
        }

        if (swapInstruction == null) {
            return alert('Transaction error')
        } else {
            transaction.add(swapInstruction)
            try {
                const txid = await sendTransaction(transaction, connection)
                const txString = `Transaction submitted {https://explorer.solana.com/tx/${txid}?cluster=devnet}`
                alert('Transaction submitted, check link in console.')
                console.log(txString)
            } catch (error) {
                alert(JSON.stringify(error))
            }
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
            <form onSubmit={handleSwapSubmit}>
                <FormControl isRequired>
                    <FormLabel color="gray.200">Swap Amount</FormLabel>
                    <NumberInput
                        max={1000}
                        min={1}
                        onChange={(valueString) =>
                            setAmount(parseInt(valueString))
                        }
                    >
                        <NumberInputField id="amount" color="gray.400" />
                    </NumberInput>
                    <div style={{ display: "felx" }}>
                        <Select
                            display={{ md: "flex" }}
                            justifyContent="center"
                            placeholder="Token to Swap"
                            color="white"
                            variant="outline"
                            dropShadow="#282c34"
                            onChange={(item) =>
                                setMint(item.currentTarget.value)
                            }
                        >
                            <option
                                style={{ color: "#282c34" }}
                                value="kryptToScrooge"
                            >
                                {" "}
                                Krypt{" "}
                            </option>
                            <option
                                style={{ color: "#282c34" }}
                                value="scroogeToKrypt"
                            >
                                {" "}
                                Scrooge{" "}
                            </option>
                        </Select>
                    </div>
                </FormControl>
                <Button width="full" mt={4} type="submit">
                    Swap ⇅
                </Button>
            </form>
        </Box>
    )
}
