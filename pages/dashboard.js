import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'
import { Button, Grid } from '@mui/material';
import styles from '../styles/Home.module.css';
import Image from 'next/image'
import { Alert } from '@mui/material';
import { FaEthereum } from 'react-icons/fa';
import { Card,CardMedia,CardContent,CardActions,Typography } from '@mui/material';

import {
  marketplaceAddress
} from '../config'

import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'

export default function CreatorDashboard() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  useEffect(() => {
    loadNFTs()
  }, [])
  async function loadNFTs() {
    const web3Modal = new Web3Modal({
      network: 'mainnet',
      cacheProvider: true,
    })
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)
    const data = await contract.fetchItemsListed()

    const items = await Promise.all(data.map(async i => {
      const tokenUri = await contract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        name: meta.data.name,
        description: meta.data.description,
        image: meta.data.image,
      }
      return item
    }))

    setNfts(items)
    setLoadingState('loaded') 
  }
  if (loadingState === 'loaded' && !nfts.length) return (<Alert variant="outlined" severity="info" className={styles.alert}>
  No items Listed in Marketplace which are created by you.
</Alert>)
  return (
    <div>
      <div>
      <Alert variant="filled" severity="info" className={styles.alert}>
 Items which are listed currently in the Marketplace and owned by you will be displayed here.
</Alert>
          <div className={styles.cont}>
          {
            nfts.map((nft, i) => (
              <div key={i}>
              <Card sx={
              {
                  maxWidth: "300px",
                  bgcolor: "#fff",
                  marginTop: "20px",
                  marginRight: "60px",
                  marginBottom: "40px"
              }
          }
          className="anime-card">
         
              <CardMedia component="img" className={styles.cardimg}
                  image={
                      nft.image
                  }
                  height="200px"
                  />
              <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                      {
                      nft.name
                  } </Typography>
                  <Typography color="text.secondary">
                        {nft.description}
                    </Typography>
              </CardContent>
              <CardActions sx={
                  {alignItems: "right"}
              }>
                  <div className={styles.price}><FaEthereum className={styles.inline}/> {
                      nft.price
                  } ETH &nbsp;</div>
              
              </CardActions>
      </Card>
            </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}