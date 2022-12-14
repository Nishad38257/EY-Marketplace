import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { useRouter } from 'next/router'
import axios from 'axios'
import Web3Modal from 'web3modal'
import { Button, Grid } from '@mui/material';
import styles from '../styles/Home.module.css';
import { TextField } from '@mui/material'

import { Card,CardMedia,CardContent,CardActions,Typography } from '@mui/material';
import {
  marketplaceAddress
} from '../config'

import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'

export default function ResellNFT() {
  const [formInput, updateFormInput] = useState({ price: '', image: '' })
  const router = useRouter()
  const { id, tokenURI } = router.query
  const { image, price } = formInput

  useEffect(() => {
    fetchNFT()
  }, [id])

  async function fetchNFT() {
    if (!tokenURI) return
    const meta = await axios.get(tokenURI)
    updateFormInput(state => ({ ...state, image: meta.data.image }))
  }

  async function listNFTForSale() {
    if (!price) return
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const priceFormatted = ethers.utils.parseUnits(formInput.price, 'ether')
    let contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)
    let listingPrice = await contract.getListingPrice()

    listingPrice = listingPrice.toString()
    let transaction = await contract.resellToken(id, priceFormatted, { value: listingPrice })
    await transaction.wait()
   
    router.push('/')
  }

  return (
    <div className={styles.cont}>
      <div className={styles.form}>
        <TextField
          placeholder="Item Price in ETH"
          onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
          className={styles.text}
        />
        {
          image && (
            <img className={styles.upimagere} width="350" src={image} />
          )
        }
      
        <Button onClick={listNFTForSale} variant="contained" color="success" className={styles.createbutton}>
          List Item
        </Button>
      </div>
    </div>
    
  )
}