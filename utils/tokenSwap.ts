import * as web3 from "@solana/web3.js"
import * as token from "@solana/spl-token"
import {
    kryptMint,
    ScroogeCoinMint,
    poolMint,
    tokenSwapStateAccount,
    swapAuthority,
    feeAccount,
} from "../utils/constants"
import { TokenSwap, TOKEN_SWAP_PROGRAM_ID } from "@solana/spl-token-swap"
import { TOKEN_PROGRAM_ID } from "@solana/spl-token"

export async function getAssociatedAccounts(publicKey: web3.PublicKey, connection: web3.Connection) 
: Promise<[
    web3.PublicKey, 
    web3.PublicKey, 
    web3.PublicKey,
    token.Mint,
    web3.Transaction
]> {
    const kryptATA = await token.getAssociatedTokenAddress(kryptMint, publicKey)
    const scroogeATA = await token.getAssociatedTokenAddress(ScroogeCoinMint, publicKey)
    const tokenAccountPool = await token.getAssociatedTokenAddress(poolMint, publicKey)

    const poolMintInfo = await token.getMint(connection, poolMint)

    const transaction = new web3.Transaction()

    let account = await connection.getAccountInfo(tokenAccountPool)

    if (account == null) {
        const createATAInstruction = token.createAssociatedTokenAccountInstruction(
            publicKey,
            tokenAccountPool,
            publicKey,
            poolMint
        )
        transaction.add(createATAInstruction)
    }
    return [kryptATA, scroogeATA, tokenAccountPool, poolMintInfo, transaction]
}

export function getSwapInstruction(
    userPublicKey: web3.PublicKey,
    sourceTokenATA: web3.PublicKey, 
    sourceTokenPoolATA: web3.PublicKey, 
    destinationTokenPoolATA: web3.PublicKey, 
    destinationTokenATA: web3.PublicKey, 
    sourceTokenMintInfo: token.Mint,
    sourceTokenAmount: number
) {
    const instruction = TokenSwap.swapInstruction(
        tokenSwapStateAccount,
        swapAuthority,
        userPublicKey,
        sourceTokenATA,
        sourceTokenPoolATA,
        destinationTokenPoolATA,
        destinationTokenATA,
        poolMint,
        feeAccount,
        null,
        TOKEN_SWAP_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        sourceTokenAmount * 10 ** sourceTokenMintInfo.decimals,
        0
    )
    return instruction
}