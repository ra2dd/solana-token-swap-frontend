import * as web3 from "@solana/web3.js"
import * as token from "@solana/spl-token"
import {
    kryptMint,
    ScroogeCoinMint,
    poolMint,
} from "../utils/constants"

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